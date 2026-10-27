// Construit le site dans le dossier _site/ à partir de vos fichiers.
// Lancé automatiquement par GitHub à chaque modification et chaque matin.
// Vous n'avez normalement jamais besoin de modifier ce fichier.

import { readdir, readFile, writeFile, mkdir, copyFile, rm, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SORTIE = path.join(RACINE, '_site');

// Date du jour à Paris, au format AAAA-MM-JJ
const AUJOURDHUI = process.env.DATE_DU_JOUR ||
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

// Répare les accents abîmés par certaines décompressions sous Windows (« corrig├® » → « corrigé »).
const TABLES = [
  // CP850 (Windows en français)
  'ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ ',
  // CP437
  'ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ',
];
function reparer(s) {
  if (!/[─-◿]/.test(s)) return s; // seuls les noms abîmés contiennent ces caractères de dessin
  for (const table of TABLES) {
    const octets = [];
    let ok = true;
    for (const ch of s) {
      const c = ch.codePointAt(0);
      if (c < 128) { octets.push(c); continue; }
      const i = table.indexOf(ch);
      if (i === -1) { ok = false; break; }
      octets.push(128 + i);
    }
    if (!ok) continue;
    try { return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(octets)); } catch { /* table suivante */ }
  }
  return s;
}

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'chapitre';
const trierNoms = (a, b) => a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' });

// Le type d'un document est donné par le premier mot de son nom.
const TYPES = [
  ['cours', /^cours\b/],
  ['methode', /^(fiches?|methodes?)\b/],
  ['exercices', /^(exercices?|exos?|td|feuilles?|devoirs?|dm)\b/],
  ['corriges', /^(corriges?|corrections?)\b/],
  ['diaporama', /^(diaporamas?|diapos?|presentations?)\b/],
];
const LIBELLES = { cours: 'Cours', methode: 'Fiche méthode', exercices: 'Exercices', corriges: 'Corrigé', diaporama: 'Diaporama', autres: 'Document' };

function analyserNom(fichier) {
  const ext = path.extname(fichier).slice(1).toLowerCase();
  let base = reparer(path.basename(fichier, path.extname(fichier)).trim());
  let date = null;
  const m = base.match(/\s*@\s*(\d{4}-\d{2}-\d{2})\s*/);
  if (m) { date = m[1]; base = base.replace(m[0], ' ').trim(); }
  const n = norm(base);
  let type = 'autres';
  for (const [t, re] of TYPES) if (re.test(n)) { type = t; break; }
  const sep = base.indexOf(' - ');
  let titre = sep !== -1 ? base.slice(sep + 3).trim() : '';
  if (!titre) titre = type === 'autres' ? base : LIBELLES[type] + ' du chapitre';
  if (type === 'corriges' && sep !== -1 && !norm(titre).startsWith('corrig')) titre = 'Corrigé · ' + titre;
  return { ext, type, titre, date, base };
}
const titreApresTiret = (base, defaut) => {
  const sep = base.indexOf(' - ');
  return sep !== -1 ? base.slice(sep + 3).trim() : defaut;
};

// Lit un fichier CSV : séparateur virgule, point-virgule ou tabulation,
// champs entre guillemets acceptés (un guillemet dans le texte s'écrit "").
function lireCsv(texte) {
  texte = texte.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  let sep = ';', guill = false;
  for (const ch of texte) {
    if (ch === '"') guill = !guill;
    else if (!guill && (ch === ',' || ch === ';' || ch === '\t')) { sep = ch; break; }
  }
  const lignes = [];
  let champ = '', ligne = [], i = 0;
  guill = false;
  while (i < texte.length) {
    const ch = texte[i];
    if (guill) {
      if (ch === '"' && texte[i + 1] === '"') { champ += '"'; i += 2; continue; }
      if (ch === '"') { guill = false; i++; continue; }
      champ += ch; i++; continue;
    }
    if (ch === '"' && champ.trim() === '') { guill = true; champ = ''; i++; continue; }
    if (ch === sep) { ligne.push(champ); champ = ''; i++; continue; }
    if (ch === '\n') { ligne.push(champ); lignes.push(ligne); ligne = []; champ = ''; i++; continue; }
    champ += ch; i++;
  }
  ligne.push(champ); lignes.push(ligne);
  return { sep, lignes: lignes.map((l) => l.map((c) => c.trim())).filter((l) => l[0] && !l[0].startsWith('#')) };
}

function lireFlashcards(texte) {
  const { sep, lignes } = lireCsv(texte);
  const cartes = [];
  for (const l of lignes) {
    const q = l[0], r = l.slice(1).join(sep).trim();
    if (!r || norm(q) === 'question') continue; // ligne d'en-tête
    cartes.push({ q, r });
  }
  return cartes;
}

// QCM : question, bonne réponse, mauvaise réponse 1, 2, 3 (facultatives), explication (facultative)
function lireQcm(texte) {
  const questions = [];
  for (const l of lireCsv(texte).lignes) {
    if (norm(l[0]) === 'question') continue;
    const bonne = l[1] || '';
    const fausses = [l[2], l[3], l[4]].filter(Boolean);
    if (!bonne || !fausses.length) continue;
    questions.push({ q: l[0], bonne, fausses, expl: l[5] || '' });
  }
  return questions;
}

// Date d'ajout de chaque fichier, lue dans l'historique GitHub.
function datesAjout() {
  const dates = new Map();
  try {
    const sortie = execFileSync('git', ['-c', 'core.quotepath=off', 'log', '--diff-filter=ACR', '--format=@@%cs', '--name-only', '--', 'documents'],
      { cwd: RACINE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    let date = null;
    for (const ligne of sortie.split('\n')) {
      if (ligne.startsWith('@@')) date = ligne.slice(2);
      else if (ligne && date && !dates.has(ligne)) dates.set(ligne, date); // le plus récent ajout d'abord
    }
  } catch { /* pas d'historique disponible : pas de « nouveautés » */ }
  return dates;
}

async function lireTexte(fichier) {
  try { return await readFile(fichier, 'utf8'); } catch { return ''; }
}
async function sousDossiers(dossier) {
  try {
    return (await readdir(dossier, { withFileTypes: true }))
      .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_'))
      .map((e) => e.name).sort(trierNoms);
  } catch { return []; }
}
async function fichiers(dossier) {
  return (await readdir(dossier, { withFileTypes: true }))
    .filter((e) => e.isFile() && !e.name.startsWith('.') && !e.name.startsWith('_'))
    .map((e) => e.name).sort(trierNoms);
}
async function copier(depuis, vers) {
  await mkdir(path.dirname(vers), { recursive: true });
  await copyFile(depuis, vers);
}

async function main() {
  const reglages = JSON.parse(await readFile(path.join(RACINE, 'reglages.json'), 'utf8'));
  await rm(SORTIE, { recursive: true, force: true });
  await mkdir(SORTIE, { recursive: true });
  const ajouts = datesAjout();

  const donnees = {
    genere: new Date().toISOString(),
    aujourdhui: AUJOURDHUI,
    reglages: { matiere: reglages.matiere, etablissement: reglages.etablissement, email: reglages.email || '' },
    textes: {
      presentation: await lireTexte(path.join(RACINE, 'textes', 'presentation.md')),
      annonces: await lireTexte(path.join(RACINE, 'textes', 'annonces.md')),
      methodologie: await lireTexte(path.join(RACINE, 'textes', 'methodologie.md')),
    },
    classes: [],
  };

  let nbPublies = 0, nbEnAttente = 0, nbCartes = 0, nbQcm = 0;
  for (const classe of reglages.classes) {
    const dossierClasse = path.join(RACINE, 'documents', classe.dossier);
    const c = {
      dossier: classe.dossier, nom: classe.nom, description: classe.description || '',
      progression: await lireTexte(path.join(dossierClasse, '_progression.md')),
      chapitres: [],
    };
    const ids = new Set();
    for (const nomChap of await sousDossiers(dossierClasse)) {
      const m = reparer(nomChap).match(/^(\d+)\s*[-–._)]?\s*(.*)$/);
      const numero = m ? Number(m[1]) : null;
      const titre = (m && m[2]) ? m[2].trim() : reparer(nomChap);
      let id = slug(reparer(nomChap));
      while (ids.has(id)) id += '-2';
      ids.add(id);
      const dossierChap = path.join(dossierClasse, nomChap);
      const ch = { id, numero, titre, essentiel: await lireTexte(path.join(dossierChap, '_essentiel.md')), documents: [], paquets: [], qcms: [] };

      for (const f of await fichiers(dossierChap)) {
        const source = path.join(dossierChap, f);
        const relatif = ['documents', classe.dossier, nomChap, f].join('/');
        const info = analyserNom(f);
        const ajoute = ajouts.get(relatif);
        const nf = norm(info.base);

        if ((info.ext === 'csv' || info.ext === 'txt') && nf.startsWith('flash')) {
          const cartes = lireFlashcards(await readFile(source, 'utf8'));
          if (cartes.length) { ch.paquets.push({ titre: titreApresTiret(info.base, 'Flashcards du chapitre'), cartes, ajoute }); nbCartes += cartes.length; }
          else console.warn(`Attention : aucune carte lue dans « ${f} ».`);
          continue;
        }
        if ((info.ext === 'csv' || info.ext === 'txt') && nf.startsWith('qcm')) {
          const questions = lireQcm(await readFile(source, 'utf8'));
          if (questions.length) { ch.qcms.push({ titre: titreApresTiret(info.base, 'QCM du chapitre'), questions, ajoute }); nbQcm++; }
          else console.warn(`Attention : aucune question lue dans « ${f} ».`);
          continue;
        }

        const disponible = !info.date || info.date <= AUJOURDHUI;
        const doc = { type: info.type, titre: info.titre, ext: info.ext, disponible };
        if (info.date) doc.date = info.date;
        if (disponible) {
          doc.fichier = relatif;
          doc.taille = (await stat(source)).size;
          // un corrigé daté est « nouveau » à partir de sa date de publication
          const d = info.date && (!ajoute || info.date > ajoute) ? info.date : ajoute;
          if (d) doc.ajoute = d;
          await copier(source, path.join(SORTIE, ...relatif.split('/')));
          nbPublies++;
        } else {
          nbEnAttente++;
        }
        ch.documents.push(doc);
      }
      c.chapitres.push(ch);
    }
    donnees.classes.push(c);
  }

  await copier(path.join(RACINE, 'index.html'), path.join(SORTIE, 'index.html'));
  await writeFile(path.join(SORTIE, 'donnees.json'), JSON.stringify(donnees));
  console.log(`Site construit (${AUJOURDHUI}) : ${nbPublies} document(s) publié(s), ${nbEnAttente} corrigé(s) en attente, ${nbCartes} flashcard(s), ${nbQcm} QCM.`);
}

main().catch((e) => { console.error('Erreur :', e.message); process.exit(1); });
