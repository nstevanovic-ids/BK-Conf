# Critique indépendante : prototype « Codex »

Évalué le 2026-11-15 sur http://localhost:8102/, Chrome headless piloté par Playwright, à 1440 × 900 et à 375 × 812 (tactile), en clair, en sombre et en `prefers-reduced-motion: reduce`. Seule grille : `proto/BRIEF-CLIENT.md`. Les notes des concepteurs n'ont pas été lues. Captures dans `/tmp/critique-codex/`.

Verdict en une phrase : un très bon lecteur de Constitution, avec une vraie idée (la marge qui calcule et qui annote le texte), mais ce n'est pas encore l'interface « studio de pointe » demandée : la carte, le mouvement et les municipalités sont absents, et quatre défauts visibles en moins de deux minutes feraient rejeter la démonstration.

## 1. Notes

**Originalité : 6 / 10.** Les instruments de marge qui appliquent l'article et écrivent leur verdict sur les alinéas mêmes (« 5 / 7 ✓ », « 44,0 % ✕ », dans toutes les colonnes) et la bascule glyphe par glyphe ne sortent d'aucun thème ni d'aucun générateur. Mais l'accueil est une couverture typographique suivie d'un sommaire, la fiche d'État est une fiche de documentation, et rien n'approche la carte de Bloomberg Graphics ni le récit au défilement de The Pudding : on est au niveau d'un bon Stripe Press, pas au-dessus.

**Exécution : 6 / 10.** Le socle est propre (0 erreur console, 0 débordement horizontal aux deux tailles, LCP ≈ 1,0 s en 4G simulée, mesure de 55 à 65 caractères, focus visible partout, mode sombre soigné). La finition lâche dès qu'on sort du chemin anglais à une colonne : anglais résiduel dans les trois standards, alternative « mouvement réduit » cassée, instruments étirés sur 1 243 px, trous entre alinéas sur mobile, extraits de recherche sans diacritiques.

**Utilité réelle : 7 / 10.** Un lecteur fait ici ce qu'aucun PDF ne permet : suivre un renvoi et revenir par le fil, lire cinq textes alignés alinéa par alinéa, vérifier une double majorité ou la péréquation à côté de l'article, atteindre un article par son numéro en deux touches. Hors Constitution, l'utilité tombe : pas de carte navigable, une municipalité cherchée mène à une fiche d'État qui ne la mentionne pas, et la fiche d'État apporte peu de plus que le portail actuel.

## 2. Défauts

### Bloquant avant de montrer au client

**B1. Anglais affiché dans les trois standards.**
Où : `#art-110`, `#art-132`, `#art-103`, `#state-BG-91`, accueil, en ZAP, SRE et IST.
Reproduire : ouvrir `#art-110`, choisir IST. Restent en anglais au milieu du cyrillique : « TEXTS IN PARALLEL », « CITED BY », « AGAINST ◂ ▸ FOR », « ASSUMPTION » et tout son paragraphe, « RESET », « READING THREAD » ; sur une fiche d'État : « NAMES THIS STATE », « APPLIES TO ITS CATEGORY », « NEIGHBOURING STATES » ; sur l'accueil : les quatre phrases d'usage. 29 chaînes (`strings-new.json`), marquées `data-untranslated` dans le DOM mais sans aucun signe visible.
Pourquoi : c'est un « non négociable » du brief. Le brief tolère qu'une traduction incertaine soit listée, mais « Reset », « For », « Against », « Cited by » ne sont pas incertaines, et le client verra de l'anglais dans une interface bulgare.
Correction : traduire les chaînes sûres par le glossaire des trois standards ; pour les autres, les masquer ou les marquer visiblement « à traduire », et joindre la liste à la livraison.

**B2. L'alternative « mouvement réduit » de la bascule d'écriture est cassée.**
Où : `cyr.js`, `fadeSwitch` (ligne 231 et suivantes) ; visible sur `#art-128` en SRE.
Reproduire : contexte `reduced_motion="reduce"`, `#art-128`, SRE, cliquer « Ћир ». Pendant 200 ms, le titre du titre apparaît deux fois à deux tailles différentes, « Glava V » perd ses capitales, l'index des articles passe sur une colonne (captures `r-anim0.png`, `r-anim2.png`).
Pourquoi : le fantôme est cloné puis attaché à `document.body`, hors de `.rd .opener` : il perd tous ses styles contextuels. Le brief exige « une vraie alternative, pas une simple suppression » ; celle-ci est un défaut visible.
Correction : insérer le fantôme dans le même parent que la cellule (position absolue), ou fondre la cellule elle-même sur deux calques.

**B3. La carte est absente.**
Où : partout. La seule carte est un localisateur SVG statique de 320 px sur la fiche d'État (`state.js`, `locator`), sans zoom, sans survol, voisins non focalisables (`tabindex="-1" aria-hidden`).
Pourquoi : le brief place « le rapport aux données et à la carte » dans le sujet, et cite en premier calibrage le zoom continu Confédération → État → municipalité. Le GeoJSON jusqu'à la municipalité n'est pas utilisé. On peut défendre un concept sans carte, pas le présenter sans le dire.
Correction : soit une vraie vue cartographique reliée aux articles (art. 1 bis, 103, 132 colorés par leur résultat), soit l'annoncer explicitement comme limite du concept dans le paragraphe de présentation.

**B4. Les instruments quittent la marge dès trois colonnes.**
Où : `#art-110-en-zap-sre` et au-delà, 1440 px.
Reproduire : `#art-110`, activer ZAP puis SRE. L'instrument passe sous l'article (à 1 228 px du début de l'article), étiré sur 1 243 px : sept barres de 1 100 px de long, un vide de 200 px dessous (capture `d-ins3col.png`).
Pourquoi : les deux fonctions signature (textes en parallèle, marge active) s'annulent l'une l'autre ; l'instrument n'est plus à côté des alinéas qu'il annote.
Correction : au-delà de deux colonnes, garder l'instrument en panneau collant de 300 px (tiroir à droite), ou le plafonner à 420 px sous la première colonne.

### Important

**I1. Sur mobile, des trous entre les alinéas.**
Où : `#art-110`, `#art-132` à 375 px.
Reproduire : ouvrir `#art-110` : l'espace après l'alinéa 1 et après le point a de l'article 132 est deux à trois fois plus grand qu'ailleurs (captures `m-art110.png`, `m-art132.png`).
Pourquoi : les cinq textes restent montés dans une grille alignée, donc chaque rangée prend la hauteur du texte le plus long, invisible. Le rythme vertical paraît accidentel.
Correction : sur mobile, ne monter que le texte actif (ou `align-content:start` par colonne sans rangées partagées) et charger les autres au glissement.

**I2. Cinq colonnes à 1440 px : 23 caractères par ligne.**
Mesuré sur `#art-110-en-zap-sre-ist-fr` : colonnes de 239 px, corps 14,4 px, 23 caractères par ligne (27 à quatre colonnes, 31 à trois). Trois colonnes est la limite de confort ; à cinq, c'est une démonstration, pas une lecture.
Correction : à partir de quatre textes, colonnes de 340 px minimum avec défilement horizontal aimanté et première colonne figée.

**I3. Palette de commande : extraits dégradés.**
Reproduire : Ctrl+K, taper « lika » ou « Београд ». Les extraits sont tirés du texte replié pour la recherche : minuscules, sans diacritiques (« dubrovacka r », « lublana », « tehnicki sportski institut »), coupés au milieu des mots, sans mise en évidence du terme. Pour « lika », l'extrait de l'article 1 bis ne contient même pas le mot.
Pourquoi : dans un projet dont l'alphabet est un livrable, afficher « lublana » est une faute.
Correction : chercher dans le texte replié, afficher l'extrait du texte original aux mêmes positions, couper aux mots, surligner l'occurrence.

**I4. Les municipalités ne mènent nulle part.**
Reproduire : Ctrl+K, « gosp », Entrée : on arrive sur `#state-LK-20`, où Gospić n'apparaît que comme chef-lieu ; « Novi Sad » mène à `#state-BC-02` sans aucune trace de Novi Sad.
Correction : au minimum, une liste des communes sur la fiche avec ancre et surbrillance de celle demandée ; mieux, la commune sur la carte.

**I5. Hash inconnu : retour muet à l'accueil.**
Reproduire : `#art-1-bis` (au lieu de `#art-1bis`), `#art-999`, `#foo` : l'accueil s'affiche sans message ; `#art-999` est même réécrit en `#home`. Seul `#state-XX-99` donne « State not found ».
Pourquoi : un lien mal recopié ne dit pas qu'il est faux. Par ailleurs le schéma `#state-LK-20` diffère du `#/state/<code>` du portail : les liens existants ne fonctionneront pas.
Correction : tolérer `art-1-bis`, afficher « article introuvable » avec la palette préremplie, accepter `#/state/<code>`.

**I6. Aucune transition à éléments partagés, aucun mouvement lié au défilement.**
Mesuré : 0 `view-transition-name` dans `codex.css` ; les changements de vue sont un fondu de la racine (160 ms / 260 ms). Le drapeau de la liste ne devient pas celui de la fiche, le numéro d'article du sommaire ne devient pas celui de la marge. Le seul élément piloté par le défilement est la barre de progression.
Pourquoi : hors bascule d'écriture, le prototype est immobile ; le brief demande une « signature de mouvement ».
Correction : nommer le drapeau, le code et le numéro d'article comme éléments partagés ; faire vivre les graduations du sommaire pendant la lecture.

**I7. L'accueil ne montre rien de ce qui est nouveau.**
À 1440 × 900, le premier écran contient un titre de 130 px, une devise et deux boutons. Les quatre promesses (renvois, parallèle, cyrillique, instruments) sont une liste numérotée en petit corps sous la ligne de flottaison, en anglais dans toutes les langues. Un client qui ne clique pas sur « 4 » ne verra jamais l'article 110.
Correction : faire tourner un instrument réel sur l'accueil (la double clé, manipulable), ou ouvrir directement sur un article vivant.

**I8. Cibles tactiles trop petites.**
Mesuré à 375 px : 202 graduations du sommaire de 11 × 44 px (liens réels) ; burger 32 × 44 ; curseurs de l'article 132 hauts de 28 px ; numéros « cité par » de 23 × 45 ; lien « Art. 103 » des fiches 44 × 14.
Correction : graduations non interactives sur mobile (la rangée entière ouvre le titre), 44 px partout ailleurs.

### Finition

- **F1. « 9 ноември 2026 g. »** sur l'accueil IST : le « g. » reste latin (`app.js` ligne 72, la chaîne passe par `pn` mais « g. » n'est pas converti). Attendu « г. ».
- **F2. Titre cyrillique de l'accueil** : interligne 0,82, le jambage du Ц de « КОНСТИТУЦИЯ » touche la ligne suivante (capture `d-home-ist.png`).
- **F3. Double ligne (A/Ћ)** : alignement mot à mot qui crée des blancs irréguliers dans la ligne latine (« Nacionalni  jezik », « kroz tri   regionalna ») ; « čl . 128 » avec une espace avant le point, et la ligne cyrillique montre « чл » sans le numéro.
- **F4. Barre « Texts in parallel » collante** : fond à 94 % avec flou, le texte qui passe dessous laisse des taches grises (visibles vers x = 590 et x = 1100 sur `d-art110.png`). Fond opaque.
- **F5. Fil de lecture** : pastille fixe en bas qui recouvre le corps du texte (desktop et mobile) ; un aller-retour s'empile (« Art. 110 › 115 bis › 14 › 115 bis ») au lieu de revenir au nœud déjà visité.
- **F6. Fiche d'État** : le code (200 px) écrase le nom (74 px), hiérarchie inversée ; sous « In the Constitution », la colonne gauche reste vide sur 800 px pendant que la droite continue (`d-LK-full.png`).
- **F7. Drapeau principal** : source de 400 px affichée à 384 px CSS, donc floue sur écran 2×.
- **F8. Texte français à cinq colonnes** : « dans l'ordre suivant / : slovène », deux-points rejeté en début de ligne (espace insécable manquante).
- **F9. Étiquettes sibyllines** : « 9 × 2 · 0 × 20 » (art. 103), « Art. … » comme libellé du bouton de recherche sur mobile, « +0 % » au signe minuscule.
- **F10. Marque en latin** (« BALKANSKA KONFEDERACIJA ») dans l'en-tête quand toute l'interface est en cyrillique, alors que le surtitre juste dessous est converti.
- **F11. Clavier** : aucun raccourci pour passer à l'article suivant ou précédent (j, k, flèches sans effet) ; il faut la palette. Le menu mobile reste ouvert après le choix de l'écriture et masque l'animation.
- **F12. Changement de langue** en cours de lecture : retour au début de l'article, l'alinéa en cours est perdu (−314 px → 106 px mesurés sur `#art-110`, clic par coordonnées).

## 3. Manquements au brief, point par point

| Exigence du brief | État |
|---|---|
| Niveau Linear, Stripe Press, The Pudding, Bloomberg Graphics | Stripe Press atteint sur la page d'article ; les trois autres non |
| Navigation, architecture, composants, interactions | Tenu pour la Constitution ; fiche d'État et index conventionnels |
| Mouvement | Une seule signature (glyphes) ; le reste est un fondu |
| Rapport aux données | Tenu : trois instruments manipulables sur données réelles, hypothèses déclarées |
| Rapport à la carte | **Manquant** (B3) |
| Drapeaux jamais le concept, jamais verticaux, jamais recadrés, proportion réelle | **Tenu.** 54 drapeaux mesurés : rapport affiché = rapport naturel (1,48 à 2,0), `object-fit: fill` sans déformation, aucun plus haut que large |
| Trois vues navigables sur vraies données | Tenu (accueil, lecteur, État, index) |
| Palette ⌘K sur États, articles, municipalités | Tenu, avec I3 et I4 |
| Bascule latin ↔ cyrillique glyphe par glyphe | **Tenu et réussi** ; alternative mouvement réduit cassée (B2) |
| Renvois cliquables | Tenu : aperçu au survol et au focus clavier, 184 renvois inverses « cité par » |
| Vue parallèle des 5 textes | Tenu jusqu'à trois colonnes ; I2 au-delà ; I1 sur mobile |
| Simulateur de double majorité | Tenu (art. 110 et 111) |
| Simulateur de péréquation 85 % / 30 % | Tenu (art. 132), et il montre que le plafond ne finance pas le plancher |
| Droit d'alarme | **Manquant** comme mécanisme manipulable (texte seulement, art. 109) |
| Transbalkanska, carte de citoyen | **Manquants** (texte des articles seulement) |
| View Transitions à éléments partagés | **Manquant** (I6) |
| Animations pilotées par le défilement | **Manquant**, hors barre de progression |
| Typographie variable en mouvement | **Manquant** : polices variables chargées, graisse jamais animée |
| Bibliothèques à la demande | Tenu : aucune bibliothèque, modules importés à la demande |
| LCP < 2,5 s mobile 4G | **Tenu** : ≈ 1,0 s mesuré (1,6 Mbit/s, 150 ms, CPU ÷ 4), 312 Ko pour l'accueil, CLS ≤ 0,009 |
| 60 fps | Tenu au défilement (médiane 16,7 ms, 3 images longues sur 120, CPU ÷ 4) |
| `prefers-reduced-motion` : vraie alternative | Intention présente, exécution cassée (B2) |
| Site statique, aucune requête externe | Tenu : 0 requête hors `localhost:8102` |
| Palette canonique, Arimo, Sofia Sans Extra Condensed | Tenu, aucune police ajoutée |
| Aucun emblème dessiné en SVG | Tenu : `emblem.png`, `flags/*.png`, `coa/*.webp` ; le seul SVG dessiné est le contour des États |
| Aucun code couleur par peuple | Tenu : les sept peuples partagent la même encre dans les instruments et l'index |
| Toute chaîne dans toutes les langues | **Non tenu à l'écran** (B1) : 29 chaînes listées mais affichées en anglais |
| Vidéo de 30 s | Présente : `proto/codex/demo.mp4`, 30,0 s, 1280 × 720 (non visionnée) |
| Routes `#/state/<code>` | Schéma différent (`#state-LK-20`), voir I5 |

## 4. Ce qui est réellement réussi

- **La marge active.** Basculer la délégation serbe sur l'article 110 et voir l'alinéa 5 passer à « 44,0 % ✕ » dans chaque colonne de langue : c'est l'idée du prototype, elle est juste et elle n'existe nulle part ailleurs. Les hypothèses sont dites (« Assumption ») au lieu d'être cachées.
- **La bascule d'écriture.** Balayage glyphe par glyphe, teinte rouge transitoire, position de lecture tenue : la meilleure séquence de mouvement des trois critères.
- **L'alignement des textes.** Alinéas numérotés, rangées communes, renvois traduits dans chaque langue ; à deux ou trois colonnes, c'est un outil de juriste.
- **La tenue technique.** 0 erreur, 0 débordement, 1 s de LCP, 2 polices, aucune dépendance, position conservée quand on ajoute une colonne (106 → 107 px), atterrissage exact sur les 11 articles testés.
- **La palette de commande** pour les numéros : « 110 », « art 1 bis », « LK-20 », requête en cyrillique, tout répond.

## Note de méthode

Une première série de mesures montrait un saut de défilement de 400 à 500 px au changement de thème et à l'ajout d'une colonne. C'était un artefact de `locator.click()` de Playwright sur l'en-tête collant ; refait avec des clics par coordonnées, le saut disparaît. Il n'est donc pas compté comme défaut. Non testé : Safari et Firefox (les View Transitions et `content-visibility` y diffèrent), lecteur d'écran réel, appareil physique.
