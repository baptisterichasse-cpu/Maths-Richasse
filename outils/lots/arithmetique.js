// Lot « Arithmétique » : 4 thèmes de 30 exercices
const D = '02 - Arithmétique';
const NB = 'Répondre par un nombre.';
module.exports = [
  {
    dossier: D, ordre: 1, titre: 'Multiples, diviseurs et critères de divisibilité', type: 'ensemble',
    exercices: [
      { div: 48, parmi: [2, 3, 5, 10] }, { div: 135, parmi: [2, 3, 5, 9] }, { div: 250, parmi: [2, 3, 5, 10] }, { diviseurs: 12 }, { diviseurs: 20 },
      { multiples: [7, 30, 60] }, { div: 426, parmi: [2, 3, 5, 9] }, { div: 1035, parmi: [2, 3, 5, 9, 10] }, { multiples: [9, 50, 100] }, { diviseurs: 18 },
      { div: 516, parmi: [2, 3, 4, 9] }, { div: 2340, parmi: [2, 3, 4, 5, 9, 10] }, { diviseurs: 36 }, { diviseurs: 45 }, { div: 738, parmi: [2, 3, 4, 6, 9] },
      { multiples: [12, 100, 160] }, { div: 1001, parmi: [2, 3, 7, 11, 13] }, { diviseurs: 48 }, { div: 4125, parmi: [3, 5, 9, 11, 25] }, { multiples: [15, 200, 300] },
      { diviseurs: 60 }, { div: 7920, parmi: [4, 6, 9, 11, 12, 15] }, { diviseurs: 72 }, { div: 12345, parmi: [3, 5, 9, 15, 823] }, { diviseurs: 100 },
      { div: 9999, parmi: [3, 9, 11, 99, 101] }, { multiples: [25, 480, 620] }, { diviseurs: 97 }, { div: 123456, parmi: [2, 3, 4, 6, 8, 9] }, { diviseurs: 144 },
    ],
  },
  {
    dossier: D, ordre: 2, titre: 'Division euclidienne', type: 'liste', mode: 'lin',
    exercices: [
      { de: [47, 5] }, { de: [63, 8] }, { de: [100, 7] }, { de: [85, 9] }, { de: [124, 10] },
      { de: [59, 6] }, { de: [200, 12] }, { de: [75, 4] },
      { de: [50, 6], t: 'On range $50$ œufs par boîtes de $6$. Combien de boîtes pleines obtient-on, et combien d’œufs reste-t-il ?' },
      { de: [144, 12] },
      { de: [357, 11] }, { de: [1000, 13] }, { de: [845, 25] }, { de: [999, 37] }, { de: [2024, 15] },
      { de: [250, 48], t: '$250$ élèves partent en voyage dans des cars de $48$ places. Combien de cars seront pleins, et combien d’élèves reste-t-il à placer ?' },
      { de: [500, 60], t: 'Convertir $500$ minutes : combien d’heures entières, et combien de minutes restantes ?' },
      { de: [400, 7], t: 'Convertir $400$ jours : combien de semaines entières, et combien de jours restants ?' },
      { de: [1234, 56] }, { de: [731, 17] },
      { de: [10000, 7] }, { de: [5555, 101] }, { de: [3600, 128] },
      { de: [1000, 60], t: 'Convertir $1\\,000$ secondes : combien de minutes entières, et combien de secondes restantes ?' },
      { t: 'Dans une division euclidienne, le diviseur est $12$, le quotient est $7$ et le reste est $5$. Quel est le dividende ?', e: '12*7+5', type: 'nombre', consigne: NB, n: 'Dividende $=$ diviseur $\\times$ quotient $+$ reste.' },
      { t: 'En divisant un nombre par $8$, on trouve un quotient de $13$ et un reste de $6$. Quel est ce nombre ?', e: '8*13+6', type: 'nombre', consigne: NB, n: 'Dividende $=$ diviseur $\\times$ quotient $+$ reste.' },
      { t: 'Quel est le plus grand reste possible dans une division euclidienne par $15$ ?', r: '14', type: 'nombre', consigne: NB, c: 'Le reste est toujours strictement inférieur au diviseur : le plus grand reste possible est $14$.' },
      { t: 'Quel est le reste de la division euclidienne de $2\\,347$ par $5$ ?', r: '2', type: 'nombre', consigne: NB, c: 'Les multiples de $5$ se terminent par $0$ ou $5$ : $2\\,347 = 2\\,345 + 2 = 5\\times 469 + 2$.' },
      { t: 'On partage équitablement $365$ bonbons entre $24$ enfants. Combien de bonbons faut-il ajouter, au minimum, pour qu’il n’en reste aucun ?', r: '19', type: 'nombre', consigne: NB, c: '$365 = 24\\times 15 + 5$ : il reste $5$ bonbons. Il en manque $24 - 5 = 19$ pour donner un bonbon de plus à chacun.' },
      { t: 'Le quotient d’une division euclidienne par $9$ est $21$. Quel est le plus grand dividende possible ?', e: '9*21+8', type: 'nombre', consigne: NB, n: 'Le plus grand reste possible est $8$.' },
    ],
  },
  {
    dossier: D, ordre: 3, titre: 'Nombres premiers et décomposition', type: 'decomposition',
    exercices: [
      { premiers: [2, 9, 11, 15] }, { premiers: [1, 7, 21, 23] }, { premiers: [13, 17, 27, 33] }, { premiers: [29, 39, 49, 59] },
      { premiers: [31, 51, 61, 91] }, { premiers: [37, 47, 57, 87] }, { premiers: [41, 43, 45, 49] }, { premiers: [71, 77, 79, 81] },
      { dec: 12 }, { dec: 30 },
      { dec: 18 }, { dec: 45 }, { dec: 50 }, { dec: 60 }, { dec: 72 }, { dec: 84 }, { dec: 90 }, { dec: 100 }, { dec: 126 }, { dec: 150 },
      { dec: 360 }, { dec: 504 }, { dec: 1000 }, { dec: 1001 }, { dec: 432 }, { dec: 1755 }, { dec: 2310 }, { dec: 3675 },
      { premiers: [97, 101, 111, 119] }, { premiers: [143, 149, 151, 169] },
    ],
  },
  {
    dossier: D, ordre: 4, titre: 'Diviseurs communs et fractions irréductibles', type: 'fraction',
    exercices: [
      { communs: [12, 18] }, { communs: [20, 30] }, { communs: [15, 25] }, { communs: [8, 12] }, { communs: [24, 36] },
      { pgcd: [14, 21] }, { pgcd: [16, 24] }, { pgcd: [30, 45] }, { pgcd: [9, 28] }, { pgcd: [18, 27] },
      { irr: [12, 18] }, { irr: [20, 30] }, { irr: [24, 36] }, { irr: [45, 60] }, { irr: [28, 42] },
      { irr: [84, 126] }, { irr: [35, 49] }, { irr: [48, 64] }, { irr: [60, 84] }, { irr: [27, 64] },
      { pgcd: [144, 180] }, { pgcd: [210, 330] }, { pgcd: [255, 340] },
      { pgcd: [84, 126], t: 'Un fleuriste a $84$ roses et $126$ tulipes. Il veut composer le plus grand nombre possible de bouquets identiques en utilisant toutes les fleurs. Combien de bouquets peut-il faire ?' },
      { pgcd: [120, 168], t: 'On veut carreler une pièce de $120$ cm sur $168$ cm avec des carreaux carrés identiques, les plus grands possible, sans découpe. Quelle est la longueur du côté d’un carreau, en cm ?' },
      { pgcd: [48, 60], t: 'Un pâtissier a $48$ macarons et $60$ chocolats. Il veut préparer le plus grand nombre possible de sachets identiques, sans reste. Combien de sachets peut-il faire ?' },
      { irr: [126, 210] }, { irr: [330, 462] }, { irr: [360, 504] }, { irr: [625, 1000] },
    ],
  },
];
