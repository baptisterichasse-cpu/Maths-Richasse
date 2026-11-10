// Générateur de thèmes de révision (format compact). Usage : node generer.js lots/nombres.js
// Les réponses sont calculées par le moteur ; chaque étape de correction est vérifiée.
const fs = require('fs');
const path = require('path');
const A = require('./moteur.js');

let erreurs = 0, ici = '';
const ko = (m) => { erreurs++; console.error('✗ [' + ici + '] ' + m); };
const arbre = (s) => { const r = A.analyser(s); if (!r.ok) throw new Error(`illisible « ${s} » : ${r.erreur}`); return r.arbre; };
const tex = (s) => A.latex(arbre(s));
const poly = (s) => A.polynome(arbre(s));
const pgcd = A.pgcd, ppcm = (a, b) => a / pgcd(a, b) * b;

/* ----- Rationnels [n, d] ----- */
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = pgcd(n, d) || 1; return [n / g, d / g]; };
const add = (a, b) => R(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const mul = (a, b) => R(a[0] * b[0], a[1] * b[1]);
const div = (a, b) => R(a[0] * b[1], a[1] * b[0]);
const neg = (a) => [-a[0], a[1]];
const cmp = (a, b) => a[0] * b[1] - b[0] * a[1];
const cst = (s) => { const p = poly(s), k = Object.keys(p); if (k.some((c) => c !== '')) throw new Error(`« ${s} » n’est pas un nombre`); return p[''] || [0, 1]; };
const decimalFini = (d) => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
function txt(q, decimal) { // écriture clavier d'un rationnel
  const [n, d] = q;
  if (d === 1) return String(n);
  if (decimal && decimalFini(d)) { let k = 0, m = d; while (m !== 1) { k++; m = R(10 ** k, d)[1]; } const e = Math.abs(n) * (10 ** k / d), s = String(e).padStart(k + 1, '0'); return (n < 0 ? '-' : '') + s.slice(0, -k) + ',' + s.slice(-k); }
  return (n < 0 ? '-' : '') + Math.abs(n) + '/' + d;
}
const fr = (q) => q[1] === 1 ? String(q[0]) : (q[0] < 0 ? '-' : '') + '\\dfrac{' + Math.abs(q[0]) + '}{' + q[1] + '}';
const nb = (s) => { const [e, d] = String(s).split(','); const g = e.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,'); return d === undefined ? g : g + '{,}' + d; };
const N = (s) => /\//.test(String(s)) ? fr(cst(String(s))) : nb(s);

/* ----- Écriture « en ligne » : ÷ avec « : », fractions a/b, pas de fractions empilées ----- */
function lin(s) {
  if (/\^-?\d+\//.test(s)) throw new Error('puissance suivie de / en mode ligne : ' + s);
  return s.replace(/\s+/g, '')
    .replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\dfrac{$1}{$2}')
    .replace(/(\d+)\/(\d+)/g, '\\dfrac{$1}{$2}')
    .replace(/\^\((-?\d+)\)|\^(-?\d+)/g, (m, a, b) => '^{' + (a || b) + '}')
    .replace(/√\(([^()]+)\)|√(\d+)/g, (m, a, b) => '\\sqrt{' + (a || b) + '}')
    .replace(/\*/g, '\\times ').replace(/:/g, '\\div ').replace(/(\d),(\d)/g, '$1{,}$2')
    .replace(/\(/g, '\\left(').replace(/\)/g, '\\right)');
}
const calc = (s) => s.replace(/(\d+)\/(\d+)/g, '($1/$2)').replace(/:/g, '/');
const POLY = ['nombre', 'fraction', 'developpe', 'factorise', 'puissance', 'scientifique', 'decomposition', 'racine'];

function substituer(expr, val) {
  const v = /^-|\/|,/.test(val) ? '(' + val + ')' : val;
  let s = '';
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] !== 'x') { s += expr[i]; continue; }
    if (i && /[\d)]/.test(expr[i - 1])) s += '*';
    s += v;
    if (expr[i + 1] === '(') s += '*';
  }
  return s;
}

/* ----- Équations et inéquations ----- */
function coefs(g, d) {
  const p = poly(`(${g})-(${d})`), c = { 2: [0, 1], 1: [0, 1], 0: [0, 1] };
  for (const k of Object.keys(p)) { const m = /^[a-z](?:\^(\d+))?$/.exec(k); const deg = k === '' ? 0 : m ? Number(m[1] || 1) : 9; if (deg > 2) throw new Error('équation non gérée'); c[deg] = p[k]; }
  return c;
}
function resoudre(g, d) { // → liste d'écritures clavier, triées
  const c = coefs(g, d);
  if (c[2][0] === 0) { if (c[1][0] === 0) { if (c[0][0] === 0) throw new Error('équation toujours vraie'); return []; } return [txt(div(neg(c[0]), c[1]))]; }
  const disc = add(mul(c[1], c[1]), neg(mul([4, 1], mul(c[2], c[0]))));
  if (disc[0] < 0) return [];
  const deuxA = mul([2, 1], c[2]);
  if (disc[0] === 0) return [txt(div(neg(c[1]), deuxA))];
  const [k, m] = A.carres(disc[0] * disc[1]);
  if (m === 1) { const s = R(k, disc[1]); return [div(add(neg(c[1]), neg(s)), deuxA), div(add(neg(c[1]), s), deuxA)].sort(cmp).map((q) => txt(q)); }
  if (c[1][0] !== 0) throw new Error('racines non gérées');
  const v = div(neg(c[0]), c[2]);
  if (v[1] !== 1) throw new Error('racine de fraction non gérée');
  const [k2, m2] = A.carres(v[0]), t = (k2 > 1 ? k2 : '') + '√' + m2;
  return ['-' + t, t];
}
const LP = A.latexPolynome;
const echelle = (p, k) => { const q = {}; for (const c in p) q[c] = mul(p[c], k); return q; };
function etapesLineaires(g, d, sym, lettre) {
  let pl = poly(g), pr = poly(d);
  const dens = [...Object.values(pl), ...Object.values(pr)].map((q) => q[1]), D = dens.reduce(ppcm, 1), parts = [];
  const S = sym || ' = ';
  if (D > 1) { pl = echelle(pl, [D, 1]); pr = echelle(pr, [D, 1]); parts.push(`On multiplie les deux membres par $${D}$ : $${LP(pl)}${S}${LP(pr)}$.`); }
  else if (tex(g) !== LP(pl) || tex(d) !== LP(pr)) parts.push(`On développe et on réduit : $${LP(pl)}${S}${LP(pr)}$.`);
  const a1 = pl[lettre] || [0, 1], a2 = pr[lettre] || [0, 1], b1 = pl[''] || [0, 1], b2 = pr[''] || [0, 1];
  const Aa = add(a1, neg(a2)), B = add(b2, neg(b1));
  if (a2[0] !== 0 || b1[0] !== 0) parts.push(`On regroupe les $${lettre}$ dans un membre et les nombres dans l’autre : $${LP({ [lettre]: Aa })}${S}${fr(B)}$.`);
  return { parts, Aa, B };
}
function equation(th, o) {
  const [g, d] = o.eq.split('='), lettre = (/[a-z]/.exec(o.eq) || ['x'])[0];
  const enonce = '$' + tex(g) + ' = ' + tex(d) + '$';
  if (o.parmi) {
    const sols = [], lignes = [];
    for (const v of o.parmi) {
      const vg = cst(substituer(g, v)), vd = cst(substituer(d, v)), bon = cmp(vg, vd) === 0;
      if (bon) sols.push(v);
      lignes.push(`Pour $x = ${N(v)}$ : $${fr(vg)} ${bon ? '=' : '\\neq'} ${fr(vd)}$${bon ? ', donc $' + N(v) + '$ est solution' : ''}.`);
    }
    return { enonce: enonce + ' — valeurs proposées : ' + o.parmi.map((v) => '$' + N(v) + '$').join(' ; '), r: sols.join(';') || 'aucune', type: 'ensemble', c: 'On remplace $x$ par chaque valeur et on compare les deux membres. ' + lignes.join(' ') };
  }
  const sols = resoudre(g, d), r = sols.join(';') || 'aucune';
  for (const s of sols) if (!/√/.test(s) && cmp(cst(substituer(g, s)), cst(substituer(d, s))) !== 0) ko('solution fausse ' + s);
  if (o.r && o.r !== r) ko(`réponse annoncée ${o.r} ≠ calculée ${r}`);
  let c = o.c;
  const co = coefs(g, d);
  if (!c && co[2][0] === 0 && co[1][0] !== 0) {
    const { parts, Aa, B } = etapesLineaires(g, d, ' = ', lettre);
    if (cmp(Aa, [1, 1]) !== 0) parts.push(`On divise par $${fr(Aa)}$ : $${lettre} = ${fr(div(B, Aa))}$.`);
    c = parts.join(' ');
  } else if (!c && co[2][0] === 0) {
    c = `En réduisant, on obtient $0 = ${fr(neg(co[0]))}$, ce qui est impossible : l’équation n’a pas de solution.`;
  } else if (!c && /^0$/.test(d.trim()) && /^[^()]*(\([^()]+\)(\^2)?)+$/.test(g)) {
    const facteurs = [], prefixe = g.slice(0, g.indexOf('('));
    if (/[a-z]/.test(prefixe)) facteurs.push(prefixe.replace(/^-?\d*/, '') || prefixe);
    g.replace(/\(([^()]+)\)/g, (m, f) => { facteurs.push(f); return m; });
    const morceaux = facteurs.map((f) => { const s = resoudre(f, '0'); return { f, s: s[0] }; });
    const uniques = morceaux.filter((m, i) => morceaux.findIndex((x) => x.s === m.s) === i);
    c = 'Un produit est nul si et seulement si l’un de ses facteurs est nul. ' +
      '$' + uniques.map((m) => tex(m.f) + ' = 0').join('$ ou $') + '$, donc $' + uniques.map((m) => lettre + ' = ' + N(m.s)).join('$ ou $') + '$.';
  } else if (!c && co[1][0] === 0) {
    const v = div(neg(co[0]), co[2]), parts = [];
    if (g.trim() !== lettre + '^2' || /[a-z]/.test(d)) parts.push(`On isole $${lettre}^2$ : $${lettre}^2 = ${fr(v)}$.`);
    if (v[0] < 0) parts.push('Un carré n’est jamais négatif : l’équation n’a pas de solution.');
    else if (v[0] === 0) parts.push(`Le seul nombre dont le carré est nul est $0$.`);
    else parts.push(`$${fr(v)}$ est positif : il y a deux solutions, $${lettre} = ${tex(sols[1])}$ ou $${lettre} = ${tex(sols[0])}$.`);
    c = parts.join(' ');
  }
  if (!c) ko('correction manquante pour ' + o.eq);
  return { enonce, r, type: 'ensemble', c: note(o.n) + c };
}
const OPS = { '<=': ['≤', ' \\leqslant '], '>=': ['≥', ' \\geqslant '], '<': ['<', ' < '], '>': ['>', ' > '] };
const INV = { '≤': '≥', '≥': '≤', '<': '>', '>': '<' };
function inequation(th, o) {
  const m = /^(.+?)(<=|>=|<|>)(.+)$/.exec(o.ineq), g = m[1], d = m[3], [op, sym] = OPS[m[2]], lettre = (/[a-z]/.exec(o.ineq))[0];
  const { parts, Aa, B } = etapesLineaires(g, d, sym, lettre);
  if (Aa[0] === 0) throw new Error('inéquation sans inconnue');
  const borne = div(B, Aa), opF = Aa[0] < 0 ? INV[op] : op, symF = Object.values(OPS).find((x) => x[0] === opF)[1];
  if (cmp(Aa, [1, 1]) !== 0) parts.push(`On divise par $${fr(Aa)}$${Aa[0] < 0 ? ', qui est négatif : le sens de l’inégalité change' : ''} : $${lettre}${symF}${fr(borne)}$.`);
  return { enonce: '$' + tex(g) + sym + tex(d) + '$', r: lettre + opF + txt(borne), type: 'inequation', c: note(o.n) + parts.join(' ') };
}

/* ----- Arithmétique ----- */
const diviseurs = (n) => { const d = []; for (let k = 1; k <= n; k++) if (n % k === 0) d.push(k); return d; };
const facteursPremiers = (n) => { const f = []; for (let p = 2; n > 1; p++) while (n % p === 0) { f.push(p); n /= p; } return f; };
const puissances = (f, sep = '*') => [...new Set(f)].map((p) => { const k = f.filter((x) => x === p).length; return k > 1 ? p + '^' + k : String(p); }).join(sep);
const somme = (n) => String(n).split('').reduce((a, c) => a + Number(c), 0);
function critere(n, d) {
  const oui = n % d === 0, s = somme(n), fin = n % 10, deux = n % 100;
  if (d === 2) return `$2$ : le chiffre des unités est $${fin}$, ${oui ? 'pair' : 'impair'}`;
  if (d === 5) return `$5$ : le nombre ${oui ? 'se termine' : 'ne se termine pas'} par $0$ ou $5$`;
  if (d === 10) return `$10$ : le nombre ${oui ? 'se termine' : 'ne se termine pas'} par $0$`;
  if (d === 3 || d === 9) return `$${d}$ : la somme des chiffres vaut $${s}$, ${oui ? 'multiple' : 'non multiple'} de $${d}$`;
  if (d === 4) return `$4$ : les deux derniers chiffres forment $${deux}$, ${oui ? 'multiple' : 'non multiple'} de $4$`;
  return oui ? `$${d}$ : $${nb(n)} = ${d}\\times ${nb(n / d)}$` : `$${d}$ : $${nb(n)} = ${d}\\times ${nb(Math.floor(n / d))} + ${n % d}$, le reste n’est pas nul`;
}
function arrondi(o) {
  const [s, n] = o.arr, mode = o.mode || 'arrondi', q = cst(s), p10 = 10 ** Math.abs(n);
  const num = n >= 0 ? q[0] * p10 : q[0], den = n >= 0 ? q[1] : q[1] * p10;
  const bas = Math.floor(num / den), reste = num - bas * den;
  const haut = mode === 'exces' ? reste > 0 : mode === 'arrondi' ? 2 * reste >= den : false;
  const e = bas + (haut ? 1 : 0);
  let r;
  if (n <= 0) r = String(e * p10); else { const t = String(e).padStart(n + 1, '0'); r = t.slice(0, -n) + ',' + t.slice(-n); }
  const suivant = Math.floor(reste * 10 / den);
  const RANG = { 0: 'à l’unité', 1: 'au dixième', 2: 'au centième', 3: 'au millième', '-1': 'à la dizaine', '-2': 'à la centaine', '-3': 'au millier' };
  const QUOI = { arrondi: 'Arrondir ', tronc: 'Donner la troncature ', defaut: 'Donner la valeur approchée par défaut ', exces: 'Donner la valeur approchée par excès ' };
  let approx = '';
  if (/\//.test(s) || /√/.test(s)) { const k = Math.max(n, 0) + 2, v = Math.floor(q[0] * 10 ** k / q[1]), t = String(v).padStart(k + 1, '0'); approx = `$${N(s)} = ${nb(t.slice(0, -k) + ',' + t.slice(-k))}\\ldots$ `; }
  const c = mode === 'arrondi'
    ? `${approx}Le chiffre qui suit est $${suivant}$ : ${suivant >= 5 ? 'il vaut au moins $5$, on arrondit au-dessus' : 'il est inférieur à $5$, on garde le chiffre précédent'}. Réponse : $${nb(r)}$.`
    : `${approx}${mode === 'exces' ? 'Par excès, on prend la valeur juste au-dessus' : 'On coupe après le rang demandé, sans arrondir'}. Réponse : $${nb(r)}$.`;
  return { consigne: QUOI[mode] + RANG[n] + '.', enonce: '$' + N(s) + '$', r, type: 'nombre', c };
}
function ordre(valeurs) { return valeurs.map((v) => ({ v, q: cst(v) })).sort((a, b) => cmp(a.q, b.q)); }
function explicationOrdre(valeurs, tri) {
  const fractions = valeurs.filter((v) => /\//.test(v));
  let debut = '';
  if (fractions.length) {
    const L = valeurs.map((v) => cst(v)[1]).reduce(ppcm, 1);
    debut = `Même dénominateur $${L}$ : ` + valeurs.map((v) => { const q = cst(v); return `$${N(v)} = \\dfrac{${q[0] * L / q[1]}}{${L}}$`; }).join(' ; ') + '. ';
  } else if (valeurs.some((v) => /,/.test(v))) {
    const k = Math.max(...valeurs.map((v) => (v.split(',')[1] || '').length));
    debut = 'On écrit tous les nombres avec le même nombre de décimales : ' + valeurs.map((v) => { const [e, dcm = ''] = v.split(','); return '$' + nb(e + ',' + dcm.padEnd(k, '0')) + '$'; }).join(' ; ') + '. ';
  }
  return debut + 'Donc $' + tri.map((x) => N(x.v)).join(' < ') + '$.';
}
function scientifique(o) {
  const s = o.sci, q = cst(s);
  let n = 0, a = [Math.abs(q[0]), q[1]];
  while (cmp(a, [10, 1]) >= 0) { a = div(a, [10, 1]); n++; }
  while (cmp(a, [1, 1]) < 0) { a = mul(a, [10, 1]); n--; }
  const at = (q[0] < 0 ? '-' : '') + txt(a, true), r = at + '*10^' + n;
  return { consigne: A.CONSIGNES.scientifique, enonce: '$' + nb(s) + '$', r, type: 'scientifique', c: `Le premier facteur doit être compris entre $1$ et $10$ : la virgule se déplace de $${Math.abs(n)}$ rang${Math.abs(n) > 1 ? 's' : ''} vers la ${n > 0 ? 'gauche' : 'droite'}. $${nb(s)} = ${nb(at)}\\times 10^{${n}}$` };
}

const note = (n) => !n ? '' : /[.!?]$/.test(n) ? n + ' ' : n + ' : ';

/* ----- Un exercice ----- */
function chaine(th, type, e, etapes, rImpose) {
  const mode = th.mode === 'lin', val = (s) => poly(mode ? calc(s) : s), rendu = (s) => mode ? lin(s) : tex(s);
  let liste = [e, ...etapes], r = rImpose;
  if (!r && (type === 'nombre' || type === 'fraction')) {
    const p = val(e), k = Object.keys(p);
    if (k.some((c) => c !== '')) throw new Error('résultat non numérique : ' + e);
    r = txt(p[''] || [0, 1], type === 'nombre' && (th.decimal || /,/.test(e)));
    if (liste[liste.length - 1].replace(/\s/g, '') !== r) liste.push(r);
  } else if (!r) { if (liste.length < 2) throw new Error('réponse manquante : ' + e); r = liste[liste.length - 1]; }
  else if (liste[liste.length - 1].replace(/\s/g, '') !== r) liste.push(r);
  const ref = val(r);
  liste.forEach((m, i) => { if (!A.egaux(val(m), ref)) ko(`étape ${i + 1} fausse : ${m} (réponse ${r})`); });
  if (A.verifier(type, mode ? calc(e) : e, r).etat === 'juste') ko('énoncé déjà sous la forme attendue : ' + e);
  return { r, rendu, texte: '$' + liste.map(rendu).join(' = ') + '$', enonce: '$' + rendu(e) + '$' };
}
function exercice(th, brut) {
  let o = brut;
  if (typeof o === 'string' || Array.isArray(o)) {
    const t = [].concat(o), note = t.length > 1 && t[t.length - 1][0] === '#' ? t.pop().slice(1) : '';
    o = th.forme === 'eq' ? { eq: t[0], n: note } : th.forme === 'ineq' ? { ineq: t[0], n: note } : { e: t[0], s: t.slice(1), n: note };
  }
  const type = o.type || th.type;
  if (o.eq) return equation(th, o);
  if (o.ineq) return inequation(th, o);
  if (o.arr) return arrondi(o);
  if (o.sci) return scientifique(o);
  if (o.div) { const d = o.parmi.filter((k) => o.div % k === 0); return { consigne: 'Parmi les nombres proposés, lesquels sont des diviseurs du nombre donné ? (Répondre « aucun » s’il n’y en a pas.)', enonce: `$${nb(o.div)}$ — nombres proposés : ` + o.parmi.map((k) => '$' + k + '$').join(' ; '), r: d.join(';') || 'aucun', type: 'ensemble', c: o.parmi.map((k) => critere(o.div, k)).join(' ; ') + '.' }; }
  if (o.diviseurs) { const d = diviseurs(o.diviseurs); return { consigne: 'Donner tous les diviseurs du nombre, séparés par des points-virgules.', enonce: '$' + o.diviseurs + '$', r: d.join(';'), type: 'ensemble', c: 'On cherche les produits égaux à $' + o.diviseurs + '$ : ' + d.filter((k) => k * k <= o.diviseurs).map((k) => `$${k}\\times ${o.diviseurs / k}$`).join(', ') + `. Il y a $${d.length}$ diviseurs.` }; }
  if (o.multiples) { const [k, lo, hi] = o.multiples, m = []; for (let x = Math.ceil(lo / k) * k; x <= hi; x += k) m.push(x); return { consigne: 'Donner tous les multiples demandés, séparés par des points-virgules.', enonce: `Multiples de $${k}$ compris entre $${lo}$ et $${hi}$`, r: m.join(';'), type: 'ensemble', c: m.map((x) => `$${k}\\times ${x / k} = ${x}$`).join(' ; ') + '.' }; }
  if (o.de) { const [a, b] = o.de, q = Math.floor(a / b), r = a % b; return { consigne: 'Donner le quotient puis le reste de la division euclidienne, séparés par un point-virgule.', enonce: o.t || `Division euclidienne de $${nb(a)}$ par $${b}$`, r: q + ';' + r, type: 'liste', c: note(o.n) + (r ? `$${nb(a)} = ${b}\\times ${q} + ${r}$ et le reste $${r}$ est bien inférieur à $${b}$.` : `$${nb(a)} = ${b}\\times ${q}$ : le reste est nul.`) }; }
  if (o.premiers) { const p = o.premiers.filter(A.estPremier); return { consigne: 'Parmi les nombres proposés, lesquels sont des nombres premiers ? (Répondre « aucun » s’il n’y en a pas.)', enonce: o.premiers.map((k) => '$' + k + '$').join(' ; '), r: p.join(';') || 'aucun', type: 'ensemble', c: o.premiers.map((k) => A.estPremier(k) ? `$${k}$ est premier` : k < 2 ? `$${k}$ n’est pas premier (un nombre premier a exactement deux diviseurs)` : `$${k} = ${puissances(facteursPremiers(k), '\\times ').replace(/\^(\d+)/g, '^{$1}')}$`).join(' ; ') + '.' }; }
  if (o.dec) { const f = facteursPremiers(o.dec), etapes = []; let reste = o.dec; f.slice(0, -1).forEach((p, i) => { reste /= p; etapes.push(f.slice(0, i + 1).join('*') + '*' + reste); }); const r = puissances(f); const ch = chaine({ mode: 'lin' }, 'decomposition', String(o.dec), etapes.filter((x) => x !== r), r); return { enonce: '$' + nb(o.dec) + '$', r, type: 'decomposition', c: 'On divise par les nombres premiers successifs. ' + ch.texte }; }
  if (o.pgcd || o.irr || o.communs) {
    const [a, b] = o.pgcd || o.irr || o.communs, g = pgcd(a, b), dec = (n) => `$${nb(n)} = ${lin(puissances(facteursPremiers(n)))}$`;
    if (o.communs) { const d = diviseurs(g); return { consigne: 'Donner tous les diviseurs communs aux deux nombres, séparés par des points-virgules.', enonce: `$${a}$ et $${b}$`, r: d.join(';'), type: 'ensemble', c: `Diviseurs de $${a}$ : ${diviseurs(a).join(', ')}. Diviseurs de $${b}$ : ${diviseurs(b).join(', ')}. Les diviseurs communs sont ceux de $${g}$.` }; }
    if (o.pgcd) return { consigne: o.t ? 'Répondre par un nombre.' : 'Donner le plus grand diviseur commun aux deux nombres.', enonce: o.t || `$${nb(a)}$ et $${nb(b)}$`, r: String(g), type: 'nombre', c: note(o.n) + `${dec(a)} et ${dec(b)}. ` + (g > 1 ? `On garde les facteurs communs : $${lin(puissances(facteursPremiers(g)))}${A.estPremier(g) ? '' : ' = ' + g}$.` : 'Il n’y a aucun facteur premier commun : le plus grand diviseur commun est $1$.') };
    const r = txt(R(a, b));
    return { consigne: 'Rendre la fraction irréductible.', enonce: `$\\dfrac{${a}}{${b}}$`, r, type: 'fraction', c: g === 1 ? `${dec(a)} et ${dec(b)} n’ont aucun facteur premier commun : la fraction est déjà irréductible.` : `${dec(a)} et ${dec(b)} : le plus grand diviseur commun est $${g}$. $\\dfrac{${a}}{${b}} = \\dfrac{${g}\\times ${a / g}}{${g}\\times ${b / g}} = ${fr(R(a, b))}$` };
  }
  if (o.simp) { const [a, b] = o.simp, g = pgcd(a, b); return { enonce: `$\\dfrac{${a}}{${b}}$`, r: txt(R(a, b)), type: 'fraction', c: `On divise le numérateur et le dénominateur par $${g}$. $\\dfrac{${a}}{${b}} = \\dfrac{${g}\\times ${a / g}}{${g}\\times ${b / g}} = ${fr(R(a, b))}$` }; }
  if (o.ranger || o.max || o.min) {
    const vals = o.ranger || o.max || o.min, tri = ordre(vals), dec = o.sens === 'd';
    const c = explicationOrdre(vals, tri);
    if (o.ranger) return { consigne: `Ranger dans l’ordre ${dec ? 'décroissant' : 'croissant'}, en séparant les nombres par des points-virgules.`, enonce: vals.map((v) => '$' + N(v) + '$').join(' ; '), r: (dec ? [...tri].reverse() : tri).map((x) => x.v).join(';'), type: 'liste', c };
    return { consigne: o.max ? 'Quel est le plus grand de ces nombres ?' : 'Quel est le plus petit de ces nombres ?', enonce: vals.map((v) => '$' + N(v) + '$').join(' ; '), r: (o.max ? tri[tri.length - 1] : tri[0]).v, type: 'nombre', c };
  }
  if (o.q) { const [f, Q, u] = o.q, q = cst(f), simple = Number(Q) % q[1] === 0; const ch = chaine({ mode: 'lin', decimal: true }, 'nombre', `${f}*${Q}`, [simple ? `${q[0]}*${Number(Q) / q[1]}` : `(${q[0]}*${Q})/(${q[1]})`]); return { enonce: `${q[0] === 1 ? 'Le' : 'Les'} $${fr(q)}$ de $${nb(Q)}$${u ? ' ' + u : ''}`, r: ch.r, type: 'nombre', c: `Prendre une fraction d’une quantité, c’est multiplier par cette fraction. ${ch.texte}` }; }
  // Forme générale : énoncé calculé (e) ou texte (t), étapes (s), note (n), correction rédigée (c)
  let res;
  if (o.e) res = chaine(th, type, o.e, o.s || [], o.r);
  const r = res ? res.r : o.r;
  if (!r) throw new Error('réponse manquante');
  const rendu = res ? res.rendu : (s) => (th.mode === 'lin' ? lin(s) : tex(s));
  let c = o.c ? o.c.replace(/\[\[(.+?)\]\]/g, (m, ch) => {
    const mb = ch.split('=').map((s) => s.trim()), v = (s) => poly(th.mode === 'lin' ? calc(s) : s);
    mb.forEach((x, i) => { if (!A.egaux(v(x), v(mb[0]))) ko(`correction : étape ${i + 1} fausse (${x})`); });
    if (POLY.includes(type) && !A.egaux(v(mb[mb.length - 1]), v(r))) ko('correction : la chaîne n’aboutit pas à la réponse ' + r);
    return '$' + mb.map(rendu).join(' = ') + '$';
  }) : note(o.n) + (res ? res.texte : '');
  if (!c) ko('correction manquante');
  return { consigne: o.consigne, enonce: o.t || o.el || res.enonce, r, type, c };
}

const lot = require(path.resolve(process.argv[2]));
const sortie = path.join(__dirname, 'sortie-lots');
lot.forEach((th) => {
  const vus = new Set(), lignes = [['consigne', 'énoncé', 'réponse', 'vérification', 'correction']];
  if (th.exercices.length !== 30) { ici = th.titre; ko(th.exercices.length + ' exercices au lieu de 30'); }
  th.exercices.forEach((brut, k) => {
    ici = th.titre + ' n°' + (k + 1);
    try {
      const x = exercice(th, brut), consigne = x.consigne || th.consigne || A.CONSIGNES[x.type];
      if (vus.has(consigne + x.enonce)) ko('doublon'); vus.add(consigne + x.enonce);
      const v = A.verifier(x.type, x.r, x.r, x.enonce);
      if (v.etat !== 'juste') ko(`réponse attendue « ${x.r} » refusée : ${v.message}`);
      lignes.push([consigne, x.enonce, x.r, x.type, x.c]);
    } catch (e) { ko(e.message); }
  });
  const dossier = path.join(sortie, th.dossier);
  fs.mkdirSync(dossier, { recursive: true });
  fs.writeFileSync(path.join(dossier, `revision - ${th.ordre ? th.ordre + ' - ' : ''}${th.titre}.csv`), lignes.map((l) => l.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n') + '\n');
  console.log(`✓ ${th.titre} : ${lignes.length - 1}`);
});
if (erreurs) { console.error(erreurs + ' erreur(s)'); process.exit(1); }
console.log('Toutes les vérifications sont passées.');
