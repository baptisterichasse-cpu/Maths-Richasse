// Formes d'exercices calculées automatiquement (grandeurs, fonctions, statistiques, probabilités, géométrie)
module.exports = (H) => {
  const { A, cst, txt, fr, nb, N, tex, chaine, equation, substituer, R, add, mul, div, neg, cmp, poly } = H;
  const L = { mode: 'lin', decimal: true };
  const ch = (e, s = [], type = 'nombre') => chaine(L, type, e, s);
  const dec = (q) => txt(q, true);
  const NB = 'Répondre par un nombre, sans unité.';
  const pc = (t) => `$${nb(String(t).replace(/^[+-]/, ''))}\\,\\%$`;
  const somme = (l) => l.reduce(add, [0, 1]);
  const hm = (h, m) => (h ? `$${h}$ h ` : '') + (m || !h ? `$${m}$ min` : '').trim();
  const duree = (t) => { const h = Math.floor(t / 60), m = t % 60; return h ? h + 'h' + (m ? String(m).padStart(2, '0') : '') : m + 'min'; };
  const FAM = [
    { km: 3, hm: 2, dam: 1, m: 0, dm: -1, cm: -2, mm: -3 }, { t: 6, kg: 3, hg: 2, dag: 1, g: 0, dg: -1, cg: -2, mg: -3 }, { hL: 2, daL: 1, L: 0, dL: -1, cL: -2, mL: -3 },
    { 'km²': 6, ha: 4, a: 2, 'm²': 0, 'dm²': -2, 'cm²': -4, 'mm²': -6 }, { 'm³': 0, hL: -1, 'dm³': -3, L: -3, dL: -4, cL: -5, 'cm³': -6, mL: -6, 'mm³': -9 },
  ];
  const fl = (s) => Number(String(s).replace(',', '.'));
  const arr1 = (x) => x.toFixed(1).replace('.', ',');
  const expr = (a, b) => { const ax = cmp(a, [1, 1]) === 0 ? 'x' : cmp(a, [-1, 1]) === 0 ? '-x' : txt(a) + 'x'; return b[0] === 0 ? ax : ax + (b[0] > 0 ? '+' : '') + txt(b); };

  return (th, o) => {
    /* --- Lecture graphique : { gr: [[x, y], …], lire: ['img', 2] } --- */
    if (o.gr) {
      const pts = [...o.gr].sort((a, b) => a[0] - b[0]), [quoi, k] = o.lire, fig = `[[courbe:${pts.map((q) => q.join(',')).join(' ')}]] `;
      const C = 'Courbe de la fonction $f$. ', xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
      if (quoi === 'coef' || quoi === 'ord' || quoi === 'expr') {
        if (pts.length !== 2) throw new Error('une droite se donne par deux points');
        const [[x1, y1], [x2, y2]] = pts, a = R(y2 - y1, x2 - x1), b = add([y1, 1], neg(mul(a, [x1, 1]))), P = (v) => (v < 0 ? '(' + v + ')' : v), Dt = 'Droite représentant une fonction affine $f$.';
        if (b[1] !== 1) throw new Error('ordonnée à l’origine non lisible');
        const ca = `La droite passe par les points $(${x1}\\,;${y1})$ et $(${x2}\\,;${y2})$ : $a = \\dfrac{${y2}-${P(y1)}}{${x2}-${P(x1)}} = ${fr(a)}$.`, cb = `La droite coupe l’axe des ordonnées au point d’ordonnée $${b[0]}$ : $b = f(0) = ${b[0]}$.`;
        if (quoi === 'coef') return { consigne: 'Lire graphiquement le coefficient directeur.', enonce: fig + Dt, r: txt(a), type: 'nombre', c: ca };
        if (quoi === 'ord') return { consigne: 'Lire graphiquement l’ordonnée à l’origine.', enonce: fig + Dt, r: String(b[0]), type: 'nombre', c: cb };
        const r = expr(a, b);
        return { consigne: 'Donner l’expression de $f(x)$.', enonce: fig + Dt, r, type: 'developpe', c: `${cb} ${ca} Donc $f(x) = ${tex(r)}$.` };
      }
      for (let i = 0; i < pts.length - 1; i++) if (ys[i] === ys[i + 1]) throw new Error('palier dans la courbe');
      if (quoi === 'img') { const q = pts.find((z) => z[0] === k); if (!q) throw new Error('image non lisible'); return { consigne: 'Lire graphiquement l’image demandée.', enonce: fig + C + `Image de $${k}$ ?`, r: String(q[1]), type: 'nombre', c: `Le point de la courbe d’abscisse $${k}$ a pour ordonnée $${q[1]}$ : $f(${k}) = ${q[1]}$.` }; }
      if (quoi === 'ant' || quoi === 'nb') {
        const coupe = xs.filter((x, i) => ys[i] === k); let entre = 0;
        for (let i = 0; i < pts.length - 1; i++) if ((ys[i] - k) * (ys[i + 1] - k) < 0) entre++;
        const n = coupe.length + entre;
        if (quoi === 'nb') return { consigne: 'Répondre par un nombre.', enonce: fig + C + `Combien d’antécédents le nombre $${k}$ a-t-il ?`, r: String(n), type: 'nombre', c: n ? `La droite horizontale d’ordonnée $${k}$ coupe la courbe en $${n}$ point${n > 1 ? 's' : ''} : $${k}$ a $${n}$ antécédent${n > 1 ? 's' : ''}.` : `La droite horizontale d’ordonnée $${k}$ ne coupe pas la courbe : $${k}$ n’a aucun antécédent.` };
        if (entre) throw new Error('antécédent non lisible pour ' + k);
        return { consigne: 'Lire graphiquement le ou les antécédents (répondre « aucun » s’il n’y en a pas).', enonce: fig + C + `Antécédent(s) de $${k}$ ?`, r: coupe.join(';') || 'aucun', type: 'ensemble', c: coupe.length ? `La droite horizontale d’ordonnée $${k}$ coupe la courbe ${coupe.length > 1 ? 'aux points d’abscisses' : 'au point d’abscisse'} ${coupe.map((x) => '$' + x + '$').join(' ; ')}.` : `La droite horizontale d’ordonnée $${k}$ ne coupe pas la courbe : $${k}$ n’a pas d’antécédent.` };
      }
      const haut = quoi === 'max' || quoi === 'argmax', v = haut ? Math.max(...ys) : Math.min(...ys), ou = xs.filter((x, i) => ys[i] === v), nom = haut ? 'maximum' : 'minimum';
      if (ou.length !== 1) throw new Error('extremum atteint plusieurs fois');
      const ce = `Le point le plus ${haut ? 'haut' : 'bas'} de la courbe a pour coordonnées $(${ou[0]}\\,;${v})$ : le ${nom} de $f$ est $${v}$, atteint en $x = ${ou[0]}$.`;
      if (quoi === 'max' || quoi === 'min') return { consigne: 'Répondre par un nombre.', enonce: fig + C + `Quel est le ${nom} de $f$ sur l’intervalle représenté ?`, r: String(v), type: 'nombre', c: ce };
      return { consigne: 'Répondre par un nombre.', enonce: fig + C + `Pour quelle valeur de $x$ le ${nom} de $f$ est-il atteint ?`, r: String(ou[0]), type: 'nombre', c: ce };
    }
    /* --- Lecture d'un tableau de valeurs : { tb: [xs, ys], lire: ['img', '2'] } --- */
    if (o.tb) {
      let [xs, ys] = o.tb; const [quoi, k, f] = o.lire, L2 = (l) => l.map((v) => (v === '?' ? '?' : '$' + N(v) + '$')).join(';');
      const fig = (a, b) => `[[tableau:$x$;${L2(a)}|$f(x)$;${L2(b)}]] `;
      if (quoi === 'val' || quoi === 'xval') { // k = rang de la case manquante, f = expression
        xs = xs.map(String); ys = xs.map((x) => dec(cst(substituer(f, x)))); const F = `$f(x) = ${tex(f)}$. Quelle est la valeur manquante ?`, i = k;
        if (quoi === 'val') return { consigne: 'Compléter le tableau de valeurs.', enonce: fig(xs, ys.map((y, j) => (j === i ? '?' : y))) + F, r: ys[i], type: 'nombre', c: `C’est l’image de $${N(xs[i])}$ : $f(${N(xs[i])}) = ${tex(substituer(f, xs[i]))} = ${N(ys[i])}$.` };
        const e = equation(th, { eq: f + '=' + ys[i] });
        if (e.r !== xs[i]) throw new Error('antécédent non unique dans le tableau : ' + e.r);
        return { consigne: 'Compléter le tableau de valeurs.', enonce: fig(xs.map((x, j) => (j === i ? '?' : x)), ys) + F, r: xs[i], type: 'nombre', c: `On cherche $x$ tel que $f(x) = ${N(ys[i])}$, c’est-à-dire $${tex(f)} = ${N(ys[i])}$. ${e.c}` };
      }
      xs = xs.map(String); ys = ys.map(String);
      if (quoi === 'img') { const i = xs.indexOf(String(k)); if (i < 0) throw new Error('valeur absente du tableau'); return { consigne: 'Lire dans le tableau l’image demandée.', enonce: fig(xs, ys) + `Image de $${N(k)}$ ?`, r: ys[i], type: 'nombre', c: `Dans la colonne où $x = ${N(k)}$, on lit $f(x) = ${N(ys[i])}$ : l’image de $${N(k)}$ est $${N(ys[i])}$.` }; }
      const a = xs.filter((x, i) => ys[i] === String(k));
      return { consigne: 'Lire dans le tableau le ou les antécédents (répondre « aucun » si le tableau n’en donne pas).', enonce: fig(xs, ys) + `Antécédent(s) de $${N(k)}$ ?`, r: a.join(';') || 'aucun', type: 'ensemble', c: a.length ? `On cherche $${N(k)}$ dans la ligne $f(x)$ : on le trouve pour ${a.map((x) => '$x = ' + N(x) + '$').join(' et ')}. Attention à ne pas confondre avec la ligne des $x$.` : `Le nombre $${N(k)}$ n’apparaît pas dans la ligne $f(x)$ : le tableau ne donne aucun antécédent.` };
    }
    /* --- Pourcentages et évolutions --- */
    if (o.pc) { const [p, v, u] = o.pc, c = ch(`${p}*${v}:100`); return { consigne: 'Calculer.', enonce: `${pc(p)} de $${nb(v)}$${u ? ' ' + u : ''}`, r: c.r, type: 'nombre', c: `Prendre ${pc(p)} d’une quantité, c’est la multiplier par $\\dfrac{${nb(p)}}{100}$. ${c.texte}` }; }
    if (o.part) { const [a, b, quoi] = o.part, r = dec(mul(div(cst(a), cst(b)), [100, 1])); return { consigne: 'Exprimer la proportion en pourcentage (répondre sans le signe %).', enonce: o.t || `$${nb(a)}$ ${quoi || ''} sur $${nb(b)}$`.replace('  ', ' '), r, type: 'nombre', c: `$\\dfrac{${nb(a)}}{${nb(b)}}\\times 100 = ${nb(r)}$, soit ${pc(r)}.` }; }
    if (o.cm !== undefined) { const t = cst(String(o.cm)), k = add([1, 1], div(t, [100, 1])), h = t[0] > 0; return { consigne: 'Donner le coefficient multiplicateur.', enonce: `${h ? 'Hausse' : 'Baisse'} de ${pc(o.cm)}`, r: dec(k), type: 'nombre', c: `Une ${h ? 'hausse' : 'baisse'} de ${pc(o.cm)} revient à multiplier par $1 ${h ? '+' : '-'} \\dfrac{${nb(String(o.cm).replace(/^[+-]/, ''))}}{100} = ${nb(dec(k))}$.` }; }
    if (o.evo) { const [v, tt, u] = o.evo, t = cst(String(tt)), k = add([1, 1], div(t, [100, 1])), h = t[0] > 0, r = dec(mul(cst(v), k)); return { consigne: NB, enonce: `${o.quoi || 'Une valeur'} de $${nb(v)}$${u ? ' ' + u : ''} ${h ? 'augmente' : 'diminue'} de ${pc(tt)}. Quelle est la nouvelle valeur${u ? ', en ' + u : ''} ?`, r, type: 'nombre', c: `Le coefficient multiplicateur est $${nb(dec(k))}$. $${nb(v)}\\times ${nb(dec(k))} = ${nb(r)}$` }; }
    if (o.taux) { const [a, b] = o.taux, q = mul(div(add(cst(b), neg(cst(a))), cst(a)), [100, 1]), r = dec(q); return { consigne: 'Donner le pourcentage d’évolution : un nombre positif pour une hausse, négatif pour une baisse (sans le signe %).', enonce: `Une valeur passe de $${nb(a)}$ à $${nb(b)}$.`, r, type: 'nombre', c: `$\\dfrac{${nb(b)}-${nb(a)}}{${nb(a)}}\\times 100 = ${nb(r)}$ : c’est une ${q[0] > 0 ? 'hausse' : 'baisse'} de ${pc(r)}.` }; }
    if (o.succ) { const ks = o.succ.map((t) => add([1, 1], div(cst(String(t)), [100, 1]))), k = ks.reduce(mul), g = mul(add(k, [-1, 1]), [100, 1]), desc = o.succ.map((t) => `une ${cst(String(t))[0] > 0 ? 'hausse' : 'baisse'} de ${pc(t)}`).join(' puis '); const base = `Coefficients multiplicateurs : $${ks.map((x) => nb(dec(x))).join('\\times ')} = ${nb(dec(k))}$.`; return o.global ? { consigne: 'Donner le pourcentage d’évolution global : positif pour une hausse, négatif pour une baisse (sans le signe %).', enonce: `Une valeur subit ${desc}.`, r: dec(g), type: 'nombre', c: `${base} $(${nb(dec(k))}-1)\\times 100 = ${nb(dec(g))}$ : ${g[0] === 0 ? 'la valeur est inchangée' : (g[0] > 0 ? 'hausse' : 'baisse') + ' globale de ' + pc(dec(g))}. On n’ajoute pas les pourcentages.` } : { consigne: 'Donner le coefficient multiplicateur global.', enonce: `Une valeur subit ${desc}.`, r: dec(k), type: 'nombre', c: base }; }
    if (o.init) { const [v, tt, u] = o.init, t = cst(String(tt)), k = add([1, 1], div(t, [100, 1])), h = t[0] > 0, r = dec(div(cst(v), k)); return { consigne: NB, enonce: `Après une ${h ? 'hausse' : 'baisse'} de ${pc(tt)}, ${o.quoi || 'une valeur'} vaut $${nb(v)}$${u ? ' ' + u : ''}. Quelle était la valeur de départ${u ? ', en ' + u : ''} ?`, r, type: 'nombre', c: `La valeur de départ a été multipliée par $${nb(dec(k))}$ : on divise donc par $${nb(dec(k))}$. $${nb(v)}\\div ${nb(dec(k))} = ${nb(r)}$` }; }

    /* --- Conversions et durées --- */
    if (o.conv) { const [v, a, b] = o.conv, f = FAM.find((x) => a in x && b in x), d = f[a] - f[b], k = 10 ** Math.abs(d), r = dec(d >= 0 ? mul(cst(v), [k, 1]) : div(cst(v), [k, 1])); return { consigne: NB, enonce: `Convertir $${nb(v)}$ ${a} en ${b}.`, r, type: 'nombre', c: (d === 0 ? `$1$ ${a} $= 1$ ${b}.` : d > 0 ? `$1$ ${a} $= ${nb(k)}$ ${b} : on multiplie par $${nb(k)}$.` : `$1$ ${b} $= ${nb(k)}$ ${a} : on divise par $${nb(k)}$.`) + ` $${nb(v)}$ ${a} $= ${nb(r)}$ ${b}.` }; }
    if (o.dmin) { const t = o.dmin; return { enonce: `Convertir $${t}$ min en heures et minutes.`, r: duree(t), type: 'duree', c: `$${t} = ${Math.floor(t / 60)}\\times 60 + ${t % 60}$, donc $${t}$ min $=$ ${hm(Math.floor(t / 60), t % 60)}.` }; }
    if (o.dh) { const q = cst(o.dh), t = mul(q, [60, 1])[0], h = Math.floor(t / 60); return { enonce: `Convertir $${nb(o.dh)}$ h en heures et minutes.`, r: duree(t), type: 'duree', c: `$${nb(dec(add(q, [-h, 1])))}$ h $= ${nb(dec(add(q, [-h, 1])))}\\times 60$ min $= ${t % 60}$ min. Donc $${nb(o.dh)}$ h $=$ ${hm(h, t % 60)}.` }; }
    if (o.dsum || o.dmoins) { const [[h1, m1], [h2, m2]] = o.dsum || o.dmoins, s = o.dsum ? 1 : -1, t = 60 * h1 + m1 + s * (60 * h2 + m2); return { consigne: 'Calculer et donner la durée en heures et minutes.', enonce: `${hm(h1, m1)} ${s > 0 ? '$+$' : '$-$'} ${hm(h2, m2)}`, r: duree(t), type: 'duree', c: (s > 0 ? `On ajoute séparément : $${h1 + h2}$ h $${m1 + m2}$ min${m1 + m2 >= 60 ? `, et $${m1 + m2}$ min $= 1$ h $${m1 + m2 - 60}$ min` : ''}.` : m1 < m2 ? `On ne peut pas retirer $${m2}$ min à $${m1}$ min : on écrit ${hm(h1, m1)} $=$ $${h1 - 1}$ h $${m1 + 60}$ min.` : 'On soustrait séparément les heures et les minutes.') + ` Résultat : ${hm(Math.floor(t / 60), t % 60)}.` }; }
    if (o.dentre) { const [[h1, m1], [h2, m2]] = o.dentre, t = 60 * h2 + m2 - 60 * h1 - m1; return { consigne: 'Donner la durée en heures et minutes.', enonce: o.t || `Durée écoulée entre $${h1}$ h $${String(m1).padStart(2, '0')}$ et $${h2}$ h $${String(m2).padStart(2, '0')}$`, r: duree(t), type: 'duree', c: `De $${h1}$ h $${String(m1).padStart(2, '0')}$ à $${h1 + 1}$ h : $${60 - m1}$ min. De $${h1 + 1}$ h à $${h2}$ h $${String(m2).padStart(2, '0')}$ : ${hm(h2 - h1 - 1, m2)}. Au total : ${hm(Math.floor(t / 60), t % 60)}.` }; }
    if (o.dfin) { const [[h1, m1], [h2, m2]] = o.dfin, t = 60 * (h1 + h2) + m1 + m2; return { consigne: 'Donner l’heure sous la forme 17h25.', enonce: o.t, r: duree(t), type: 'duree', c: `$${h1}$ h $${String(m1).padStart(2, '0')}$ $+$ ${hm(h2, m2)} : $${h1 + h2}$ h $${m1 + m2}$ min${m1 + m2 >= 60 ? `, soit $${Math.floor(t / 60)}$ h $${String(t % 60).padStart(2, '0')}$` : ''}.` }; }
    if (o.enmin) { const [h, m] = o.enmin; return { consigne: NB, enonce: `Convertir ${hm(h, m)} en minutes.`, r: String(60 * h + m), type: 'nombre', c: `$${h}\\times 60 + ${m} = ${60 * h + m}$` }; }
    if (o.enh) { const [h, m] = o.enh, r = dec(R(60 * h + m, 60)); return { consigne: 'Donner la durée en heures, sous forme d’un nombre décimal.', enonce: `${hm(h, m)}`, r, type: 'nombre', c: `$${m}$ min $= \\dfrac{${m}}{60}$ h $= ${nb(dec(R(m, 60)))}$ h, donc ${hm(h, m)} $= ${nb(r)}$ h.` }; }

    /* --- Fonctions --- */
    if (o.img) { const [f, v] = o.img, c = chaine({ decimal: /,/.test(v) }, 'nombre', substituer(f, v), o.s || []); return { consigne: 'Calculer l’image demandée.', enonce: `$f(x) = ${tex(f)}$. Image de $${N(v)}$ ?`, r: c.r, type: 'nombre', c: `On remplace $x$ par $${N(v)}$. $f(${N(v)}) = ${c.texte.slice(1)}` }; }
    if (o.ant) { const [f, v] = o.ant, x = equation(th, { eq: f + '=' + v }); return { consigne: 'Donner le ou les antécédents (répondre « aucun » s’il n’y en a pas).', enonce: `$f(x) = ${tex(f)}$. Antécédent(s) de $${N(v)}$ ?`, r: x.r === 'aucune' ? 'aucun' : x.r, type: 'ensemble', c: `On cherche les nombres $x$ tels que $f(x) = ${N(v)}$, c’est-à-dire $${tex(f)} = ${N(v)}$. ${x.c}` }; }
    if (o.tab) { const [f, vals] = o.tab, im = vals.map((v) => dec(cst(substituer(f, v)))); return { consigne: 'Calculer les images demandées, dans l’ordre, séparées par des points-virgules.', enonce: `$f(x) = ${tex(f)}$. Images de ${vals.map((v) => '$' + N(v) + '$').join(' ; ')} ?`, r: im.join(';'), type: 'liste', c: vals.map((v, i) => `$f(${N(v)}) = ${tex(substituer(f, v))} = ${N(im[i])}$`).join(' ; ') + '.' }; }
    if (o.coef || o.ord) { const f = o.coef || o.ord, p = poly(f), a = p.x || [0, 1], b = p[''] || [0, 1]; return o.coef ? { consigne: 'Donner le coefficient directeur de la fonction.', enonce: `$f(x) = ${tex(f)}$`, r: txt(a, /,/.test(f)), type: 'nombre', c: `Sous la forme $f(x) = ax+b$ : $f(x) = ${A.latexPolynome(p)}$. Le coefficient directeur est le nombre qui multiplie $x$ : $a = ${fr(a)}$.` } : { consigne: 'Donner l’ordonnée à l’origine de la fonction.', enonce: `$f(x) = ${tex(f)}$`, r: txt(b, /,/.test(f)), type: 'nombre', c: `Sous la forme $f(x) = ax+b$ : $f(x) = ${A.latexPolynome(p)}$. L’ordonnée à l’origine est $b = f(0) = ${fr(b)}$.` }; }
    if (o.lin) { const [x0, y0] = o.lin, a = div(cst(y0), cst(x0)); return { consigne: 'Donner le coefficient de la fonction linéaire.', enonce: `$f$ est linéaire et $f(${N(x0)}) = ${N(y0)}$.`, r: txt(a), type: 'nombre', c: `$f(x) = ax$, donc $a\\times ${cst(x0)[0] < 0 ? '(' + N(x0) + ')' : N(x0)} = ${N(y0)}$ : $a = \\dfrac{${N(y0)}}{${N(x0)}} = ${fr(a)}$.` }; }
    if (o.pente || o.pts) {
      const [[x1, y1], [x2, y2]] = o.pente || o.pts, q = (s) => cst(String(s)), a = div(add(q(y2), neg(q(y1))), add(q(x2), neg(q(x1)))), b = add(q(y1), neg(mul(a, q(x1))));
      const P = (s) => (q(s)[0] < 0 ? '(' + N(s) + ')' : N(s)), don = `$f$ est affine, $f(${N(x1)}) = ${N(y1)}$ et $f(${N(x2)}) = ${N(y2)}$.`;
      const ca = `$a = \\dfrac{f(${N(x2)})-f(${N(x1)})}{${N(x2)}-${P(x1)}} = \\dfrac{${N(y2)}-${P(y1)}}{${N(x2)}-${P(x1)}} = ${fr(a)}$.`;
      if (o.pente) return { consigne: 'Donner le coefficient directeur de la fonction.', enonce: don, r: txt(a), type: 'nombre', c: ca };
      const r = expr(a, b);
      return { consigne: 'Donner l’expression de $f(x)$.', enonce: don, r, type: 'developpe', c: `${ca} Puis $b = f(${N(x1)}) - a\\times ${P(x1)} = ${fr(b)}$. Donc $f(x) = ${tex(r)}$.` };
    }

    /* --- Statistiques et probabilités --- */
    if (o.moy) { const v = o.moy, s = somme(v.map(cst)), r = dec(div(s, [v.length, 1])); return { consigne: 'Calculer la moyenne de la série.', enonce: v.map((x) => '$' + nb(x) + '$').join(' ; '), r, type: 'nombre', c: `On additionne les $${v.length}$ valeurs, puis on divise par $${v.length}$ : $\\dfrac{${nb(dec(s))}}{${v.length}} = ${nb(r)}$` }; }
    if (o.med || o.et) {
      const v = o.med || o.et, tri = v.map((x) => ({ x, q: cst(x) })).sort((a, b) => cmp(a.q, b.q)), n = v.length, range = 'Série rangée : ' + tri.map((t) => '$' + nb(t.x) + '$').join(' ; ') + '. ';
      if (o.et) { const r = dec(add(tri[n - 1].q, neg(tri[0].q))); return { consigne: 'Calculer l’étendue de la série.', enonce: v.map((x) => '$' + nb(x) + '$').join(' ; '), r, type: 'nombre', c: `L’étendue est l’écart entre la plus grande et la plus petite valeur : $${nb(tri[n - 1].x)} - ${cst(tri[0].x)[0] < 0 ? '(' + nb(tri[0].x) + ')' : nb(tri[0].x)} = ${nb(r)}$` }; }
      const r = n % 2 ? tri[(n - 1) / 2].x : dec(div(add(tri[n / 2 - 1].q, tri[n / 2].q), [2, 1]));
      return { consigne: 'Déterminer la médiane de la série.', enonce: v.map((x) => '$' + nb(x) + '$').join(' ; '), r, type: 'nombre', c: range + (n % 2 ? `Il y a $${n}$ valeurs : la médiane est la $${(n + 1) / 2}^{\\text{e}}$, soit $${nb(r)}$.` : `Il y a $${n}$ valeurs : la médiane est la moyenne des $${n / 2}^{\\text{e}}$ et $${n / 2 + 1}^{\\text{e}}$ valeurs, soit $\\dfrac{${nb(tri[n / 2 - 1].x)}+${nb(tri[n / 2].x)}}{2} = ${nb(r)}$.`) };
    }
    if (o.mp) { const num = somme(o.mp.map(([v, e]) => mul(cst(v), cst(String(e))))), den = somme(o.mp.map(([, e]) => cst(String(e)))), r = dec(div(num, den)), co = o.ctx === 'coef'; return { consigne: co ? 'Calculer la moyenne pondérée par les coefficients.' : 'Calculer la moyenne de la série.', enonce: (co ? 'Notes (coefficients) : ' : 'Valeurs (effectifs) : ') + o.mp.map(([v, e]) => `$${nb(v)}$ ($${e}$)`).join(' ; '), r, type: 'nombre', c: `$\\dfrac{${o.mp.map(([v, e]) => nb(v) + '\\times ' + e).join('+')}}{${o.mp.map(([, e]) => e).join('+')}} = \\dfrac{${nb(dec(num))}}{${nb(dec(den))}} = ${nb(r)}$` }; }
    if (o.freq) { const [a, n, forme] = o.freq, q = R(a, n), en = o.t || `Effectif $${a}$ sur un effectif total de $${n}$.`; if (forme === 'f') return { consigne: 'Donner la fréquence sous forme de fraction irréductible.', enonce: en, r: txt(q), type: 'fraction', c: `Fréquence $=$ effectif $\\div$ effectif total : $\\dfrac{${a}}{${n}} = ${fr(q)}$` }; const r = dec(forme === '%' ? mul(q, [100, 1]) : q); return { consigne: forme === '%' ? 'Donner la fréquence en pourcentage (sans le signe %).' : 'Donner la fréquence sous forme décimale.', enonce: en, r, type: 'nombre', c: `Fréquence $=$ effectif $\\div$ effectif total : $\\dfrac{${a}}{${n}} = ${nb(dec(q))}$${forme === '%' ? `, soit ${pc(r)}` : ''}.` }; }
    if (o.fav !== undefined) { const q = R(o.fav, o.tot); return { enonce: o.t, r: txt(q), type: 'fraction', c: (o.n ? o.n + ' ' : '') + `$${o.fav}$ issue${o.fav > 1 ? 's' : ''} favorable${o.fav > 1 ? 's' : ''} sur $${o.tot}$ issues équiprobables : $\\dfrac{${o.fav}}{${o.tot}}${q[0] === o.fav ? '' : ' = ' + fr(q)}$.` }; }

    /* --- Aires, périmètres et volumes --- */
    const u = o.u || 'cm';
    if (o.rect || o.carre || o.tri || o.para || o.trap) {
      const aire = !o.perim, cons = aire ? `Calculer l’aire, en ${u}².` : `Calculer le périmètre, en ${u}.`;
      if (o.rect) { const [a, b] = o.rect, c = ch(aire ? `${a}*${b}` : `2*(${a}+${b})`); return { consigne: cons, enonce: `Rectangle de longueur $${nb(a)}$ ${u} et de largeur $${nb(b)}$ ${u}`, r: c.r, type: 'nombre', c: (aire ? 'Aire $=$ longueur $\\times$ largeur. ' : 'Périmètre $= 2\\times($longueur $+$ largeur$)$. ') + c.texte }; }
      if (o.carre) { const [a] = o.carre, c = ch(aire ? `${a}*${a}` : `4*${a}`); return { consigne: cons, enonce: `Carré de côté $${nb(a)}$ ${u}`, r: c.r, type: 'nombre', c: (aire ? 'Aire $=$ côté $\\times$ côté. ' : 'Périmètre $= 4\\times$ côté. ') + c.texte }; }
      if (o.tri) { const [b, h] = o.tri, c = ch(`${b}*${h}:2`); return { consigne: cons, enonce: `Triangle de base $${nb(b)}$ ${u} et de hauteur associée $${nb(h)}$ ${u}`, r: c.r, type: 'nombre', c: 'Aire $=$ base $\\times$ hauteur $\\div 2$. ' + c.texte }; }
      if (o.para) { const [b, h] = o.para, c = ch(`${b}*${h}`); return { consigne: cons, enonce: `Parallélogramme de base $${nb(b)}$ ${u} et de hauteur associée $${nb(h)}$ ${u}`, r: c.r, type: 'nombre', c: 'Aire $=$ base $\\times$ hauteur. ' + c.texte }; }
      const [B, b, h] = o.trap, c = ch(`(${B}+${b})*${h}:2`); return { consigne: cons, enonce: `Trapèze de bases $${nb(B)}$ ${u} et $${nb(b)}$ ${u}, de hauteur $${nb(h)}$ ${u}`, r: c.r, type: 'nombre', c: 'Aire $=($grande base $+$ petite base$)\\times$ hauteur $\\div 2$. ' + c.texte };
    }
    if (o.disque) { const d = o.diam, ray = d ? fl(o.disque[0]) / 2 : fl(o.disque[0]), aire = !o.perim, val = aire ? Math.PI * ray * ray : 2 * Math.PI * ray, r = arr1(val), rs = nb(String(ray).replace('.', ',')); return { consigne: (aire ? `Calculer l’aire, en ${u}²` : `Calculer le périmètre, en ${u}`) + ', en arrondissant au dixième.', enonce: `Disque de ${d ? 'diamètre' : 'rayon'} $${nb(o.disque[0])}$ ${u}`, r, type: 'nombre', c: (d ? `Le rayon vaut $${rs}$ ${u}. ` : '') + (aire ? `Aire $= \\pi\\times r^2 = \\pi\\times ${rs}^2 \\approx ${nb(r)}$` : `Périmètre $= 2\\times\\pi\\times r = 2\\times\\pi\\times ${rs} \\approx ${nb(r)}$`) }; }
    if (o.pave || o.cube || o.pyr || o.prisme) {
      const cons = `Calculer le volume, en ${u}³.`;
      if (o.pave) { const [a, b, c0] = o.pave, c = ch(`${a}*${b}*${c0}`); return { consigne: cons, enonce: `Pavé droit de dimensions $${nb(a)}$ ${u}, $${nb(b)}$ ${u} et $${nb(c0)}$ ${u}`, r: c.r, type: 'nombre', c: 'Volume $=$ longueur $\\times$ largeur $\\times$ hauteur. ' + c.texte }; }
      if (o.cube) { const [a] = o.cube, c = ch(`${a}^3`, [`${a}*${a}*${a}`]); return { consigne: cons, enonce: `Cube d’arête $${nb(a)}$ ${u}`, r: c.r, type: 'nombre', c: 'Volume $=$ arête$^3$. ' + c.texte }; }
      if (o.pyr) { const [a, h] = o.pyr, c = ch(`${a}^2*${h}:3`, [`${dec(mul(cst(a), cst(a)))}*${h}:3`]); return { consigne: cons, enonce: `Pyramide à base carrée de côté $${nb(a)}$ ${u} et de hauteur $${nb(h)}$ ${u}`, r: c.r, type: 'nombre', c: 'Volume $=$ aire de la base $\\times$ hauteur $\\div 3$. ' + c.texte }; }
      const [b, h] = o.prisme, c = ch(`${b}*${h}`); return { consigne: cons, enonce: `Prisme droit dont la base a pour aire $${nb(b)}$ ${u}² et dont la hauteur est $${nb(h)}$ ${u}`, r: c.r, type: 'nombre', c: 'Volume $=$ aire de la base $\\times$ hauteur. ' + c.texte };
    }
    if (o.cyl || o.cone || o.boule) {
      const cons = `Calculer le volume, en ${u}³, en arrondissant au dixième.`, P = (x) => nb(String(x));
      if (o.boule) { const ray = fl(o.boule[0]), r = arr1(4 / 3 * Math.PI * ray ** 3); return { consigne: cons, enonce: `Boule de rayon $${P(o.boule[0])}$ ${u}`, r, type: 'nombre', c: `Volume $= \\dfrac{4}{3}\\times\\pi\\times r^3 = \\dfrac{4}{3}\\times\\pi\\times ${P(o.boule[0])}^3 \\approx ${nb(r)}$` }; }
      const [r0, h] = o.cyl || o.cone, k = o.cone ? 1 / 3 : 1, r = arr1(k * Math.PI * fl(r0) ** 2 * fl(h));
      return { consigne: cons, enonce: `${o.cone ? 'Cône' : 'Cylindre'} de rayon $${P(r0)}$ ${u} et de hauteur $${P(h)}$ ${u}`, r, type: 'nombre', c: (o.cone ? 'Volume $= \\dfrac{1}{3}\\times\\pi\\times r^2\\times h = \\dfrac{1}{3}\\times' : 'Volume $= \\pi\\times r^2\\times h = ') + `\\pi\\times ${P(r0)}^2\\times ${P(h)} \\approx ${nb(r)}$` };
    }
    return null;
  };
};
