# Outils (non publiés sur le site)

Ce dossier sert à préparer les exercices de révision. Il n'est pas copié sur le site.

- `moteur.js` : moteur de correction des réponses (le même que dans `index.html`).
  Après une modification : `python3 synchro-moteur.py ..` (depuis ce dossier) recopie le moteur dans la page.
- `generer.js` (avec `formes.js`) : fabrique les fichiers « revision - … .csv » d'un lot et vérifie chaque exercice
  (réponse calculée par le moteur, chaque étape de correction recalculée).
  Usage : `node generer.js lots/fonctions.js` → fichiers dans `sortie-lots/`.
  (`generer-lot.js` est l'ancien générateur, utilisé pour `lots/calcul-litteral.js`.)
- `lots/` : les exercices de chaque lot, en écriture compacte. `premiers-themes.js` = fractions, développement, factorisation
  (générés par `generer-premiers-themes.js`).
- `tableur/Code.gs` : programme du tableur Google de suivi des élèves.

Types de vérification : fraction, developpe, factorise, egal, nombre, decomposition, puissance, scientifique,
racine, liste, ensemble, inequation, duree.
Figures dans un énoncé : `[[courbe:-4,1 -2,3 0,-1]]` (courbe passant par ces points) et
`[[tableau:$x$;$1$;$2$|$f(x)$;$5$;?]]` (lignes séparées par |, cases par ;).
Ordre des thèmes dans un domaine : numéro dans le nom du fichier (« revision - 2 - Réduire une expression.csv »).
