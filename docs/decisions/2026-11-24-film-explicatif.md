# ADR 2026-11-24 — Film explicatif « The Confederation in five minutes » (#/five-minutes)

## Statut
Accepté le 2026-11-24 par l'auteur : une vidéo pour expliquer la Confédération en cinq minutes, en motion design
(« go ») ; scène d'essai validée avec quatre corrections (transitions plus vivantes au drapeau, ouverture plus
courte, capitales qui ne restent pas en or pendant Brčko et Mostar, fond blanc neutre au lieu du beige), puis
transition au drapeau sans numéro ni titre de chapitre.

## Contexte
- L'auteur voulait « un onglet quelque part ou une vidéo » qui explique la Confédération en cinq minutes.
- Le portail montre déjà chaque sujet en détail (fiches d'États, carte, Institutions, page des votes, lecteur de
  la Constitution, identité) ; il manquait un parcours court qui les relie.
- Les films d'États (`portail/videos/<code>.mp4`, ADR 2026-10-18-films-etats.md) sont des boucles tournées hors
  dépôt ; un film explicatif, lui, se dessine à partir des données et de la Constitution.

## Décision
1. **Un film construit en code** (`film/`) : composition SVG 1280 × 720 (`film/explainer/`) dont
   `FILM.seek(t)` dessine n'importe quel instant, sans horloge ni hasard ; `film/render.js` capture chaque image
   dans Chromium (Playwright) et l'encode avec ffmpeg (H.264, yuv420p, faststart, 30 images par seconde). La
   même composition se lit en direct dans un navigateur pour le travail.
2. **Contenu** : une ouverture (lion ailé, titre, devise) et huit chapitres : les États (carte des cinquante-deux
   États, capitales, Brčko et Mostar) ; les peuples (registres, communautés, entités autonomes) ; les
   institutions ; comment une loi passe (Kongres, consentement du Narodni Sabor, double clé, sonnette d'alarme) ;
   la démocratie directe ; la langue (trois standards, 32 lettres et leur jumelle cyrillique) ; vivre ensemble
   (titre 5 bis, art. 60 et 73 bis) ; les symboles (drapeaux civil et d'État, lion ailé, devise). 4 min 35.
3. **Sources** : textes repris de la Constitution v4.16 ; carte de marge `constitution/map.json`, États, peuples,
   entités, alphabet et chiffres de `portail/data/` ; les nombres de la double clé (cinq délégations à 44,0 %
   des inscrits, six à 75,3 %) et le vote des États de l'exemple de double majorité sont calculés par le moteur
   unique `REGLES`, dont l'hypothèse sur les inscrits est dite à l'écran.
4. **Forme** : sans son, le texte à l'écran porte le propos (quatre secondes au moins par phrase) ; ouverture
   sur fond indigo, chapitres sur fond blanc ; transition entre chapitres par le drapeau civil (bandes depuis la
   gauche, bande rouge qui tombe, un tiers de seconde plein cadre, départ vers la droite), sans texte, dans les
   couleurs du drapeau lui-même ; couleurs du canon ailleurs ; Sofia Sans Extra Condensed et Arimo ; cyrillique
   en formes droites (jeu ss01), comme le portail. Aucune couleur par peuple : un peuple à la fois, dans une
   seule teinte, comme le filtre de la carte.
5. **Langues** : anglais d'abord. Tous les textes à l'écran sont dans `film/explainer/<langue>.js` ; une
   version dans un standard = un fichier de même forme et un rendu, non faits à ce jour.
6. **Page** « The Confederation in five minutes », route `#/five-minutes`, rangée sous Home (fil d'Ariane
   Home › The Confederation in five minutes), sans entrée de navigation ; mise en avant par un bouton du héros
   de l'accueil et par la recherche. La vidéo en tête, puis les chapitres (un bouton par chapitre, la vidéo y
   saute), puis le texte du film en entier (accessibilité), dans la langue du film (`lang="en"`,
   `translate="no"` : ni traduit ni passé en cyrillique). Les libellés de la page passent par `L` et ont leurs
   trois traductions.
7. **Données** : `portail/data/film.json` (chapitres, instants, texte, chemins de la vidéo et de l'image
   d'attente), généré par `node film/render.js --data`, **ne pas éditer** ; chargé par la route
   (`DATA_ROUTE`), publié (`DATA_FILES`), injecté dans le fichier unique (`EXPLAINER`), chemins préfixés comme
   ceux des films d'États. La vidéo (`portail/videos/explainer-en.mp4`, 7,5 Mo) et son image d'attente
   (`explainer-en.jpg`) sont versées et copiées par le déploiement Pages ; le fichier unique les lie.

## Conséquences
- Une décision gelée qui touche le film (nombre d'États, noms, institutions, seuils, symboles) impose de
  modifier `film/explainer/` puis de refaire le rendu (`node film/render.js`, environ 2,4 fois la durée du film)
  et les données (`--data`).
- Le film n'est ni traduit ni sous-titré dans les standards ; la page le dit.
- Pas vu fonctionner : lecture sur un vrai téléphone, Safari et Firefox ; déploiement réel sur Pages.
