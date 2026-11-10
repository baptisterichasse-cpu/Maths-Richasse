// Génère les thèmes d'un lot de révisions et vérifie chaque exercice.
// Usage : node generer-lot.js lots/calcul-litteral.js
const fs = require('fs');
const path = require('path');
const A = require('./moteur.js');

const tex = (s) => { const r = A.analyser(s); if (!r.ok) throw new Error(`Illisible « ${s} » : ${r.erreur}`); return A.latex(r.arbre); };
const poly = (s) => { const r = A.analyser(s); if (!r.ok) throw new Error(`Illisible « ${s} » : ${r.erreur}`); return A.polynome(r.arbre); };
let erreurs = 0;
const ko = (msg) => { erreurs++; console.error('✗ ' + msg); };

// Valeur d'une expression : remplace x par la valeur, en ajoutant × et parenthèses
function substituer(expr, val) {
  const negOuFrac = /^-|\/|,/.test(val);
  const v = negOuFrac ? '(' + val + ')' : val;
  let s = '';
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch !== 'x') { s += ch; continue; }
    const avant = expr[i - 1], apres = expr[i + 1];
    if (avant && /[\d)]/.test(avant)) s += '*';
    s += v;
    if (apres === '(') s += '*';
  }
  return s;
}
function nombreTexte(q, decimal) {
  const [n, d] = q;
  if (d === 1) return String(n);
  if (decimal) {
    let dd = d; while (dd % 2 === 0) dd /= 2; while (dd % 5 === 0) dd /= 5;
    if (dd === 1) return String(n / d).replace('.', ',');
  }
  return (n < 0 ? '-' : '') + Math.abs(n) + '/' + d;
}
function constanteDe(s) {
  const p = poly(s), cles = Object.keys(p);
  if (cles.some((c) => c !== '')) throw new Error(`« ${s} » contient encore une lettre`);
  return p[''] || [0, 1];
}

function rendreCorrection(c, ex) {
  return c.replace(/\[\[(.+?)\]\]/g, (_, chaine) => {
    const membres = chaine.split('=').map((s) => s.trim());
    const pr = poly(ex.r);
    membres.forEach((mb, k) => { if (!A.egaux(poly(mb), pr)) ko(`[${ex.id}] étape ${k + 1} fausse : ${mb}`); });
    if ((ex.type === 'developpe' || ex.type === 'factorise') && ex.e && membres[0].replace(/\s/g, '') !== ex.e.replace(/\s/g, '')) ko(`[${ex.id}] la correction ne part pas de l’énoncé`);
    const fin = membres[membres.length - 1];
    if (A.verifier(ex.type, fin, ex.r).etat !== 'juste') ko(`[${ex.id}] dernière étape non acceptée : ${fin}`);
    return '$' + membres.map(tex).join(' = ') + '$';
  });
}

function preparer(ex, k, theme) {
  ex = Object.assign({}, ex);
  ex.id = theme.titre + ' n°' + (k + 1);
  if (ex.valeur) { // { valeur: [expression, valeur de x, étape intermédiaire facultative] }
    const [expr, val, milieu] = ex.valeur;
    const sub = substituer(expr, val);
    ex.type = 'nombre';
    ex.r = nombreTexte(constanteDe(sub), val.includes(','));
    ex.el = '$' + tex(expr) + '$ pour $x = ' + tex(val) + '$';
    const chaine = [sub].concat(milieu ? [milieu] : []).concat([ex.r]);
    ex.c = (ex.c ? ex.c + ' ' : '') + 'On remplace $x$ par $' + tex(val) + '$' + (/^-|\/|,/.test(val) ? ', entre parenthèses' : '') + '. [[' + chaine.join(' = ') + ']]';
  }
  ex.type = ex.type || theme.type;
  ex.consigne = ex.consigne || theme.consigne || A.CONSIGNES[ex.type];
  ex.enonce = ex.el || '$' + tex(ex.e) + '$';
  return ex;
}

function verifierExercice(ex) {
  if (!A.analyser(ex.r).ok) return ko(`[${ex.id}] réponse illisible : ${ex.r}`);
  if (ex.e && ex.type !== 'nombre' && !A.egaux(poly(ex.e), poly(ex.r))) ko(`[${ex.id}] réponse fausse : ${ex.e} ≠ ${ex.r}`);
  const v = A.verifier(ex.type, ex.r, ex.r, ex.enonce);
  if (v.etat !== 'juste') ko(`[${ex.id}] la réponse attendue n’est pas acceptée : ${v.message}`);
  if (ex.e && A.verifier(ex.type, ex.e, ex.r, ex.enonce).etat === 'juste') ko(`[${ex.id}] l’énoncé est déjà sous la forme attendue`);
  if (!/\[\[/.test(ex.c || '')) ko(`[${ex.id}] correction sans calcul vérifié`);
}

const lot = require(path.resolve(process.argv[2]));
const sortie = path.join(__dirname, 'sortie-lots');
lot.forEach((theme) => {
  if (theme.exercices.length !== 30) ko(`${theme.titre} : ${theme.exercices.length} exercices au lieu de 30`);
  const vus = new Set();
  const lignes = [['consigne', 'énoncé', 'réponse', 'vérification', 'correction']];
  theme.exercices.forEach((brut, k) => {
    const ex = preparer(brut, k, theme);
    if (vus.has(ex.enonce + ex.consigne)) ko(`[${ex.id}] doublon`);
    vus.add(ex.enonce + ex.consigne);
    verifierExercice(ex);
    lignes.push([ex.consigne, ex.enonce, ex.r, ex.type, rendreCorrection(ex.c, ex)]);
  });
  const dossier = path.join(sortie, theme.dossier);
  fs.mkdirSync(dossier, { recursive: true });
  const csv = lignes.map((l) => l.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n') + '\n';
  fs.writeFileSync(path.join(dossier, `revision - ${theme.titre}.csv`), csv);
  console.log(`✓ ${theme.dossier} / ${theme.titre} : ${theme.exercices.length} exercices`);
});
if (erreurs) { console.error(`${erreurs} erreur(s)`); process.exit(1); }
console.log('Toutes les vérifications sont passées.');
