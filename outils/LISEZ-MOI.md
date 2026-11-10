# Outils (non publiés sur le site)

Ce dossier sert à préparer les exercices de révision. Il n'est pas copié sur le site.

- `moteur.js` : moteur de correction des réponses (le même que dans `index.html`).
  Après une modification : `python3 synchro-moteur.py ..` (depuis ce dossier) recopie le moteur dans la page.
- `generer-lot.js` : fabrique les fichiers « revision - … .csv » d'un lot et vérifie chaque exercice
  (réponse juste, forme attendue, chaque étape de correction recalculée).
  Usage : `node generer-lot.js lots/calcul-litteral.js` → fichiers dans `sortie-lots/`.
- `lots/` : les exercices de chaque lot, en écriture clavier. `premiers-themes.js` = fractions, développement, factorisation
  (générés par `generer-premiers-themes.js`).
- `tableur/Code.gs` : programme du tableur Google de suivi des élèves.

Types de vérification : fraction, developpe, factorise, egal, nombre.
Ordre des thèmes dans un domaine : numéro dans le nom du fichier (« revision - 2 - Réduire une expression.csv »).
