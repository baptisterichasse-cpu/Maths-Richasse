// Compétences du chapitre 2 de Seconde (Arithmétique) : 10 exercices par compétence
const D = 'seconde/02 - Arithmétique';
const DEV = 'Développer et réduire.', FAC = 'Factoriser.';
const L = (t, r, type, c) => ({ t, r, type, consigne: type === 'developpe' ? DEV : FAC, c });
module.exports = [
  {
    dossier: D, nb: 10, ordre: 1, titre: 'Reconnaître un multiple ou un diviseur', type: 'ensemble',
    exercices: [
      { div: 84, parmi: [2, 3, 5] }, { div: 135, parmi: [2, 3, 5] }, { div: 250, parmi: [2, 3, 5] }, { multiples: [6, 20, 50] }, { div: 372, parmi: [2, 3, 5] },
      { div: 1005, parmi: [2, 3, 5] }, { multiples: [15, 40, 100] }, { div: 913, parmi: [2, 3, 5] }, { div: 4710, parmi: [2, 3, 5, 6, 10, 15] }, { div: 12345, parmi: [2, 3, 5, 6, 10, 15] },
    ],
  },
  {
    dossier: D, nb: 10, ordre: 2, titre: "Donner la liste des diviseurs d'un entier", type: 'ensemble',
    exercices: [{ diviseurs: 10 }, { diviseurs: 12 }, { diviseurs: 15 }, { diviseurs: 18 }, { diviseurs: 20 }, { diviseurs: 28 }, { diviseurs: 30 }, { diviseurs: 36 }, { diviseurs: 45 }, { diviseurs: 60 }],
  },
  {
    dossier: D, nb: 10, ordre: 3, titre: 'Utiliser une écriture littérale pour démontrer', type: 'developpe',
    exercices: [
      L('Un nombre pair s’écrit $2k$. Son carré est $(2k)^2$.', '4k^2', 'developpe', '$(2k)^2 = 2^2\\times k^2 = 4k^2$. Comme $4k^2 = 2\\times 2k^2$, le carré d’un nombre pair est pair.'),
      L('La somme de deux entiers consécutifs s’écrit $n + (n+1)$.', '2n+1', 'developpe', '$n + (n+1) = 2n + 1$ : la somme de deux entiers consécutifs est toujours impaire.'),
      L('La somme de deux nombres pairs s’écrit $2a + 2b$.', '2(a+b)', 'factorise', '$2a + 2b = 2(a+b)$ avec $a+b$ entier : la somme de deux nombres pairs est paire.'),
      L('La somme de deux multiples de $5$ s’écrit $5a + 5b$.', '5(a+b)', 'factorise', '$5a + 5b = 5(a+b)$ avec $a+b$ entier : la somme de deux multiples de $5$ est un multiple de $5$.'),
      L('Un nombre impair s’écrit $2k+1$. Son carré est $(2k+1)^2$.', '4k^2+4k+1', 'developpe', 'Identité remarquable : $(2k+1)^2 = (2k)^2 + 2\\times 2k\\times 1 + 1^2 = 4k^2 + 4k + 1$.'),
      L('Pour montrer que $4k^2 + 4k + 1$ est impair, on factorise d’abord $4k^2 + 4k$.', '4k(k+1)', 'factorise', '$4k^2 + 4k = 4k(k+1) = 2\\times 2k(k+1)$, donc $4k^2 + 4k + 1 = 2\\times 2k(k+1) + 1$ : le carré d’un nombre impair est impair.'),
      L('La somme de deux nombres impairs s’écrit $(2a+1) + (2b+1)$.', '2(a+b+1)', 'factorise', '$(2a+1) + (2b+1) = 2a + 2b + 2 = 2(a+b+1)$ : la somme de deux nombres impairs est paire.'),
      L('La somme de trois entiers consécutifs s’écrit $n + (n+1) + (n+2)$.', '3(n+1)', 'factorise', '$n + (n+1) + (n+2) = 3n + 3 = 3(n+1)$ : la somme de trois entiers consécutifs est un multiple de $3$.'),
      L('La différence des carrés de deux entiers consécutifs s’écrit $(n+1)^2 - n^2$.', '2n+1', 'developpe', '$(n+1)^2 - n^2 = n^2 + 2n + 1 - n^2 = 2n + 1$ : c’est toujours un nombre impair.'),
      L('Le produit de deux nombres impairs s’écrit $(2a+1)(2b+1)$.', '4ab+2a+2b+1', 'developpe', '$(2a+1)(2b+1) = 4ab + 2a + 2b + 1 = 2(2ab+a+b) + 1$ : le produit de deux nombres impairs est impair.'),
    ],
  },
  {
    dossier: D, nb: 10, ordre: 4, titre: 'Reconnaître un nombre premier', type: 'ensemble',
    exercices: [
      { premiers: [7, 9, 11, 15] }, { premiers: [13, 21, 23, 27] }, { premiers: [1, 2, 17, 25] }, { premiers: [29, 33, 37, 39] }, { premiers: [41, 49, 51, 53] },
      { premiers: [57, 59, 61, 63] }, { premiers: [67, 77, 87, 97] }, { premiers: [71, 81, 91, 101] }, { premiers: [83, 89, 93, 99] }, { premiers: [103, 111, 119, 127] },
    ],
  },
  {
    dossier: D, nb: 10, ordre: 5, titre: 'Décomposer en produit de facteurs premiers', type: 'decomposition',
    exercices: [{ dec: 12 }, { dec: 18 }, { dec: 30 }, { dec: 45 }, { dec: 56 }, { dec: 84 }, { dec: 90 }, { dec: 126 }, { dec: 180 }, { dec: 252 }],
  },
  {
    dossier: D, nb: 10, ordre: 6, titre: 'Rendre une fraction irréductible', type: 'fraction',
    exercices: [{ irr: [12, 18] }, { irr: [15, 25] }, { irr: [14, 35] }, { irr: [24, 36] }, { irr: [45, 60] }, { irr: [42, 70] }, { irr: [84, 126] }, { irr: [54, 72] }, { irr: [90, 150] }, { irr: [168, 252] }],
  },
];
