/* ---------- Moteur de correction des révisions ----------
   Lit une réponse tapée au clavier (fractions, expressions littérales),
   la compare à la réponse attendue et vérifie sa forme. */
var Algebre = (function () {
  'use strict';

  /* Nombres rationnels [numérateur, dénominateur] */
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function rat(n, d) {
    if (d === undefined) d = 1;
    if (d === 0) throw new Error('Division par zéro.');
    if (d < 0) { n = -n; d = -d; }
    var g = pgcd(n, d) || 1;
    return [n / g, d / g];
  }
  function carres(n) { var k = 1; for (var f = 2; f * f <= n; f++) while (n % (f * f) === 0) { n /= f * f; k *= f; } return [k, n]; }
  function estPremier(n) { if (n < 2 || n % 1) return false; for (var f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; }
  function radd(a, b) { return rat(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function rmul(a, b) { return rat(a[0] * b[0], a[1] * b[1]); }
  function rinv(a) { return rat(a[1], a[0]); }

  /* ---------- Lecture ---------- */
  function normaliser(s) {
    return String(s == null ? '' : s)
      .replace(/[−–—]/g, '-')
      .replace(/[×·∙⋅]/g, '*')
      .replace(/[÷:]/g, '/')
      .replace(/²/g, '^2').replace(/³/g, '^3')
      .replace(/[\[{]/g, '(').replace(/[\]}]/g, ')')
      .replace(/\s+/g, '')
      .replace(/^=+/, '')
      .toLowerCase();
  }
  function decouper(s) {
    var t = [], i = 0, m;
    while (i < s.length) {
      var ch = s.charAt(i);
      if ((m = /^\d+(?:[.,]\d+)?/.exec(s.slice(i)))) {
        var txt = m[0].replace(',', '.'), p = txt.indexOf('.');
        var v = p === -1 ? rat(Number(txt)) : rat(Number(txt.replace('.', '')), Math.pow(10, txt.length - p - 1));
        t.push({ k: 'n', v: v, dec: p !== -1, txt: txt });
        i += m[0].length; continue;
      }
      if (ch === '√') { t.push({ k: 'rac' }); i++; continue; }
      if ((m = /^(sqrt|rac)/.exec(s.slice(i)))) { t.push({ k: 'rac' }); i += m[0].length; continue; }
      if (/[a-z]/.test(ch)) { t.push({ k: 'v', v: ch }); i++; continue; }
      if ('+-*/^()'.indexOf(ch) !== -1) { t.push({ k: ch }); i++; continue; }
      throw new Error('Caractère non reconnu : « ' + ch + ' ».');
    }
    return t;
  }
  function Lecteur(t) { this.t = t; this.i = 0; }
  Lecteur.prototype.voir = function () { return this.t[this.i] || { k: 'fin' }; };
  Lecteur.prototype.prendre = function () { return this.t[this.i++] || { k: 'fin' }; };
  Lecteur.prototype.somme = function () {
    var termes = [{ s: 1, e: this.produit() }];
    while (this.voir().k === '+' || this.voir().k === '-') {
      var op = this.prendre().k;
      termes.push({ s: op === '+' ? 1 : -1, e: this.produit() });
    }
    return termes.length === 1 ? termes[0].e : { t: 'add', a: termes };
  };
  Lecteur.prototype.produit = function () {
    var n = this.unaire();
    for (;;) {
      var k = this.voir().k;
      if (k === '*') { this.prendre(); n = { t: 'mul', a: n, b: this.unaire(), x: true }; }
      else if (k === '/') { this.prendre(); n = { t: 'div', a: n, b: this.unaire() }; }
      else if (k === 'v' || k === '(' || k === 'rac') { n = { t: 'mul', a: n, b: this.puissance(), x: false }; }
      else if (k === 'n' && (n.t === 'par' || (n.t === 'pow' && n.b.t === 'par'))) { n = { t: 'mul', a: n, b: this.puissance(), x: false }; }
      else return n;
    }
  };
  Lecteur.prototype.unaire = function () {
    var k = this.voir().k;
    if (k === '-') { this.prendre(); return { t: 'neg', e: this.unaire() }; }
    if (k === '+') { this.prendre(); return this.unaire(); }
    return this.puissance();
  };
  Lecteur.prototype.puissance = function () {
    var base = this.atome();
    if (this.voir().k !== '^') return base;
    this.prendre();
    var signe = 1;
    if (this.voir().k === '-') { this.prendre(); signe = -1; }
    var e = this.atome();
    while (e.t === 'par' || e.t === 'neg') { if (e.t === 'neg') signe = -signe; e = e.e; }
    if (e.t !== 'num' || e.v[1] !== 1 || e.v[0] > 15) throw new Error('L’exposant doit être un nombre entier.');
    return { t: 'pow', b: base, n: signe * e.v[0] };
  };
  Lecteur.prototype.atome = function () {
    var tk = this.prendre();
    if (tk.k === 'n') return { t: 'num', v: tk.v, dec: tk.dec, txt: tk.txt };
    if (tk.k === 'v') return { t: 'var', n: tk.v };
    if (tk.k === 'rac') return { t: 'rac', e: this.atome() };
    if (tk.k === '(') {
      if (this.voir().k === ')') throw new Error('Parenthèses vides.');
      var e = this.somme();
      if (this.prendre().k !== ')') throw new Error('Une parenthèse n’est pas fermée.');
      return { t: 'par', e: e };
    }
    if (tk.k === ')') throw new Error('Parenthèse fermante en trop.');
    throw new Error('Expression incomplète.');
  };
  function analyser(texte) {
    var s = normaliser(texte);
    if (!s) return { ok: false, vide: true, erreur: '' };
    try {
      var l = new Lecteur(decouper(s));
      var arbre = l.somme();
      if (l.voir().k !== 'fin') throw new Error(l.voir().k === ')' ? 'Parenthèse fermante en trop.' : 'Expression mal écrite.');
      polynome(arbre); // vérifie aussi les divisions
      return { ok: true, arbre: arbre };
    } catch (e) {
      return { ok: false, erreur: e.message };
    }
  }

  /* ---------- Polynômes : { "x^2": [3, 1], "": [5, 1] } ---------- */
  function cleVersObj(c) {
    var o = {};
    if (c) c.split('.').forEach(function (m) { var p = m.split('^'); o[p[0]] = p[1] ? Number(p[1]) : 1; });
    return o;
  }
  function objVersCle(o) {
    return Object.keys(o).filter(function (v) { return o[v]; }).sort().map(function (v) { return o[v] === 1 ? v : v + '^' + o[v]; }).join('.');
  }
  function degre(c) { var o = cleVersObj(c), d = 0; for (var v in o) d += o[v]; return d; }
  function nettoyer(p) { var q = {}; for (var c in p) if (p[c][0] !== 0) q[c] = p[c]; return q; }
  function padd(p, q, s) {
    var r = {}, c;
    for (c in p) r[c] = p[c];
    for (c in q) { var v = s < 0 ? [-q[c][0], q[c][1]] : q[c]; r[c] = r[c] ? radd(r[c], v) : v; }
    return nettoyer(r);
  }
  function pmul(p, q) {
    var r = {};
    for (var a in p) for (var b in q) {
      var oa = cleVersObj(a), ob = cleVersObj(b);
      for (var v in ob) oa[v] = (oa[v] || 0) + ob[v];
      var R = 1, mult = 1;
      for (var w in oa) if (w.charAt(0) === '√') { for (var z = 0; z < oa[w]; z++) R *= Number(w.slice(1)); delete oa[w]; }
      if (R > 1) { var dr = carres(R); mult = dr[0]; if (dr[1] > 1) oa['√' + dr[1]] = 1; }
      var c = objVersCle(oa), v2 = rmul(rmul(p[a], q[b]), [mult, 1]);
      r[c] = r[c] ? radd(r[c], v2) : v2;
    }
    return nettoyer(r);
  }
  function constante(p) { var cles = Object.keys(p); if (!cles.length) return [0, 1]; if (cles.length === 1 && cles[0] === '') return p['']; return null; }
  function polynome(n) {
    var o;
    switch (n.t) {
      case 'num': return nettoyer({ '': n.v });
      case 'var': o = {}; o[n.n] = [1, 1]; return o;
      case 'par': return polynome(n.e);
      case 'neg': return pmul(polynome(n.e), { '': [-1, 1] });
      case 'add': return n.a.reduce(function (p, t) { return padd(p, polynome(t.e), t.s); }, {});
      case 'mul': return pmul(polynome(n.a), polynome(n.b));
      case 'div':
        var pd = polynome(n.b), d = constante(pd), kd = Object.keys(pd);
        if (!d && kd.length === 1 && /^√\d+$/.test(kd[0])) {
          var inv = {}; inv[kd[0]] = rinv(rmul(pd[kd[0]], [Number(kd[0].slice(1)), 1]));
          return pmul(polynome(n.a), inv);
        }
        if (!d) throw new Error('Division par une expression contenant une lettre.');
        if (d[0] === 0) throw new Error('Division par zéro.');
        return pmul(polynome(n.a), { '': rinv(d) });
      case 'pow':
        var r = { '': [1, 1] }, b = polynome(n.b), ex = n.n;
        if (ex < 0) {
          var cb = constante(b);
          if (!cb) throw new Error('Exposant négatif sur une expression contenant une lettre.');
          if (cb[0] === 0) throw new Error('Division par zéro.');
          b = { '': rinv(cb) }; ex = -ex;
        }
        for (var k = 0; k < ex; k++) r = pmul(r, b);
        return r;
      case 'rac':
        var cr = constante(polynome(n.e));
        if (!cr) throw new Error('Racine carrée d’une expression contenant une lettre.');
        if (cr[0] < 0) throw new Error('Racine carrée d’un nombre négatif.');
        var dc = carres(cr[0] * cr[1]), res = {};
        res[dc[1] > 1 ? '√' + dc[1] : ''] = rat(dc[0], cr[1]);
        return nettoyer(res);
    }
    throw new Error('Expression inconnue.');
  }
  function egaux(p, q) {
    var a = Object.keys(p), b = Object.keys(q);
    if (a.length !== b.length) return false;
    return a.every(function (c) { return q[c] && q[c][0] === p[c][0] && q[c][1] === p[c][1]; });
  }

  /* ---------- Affichage LaTeX ---------- */
  function nombreLatex(n) {
    if (n.txt) return n.txt.replace('.', '{,}');
    return n.v[1] === 1 ? String(n.v[0]) : '\\dfrac{' + n.v[0] + '}{' + n.v[1] + '}';
  }
  function entourer(s) { return s.indexOf('\\dfrac') !== -1 ? '\\left(' + s + '\\right)' : '(' + s + ')'; }
  function sansPar(n) { while (n.t === 'par') n = n.e; return n; }
  function latex(n) {
    switch (n.t) {
      case 'num': return nombreLatex(n);
      case 'var': return n.n;
      case 'rac': return '\\sqrt{' + latex(sansPar(n.e)) + '}';
      case 'par': return entourer(latex(n.e));
      case 'neg': return '-' + latex(n.e);
      case 'add': return n.a.map(function (t, k) {
        var s = latex(t.e);
        return (t.s < 0 ? '-' : (k ? '+' : '')) + s;
      }).join('');
      case 'mul':
        var g = latex(n.a), d = latex(n.b);
        if (n.b.t === 'neg') d = entourer(d);
        if (n.x || (/\d$/.test(g) && /^\d/.test(d))) return g + '\\times ' + d;
        return g + d;
      case 'div':
        if (n.a.t === 'neg') return '-' + latex({ t: 'div', a: n.a.e, b: n.b });
        return '\\dfrac{' + latex(sansPar(n.a)) + '}{' + latex(sansPar(n.b)) + '}';
      case 'pow': return (n.b.t === 'rac' ? entourer(latex(n.b)) : latex(n.b)) + (n.n >= 0 && n.n < 10 ? '^' + n.n : '^{' + n.n + '}');
    }
    return '';
  }
  function latexPolynome(p) {
    var cles = Object.keys(p).sort(function (a, b) { return degre(b) - degre(a) || (a < b ? -1 : 1); });
    if (!cles.length) return '0';
    return cles.map(function (c, k) {
      var v = p[c], neg = v[0] < 0, a = [Math.abs(v[0]), v[1]];
      var coef = a[1] === 1 ? String(a[0]) : '\\dfrac{' + a[0] + '}{' + a[1] + '}';
      var mono = c.split('.').map(function (m) { var q = m.split('^'); return q[0] + (q[1] ? '^{' + q[1] + '}' : ''); }).join('');
      var corps = c === '' ? coef : ((a[0] === 1 && a[1] === 1) ? '' : coef) + mono;
      return (neg ? '-' : (k ? '+' : '')) + corps;
    }).join('');
  }
  function nomTerme(c) {
    if (c === '') return 'le terme constant';
    return 'le terme en $' + c.split('.').map(function (m) { var q = m.split('^'); return q[0] + (q[1] ? '^{' + q[1] + '}' : ''); }).join('') + '$';
  }

  /* Énoncé écrit en LaTeX → écriture « clavier » (pour repérer les erreurs classiques) */
  function depuisLatex(s) {
    s = String(s).replace(/\$/g, '').replace(/\\left|\\right/g, '').replace(/\\[,;! ]/g, '').replace(/\{,\}/g, ',')
      .replace(/\\times|\\cdot/g, '*');
    var sortie = '', i = 0;
    function groupe() {
      while (s.charAt(i) === ' ') i++;
      if (s.charAt(i) !== '{') { var c = s.charAt(i); i++; return c; }
      var prof = 0, debut = ++i;
      for (; i < s.length; i++) {
        if (s.charAt(i) === '{') prof++;
        else if (s.charAt(i) === '}') { if (!prof) break; prof--; }
      }
      var g = s.slice(debut, i); i++;
      return depuisLatex(g);
    }
    while (i < s.length) {
      var m = /^\\[dt]?frac/.exec(s.slice(i));
      if (m) { i += m[0].length; var a = groupe(), b = groupe(); sortie += '((' + a + ')/(' + b + '))'; continue; }
      if (s.charAt(i) === '{' || s.charAt(i) === '}') { i++; continue; }
      if (s.charAt(i) === '^') { i++; sortie += '^(' + groupe() + ')'; continue; }
      sortie += s.charAt(i); i++;
    }
    return sortie;
  }

  /* ---------- Analyse de la forme ---------- */
  function termes(n) { n = sansPar(n); return n.t === 'add' ? n.a : [{ s: 1, e: n }]; }
  function facteurs(n, liste) {
    liste = liste || [];
    while (n.t === 'neg') n = n.e;
    if (n.t === 'mul') { facteurs(n.a, liste); facteurs(n.b, liste); }
    else liste.push(n);
    return liste;
  }
  function estEntierEcrit(n) { return n.t === 'num' && !n.dec && n.v[1] === 1; }
  function contientDecimal(n) {
    if (!n || typeof n !== 'object') return false;
    if (n.t === 'num') return !!n.dec;
    if (n.t === 'add') return n.a.some(function (t) { return contientDecimal(t.e); });
    return contientDecimal(n.e) || contientDecimal(n.a) || contientDecimal(n.b);
  }

  // Une seule fraction (ou un entier), sans opération restante
  function lireFraction(n) {
    var s = 1;
    while (n.t === 'neg' || n.t === 'par') { if (n.t === 'neg') s = -s; n = n.e; }
    if (estEntierEcrit(n)) return { n: s * n.v[0], d: 1, entier: true };
    if (n.t !== 'div') return null;
    var a = n.a, b = n.b, sb = 1;
    while (a.t === 'neg' || a.t === 'par') { if (a.t === 'neg') s = -s; a = a.e; }
    while (b.t === 'neg' || b.t === 'par') { if (b.t === 'neg') sb = -sb; b = b.e; }
    if (!estEntierEcrit(a) || !estEntierEcrit(b)) return null;
    return { n: s * a.v[0], d: b.v[0], denNegatif: sb < 0 };
  }

  // Développée réduite : somme de monômes, sans parenthèses, sans termes semblables
  function formeDeveloppee(n) {
    var vus = {}, reduite = true;
    var ok = termes(n).every(function (t) {
      var nb = 0, lettres = {}, simple = true;
      (function visiter(f) {
        if (!simple) return;
        if (f.t === 'neg') return visiter(f.e);
        if (f.t === 'mul') { visiter(f.a); visiter(f.b); return; }
        if (f.t === 'div') { if (estEntierEcrit(sansPar(f.b))) { var avant = nb; visiter(f.a); if (nb === avant) nb++; } else simple = false; return; }
        if (f.t === 'num') { nb++; return; }
        if (f.t === 'var') { if (lettres[f.n]) reduite = false; lettres[f.n] = 1; return; }
        if (f.t === 'pow' && f.b.t === 'var') { if (lettres[f.b.n]) reduite = false; lettres[f.b.n] = 1; return; }
        simple = false;
      })(t.e);
      if (!simple) return false;
      if (nb > 1) reduite = false;
      var p = polynome(t.e), cles = Object.keys(p);
      if (!cles.length && termes(n).length > 1) reduite = false;
      cles.forEach(function (c) { if (vus[c]) reduite = false; vus[c] = 1; });
      return true;
    });
    return { developpee: ok, reduite: ok && reduite };
  }

  // Produit : constante éventuelle × facteurs non constants
  function infosProduit(n) {
    n = sansPar(n);
    var tete = n;
    while (tete.t === 'neg' || tete.t === 'par') tete = tete.e;
    if (tete.t !== 'mul' && !(tete.t === 'pow' && sansPar(tete.b).t === 'add')) return null;
    var cst = [1, 1], nonCst = [], ok = false;
    facteurs(tete).forEach(function (f) {
      var base = f, mult = 1;
      if (f.t === 'pow') { base = f.b; mult = f.n; }
      var p = polynome(base), c = constante(p);
      if (c) { for (var k = 0; k < mult; k++) cst = rmul(cst, c); return; }
      if (sansPar(base).t === 'add') ok = true;
      for (var j = 0; j < mult; j++) nonCst.push(p);
    });
    if (!nonCst.length || (nonCst.length < 2 && !ok && Math.abs(cst[0]) === 1)) return null;
    return { cst: cst, facteurs: nonCst };
  }
  function contenu(p) {
    var g = 0, entiers = true;
    for (var c in p) { if (p[c][1] !== 1) entiers = false; g = pgcd(g, p[c][0]); }
    return entiers ? g : 1;
  }
  function lettreCommune(p) {
    var cles = Object.keys(p);
    if (cles.length < 2) return null;
    var communs = cleVersObj(cles[0]);
    cles.forEach(function (c) { var o = cleVersObj(c); for (var v in communs) if (!o[v]) delete communs[v]; });
    var l = Object.keys(communs);
    return l.length ? l[0] : null;
  }

  /* ---------- Correction ---------- */
  var CONSIGNES = {
    fraction: 'Calculer et donner le résultat sous forme d’une fraction irréductible.',
    developpe: 'Développer et réduire l’expression.',
    factorise: 'Factoriser l’expression.',
    egal: 'Calculer.',
    nombre: 'Calculer et donner le résultat sous la forme d’un seul nombre.',
    decomposition: 'Décomposer en produit de facteurs premiers.',
    puissance: 'Écrire sous la forme d’une seule puissance.',
    scientifique: 'Donner l’écriture scientifique.',
    racine: 'Simplifier.',
    liste: 'Donner les valeurs demandées, séparées par des points-virgules.',
    ensemble: 'Résoudre l’équation.',
    inequation: 'Résoudre l’inéquation.',
    duree: 'Donner la durée en heures et minutes.'
  };

  function parcourir(n, f) {
    if (!n || typeof n !== 'object') return;
    f(n);
    if (n.t === 'add') n.a.forEach(function (t) { parcourir(t.e, f); });
    else { parcourir(n.e, f); parcourir(n.a, f); parcourir(n.b, f); }
  }
  function contientRac(n) { var oui = false; parcourir(n, function (x) { if (x.t === 'rac') oui = true; }); return oui; }
  var FAUX = { etat: 'faux', message: 'Ce n’est pas le bon résultat.' }, JUSTE = { etat: 'juste', message: '' };
  function presque(m) { return { etat: 'presque', message: m }; }
  function faux(m) { return { etat: 'faux', message: m }; }

  // Racines : chaque racine simplifiée, termes regroupés
  function controleRacine(arbre, p) {
    var msg = '';
    parcourir(arbre, function (n) {
      if (n.t !== 'rac' || msg) return;
      var c = constante(polynome(n.e));
      if (!c || c[1] !== 1) { msg = 'La valeur est juste, mais il faut écrire la racine carrée d’un nombre entier.'; return; }
      if (c[0] < 2 || carres(c[0])[0] > 1) msg = 'La valeur est juste, mais on peut encore simplifier $\\sqrt{' + c[0] + '}$.';
    });
    if (msg) return msg;
    var ts = termes(arbre);
    if (ts.length > (Object.keys(p).length || 1)) return 'La valeur est juste, mais il reste des termes à regrouper.';
    var trop = false;
    ts.forEach(function (t) { var k = 0; parcourir(t.e, function (n) { if (n.t === 'rac') k++; if (n.t === 'pow' && contientRac(n.b)) k += 2; }); if (k > 1) trop = true; });
    return trop ? 'La valeur est juste, mais le produit de racines carrées peut encore être calculé.' : '';
  }
  // Un seul nombre : entier, décimal, fraction irréductible ou racine simplifiée
  function controleNombre(arbre, p) {
    if (contientRac(arbre)) return controleRacine(arbre, p);
    var seul = arbre;
    while (seul.t === 'neg' || seul.t === 'par') seul = seul.e;
    if (seul.t === 'num') return '';
    var fr = lireFraction(arbre);
    if (!fr) return 'La valeur est juste, mais le calcul n’est pas terminé : donner un seul nombre.';
    if (fr.denNegatif) return 'La valeur est juste, mais le signe − se place devant la fraction ou au numérateur.';
    if (fr.d === 1) return 'La valeur est juste : une fraction de dénominateur $1$ s’écrit simplement comme un entier.';
    if (pgcd(fr.n, fr.d) !== 1) return 'La valeur est juste, mais la fraction $\\dfrac{' + Math.abs(fr.n) + '}{' + fr.d + '}$ n’est pas irréductible.';
    return '';
  }

  var VIDE = /^(aucun|aucune|aucunesolution|pasdesolution|∅|vide|impossible)$/;
  function lireListe(texte) {
    var s = String(texte == null ? '' : texte).replace(/[−–—]/g, '-').toLowerCase().replace(/\s+/g, '').replace(/^s=/, '').replace(/[{}\[\]]/g, '');
    if (!s) return { ok: false, vide: true, erreur: 'Aucune réponse saisie.' };
    if (VIDE.test(s)) return { ok: true, items: [] };
    var items = [], erreur = '';
    s.replace(/ou|et/g, ';').split(';').forEach(function (m) {
      m = m.replace(/^[a-z]=/, '');
      if (!m) { erreur = erreur || 'Séparer les valeurs par un point-virgule.'; return; }
      var a = analyser(m);
      if (!a.ok) { erreur = erreur || a.erreur; return; }
      items.push({ arbre: a.arbre, p: polynome(a.arbre) });
    });
    return erreur ? { ok: false, erreur: erreur } : { ok: true, items: items };
  }
  function verifierListe(ordonnee) {
    return function (saisie, attendu) {
      var lu = lireListe(saisie);
      if (!lu.ok) return { etat: 'illisible', message: lu.erreur };
      var ref = lireListe(attendu);
      if (!ref.ok) return { etat: 'illisible', message: 'Réponse attendue mal écrite dans le fichier.' };
      var a = lu.items, b = ref.items;
      var dans = function (x, L) { return L.some(function (y) { return egaux(x.p, y.p); }); };
      if (!ordonnee) { var u = []; a.forEach(function (x) { if (!dans(x, u)) u.push(x); }); a = u; }
      var tousBons = a.every(function (x) { return dans(x, b); }), complet = b.every(function (y) { return dans(y, a); });
      if (ordonnee) {
        if (a.length !== b.length) return faux(b.length + ' valeurs sont attendues, séparées par des points-virgules.');
        var mal = a.filter(function (x, i) { return !egaux(x.p, b[i].p); }).length;
        if (mal && tousBons && complet) return faux('Les valeurs sont les bonnes, mais pas dans le bon ordre.');
        if (mal) return faux(mal === 1 ? 'Une des valeurs est à revoir.' : mal + ' valeurs sont à revoir.');
      } else {
        if (!b.length && a.length) return faux('Ce n’est pas la bonne réponse.');
        if (b.length && !a.length) return faux('Il y a pourtant au moins une valeur qui convient.');
        if (!tousBons) return faux(a.length > 1 ? 'Au moins une des valeurs ne convient pas.' : 'Cette valeur ne convient pas.');
        if (!complet) return faux('Ce qui est donné convient, mais il manque au moins une valeur.');
      }
      var msg = '';
      a.forEach(function (x) { msg = msg || controleNombre(x.arbre, x.p); });
      return msg ? presque(msg) : JUSTE;
    };
  }

  var RETOURNE = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };
  var SYMBOLE = { '<': ' < ', '>': ' > ', '≤': ' \\leqslant ', '≥': ' \\geqslant ' };
  function lireIneq(texte) {
    var s = String(texte == null ? '' : texte).replace(/\s+/g, '').replace(/<=|=<|⩽/g, '≤').replace(/>=|=>|⩾/g, '≥');
    if (!s) return { ok: false, vide: true, erreur: 'Aucune réponse saisie.' };
    var forme = 'Écrire la réponse sous la forme x < 3 ou x ≥ -2.';
    var m = /^([^<>≤≥]+)([<>≤≥])([^<>≤≥]+)$/.exec(s);
    if (!m) return { ok: false, erreur: forme };
    var g = analyser(m[1]), d = analyser(m[3]);
    if (!g.ok || !d.ok) return { ok: false, erreur: (g.ok ? d : g).erreur || forme };
    var pg = polynome(g.arbre), pd = polynome(d.arbre);
    var seule = function (q) { var k = Object.keys(q); return k.length === 1 && /^[a-z]$/.test(k[0]) && q[k[0]][0] === 1 && q[k[0]][1] === 1; };
    var tex = latex(g.arbre) + SYMBOLE[m[2]] + latex(d.arbre);
    if (seule(pg) && constante(pd)) return { ok: true, op: m[2], v: constante(pd), arbre: d.arbre, p: pd, latex: tex };
    if (seule(pd) && constante(pg)) return { ok: true, op: RETOURNE[m[2]], v: constante(pg), arbre: g.arbre, p: pg, latex: tex };
    return { ok: false, erreur: 'La lettre doit être seule d’un côté et un nombre de l’autre, par exemple x < 3.' };
  }
  function verifierIneq(saisie, attendu) {
    var lu = lireIneq(saisie);
    if (!lu.ok) return { etat: 'illisible', message: lu.erreur };
    var ref = lireIneq(attendu);
    if (!ref.ok) return { etat: 'illisible', message: 'Réponse attendue mal écrite dans le fichier.' };
    var borne = lu.v[0] === ref.v[0] && lu.v[1] === ref.v[1];
    if (!borne) return FAUX;
    if (lu.op === ref.op) { var msg = controleNombre(lu.arbre, lu.p); return msg ? presque(msg) : JUSTE; }
    if (lu.op === RETOURNE[ref.op] || RETOURNE[lu.op] === ref.op || (/[<≤]/.test(lu.op) !== /[<≤]/.test(ref.op)))
      return faux('La borne est juste, mais pas le sens de l’inégalité. On change de sens quand on multiplie ou divise par un nombre négatif.');
    return faux('La borne est juste : vérifier si l’inégalité est stricte ou large.');
  }

  function lireDuree(texte) {
    var s = String(texte == null ? '' : texte).toLowerCase().replace(/\s+/g, '').replace(/heures?/g, 'h').replace(/minutes?|mn/g, 'min');
    if (!s) return { ok: false, vide: true, erreur: 'Aucune réponse saisie.' };
    var m = /^(?:(\d+)h)?(?:(\d+)(?:min)?)?$/.exec(s);
    if (!m || (m[1] === undefined && !/min$/.test(s))) return { ok: false, erreur: 'Écrire la durée sous la forme 2h15 ou 45min.' };
    var h = Number(m[1] || 0), mn = Number(m[2] || 0);
    return { ok: true, h: h, min: mn, total: 60 * h + mn, latex: (h ? h + '\\text{ h }' : '') + (mn || !h ? mn + '\\text{ min}' : '') };
  }
  function verifierDuree(saisie, attendu) {
    var lu = lireDuree(saisie);
    if (!lu.ok) return { etat: 'illisible', message: lu.erreur };
    var ref = lireDuree(attendu);
    if (!ref.ok) return { etat: 'illisible', message: 'Réponse attendue mal écrite dans le fichier.' };
    if (lu.total !== ref.total) return FAUX;
    if (lu.min >= 60) return presque('La durée est juste, mais il reste à convertir : $60$ min $= 1$ h.');
    return JUSTE;
  }
  var SPECIAUX = { liste: verifierListe(true), ensemble: verifierListe(false), inequation: verifierIneq, duree: verifierDuree };

  function verifier(type, saisie, attendu, enonce) {
    if (SPECIAUX[type]) return SPECIAUX[type](saisie, attendu, enonce);
    var lu = analyser(saisie);
    if (!lu.ok) return { etat: 'illisible', message: lu.vide ? 'Aucune réponse saisie.' : lu.erreur };
    var ref = analyser(attendu);
    if (!ref.ok) return { etat: 'illisible', message: 'Réponse attendue mal écrite dans le fichier : ' + ref.erreur };
    var p = polynome(lu.arbre), q = polynome(ref.arbre);
    var juste = egaux(p, q);

    if (type === 'fraction') {
      var f = lireFraction(lu.arbre);
      if (!juste) {
        var naif = erreurDenominateurs(enonce);
        if (naif && egaux(p, naif)) return { etat: 'faux', message: 'Attention : on n’additionne jamais les dénominateurs. Il faut d’abord mettre les fractions au même dénominateur.' };
        if (!Object.keys(p).every(function (c) { return c === ''; })) return { etat: 'faux', message: 'Le résultat ne doit pas contenir de lettre.' };
        return { etat: 'faux', message: 'Ce n’est pas le bon résultat.' };
      }
      if (contientDecimal(lu.arbre)) return { etat: 'presque', message: 'La valeur est juste, mais le résultat est attendu sous forme de fraction.' };
      if (!f) return { etat: 'presque', message: 'La valeur est juste, mais le calcul n’est pas terminé : écrire une seule fraction.' };
      if (f.denNegatif) return { etat: 'presque', message: 'La valeur est juste, mais le signe − se place devant la fraction ou au numérateur.' };
      if (!f.entier && f.d === 1) return { etat: 'presque', message: 'La valeur est juste : une fraction de dénominateur $1$ s’écrit simplement comme un entier.' };
      if (!f.entier && pgcd(f.n, f.d) !== 1) {
        return { etat: 'presque', message: 'La valeur est juste, mais la fraction n’est pas irréductible : $' + Math.abs(f.n) + '$ et $' + f.d + '$ sont tous deux divisibles par $' + pgcd(f.n, f.d) + '$.' };
      }
      return { etat: 'juste', message: '' };
    }

    if (type === 'decomposition') {
      if (!juste) return faux('Ce produit ne redonne pas le nombre de départ.');
      var pb = '';
      facteurs(sansPar(lu.arbre)).forEach(function (f) {
        f = sansPar(f);
        var base = f.t === 'pow' ? sansPar(f.b) : f;
        if (pb) return;
        if (!estEntierEcrit(base) || (f.t === 'pow' && f.n < 1)) { pb = 'La valeur est juste, mais il faut écrire un produit de nombres premiers.'; return; }
        if (base.v[0] === 1) pb = 'Le nombre $1$ n’est pas premier : il ne s’écrit pas dans la décomposition.';
        else if (!estPremier(base.v[0])) pb = 'Le produit est juste, mais $' + base.v[0] + '$ n’est pas un nombre premier : la décomposition n’est pas terminée.';
      });
      return pb ? presque(pb) : JUSTE;
    }

    if (type === 'puissance') {
      if (!juste) return FAUX;
      var pu = sansPar(lu.arbre), simple = pu.t === 'pow';
      if (simple) parcourir(pu.b, function (x) { if (x.t === 'pow' || x.t === 'mul' || x.t === 'add') simple = false; });
      return simple ? JUSTE : presque('La valeur est juste, mais le résultat est demandé sous la forme d’une seule puissance, par exemple $2^7$.');
    }

    if (type === 'scientifique') {
      if (!juste) return FAUX;
      var sc = sansPar(lu.arbre), bon = false;
      while (sc.t === 'neg' || sc.t === 'par') sc = sc.e;
      var entre = function (x) { while (x.t === 'neg' || x.t === 'par') x = x.e; return x.t === 'num' && x.v[0] >= x.v[1] && x.v[0] < 10 * x.v[1]; };
      var dix = function (x) { x = sansPar(x); if (x.t === 'pow') x = sansPar(x.b); return x.t === 'num' && x.v[0] === 10 && x.v[1] === 1; };
      if (sc.t === 'mul') bon = entre(sc.a) && dix(sc.b);
      else if (sc.t === 'pow') bon = dix(sc);
      else bon = entre(sc);
      return bon ? JUSTE : presque('La valeur est juste, mais ce n’est pas une écriture scientifique : écrire $a\\times 10^n$ avec $a$ compris entre $1$ et $10$ ($10$ exclu).');
    }

    if (type === 'racine') {
      if (!juste) return FAUX;
      var mr = controleRacine(lu.arbre, p);
      return mr ? presque(mr) : JUSTE;
    }

    if (type === 'nombre') {
      if (!juste) {
        if (!Object.keys(p).every(function (c) { return c === ''; })) return { etat: 'faux', message: 'Le résultat ne doit pas contenir de lettre.' };
        return { etat: 'faux', message: 'Ce n’est pas le bon résultat.' };
      }
      var seul = lu.arbre;
      while (seul.t === 'neg' || seul.t === 'par') seul = seul.e;
      if (seul.t === 'num') return { etat: 'juste', message: '' };
      var fr = lireFraction(lu.arbre);
      if (!fr) return { etat: 'presque', message: 'La valeur est juste, mais le calcul n’est pas terminé : donner un seul nombre.' };
      if (fr.denNegatif) return { etat: 'presque', message: 'La valeur est juste, mais le signe − se place devant la fraction ou au numérateur.' };
      if (fr.d === 1) return { etat: 'presque', message: 'La valeur est juste : une fraction de dénominateur $1$ s’écrit simplement comme un entier.' };
      if (pgcd(fr.n, fr.d) !== 1) return { etat: 'presque', message: 'La valeur est juste, mais la fraction n’est pas irréductible : $' + Math.abs(fr.n) + '$ et $' + fr.d + '$ sont tous deux divisibles par $' + pgcd(fr.n, fr.d) + '$.' };
      return { etat: 'juste', message: '' };
    }

    if (type === 'developpe') {
      if (!juste) {
        var diff = Object.keys(padd(p, q, -1));
        var lettres = {};
        Object.keys(p).concat(Object.keys(q)).forEach(function (c) { Object.keys(cleVersObj(c)).forEach(function (v) { lettres[v] = 1; }); });
        if (Object.keys(lettres).length === 1 && diff.length && diff.length <= 2) {
          diff.sort(function (a, b) { return degre(b) - degre(a); });
          return { etat: 'faux', message: 'Ce n’est pas le bon résultat : vérifier ' + diff.map(nomTerme).join(' et ') + '.' };
        }
        return { etat: 'faux', message: 'Ce n’est pas le bon résultat.' };
      }
      var fd = formeDeveloppee(lu.arbre);
      if (!fd.developpee) return { etat: 'presque', message: 'L’expression est égale, mais elle n’est pas encore développée : il reste des parenthèses ou une puissance à développer.' };
      if (!fd.reduite) return { etat: 'presque', message: 'Le développement est juste, mais il n’est pas réduit : regrouper les termes semblables.' };
      return { etat: 'juste', message: '' };
    }

    if (type === 'factorise') {
      if (!juste) return { etat: 'faux', message: 'En redéveloppant cette réponse, on ne retrouve pas l’expression de départ.' };
      var e = infosProduit(lu.arbre), a = infosProduit(ref.arbre);
      if (!e) return { etat: 'presque', message: 'L’expression est égale, mais ce n’est pas un produit.' };
      if (a) {
        var degMax = Math.max.apply(null, a.facteurs.map(function (x) { return Math.max.apply(null, Object.keys(x).map(degre)); }));
        var encore = e.facteurs.some(function (x) {
          return Math.max.apply(null, Object.keys(x).map(degre)) > degMax || lettreCommune(x);
        }) || e.facteurs.length < a.facteurs.length;
        if (encore) return { etat: 'presque', message: 'C’est bien un produit, mais un des facteurs peut encore être factorisé.' };
        var ke = Math.abs(e.cst[0] / e.cst[1]), ka = Math.abs(a.cst[0] / a.cst[1]);
        if (ke < ka) {
          var reste = 1;
          e.facteurs.forEach(function (x) { reste *= contenu(x); });
          return { etat: 'presque', message: 'C’est bien un produit, mais on peut encore mettre un nombre en facteur' + (reste > 1 ? ' (par exemple $' + reste + '$)' : '') + '.' };
        }
      }
      return { etat: 'juste', message: '' };
    }

    return juste ? { etat: 'juste', message: '' } : { etat: 'faux', message: 'Ce n’est pas le bon résultat.' };
  }

  // Erreur classique : (a/b) + (c/d) = (a+c)/(b+d)
  function erreurDenominateurs(enonce) {
    if (!enonce) return null;
    var lu = analyser(depuisLatex(enonce));
    if (!lu.ok) return null;
    var t = termes(lu.arbre);
    if (t.length < 2) return null;
    var num = 0, den = 0;
    for (var k = 0; k < t.length; k++) {
      var f = lireFraction(t[k].e);
      if (!f || f.entier) return null;
      num += t[k].s * f.n; den += f.d;
    }
    return nettoyer({ '': rat(num, den) });
  }

  function apercu(saisie, type) {
    if (type === 'liste' || type === 'ensemble') {
      var l = lireListe(saisie);
      if (!l.ok) return l;
      return { ok: true, latex: l.items.length ? l.items.map(function (x) { return latex(x.arbre); }).join('\\;;\\;') : '\\text{aucune valeur}' };
    }
    if (type === 'inequation') return lireIneq(saisie);
    if (type === 'duree') return lireDuree(saisie);
    var lu = analyser(saisie);
    if (!lu.ok) return lu;
    return { ok: true, latex: latex(lu.arbre) };
  }

  return {
    analyser: analyser, polynome: polynome, egaux: egaux, latex: latex, latexPolynome: latexPolynome,
    depuisLatex: depuisLatex, verifier: verifier, apercu: apercu, CONSIGNES: CONSIGNES, carres: carres, pgcd: pgcd, estPremier: estPremier
  };
})();
if (typeof module !== 'undefined') module.exports = Algebre;
