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
  function radd(a, b) { return rat(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function rmul(a, b) { return rat(a[0] * b[0], a[1] * b[1]); }
  function rinv(a) { return rat(a[1], a[0]); }

  /* ---------- Lecture ---------- */
  function normaliser(s) {
    return String(s == null ? '' : s)
      .replace(/[−–—]/g, '-')
      .replace(/[×·∙⋅]/g, '*')
      .replace(/÷/g, '/')
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
      else if (k === 'v' || k === '(') { n = { t: 'mul', a: n, b: this.puissance(), x: false }; }
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
    var e = this.atome();
    while (e.t === 'par') e = e.e;
    if (e.t !== 'num' || e.v[1] !== 1 || e.v[0] > 12) throw new Error('L’exposant doit être un entier positif.');
    return { t: 'pow', b: base, n: e.v[0] };
  };
  Lecteur.prototype.atome = function () {
    var tk = this.prendre();
    if (tk.k === 'n') return { t: 'num', v: tk.v, dec: tk.dec, txt: tk.txt };
    if (tk.k === 'v') return { t: 'var', n: tk.v };
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
      var c = objVersCle(oa), v2 = rmul(p[a], q[b]);
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
        var d = constante(polynome(n.b));
        if (!d) throw new Error('Division par une expression contenant une lettre.');
        if (d[0] === 0) throw new Error('Division par zéro.');
        return pmul(polynome(n.a), { '': rinv(d) });
      case 'pow':
        var r = { '': [1, 1] }, b = polynome(n.b);
        for (var k = 0; k < n.n; k++) r = pmul(r, b);
        return r;
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
      case 'pow': return latex(n.b) + (n.n < 10 ? '^' + n.n : '^{' + n.n + '}');
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
    nombre: 'Calculer et donner le résultat sous la forme d’un seul nombre.'
  };

  function verifier(type, saisie, attendu, enonce) {
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

  function apercu(saisie) {
    var lu = analyser(saisie);
    if (!lu.ok) return lu;
    return { ok: true, latex: latex(lu.arbre) };
  }

  return {
    analyser: analyser, polynome: polynome, egaux: egaux, latex: latex, latexPolynome: latexPolynome,
    depuisLatex: depuisLatex, verifier: verifier, apercu: apercu, CONSIGNES: CONSIGNES
  };
})();
if (typeof module !== 'undefined') module.exports = Algebre;
