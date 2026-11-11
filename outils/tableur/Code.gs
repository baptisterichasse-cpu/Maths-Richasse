/**
 * Suivi des élèves — site de mathématiques de M. Richasse
 *
 * UN ONGLET PAR CLASSE (menu Progression > Ajouter une classe), par exemple « Seconde 5 ».
 *   Colonnes A à C, à remplir à partir de la ligne 3 :
 *     A Numéro (facultatif)   B Nom   C Code d'accès (menu Progression > Créer les codes manquants)
 *   Colonnes D et suivantes : remplies automatiquement à chaque envoi d'un élève.
 *     D Dernier envoi, puis une colonne par activité commencée dans la classe.
 *     vert   = maîtrisé (au moins 80 % réussi)
 *     orange = commencé, à retravailler
 *     gris   = pas encore commencé
 *   Ne rien écrire à la main à partir de la colonne D : c'est effacé à chaque mise à jour.
 * Onglet « Envois » : la trace de chaque envoi (ne pas le modifier).
 *
 * Seuls les codes présents dans un onglet de classe sont acceptés par le site.
 * Un élève qui travaille sur plusieurs appareils utilise le même code partout :
 * ses exercices réussis sont réunis.
 */

// Part réussie à partir de laquelle une case devient verte (0,8 = 80 %).
var SEUIL = 0.8;
// Au-delà de ce nombre de jours sans envoi, la date du dernier envoi passe en orange.
var JOURS_SANS_ENVOI = 8;

var COULEURS = { vert: '#c6ebd4', orange: '#fde2b3', gris: '#eeeff2', blanc: '#ffffff', entete: '#1c2232', texteEntete: '#ffffff', groupe: '#dfe3ec' };
var LETTRES_CODE = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sans I, L, O, 0, 1 pour éviter les confusions
var PREMIERE_LIGNE = 3; // première ligne d'élève
var COL_FIXES = 3;      // Numéro, Nom, Code

/* ---------- Menu du tableur ---------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Progression')
    .addItem('Ajouter une classe', 'ajouterClasse')
    .addItem('Créer les codes manquants', 'creerCodes')
    .addItem('Mettre à jour la progression', 'majProgression')
    .addToUi();
}

function ajouterClasse() {
  var ui = SpreadsheetApp.getUi(), classeur = SpreadsheetApp.getActiveSpreadsheet();
  var rep = ui.prompt('Ajouter une classe', 'Nom de la classe (par exemple : Seconde 5)', ui.ButtonSet.OK_CANCEL);
  if (rep.getSelectedButton() !== ui.Button.OK) return;
  var nom = String(rep.getResponseText()).trim();
  if (!nom) return;
  if (classeur.getSheetByName(nom)) { ui.alert('Un onglet « ' + nom + ' » existe déjà.'); return; }
  var f = classeur.insertSheet(nom, 0);
  f.getRange(1, 1, 2, COL_FIXES + 1).setValues([['Élève', '', '', ''], ['Numéro', 'Nom', 'Code', 'Dernier envoi']]);
  f.getRange('A:A').setNumberFormat('@');
  f.getRange('C:C').setNumberFormat('@');
  miseEnFormeEntetes(f, COL_FIXES + 1);
  f.setColumnWidth(1, 80); f.setColumnWidth(2, 200); f.setColumnWidth(3, 110); f.setColumnWidth(4, 110);
  f.setActiveSelection('A3');
  ui.alert('Onglet « ' + nom + ' » créé. Saisissez les élèves à partir de la ligne 3 (numéro facultatif, nom), puis lancez Progression > Créer les codes manquants.');
}

function miseEnFormeEntetes(f, nbC) {
  f.getRange(1, 1, 1, nbC).setBackground(COULEURS.entete).setFontColor(COULEURS.texteEntete).setFontWeight('bold').setHorizontalAlignment('center');
  f.getRange(2, 1, 1, nbC).setBackground(COULEURS.groupe).setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
  f.getRange(1, 1, 1, COL_FIXES).merge();
  f.setFrozenRows(2);
  f.setFrozenColumns(COL_FIXES);
  f.setRowHeight(2, 48);
}

// Un onglet de classe se reconnaît à ses en-têtes « Numéro » (A2) et « Code » (C2).
function ongletsClasses(classeur) {
  return classeur.getSheets().filter(function (f) {
    return String(f.getRange(2, 1).getValue()).trim() === 'Numéro' && String(f.getRange(2, 3).getValue()).trim().indexOf('Code') === 0;
  });
}

function lignesEleves(f) {
  var n = f.getLastRow() - PREMIERE_LIGNE + 1;
  return n > 0 ? f.getRange(PREMIERE_LIGNE, 1, n, COL_FIXES).getValues() : [];
}

function creerCodes() {
  var ui = SpreadsheetApp.getUi(), classeur = SpreadsheetApp.getActiveSpreadsheet(), onglets = ongletsClasses(classeur);
  if (!onglets.length) { ui.alert('Ajoutez d’abord une classe : Progression > Ajouter une classe.'); return; }
  var existants = {}, crees = 0, tout = onglets.map(function (f) { return { f: f, lignes: lignesEleves(f) }; });
  tout.forEach(function (t) { t.lignes.forEach(function (l) { if (l[2]) existants[normaliserCode(l[2])] = true; }); });
  tout.forEach(function (t) {
    var change = false;
    t.lignes.forEach(function (l) {
      if (l[2] || !(String(l[0]).trim() || String(l[1]).trim())) return;
      var code;
      do { code = nouveauCode(String(l[0]).trim()); } while (existants[code]);
      existants[code] = true; l[2] = code; crees++; change = true;
    });
    if (change) t.f.getRange(PREMIERE_LIGNE, 1, t.lignes.length, COL_FIXES).setValues(t.lignes);
  });
  ui.alert(crees ? crees + ' code(s) créé(s) dans la colonne C.' : 'Aucun code à créer : chaque élève saisi a déjà le sien.');
}

function nouveauCode(numero) {
  var s = '';
  for (var i = 0; i < 4; i++) s += LETTRES_CODE.charAt(Math.floor(Math.random() * LETTRES_CODE.length));
  var prefixe = normaliserCode(numero).replace(/-/g, '').slice(0, 6);
  return prefixe ? prefixe + '-' + s : s + '-' + LETTRES_CODE.charAt(Math.floor(Math.random() * LETTRES_CODE.length)) + LETTRES_CODE.charAt(Math.floor(Math.random() * LETTRES_CODE.length));
}

function normaliserCode(c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9-]/g, ''); }

// Tous les codes valides : { CODE: nom de la classe }
function lireCodes(classeur) {
  var codes = {};
  ongletsClasses(classeur).forEach(function (f) {
    lignesEleves(f).forEach(function (l) { var c = normaliserCode(l[2]); if (c) codes[c] = f.getName(); });
  });
  return codes;
}

/* ---------- Réception ---------- */

// Vérification d'un code par le site : ?code=A07-K4PZ
function doGet(e) {
  var code = normaliserCode(e && e.parameter && e.parameter.code);
  if (!code) return ContentService.createTextOutput('La boîte aux lettres fonctionne. Les élèves peuvent envoyer leur progression.');
  var classe = lireCodes(SpreadsheetApp.getActiveSpreadsheet())[code];
  return repondre(classe ? { ok: true, classe: classe } : { ok: false });
}

function doPost(e) {
  var verrou = LockService.getScriptLock();
  verrou.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var code = normaliserCode(d && d.code);
    if (!code || !d.progression) throw new Error('Envoi incomplet');
    var classeur = SpreadsheetApp.getActiveSpreadsheet(), classe = lireCodes(classeur)[code];
    if (!classe) return repondre({ ok: false, erreur: 'code inconnu' });
    feuilleEnvois(classeur).appendRow([new Date(), code, classe, String(d.appareil || '').slice(0, 20), JSON.stringify(d.progression)]);
    majProgression(classeur);
    return repondre({ ok: true });
  } catch (err) {
    return repondre({ ok: false, erreur: String(err && err.message || err) });
  } finally {
    verrou.releaseLock();
  }
}

function repondre(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet)).setMimeType(ContentService.MimeType.JSON);
}

function feuilleEnvois(classeur) {
  var f = classeur.getSheetByName('Envois');
  if (f) return f;
  f = classeur.insertSheet('Envois', classeur.getNumSheets());
  f.appendRow(['Date', 'Code', 'Classe', 'Appareil', 'Progression (données brutes)']);
  f.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
  f.getRange('B:B').setNumberFormat('@');
  f.getRange(1, 1, 1, 5).setFontWeight('bold');
  f.setFrozenRows(1);
  return f;
}

/* ---------- Mise à jour des onglets de classe ---------- */

function majProgression(classeur) {
  classeur = classeur && classeur.getSheetByName ? classeur : SpreadsheetApp.getActiveSpreadsheet();
  var fe = feuilleEnvois(classeur);
  var brut = fe.getLastRow() > 1 ? fe.getRange(2, 1, fe.getLastRow() - 1, 5).getValues() : [];
  var envois = [];
  brut.forEach(function (l) {
    try { envois.push({ date: new Date(l[0]), code: normaliserCode(l[1]), appareil: String(l[3]), progression: JSON.parse(l[4]) }); } catch (err) {}
  });
  ongletsClasses(classeur).forEach(function (f) {
    var codes = lignesEleves(f).map(function (l) { return normaliserCode(l[2]); });
    ecrireClasse(f, calculerClasse(codes, envois, new Date()));
  });
}

function ecrireClasse(f, t) {
  var debut = COL_FIXES + 1, nbC = t.entetes1.length, nbL = t.lignes.length;
  var aEffacer = Math.max(f.getLastColumn() - COL_FIXES, nbC);
  if (f.getMaxColumns() < COL_FIXES + aEffacer) f.insertColumnsAfter(f.getMaxColumns(), COL_FIXES + aEffacer - f.getMaxColumns());
  var zone = f.getRange(1, debut, f.getMaxRows(), aEffacer);
  zone.breakApart(); zone.clearContent(); zone.setBackground(null); zone.clearNote();
  f.getRange(1, debut, 2, nbC).setValues([t.entetes1, t.entetes2]);
  f.getRange(1, 1, 1, COL_FIXES).breakApart();
  miseEnFormeEntetes(f, COL_FIXES + nbC);
  t.groupes.forEach(function (g) { if (g.largeur > 1) f.getRange(1, debut + g.colonne, 1, g.largeur).merge(); });
  if (nbL) {
    var plage = f.getRange(PREMIERE_LIGNE, debut, nbL, nbC);
    plage.setValues(t.lignes).setBackgrounds(t.couleurs).setHorizontalAlignment('center').setVerticalAlignment('middle');
    f.getRange(PREMIERE_LIGNE, debut, nbL, 1).setNumberFormat('dd/mm/yyyy');
  }
  for (var c = 1; c < nbC; c++) f.setColumnWidth(debut + c, 130);
  f.getRange(2, debut).setNote('Vert : maîtrisé (au moins ' + Math.round(SEUIL * 100) + ' %). Orange : à retravailler. Gris : pas commencé. Date en orange : aucun envoi depuis plus de ' + JOURS_SANS_ENVOI + ' jours.');
}

/* ---------- Calcul (sans Google, testable) ---------- */

// codes : le code de chaque ligne de l'onglet, dans l'ordre ('' si la ligne n'en a pas)
function calculerClasse(codes, envois, maintenant) {
  // Dernier envoi de chaque appareil, puis réunion des appareils de chaque élève
  var parAppareil = {}, parCode = {}, present = {};
  codes.forEach(function (c) { if (c) present[c] = true; });
  envois.forEach(function (e) {
    if (!present[e.code]) return;
    var cle = e.code + '|' + (e.appareil || '');
    if (!parAppareil[cle] || parAppareil[cle].date <= e.date) parAppareil[cle] = e;
  });
  Object.keys(parAppareil).forEach(function (k) {
    var e = parAppareil[k];
    parCode[e.code] = parCode[e.code] ? reunir(parCode[e.code], e) : e;
  });

  // Colonnes : les activités commencées par au moins un élève de la classe
  var colonnes = [], vues = {};
  [['revisions', 'Révisions'], ['qcm', 'QCM'], ['flashcards', 'Flashcards']].forEach(function (g) {
    codes.forEach(function (code) {
      var e = parCode[code];
      if (!e) return;
      (e.progression[g[0]] || []).forEach(function (x) {
        var cle = g[0] + '|' + x.chapitre + '|' + x.titre;
        if (vues[cle] || cellule(g[0], x).couleur === 'gris') return;
        vues[cle] = true;
        colonnes.push({ genre: g[0], groupe: g[1], chapitre: x.chapitre, titre: x.titre, cle: cle });
      });
    });
  });

  var entetes1 = [''], entetes2 = ['Dernier envoi'], groupes = [];
  colonnes.forEach(function (col, k) {
    var nouveau = !k || colonnes[k - 1].groupe !== col.groupe;
    if (nouveau) groupes.push({ nom: col.groupe, colonne: k + 1, largeur: 0 });
    groupes[groupes.length - 1].largeur++;
    entetes1.push(nouveau ? col.groupe : '');
    entetes2.push(col.genre === 'revisions' ? col.titre : col.chapitre + ' · ' + col.titre);
  });

  var lignes = [], couleurs = [];
  codes.forEach(function (code) {
    var e = parCode[code], ligne, teintes;
    if (!code) { ligne = colonnes.map(function () { return ''; }); ligne.unshift(''); teintes = ligne.map(function () { return COULEURS.blanc; }); }
    else {
      var index = {};
      if (e) ['revisions', 'qcm', 'flashcards'].forEach(function (g) {
        (e.progression[g] || []).forEach(function (x) { index[g + '|' + x.chapitre + '|' + x.titre] = x; });
      });
      var alerte = !e || (maintenant - e.date) / 86400000 > JOURS_SANS_ENVOI;
      ligne = [e ? e.date : 'jamais']; teintes = [alerte ? COULEURS.orange : COULEURS.blanc];
      colonnes.forEach(function (col) {
        var cel = cellule(col.genre, index[col.cle]);
        ligne.push(cel.texte); teintes.push(COULEURS[cel.couleur]);
      });
    }
    lignes.push(ligne); couleurs.push(teintes);
  });
  return { entetes1: entetes1, entetes2: entetes2, groupes: groupes, lignes: lignes, couleurs: couleurs };
}

// Réunit deux envois d'un même élève venant d'appareils différents
function reunir(a, b) {
  var p = { revisions: [], qcm: [], flashcards: [] }, index = {};
  ['revisions', 'qcm', 'flashcards'].forEach(function (g) {
    (a.progression[g] || []).concat(b.progression[g] || []).forEach(function (x) {
      var cle = g + '|' + x.chapitre + '|' + x.titre, y = index[cle];
      if (!y) { y = index[cle] = JSON.parse(JSON.stringify(x)); p[g].push(y); return; }
      y.total = Math.max(y.total || 0, x.total || 0);
      if (g === 'revisions') {
        if (y.ok && x.ok) {
          var ok = union(y.ok, x.ok), ko = union(y.ko || [], x.ko || []).filter(function (id) { return ok.indexOf(id) === -1; });
          y.ok = ok; y.ko = ko; y.reussis = ok.length; y.aRetravailler = ko.length;
        } else { y.reussis = Math.max(y.reussis, x.reussis); y.aRetravailler = Math.max(y.aRetravailler, x.aRetravailler); }
      } else if (g === 'qcm') {
        if (x.meilleur !== null && x.meilleur !== undefined && (y.meilleur === null || y.meilleur === undefined || x.meilleur > y.meilleur)) y.meilleur = x.meilleur;
      } else if (y.ids && x.ids) { y.ids = union(y.ids, x.ids); y.sues = y.ids.length; }
      else y.sues = Math.max(y.sues, x.sues);
    });
  });
  return { date: a.date > b.date ? a.date : b.date, code: a.code, progression: p };
}

function union(a, b) {
  var r = a.slice();
  b.forEach(function (x) { if (r.indexOf(x) === -1) r.push(x); });
  return r;
}

function cellule(genre, x) {
  if (!x || !x.total) return { texte: '—', couleur: 'gris' };
  var fait, part, texte;
  if (genre === 'revisions') {
    fait = x.reussis + x.aRetravailler > 0;
    part = x.reussis / x.total;
    texte = fait ? x.reussis + '/' + x.total + (x.aRetravailler ? ' · ' + x.aRetravailler + ' à revoir' : '') : '—';
  } else if (genre === 'qcm') {
    fait = x.meilleur !== null && x.meilleur !== undefined;
    part = fait ? x.meilleur / x.total : 0;
    texte = fait ? x.meilleur + '/' + x.total : '—';
  } else {
    fait = x.sues > 0;
    part = x.sues / x.total;
    texte = fait ? x.sues + '/' + x.total : '—';
  }
  return { texte: texte, couleur: !fait ? 'gris' : (part >= SEUIL ? 'vert' : 'orange') };
}

if (typeof module !== 'undefined') module.exports = { calculerClasse: calculerClasse, cellule: cellule, nouveauCode: nouveauCode, normaliserCode: normaliserCode };
