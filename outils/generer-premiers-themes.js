// Génère les fichiers CSV de révisions et vérifie chaque exercice.
const fs = require('fs');
const path = require('path');
const A = require('./moteur.js');
const { fractions, developpement, factorisation } = require('./lots/premiers-themes.js');

const pgcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const ppcm = (a, b) => a / pgcd(a, b) * b;
const tex = (s) => { const r = A.analyser(s); if (!r.ok) throw new Error(`Illisible « ${s} » : ${r.erreur}`); return A.latex(r.arbre); };
const poly = (s) => A.polynome(A.analyser(s).arbre);
let erreurs = 0;
const ko = (msg) => { erreurs++; console.error('✗ ' + msg); };

function fracTexte(n, d) { return d === 1 ? String(n) : (n < 0 ? '-' : '') + Math.abs(n) + '/' + d; }

function correctionFraction(e) {
  const termes = [];
  const re = /([+-]?)(\(-?\d+\)|\d+)(?:\/(\d+))?/g;
  let m;
  while ((m = re.exec(e))) termes.push({ s: m[1] === '-' ? -1 : 1, n: Number(m[2].replace(/[()]/g, '')), d: m[3] ? Number(m[3]) : 1 });
  const den = termes.map((t) => t.d).reduce(ppcm, 1);
  const memeDen = termes.every((t) => t.d === termes[0].d);
  const nums = termes.map((t) => t.s * t.n * (den / t.d));
  const S = nums.reduce((a, b) => a + b, 0);
  const somme = nums.map((a, k) => (a < 0 ? '-' : (k ? '+' : '')) + Math.abs(a)).join('');
  const chaine = [e];
  let texte;
  if (memeDen) {
    texte = 'Même dénominateur : on ajoute les numérateurs.';
    const numEcrits = termes.map((t, k) => (t.s < 0 ? '-' : (k ? '+' : '')) + (t.n < 0 ? '(' + t.n + ')' : t.n)).join('');
    chaine.push('(' + numEcrits + ')/' + den);
  } else {
    texte = termes.some((t) => t.d === 1) ? `On écrit l’entier sous forme de fraction de dénominateur $${den}$.` : `Dénominateur commun : $${den}$.`;
    chaine.push(nums.map((a, k) => (a < 0 ? '-' : (k ? '+' : '')) + Math.abs(a) + '/' + den).join(''));
    chaine.push('(' + somme + ')/' + den);
  }
  chaine.push(fracTexte(S, den));
  const g = pgcd(S, den);
  if (g > 1) { chaine.push(fracTexte(S / g, den / g)); }
  const fin = g > 1 ? ` On simplifie ensuite par $${g}$.` : '';
  return { r: fracTexte(S / g, den / g), c: `${texte}${fin} [[${chaine.join(' = ')}]]` };
}

function rendreCorrection(c, e, r, type) {
  return c.replace(/\[\[(.+?)\]\]/g, (_, chaine) => {
    const membres = chaine.split('=').map((s) => s.trim());
    const pe = poly(e);
    membres.forEach((mb, k) => {
      if (!A.egaux(poly(mb), pe)) ko(`[${e}] étape ${k + 1} fausse : ${mb}`);
    });
    if (membres[0].replace(/\s/g, '') !== e.replace(/\s/g, '')) ko(`[${e}] la correction ne part pas de l’énoncé`);
    const fin = membres[membres.length - 1];
    if (type !== 'developpe' && A.verifier(type, fin, r).etat !== 'juste') ko(`[${e}] dernière étape non acceptée : ${fin}`);
    return '$' + membres.map(tex).join(' = ') + '$';
  });
}

function construire(nomTheme, type, liste) {
  const lignes = [['consigne', 'énoncé', 'réponse', 'vérification', 'correction']];
  liste.forEach((ex, k) => {
    let [e, r, c] = ex;
    if (type === 'fraction') ({ r, c } = correctionFraction(e));
    const enonce = '$' + tex(e) + '$';
    if (!A.egaux(poly(e), poly(r))) ko(`[${e}] réponse fausse : ${r}`);
    const v = A.verifier(type, r, r, enonce);
    if (v.etat !== 'juste') ko(`[${e}] la réponse attendue n’est pas acceptée : ${v.message}`);
    if (A.verifier(type, e, r, enonce).etat === 'juste') ko(`[${e}] l’énoncé est déjà sous la forme attendue`);
    const correction = rendreCorrection(c, e, r, type);
    lignes.push([A.CONSIGNES[type], enonce, r, type, correction]);
  });
  const csv = lignes.map((l) => l.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n') + '\n';
  const fichier = path.join('sortie', `revision - ${nomTheme}.csv`);
  fs.mkdirSync('sortie', { recursive: true });
  fs.writeFileSync(fichier, csv);
  console.log(`✓ ${fichier} : ${liste.length} exercices`);
}

construire('Addition de fractions', 'fraction', fractions);
construire('Développement', 'developpe', developpement);
construire('Factorisation', 'factorise', factorisation);
if (erreurs) { console.error(`${erreurs} erreur(s)`); process.exit(1); }
console.log('Toutes les vérifications sont passées.');
