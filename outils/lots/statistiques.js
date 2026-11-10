// Lots « Statistiques » (3 thèmes) et « Probabilités » (1 thème) : 30 exercices chacun
const S = '07 - Statistiques', P = '08 - Probabilités';
const T = (t, e, ...r) => { const n = r.length && r[r.length - 1][0] === '#' ? r.pop().slice(1) : ''; return { t, e, s: r, n }; };
const moy = (...v) => ({ moy: v }), med = (...v) => ({ med: v }), et = (...v) => ({ et: v });
const mp = (...c) => ({ mp: c }), mc = (...c) => ({ mp: c, ctx: 'coef' });
const fq = (a, n, forme, t) => ({ freq: [a, n, forme], t });
const F = (t, fav, tot, n) => ({ t, fav, tot, n });
const DE = 'On lance un dé équilibré à $6$ faces. ', U = 'On tire une boule au hasard. ', C32 = 'On tire une carte au hasard dans un jeu de $32$ cartes. ';
const NB = 'Répondre par un nombre.';

module.exports = [
  {
    dossier: S, ordre: 1, titre: 'Moyenne, médiane, étendue', type: 'nombre', mode: 'lin', decimal: true, consigne: NB,
    exercices: [
      moy('8', '12', '10'), moy('5', '7', '9', '11'), moy('10', '14', '15', '9'), moy('2', '4', '4', '6', '9'),
      et('3', '8', '5', '12'), et('15', '9', '22', '13', '18'), et('7', '7', '10', '4'),
      med('3', '7', '9'), med('12', '5', '8', '15', '10'), med('4', '1', '9', '7', '6', '2', '8'),
      med('3', '5', '8', '10'), med('12', '7', '9', '15', '11', '8'), moy('12,5', '9', '14,5', '10'), moy('1,5', '2,5', '3', '5'),
      et('2,5', '-1', '4', '0,5'), et('-3', '-8', '2', '5'), med('2,5', '1,8', '3,1', '2,2', '2,9'), moy('-2', '4', '-5', '7', '1'),
      med('10', '10', '12', '15', '18', '20'), moy('15', '8', '11', '13', '9', '16'),
      T('La moyenne de $4$ notes est $12$. Les trois premières sont $10$, $13$ et $9$. Quelle est la quatrième ?', '4*12-(10+13+9)', '48-32', '#La somme des quatre notes vaut $4\\times 12$.'),
      T('La moyenne de $5$ nombres est $8$. On ajoute le nombre $14$. Quelle est la nouvelle moyenne ?', '(5*8+14):6', '54:6', '#La somme des cinq nombres vaut $5\\times 8$.'),
      T('Une élève a obtenu $11$, $14$ et $9$. Quelle note doit-elle obtenir au quatrième devoir pour avoir $12$ de moyenne ?', '4*12-(11+14+9)', '48-34'),
      T('La moyenne de $6$ nombres est $10$. On retire le nombre $15$. Quelle est la moyenne des cinq nombres restants ?', '(6*10-15):5', '45:5'),
      med('7', '3', '9', '3', '5', '8', '3', '10'), med('-4', '2', '-1', '0', '5', '-3'), moy('3,2', '4,8', '5,1', '2,9', '4'), et('12,4', '9,7', '15,1', '11'),
      T('Dans une série rangée de $25$ valeurs, quel est le rang de la médiane ?', '(25+1):2', '26:2', '#Avec un nombre impair de valeurs, la médiane est la valeur du milieu.'),
      T('Toutes les valeurs d’une série de moyenne $9$ sont augmentées de $3$. Quelle est la nouvelle moyenne ?', '9+3', '#Ajouter $3$ à chaque valeur ajoute $3$ à la moyenne.'),
    ],
  },
  {
    dossier: S, ordre: 2, titre: 'Moyenne pondérée', type: 'nombre', mode: 'lin', decimal: true, consigne: NB,
    exercices: [
      mp(['10', 1], ['13', 2]), mp(['8', 2], ['12', 2], ['16', 1]), mp(['5', 3], ['10', 1]), mp(['2', 4], ['5', 6]), mp(['1', 5], ['2', 3], ['3', 2]),
      mc(['12', 1], ['15', 2]), mc(['8', 1], ['14', 3]), mc(['10', 2], ['16', 1]), mc(['9', 3], ['13', 1]), mc(['11', 1], ['7', 1], ['15', 2]),
      mp(['0', 3], ['1', 8], ['2', 6], ['3', 3]), mp(['10', 4], ['12', 6], ['15', 10]), mp(['150', 2], ['160', 5], ['170', 3]), mp(['1', 2], ['2', 5], ['3', 8], ['4', 5]),
      mc(['9', 2], ['12', 3], ['15', 1]), mc(['7', 1], ['11', 2], ['14', 2]), mc(['13,5', 2], ['10', 3]), mc(['6', 3], ['18', 1]), mc(['12', 4], ['8', 1], ['15', 3]), mp(['2,5', 4], ['3', 6]),
      T('Une élève a $10$ (coefficient $2$) et $13$ (coefficient $1$). Quelle note de coefficient $2$ doit-elle obtenir pour avoir $12$ de moyenne ?', '(12*5-(10*2+13)):2', '(60-33):2', '27:2', '#La somme des coefficients vaut $5$ : le total des points doit atteindre $12\\times 5$.'),
      T('Dans une entreprise, $8$ salariés gagnent $1\\,800$ € et $2$ salariés gagnent $3\\,300$ €. Quel est le salaire moyen, en € ?', '(8*1800+2*3300):10', '(14400+6600):10'),
      T('Un groupe de $12$ filles a $14$ de moyenne ; un groupe de $18$ garçons a $11{,}5$ de moyenne. Quelle est la moyenne de l’ensemble ?', '(12*14+18*11,5):30', '(168+207):30'),
      T('La moyenne de $20$ élèves est $11$. Celle de $5$ autres élèves est $16$. Quelle est la moyenne des $25$ élèves ?', '(20*11+5*16):25', '300:25'),
      mp(['-2', 3], ['0', 2], ['4', 5]), mp(['0,5', 10], ['1', 6], ['2', 4]), mc(['8,5', 2], ['12', 2], ['15', 1]),
      T('Un cycliste roule $2$ h à $30$ km/h, puis $3$ h à $20$ km/h. Quelle est sa vitesse moyenne, en km/h ?', '(2*30+3*20):5', '120:5', '#La vitesse moyenne est la moyenne des vitesses pondérée par les durées.'),
      T('La moyenne de trois notes de coefficients $1$, $2$ et $3$ vaut $13$. Les deux premières notes sont $10$ et $13$. Quelle est la troisième ?', '(13*6-(10+2*13)):3', '(78-36):3', '42:3'),
      T('Dans une classe, $40\\,\\%$ des élèves ont $10$ et $60\\,\\%$ ont $15$. Quelle est la moyenne de la classe ?', '0,4*10+0,6*15', '4+9', '#Les fréquences jouent le rôle de coefficients.'),
    ],
  },
  {
    dossier: S, ordre: 3, titre: 'Fréquences', type: 'nombre', mode: 'lin', decimal: true, consigne: NB,
    exercices: [
      fq(12, 30, 'f'), fq(5, 20, 'f'), fq(9, 36, 'f'), fq(15, 25, 'f'), fq(7, 10, 'd'),
      fq(3, 4, 'd'), fq(12, 48, 'd'), fq(10, 40, '%'), fq(9, 20, '%'), fq(30, 50, '%'),
      fq(18, 24, '%', 'Dans une classe de $24$ élèves, $18$ sont demi-pensionnaires. Quelle est la fréquence des demi-pensionnaires ?'),
      fq(8, 32, 'f', 'Sur $32$ lancers d’un dé, le $6$ est sorti $8$ fois. Quelle est la fréquence du $6$ ?'),
      fq(45, 200, 'd', 'Sur $200$ pièces contrôlées, $45$ ont un défaut. Quelle est la fréquence des pièces défectueuses ?'),
      fq(21, 60, '%', 'Sur $60$ personnes interrogées, $21$ viennent en bus. Quelle est la fréquence des usagers du bus ?'),
      fq(14, 35, 'f'), fq(27, 45, 'd'), fq(33, 150, '%'),
      T('Dans une série de $40$ valeurs, la fréquence d’une valeur est $0{,}15$. Quel est son effectif ?', '0,15*40', '#Effectif $=$ fréquence $\\times$ effectif total.'),
      T('Une valeur a pour fréquence $35\\,\\%$ dans une série de $80$ valeurs. Quel est son effectif ?', '35*80:100'),
      T('Les fréquences de trois valeurs sont $0{,}2$, $0{,}45$ et $x$. Combien vaut $x$ ?', '1-(0,2+0,45)', '1-0,65', '#La somme des fréquences vaut $1$.'),
      T('Une valeur d’effectif $18$ a pour fréquence $0{,}3$. Quel est l’effectif total ?', '18:0,3', '#Effectif total $=$ effectif $\\div$ fréquence.'),
      T('$12$ élèves représentent $40\\,\\%$ d’une classe. Combien d’élèves compte la classe ?', '12*100:40'),
      T('Dans un lycée de $800$ élèves, $240$ sont en Seconde. Parmi eux, $25\\,\\%$ étudient l’allemand. Quelle est la fréquence, en pourcentage, des élèves de Seconde germanistes dans le lycée ? (Sans le signe %.)', '25*240:100:800*100', '60:800*100', '0,075*100'),
      fq(56, 64, 'f'), fq(39, 65, '%'), fq(7, 8, 'd'), fq(84, 240, '%'),
      T('Les effectifs d’une série sont $6$, $9$, $12$ et $3$. Quelle est la fréquence, en pourcentage, de la valeur d’effectif $9$ ? (Sans le signe %.)', '9:(6+9+12+3)*100', '9:30*100', '0,3*100'),
      T('Sur $50$ lancers d’une pièce, on obtient $23$ fois « pile ». Quelle est la fréquence de « face », sous forme décimale ?', '(50-23):50', '27:50'),
      T('Les fréquences de quatre valeurs sont $10\\,\\%$, $25\\,\\%$, $40\\,\\%$ et $x\\,\\%$. Combien vaut $x$ ?', '100-(10+25+40)', '100-75', '#La somme des fréquences vaut $100\\,\\%$.'),
    ],
  },
  {
    dossier: P, ordre: 1, titre: 'Probabilités simples', type: 'fraction', mode: 'lin', decimal: true, consigne: 'Donner la probabilité sous forme de fraction irréductible.',
    exercices: [
      F(DE + 'Probabilité d’obtenir $4$ ?', 1, 6),
      F(DE + 'Probabilité d’obtenir un nombre pair ?', 3, 6, 'Les issues favorables sont $2$, $4$ et $6$.'),
      F('On lance une pièce équilibrée. Probabilité d’obtenir « pile » ?', 1, 2),
      F('Une urne contient $3$ boules rouges et $7$ boules bleues. ' + U + 'Probabilité qu’elle soit rouge ?', 3, 10),
      F('Une urne contient $4$ boules vertes et $6$ boules jaunes. ' + U + 'Probabilité qu’elle soit jaune ?', 6, 10),
      F(DE + 'Probabilité d’obtenir un nombre strictement supérieur à $4$ ?', 2, 6, 'Les issues favorables sont $5$ et $6$.'),
      F('Une roue est partagée en $8$ secteurs identiques, dont $2$ sont gagnants. Probabilité de gagner ?', 2, 8),
      F('Un sac contient $5$ jetons numérotés de $1$ à $5$. On en tire un au hasard. Probabilité de tirer le jeton $3$ ?', 1, 5),
      F('On choisit au hasard une lettre du mot MATHS. Probabilité d’obtenir une voyelle ?', 1, 5, 'La seule voyelle est A.'),
      F(DE + 'Probabilité d’obtenir un multiple de $3$ ?', 2, 6, 'Les issues favorables sont $3$ et $6$.'),
      F('Une urne contient $5$ boules rouges, $3$ vertes et $2$ bleues. ' + U + 'Probabilité qu’elle soit verte ?', 3, 10),
      F('Une urne contient $5$ boules rouges, $3$ vertes et $2$ bleues. ' + U + 'Probabilité qu’elle ne soit pas rouge ?', 5, 10, 'Il y a $3 + 2 = 5$ boules qui ne sont pas rouges.'),
      F(C32 + 'Probabilité de tirer un as ?', 4, 32, 'Il y a $4$ as dans le jeu.'),
      F(C32 + 'Probabilité de tirer un cœur ?', 8, 32, 'Il y a $8$ cœurs dans le jeu.'),
      F('On choisit au hasard un nombre entier entre $1$ et $20$. Probabilité qu’il soit multiple de $5$ ?', 4, 20, 'Les multiples de $5$ sont $5$, $10$, $15$ et $20$.'),
      F('On choisit au hasard une lettre du mot PROBABILITE. Probabilité d’obtenir la lettre B ?', 2, 11, 'Le mot compte $11$ lettres, dont $2$ fois la lettre B.'),
      F(DE + 'Probabilité d’obtenir un nombre premier ?', 3, 6, 'Les nombres premiers sont $2$, $3$ et $5$.'),
      F('Dans une classe de $30$ élèves, $12$ sont des garçons. On choisit un élève au hasard. Probabilité que ce soit une fille ?', 18, 30, 'Il y a $30 - 12 = 18$ filles.'),
      F('Une roue est partagée en $12$ secteurs identiques : $3$ rouges, $4$ bleus, les autres jaunes. Probabilité d’obtenir un secteur jaune ?', 5, 12, 'Il y a $12 - 3 - 4 = 5$ secteurs jaunes.'),
      F(DE + 'Probabilité d’obtenir un nombre inférieur ou égal à $6$ ?', 6, 6, 'Toutes les issues sont favorables : c’est un événement certain.'),
      F('On tire une carte au hasard dans un jeu de $52$ cartes. Probabilité de tirer une figure (valet, dame ou roi) ?', 12, 52, 'Il y a $3$ figures par couleur, soit $12$ figures.'),
      F('On choisit au hasard un nombre entier entre $1$ et $30$. Probabilité qu’il soit premier ?', 10, 30, 'Les nombres premiers sont $2$, $3$, $5$, $7$, $11$, $13$, $17$, $19$, $23$ et $29$.'),
      F('On choisit au hasard un nombre entier entre $1$ et $50$. Probabilité qu’il soit multiple de $3$ ?', 16, 50, 'Le plus grand multiple de $3$ est $48 = 3\\times 16$ : il y en a $16$.'),
      Object.assign(T('La probabilité de gagner à un jeu est $0{,}35$. Quelle est la probabilité de perdre ?', '1-0,35', '#La somme des probabilités de deux événements contraires vaut $1$.'), { type: 'nombre', consigne: 'Répondre par un nombre décimal.' }),
      F('Une urne contient $20$ boules : $4$ rouges, les autres noires. ' + U + 'Probabilité qu’elle soit noire ?', 16, 20, 'Il y a $20 - 4 = 16$ boules noires.'),
      T('La probabilité d’un événement est $\\dfrac{3}{8}$. Quelle est la probabilité de l’événement contraire ?', '1-3/8', '8/8-3/8', '#La somme des probabilités de deux événements contraires vaut $1$.'),
      F('On choisit au hasard une lettre du mot MATHEMATIQUES. Probabilité d’obtenir une voyelle ?', 6, 13, 'Le mot compte $13$ lettres ; les voyelles sont A, E, A, I, U et E.'),
      F('Un dé équilibré a $12$ faces numérotées de $1$ à $12$. Probabilité d’obtenir un diviseur de $12$ ?', 6, 12, 'Les diviseurs de $12$ sont $1$, $2$, $3$, $4$, $6$ et $12$.'),
      Object.assign(T('Dans une urne de $30$ boules, la probabilité de tirer une boule rouge est $\\dfrac{2}{5}$. Combien y a-t-il de boules rouges ?', '2/5*30', '2*6'), { type: 'nombre', consigne: NB }),
      F('On choisit au hasard un nombre entier entre $1$ et $20$. Probabilité qu’il soit pair ou multiple de $5$ ?', 12, 20, 'Il y a $10$ nombres pairs, auxquels s’ajoutent $5$ et $15$ : $12$ issues favorables.'),
    ],
  },
];
