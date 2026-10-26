# Site de cours de mathématiques

Site gratuit hébergé par GitHub Pages : cours, exercices, corrigés, fiches méthode, diaporamas et flashcards, rangés par classe puis par chapitre.

## 1. Mise en ligne (une seule fois, 10 minutes)

1. Créez un compte sur [github.com](https://github.com) si ce n'est pas déjà fait.
2. Cliquez sur **New repository** (bouton vert « New »).
   - Nom : par exemple `maths` (l'adresse du site sera `https://votre-pseudo.github.io/maths/`).
   - Cochez **Public** (obligatoire pour GitHub Pages gratuit).
   - Cliquez sur **Create repository**.
3. Sur la page du dépôt vide, cliquez sur **uploading an existing file**.
   Décompressez le zip, puis glissez **tout le contenu** du dossier `site-maths` (pas le dossier lui-même) dans la page. Validez avec **Commit changes**.
   > Le dossier `.github` est caché sur Mac/Windows. Sur Mac, appuyez sur `Cmd + Maj + .` dans le Finder pour l'afficher ; sur Windows, cochez « Éléments masqués » dans l'onglet Affichage. Il doit bien être envoyé, c'est lui qui publie le site.
4. Allez dans **Settings → Pages**. Dans « Build and deployment », choisissez **Source : GitHub Actions**.
5. Allez dans l'onglet **Actions**, cliquez sur « Publier le site » puis **Run workflow**. Après environ une minute, le site est en ligne.

## 2. Personnaliser le site

Tout se modifie directement sur github.com : ouvrez le fichier, cliquez sur le crayon ✏️, modifiez, puis **Commit changes**. Le site se met à jour tout seul en une minute.

| Fichier | Ce qu'il contient |
|---|---|
| `reglages.json` | Matière, nom de l'établissement, adresse mail, liste des classes |
| `textes/presentation.md` | Le mot de présentation de la page d'accueil |
| `textes/annonces.md` | Les annonces (les plus récentes en haut) |
| `documents/seconde/_progression.md` | La progression de l'année pour une classe |

**Annonces** : une annonce commence par une ligne `### 20 octobre 2026`, suivie du texte. `**texte**` met en gras.

**Progression** : `- [x]` = chapitre traité, `- [~]` = en cours, `- [ ]` = à venir.

**Ajouter une classe** (ex. Première) : ajoutez une ligne dans `reglages.json` et créez le dossier `documents/premiere/`.

## 3. Ajouter des documents

Les documents sont rangés ainsi :

```
documents/
  seconde/
    01 - Nombres et calculs/
      cours - Nombres et calculs.pdf
      exercices - Feuille 1.pdf
      corrigé - Feuille 1 @2026-11-20.pdf
      fiche méthode - Calculer avec des fractions.pdf
      diaporama - Les puissances.pptx
      flashcards - Puissances.csv
```

**Pour ajouter un fichier** : ouvrez le dossier du chapitre sur github.com, cliquez sur **Add file → Upload files**, glissez le fichier, puis **Commit changes**.

**Pour créer un nouveau chapitre** : depuis votre ordinateur, préparez un dossier nommé `03 - Vecteurs` contenant vos fichiers, ouvrez `documents/seconde` sur github.com, faites **Add file → Upload files** et glissez le dossier entier.

### Le nom du fichier décide de tout

Le **premier mot** du nom indique le type de document. Ce qui suit ` - ` (espace, tiret, espace) est le titre affiché.

| Le nom commence par… | Rangé dans |
|---|---|
| `cours` | Cours |
| `fiche` ou `méthode` | Fiches méthode |
| `exercices`, `exo`, `td`, `feuille`, `devoir`, `dm` | Exercices |
| `corrigé` ou `correction` | Corrigés |
| `diaporama`, `diapo`, `présentation` | Diaporamas |
| `flashcards` (fichier `.csv`) | Flashcards |
| autre chose | Autres documents |

Le numéro au début du nom de dossier (`01 - `, `02 - `…) fixe l'ordre des chapitres.

### Corrigés publiés à une date choisie

Ajoutez `@` suivi de la date (année-mois-jour) à la fin du nom :

`corrigé - Feuille 1 @2026-11-20.pdf`

Avant cette date, les élèves voient « Disponible le jeudi 20 novembre » à la place du lien. Le site se reconstruit chaque matin vers 5 h et publie alors les corrigés du jour.

> **Important** : le dépôt GitHub est public. Un élève qui irait fouiller directement sur github.com pourrait y trouver le fichier avant la date. Pour un corrigé vraiment confidentiel, gardez-le sur votre ordinateur et déposez-le le jour venu.
>
> GitHub suspend les tâches automatiques d'un dépôt resté 60 jours sans modification (vacances d'été). Si cela arrive, un bouton « Enable workflow » apparaît dans l'onglet Actions.

### Flashcards

Un fichier `.csv` (créé avec un tableur ou un éditeur de texte), une carte par ligne, question et réponse séparées par un point-virgule :

```
question;réponse
Terme général d'une suite géométrique ?;$u_n = u_0 \times q^n$
Les trois étapes d'une récurrence ?;Initialisation, hérédité, conclusion
```

Les formules entre `$...$` sont écrites en LaTeX et s'affichent proprement. Dans un tableur, enregistrez au format « CSV (point-virgule) » en UTF-8.

## 4. À savoir

- Évitez les caractères `/ \ : * ? " < > |` et `#` dans les noms de fichiers et de dossiers. Les accents et les espaces sont acceptés.
- Taille maximale d'un fichier envoyé par le site GitHub : 25 Mo. Compressez les diaporamas lourds ou exportez-les en PDF.
- Mettez en ligne vos propres documents, pas des scans de manuels.
- Les fichiers d'exemple (documents et flashcards) sont à supprimer ou remplacer par les vôtres.
