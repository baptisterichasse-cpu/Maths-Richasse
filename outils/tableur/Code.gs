/**
 * Boîte aux lettres des progressions — site de mathématiques de M. Richasse
 *
 * Onglet « Élèves » : une ligne par élève.
 *   A Numéro (facultatif, ex. A07)  B Nom  C Classe (Seconde, Maths expertes…)  D Code d'accès
 *   Menu Progression > Créer les codes manquants remplit la colonne D.
 *   Seuls les codes de cet onglet sont acceptés par le site.
 * Onglets « Synthèse … » : une ligne par élève, mis à jour à chaque envoi.
 *   vert   = maîtrisé (au moins 80 % réussi)
 *   orange = commencé, à retravailler
 *   gris   = pas encore commencé
 * Onglet « Envois » : la trace de chaque envoi (ne pas le modifier).
 *
 * Un élève qui travaille sur plusieurs appareils (téléphone, ordinateur) utilise
 * le même code partout : ses exercices réussis sont réunis dans la synthèse.
 */

// Part réussie à partir de laquelle une case devient verte (0,8 = 80 %).
var SEUIL = 0.8;
// Au-delà de ce nombre de jours sans envoi, la date du dernier envoi passe en orange.
var JOURS_SANS_ENVOI = 8;

var COULEURS = { vert: '#c6ebd4', orange: '#fde2b3', gris: '#eeeff2', blanc: '#ffffff', entete: '#1c2232', texteEntete: '#ffffff', groupe: '#dfe3ec' };
var LETTRES_CODE = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sans I, L, O, 0, 1 pour éviter les confusions

/* ---------- Menu du tableur ---------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Progression')
    .addItem('Créer les codes manquants', 'creerCodes')
    .addItem('Mettre à jour les synthèses', 'majSyntheses')
    .addToUi();
}

function creerCodes() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  var f = feuilleEleves(classeur), n = f.getLastRow() - 1;
  if (n < 1) { SpreadsheetApp.getUi().alert('Ajoutez d’abord les élèves dans l’onglet « Élèves » (au moins le nom ou le numéro).'); return; }
  var lignes = f.getRange(2, 1, n, 4).getValues(), existants = {}, crees = 0;
  lignes.forEach(function (l) { if (l[3]) existants[normaliserCode(l[3])] = true; });
  lignes.forEach(function (l) {
    if (l[3] || !(String(l[0]).trim() || String(l[1]).trim())) return;
    var code;
    do { code = nouveauCode(String(l[0]).trim()); } while (existants[code]);
    existants[code] = true; l[3] = code; crees++;
  });
  f.getRange(2, 1, n, 4).setValues(lignes);
  SpreadsheetApp.getUi().alert(crees ? crees + ' code(s) créé(s) dans la colonne D.' : 'Tous les élèves ont déjà un code.');
}

function nouveauCode(numero) {
  var s = '';
  for (var i = 0; i < 4; i++) s += LETTRES_CODE.charAt(Math.floor(Math.random() * LETTRES_CODE.length));
  var prefixe = normaliserCode(numero).replace(/-/g, '').slice(0, 6);
  return prefixe ? prefixe + '-' + s : s + '-' + LETTRES_CODE.charAt(Math.floor(Math.random() * LETTRES_CODE.length)) + LETTRES_CODE.charAt(Math.floor(Math.random() * LETTRES_CODE.length));
}

function normaliserCode(c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9-]/g, ''); }

/* ---------- Réception ---------- */

// Vérification d'un code par le site : ?code=A07-K4PZ
function doGet(e) {
  var code = normaliserCode(e && e.parameter && e.parameter.code);
  if (!code) return ContentService.createTextOutput('La boîte aux lettres fonctionne. Les élèves peuvent envoyer leur progression.');
  var el = lireEleves(SpreadsheetApp.getActiveSpreadsheet())[code];
  return repondre(el ? { ok: true, classe: el.classe } : { ok: false });
}

function doPost(e) {
  var verrou = LockService.getScriptLock();
  verrou.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var code = normaliserCode(d && d.code);
    if (!code || !d.progression) throw new Error('Envoi incomplet');
    var classeur = SpreadsheetApp.getActiveSpreadsheet();
    if (!lireEleves(classeur)[code]) return repondre({ ok: false, erreur: 'code inconnu' });
    feuilleEnvois(classeur).appendRow([new Date(), code, String(d.classe || '').slice(0, 40), String(d.appareil || '').slice(0, 20), JSON.stringify(d.progression)]);
    majSyntheses(classeur);
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

/* ---------- Onglets ---------- */

function feuilleEnvois(classeur) {
  var f = classeur.getSheetByName('Envois');
  if (f) return f;
  f = classeur.insertSheet('Envois');
  f.appendRow(['Date', 'Code', 'Classe', 'Appareil', 'Progression (données brutes)']);
  f.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
  f.getRange('B:B').setNumberFormat('@');
  f.getRange(1, 1, 1, 5).setFontWeight('bold');
  f.setFrozenRows(1);
  return f;
}

function feuilleEleves(classeur) {
  var f = classeur.getSheetByName('Élèves');
  if (f) return f;
  f = classeur.insertSheet('Élèves', 0);
  f.appendRow(['Numéro (facultatif)', 'Nom', 'Classe', 'Code d’accès']);
  f.getRange('A:A').setNumberFormat('@');
  f.getRange('D:D').setNumberFormat('@');
  f.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground(COULEURS.groupe);
  f.setFrozenRows(1);
  f.setColumnWidth(1, 130); f.setColumnWidth(2, 220); f.setColumnWidth(3, 140); f.setColumnWidth(4, 130);
  return f;
}

function lireEleves(classeur) {
  var f = classeur.getSheetByName('Élèves'), eleves = {};
  if (!f || f.getLastRow() < 2) return eleves;
  f.getRange(2, 1, f.getLastRow() - 1, 4).getValues().forEach(function (l) {
    var code = normaliserCode(l[3]);
    if (code) eleves[code] = { code: code, numero: String(l[0]).trim(), nom: String(l[1]).trim(), classe: String(l[2]).trim() };
  });
  return eleves;
}

/* ---------- Mise à jour des synthèses ---------- */

function majSyntheses(classeur) {
  classeur = classeur && classeur.getSheetByName ? classeur : SpreadsheetApp.getActiveSpreadsheet();
  var f = feuilleEnvois(classeur);
  var lignes = f.getLastRow() > 1 ? f.getRange(2, 1, f.getLastRow() - 1, 5).getValues() : [];
  var envois = [];
  lignes.forEach(function (l) {
    try { envois.push({ date: new Date(l[0]), code: String(l[1]), classe: String(l[2]), appareil: String(l[3]), progression: JSON.parse(l[4]) }); } catch (err) {}
  });
  construireSyntheses(envois, new Date(), lireEleves(classeur)).forEach(function (s) { ecrireSynthese(classeur, s); });
}

function ecrireSynthese(classeur, s) {
  var nom = 'Synthèse ' + s.classe;
  var f = classeur.getSheetByName(nom) || classeur.insertSheet(nom, 1);
  f.clear();
  f.getRange(1, 1, f.getMaxRows(), f.getMaxColumns()).breakApart();
  var nbL = s.valeurs.length, nbC = s.valeurs[0].length, dc = s.colonneDate;
  f.getRange(1, 1, nbL, nbC).setValues(s.valeurs).setBackgrounds(s.couleurs).setVerticalAlignment('middle');
  f.getRange(1, 1, 2, nbC).setFontWeight('bold');
  f.getRange(1, 1, 1, nbC).setFontColor(COULEURS.texteEntete).setHorizontalAlignment('center');
  f.getRange(2, 1, 1, nbC).setWrap(true).setHorizontalAlignment('center');
  if (nbL > 2) {
    f.getRange(3, dc, nbL - 2, nbC - dc + 1).setHorizontalAlignment('center');
    f.getRange(3, dc, nbL - 2, 1).setNumberFormat('dd/mm/yyyy');
  }
  s.groupes.forEach(function (g) { if (g.largeur > 1) f.getRange(1, g.colonne, 1, g.largeur).merge(); });
  f.setFrozenRows(2);
  f.setFrozenColumns(dc);
  f.setColumnWidth(1, 90); f.setColumnWidth(2, 200); f.setColumnWidth(3, 110);
  for (var c = dc + 1; c <= nbC; c++) f.setColumnWidth(c, 130);
  f.setRowHeight(2, 48);
  f.getRange(nbL + 2, 1, 1, Math.min(nbC, 6)).merge()
    .setValue('Vert : maîtrisé (au moins ' + Math.round(SEUIL * 100) + ' %)  ·  Orange : à retravailler  ·  Gris : pas commencé  ·  Date en orange : aucun envoi depuis plus de ' + JOURS_SANS_ENVOI + ' jours')
    .setFontStyle('italic').setFontColor('#5a6172');
}

/* ---------- Calcul (sans Google, testable) ---------- */

function construireSyntheses(envois, maintenant, eleves) {
  eleves = eleves || {};
  // Dernier envoi de chaque appareil, puis réunion des appareils de chaque élève
  var parAppareil = {};
  envois.forEach(function (e) {
    if (!eleves[e.code]) return; // code retiré de la liste
    e.classe = eleves[e.code].classe || e.classe || 'Sans classe';
    var cle = e.code + '|' + e.classe + '|' + (e.appareil || '');
    if (!parAppareil[cle] || parAppareil[cle].date <= e.date) parAppareil[cle] = e;
  });
  var parClasse = {};
  Object.keys(parAppareil).forEach(function (k) {
    var e = parAppareil[k], c = parClasse[e.classe] = parClasse[e.classe] || {};
    c[e.code] = c[e.code] ? reunir(c[e.code], e) : e;
  });
  // Élèves de la liste qui n'ont encore rien envoyé
  Object.keys(eleves).forEach(function (code) {
    var el = eleves[code];
    if (!el.classe) return;
    var classe = Object.keys(parClasse).filter(function (c) { return c.toLowerCase() === el.classe.toLowerCase(); })[0] || el.classe;
    var c = parClasse[classe] = parClasse[classe] || {};
    if (!c[code]) c[code] = { code: code, classe: classe, date: null, progression: { revisions: [], qcm: [], flashcards: [] } };
  });

  return Object.keys(parClasse).sort().map(function (classe) {
    var lignesEleves = Object.keys(parClasse[classe]).map(function (k) { return parClasse[classe][k]; });
    var info = function (e) { return eleves[e.code] || { numero: '', nom: '' }; };
    lignesEleves.sort(function (a, b) {
      var na = info(a).numero || info(a).nom || a.code, nb = info(b).numero || info(b).nom || b.code;
      return na.localeCompare(nb, 'fr', { numeric: true, sensitivity: 'base' });
    });

    // Colonnes : toutes les activités rencontrées, révisions puis QCM puis flashcards
    var colonnes = [], vues = {};
    [['revisions', 'Révisions'], ['qcm', 'QCM'], ['flashcards', 'Flashcards']].forEach(function (g) {
      lignesEleves.forEach(function (e) {
        (e.progression[g[0]] || []).forEach(function (x) {
          var cle = g[0] + '|' + x.chapitre + '|' + x.titre;
          if (vues[cle]) return;
          vues[cle] = true;
          colonnes.push({ genre: g[0], groupe: g[1], chapitre: x.chapitre, titre: x.titre, cle: cle });
        });
      });
    });

    var l1 = ['Élève', '', ''], l2 = ['Numéro', 'Nom', 'Dernier envoi'], depart = 3, groupes = [{ nom: 'Élève', colonne: 1, largeur: depart }];
    var c1 = [COULEURS.entete, COULEURS.entete, COULEURS.entete], c2 = [COULEURS.groupe, COULEURS.groupe, COULEURS.groupe];
    colonnes.forEach(function (col, k) {
      var nouveau = !colonnes[k - 1] || colonnes[k - 1].groupe !== col.groupe;
      if (nouveau) groupes.push({ nom: col.groupe, colonne: k + depart + 1, largeur: 0 });
      groupes[groupes.length - 1].largeur++;
      l1.push(nouveau ? col.groupe : '');
      l2.push(col.genre === 'revisions' ? col.titre : col.chapitre + ' · ' + col.titre);
      c1.push(COULEURS.entete); c2.push(COULEURS.groupe);
    });

    var valeurs = [l1, l2], couleurs = [c1, c2];
    lignesEleves.forEach(function (e) {
      var index = {};
      ['revisions', 'qcm', 'flashcards'].forEach(function (g) {
        (e.progression[g] || []).forEach(function (x) { index[g + '|' + x.chapitre + '|' + x.titre] = x; });
      });
      var alerte = !e.date || (maintenant - e.date) / 86400000 > JOURS_SANS_ENVOI;
      var ligne = [info(e).numero || e.code, info(e).nom, e.date || 'jamais'];
      var teintes = [COULEURS.blanc, COULEURS.blanc, alerte ? COULEURS.orange : COULEURS.blanc];
      colonnes.forEach(function (col) {
        var cel = cellule(col.genre, index[col.cle]);
        ligne.push(cel.texte); teintes.push(COULEURS[cel.couleur]);
      });
      valeurs.push(ligne); couleurs.push(teintes);
    });
    return { classe: classe, valeurs: valeurs, couleurs: couleurs, groupes: groupes, colonneDate: depart };
  });
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
  return { date: a.date > b.date ? a.date : b.date, code: a.code, classe: a.classe, progression: p };
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

if (typeof module !== 'undefined') module.exports = { construireSyntheses: construireSyntheses, cellule: cellule, nouveauCode: nouveauCode, normaliserCode: normaliserCode };
