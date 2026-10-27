// Construit le site dans le dossier _site/ à partir de vos fichiers.
// Lancé automatiquement par GitHub à chaque modification et chaque matin.
// Vous n'avez normalement jamais besoin de modifier ce fichier.

import { readdir, readFile, writeFile, mkdir, copyFile, rm, stat } from 'node:fs/promises';
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
  return { ext, type, titre, date };
}

// Lit un fichier CSV de flashcards : séparateur virgule, point-virgule ou tabulation,
// champs entre guillemets acceptés (un guillemet dans le texte s'écrit "").
function lireFlashcards(texte) {
  texte = texte.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  // Le séparateur est celui qui apparaît en premier hors guillemets sur la première ligne utile.
  let sep = ';', dansGuillemets = false;
  for (const ch of texte) {
    if (ch === '"') dansGuillemets = !dansGuillemets;
    else if (!dansGuillemets && (ch === ',' || ch === ';' || ch === '\t')) { sep = ch; break; }
    else if (!dansGuillemets && ch === '\n') { dansGuillemets = false; }
  }
  const lignes = [];
  let champ = '', ligne = [], i = 0, guill = false;
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

  const cartes = [];
  for (const l of lignes) {
    const q = (l[0] || '').trim(), r = l.slice(1).join(sep).trim();
    if (!q || q.startsWith('#') || !r) continue;
    if (norm(q) === 'question') continue; // ligne d'en-tête
    cartes.push({ q, r });
  }
  return cartes;
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

  const donnees = {
    genere: new Date().toISOString(),
    reglages: { matiere: reglages.matiere, etablissement: reglages.etablissement, email: reglages.email || '' },
    textes: {
      presentation: await lireTexte(path.join(RACINE, 'textes', 'presentation.md')),
      annonces: await lireTexte(path.join(RACINE, 'textes', 'annonces.md')),
    },
    classes: [],
  };

  let nbPublies = 0, nbEnAttente = 0;
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
      const ch = { id, numero, titre, documents: [], paquets: [] };

      for (const f of await fichiers(path.join(dossierClasse, nomChap))) {
        const source = path.join(dossierClasse, nomChap, f);
        const relatif = ['documents', classe.dossier, nomChap, f].join('/');
        const info = analyserNom(f);

        if (norm(f).startsWith('flash') && (info.ext === 'csv' || info.ext === 'txt')) {
          const cartes = lireFlashcards(await readFile(source, 'utf8'));
          const base = reparer(path.basename(f, path.extname(f)));
          const sep = base.indexOf(' - ');
          if (cartes.length) ch.paquets.push({ titre: sep !== -1 ? base.slice(sep + 3).trim() : 'Flashcards du chapitre', cartes });
          else console.warn(`Attention : aucune carte lue dans « ${f} ».`);
          continue;
        }

        const disponible = !info.date || info.date <= AUJOURDHUI;
        const doc = { type: info.type, titre: info.titre, ext: info.ext, disponible };
        if (info.date) doc.date = info.date;
        if (disponible) {
          doc.fichier = relatif;
          doc.taille = (await stat(source)).size;
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
  console.log(`Site construit (${AUJOURDHUI}) : ${nbPublies} document(s) publié(s), ${nbEnAttente} corrigé(s) en attente.`);
}

main().catch((e) => { console.error('Erreur :', e.message); process.exit(1); });
