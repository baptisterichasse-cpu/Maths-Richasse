// Lot « Fonctions » : 5 thèmes de 30 exercices (1-10 bases, 11-20 intermédiaire, 21-30 expert)
const D = '06 - Fonctions';
const T = (t, e, ...r) => { const n = r.length && r[r.length - 1][0] === '#' ? r.pop().slice(1) : ''; return { t, e, s: r, n }; };
const img = (f, v) => ({ img: [f, v] }), ant = (f, v) => ({ ant: [f, v] }), tab = (f, ...v) => ({ tab: [f, v] });
const pts = (a, b) => ({ pts: [a, b] }), pente = (a, b) => ({ pente: [a, b] });

// Courbes : un point à chaque abscisse entière, pour une lecture exacte
const G1 = [[-4, 0], [-3, 2], [-2, 3], [-1, 2], [0, 0], [1, -2], [2, -3], [3, -2], [4, 0], [5, 2]];
const G2 = [[-3, 5], [-2, 0], [-1, -3], [0, -4], [1, -3], [2, 0], [3, 5]];
const G3 = [[-5, -2], [-4, 0], [-3, 1], [-2, 0], [-1, -2], [0, -3], [1, -1], [2, 2], [3, 4], [4, 3]];
const G4 = [[-3, -4], [-2, -2], [-1, -1], [0, 1], [1, 2], [2, 4], [3, 5]];
const G5 = [[-4, 4], [-3, 2], [-2, 1], [-1, -1], [0, -2], [1, -1], [2, 1], [3, 4]];
const D1 = [[-3, -5], [3, 7]], D2 = [[-4, 5], [4, -3]], D3 = [[-4, -4], [4, 0]], D8 = [[-2, 6], [3, -4]];
const g = (gr, quoi, k) => ({ gr, lire: [quoi, k] });

// Tableaux de valeurs
const T1 = [['-2', '-1', '0', '1', '2'], ['5', '2', '1', '2', '5']];
const T2 = [['0', '1', '2', '3', '4'], ['3', '5', '7', '9', '11']];
const T3 = [['-3', '-1', '0', '2', '5'], ['4', '0', '-2', '0', '6']];
const T4 = [['1', '2', '3', '4', '5'], ['3', '1', '4', '1', '5']];
const tb = (t, quoi, k) => ({ tb: t, lire: [quoi, k] });
const val = (xs, f, i) => ({ tb: [xs, []], lire: ['val', i, f] }), xval = (xs, f, i) => ({ tb: [xs, []], lire: ['xval', i, f] });

module.exports = [
  {
    dossier: D, ordre: 1, titre: 'Image et antécédent', type: 'nombre',
    exercices: [
      img('3x-1', '2'), img('2x+5', '-3'), img('x^2', '4'), img('-x+7', '5'), img('4x', '-2'),
      img('x^2+1', '-3'), img('5-2x', '4'), img('x^2-3x', '2'), img('2x^2', '-1'), img('(x+1)(x-2)', '3'),
      ant('3x-1', '8'), ant('2x+5', '1'), ant('-x+7', '10'), ant('4x', '-6'), ant('5-2x', '0'),
      img('6x+1', '1/3'), img('x^2-1', '1/2'), img('-2x^2+3', '-2'), ant('x/2+3', '5'), ant('3x+2', '0'),
      ant('x^2', '9'), ant('x^2', '-4'), ant('x^2-5', '11'), ant('(x-1)(x+4)', '0'), ant('2x^2', '50'),
      ant('x^2+3', '3'), img('x^2-4x+4', '-1/2'), ant('(2x-1)(x+3)', '0'), ant('3-x^2', '-6'), ant('x^2', '7'),
    ],
  },
  {
    dossier: D, ordre: 2, titre: 'Tableau de valeurs', type: 'nombre',
    exercices: [
      tab('2x+1', '0', '1', '3'), tab('3x', '-1', '2', '5'), tab('x-4', '0', '4', '10'), tab('x^2', '1', '3', '-2'), tab('10-x', '2', '7', '10'),
      tb(T1, 'img', '1'), tb(T2, 'img', '3'), tb(T2, 'ant', '7'), tb(T1, 'ant', '1'), tb(T3, 'img', '-3'),
      tab('2x-3', '-2', '0', '4'), tab('x^2+1', '-1', '0', '2'), tab('-3x+2', '-1', '1', '3'), tab('x^2-x', '-2', '1', '3'),
      tb(T1, 'ant', '5'), tb(T3, 'ant', '0'), tb(T3, 'ant', '4'), tb(T4, 'img', '4'), tb(T4, 'ant', '4'), tb(T4, 'ant', '2'),
      val(['-2', '0', '1', '3'], '3x-5', 2), val(['-1', '0', '2', '4'], 'x^2-2x', 0), val(['-3', '-1', '0', '2'], 'x^2+x', 0),
      xval(['1', '3', '5', '8'], '2x+1', 2), xval(['-2', '0', '3', '6'], '-x+4', 3), xval(['1', '2', '4', '5'], '3x-7', 2),
      tab('x^2-4x+3', '0', '1', '3', '5'), tab('2x^2-1', '-2', '-1', '1/2'), tab('(x+1)(x-3)', '-1', '0', '3'), tab('x/2+1', '-4', '0', '3'),
    ],
  },
  {
    dossier: D, ordre: 3, titre: "Lecture graphique d'images et d'antécédents", type: 'nombre',
    exercices: [
      g(G1, 'img', -2), g(G1, 'img', 0), g(G1, 'img', 3), g(G2, 'img', 0), g(G2, 'img', -1),
      g(G2, 'img', 3), g(G4, 'img', 1), g(G4, 'img', -2), g(G5, 'img', -4), g(G5, 'img', 2),
      g(G1, 'ant', 3), g(G1, 'ant', -3), g(G2, 'ant', 0), g(G2, 'ant', -3), g(G2, 'ant', 5),
      g(G4, 'ant', 1), g(G5, 'ant', -2), g(G1, 'ant', 0), g(G3, 'ant', 4), g(G2, 'ant', -4),
      g(G1, 'ant', 2), g(G2, 'ant', -5), g(G1, 'nb', 1), g(G3, 'nb', -1), g(G3, 'max'),
      g(G5, 'argmin'), g(D1, 'coef'), g(D3, 'coef'), g(D8, 'ord'), g(D2, 'expr'),
    ],
  },
  {
    dossier: D, ordre: 4, titre: 'Fonctions linéaires et affines', type: 'nombre', mode: 'lin', decimal: true, consigne: 'Répondre par un nombre.',
    exercices: [
      { coef: '3x-2' }, { ord: '3x-2' }, { coef: '-x+4' }, { ord: '5x' }, { coef: '7-2x' },
      { ord: '7-2x' }, { lin: ['2', '6'] }, { lin: ['5', '-15'] }, img('3x-2', '4'), img('-2x+1', '3'),
      pente([1, 3], [4, 9]), pente([0, 2], [2, 8]), pente([-1, 5], [2, -1]), { lin: ['4', '6'] }, { lin: ['-3', '2'] },
      { coef: 'x/2+1' }, { coef: '2(x-3)+5' }, { ord: '2(x-3)+5' },
      T('Un taxi facture $3$ € de prise en charge, puis $1{,}50$ € par kilomètre. Quel est le prix, en €, d’une course de $8$ km ?', '3+1,5*8', '3+12'),
      T('La fonction linéaire $f$ vérifie $f(4) = 10$. Calculer $f(6)$.', '10:4*6', '2,5*6', '#Le coefficient de $f$ est $10\\div 4 = 2{,}5$.'),
      T('$f$ est affine de coefficient directeur $3$ et $f(2) = 1$. Quelle est son ordonnée à l’origine ?', '1-3*2', '1-6', '#$f(x) = 3x+b$ et $f(2) = 1$, donc $b = 1 - 3\\times 2$.'),
      T('$f(x) = ax+4$ et $f(2) = 10$. Calculer $a$.', '(10-4):2', '6:2', '#$2a + 4 = 10$.'),
      T('Augmenter une valeur de $20\\,\\%$ revient à lui appliquer une fonction linéaire. Quel est son coefficient ?', '1+20:100', '1+0,2'),
      T('Diminuer une valeur de $15\\,\\%$ revient à lui appliquer une fonction linéaire. Quel est son coefficient ?', '1-15:100', '1-0,15'),
      { t: '$f(x) = 3x-5$ et $g(x) = x+3$. Pour quelle valeur de $x$ a-t-on $f(x) = g(x)$ ?', v: '3x-5=x+3', x: 'la valeur cherchée' },
      pente([2, '1/2'], [6, '5/2']), pente([-2, 7], [4, -5]), { lin: ['2/3', '4'] }, { coef: '(4x-6)/2' },
      T('Un abonnement coûte $12$ € par mois, plus $0{,}25$ € par SMS. Avec un budget de $20$ €, combien de SMS peut-on envoyer ?', '(20-12):0,25', '8:0,25'),
    ],
  },
  {
    dossier: D, ordre: 5, titre: 'Fonction affine passant par deux points', type: 'developpe',
    exercices: [
      pts([0, 1], [1, 3]), pts([0, -2], [1, 1]), pts([0, 5], [2, 9]), pts([0, 4], [1, 3]), pts([0, 0], [3, 6]),
      pts([0, -1], [2, -5]), pts([0, 3], [4, 11]), pts([0, 6], [3, 0]), pts([0, -4], [2, 2]), pts([0, 2], [5, 7]),
      pts([1, 5], [2, 7]), pts([1, 2], [3, 8]), pts([2, 1], [4, 5]), pts([1, 4], [3, 0]), pts([-1, 2], [1, 6]),
      pts([-2, 1], [1, 7]), pts([2, 3], [5, -3]), pts([-1, -5], [2, 4]), pts([3, 2], [6, 5]), pts([-3, 4], [-1, 0]),
      pts([2, 1], [4, 2]), pts([1, 1], [3, 2]), pts([0, 1], [3, 3]), pts([-2, 0], [4, 3]), pts([1, 2], [4, 1]),
      pts([2, 5], [6, 3]), pts([-3, -1], [3, 3]), pts([1, '1/2'], [3, '3/2']), pts([-4, 5], [2, '1/2']), pts([5, -2], [-1, 2]),
    ],
  },
];
