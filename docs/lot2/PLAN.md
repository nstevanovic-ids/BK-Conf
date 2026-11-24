# Plan du lot 2 : Atlas → `#/map`

Rédigé le 23 novembre 2026 sur `claude/lot2-carte`, partie de `main` (f0c5031, lot 1 fusionné). Copie
destinée au Projet claude.ai sous `claude/plan-lot2-atlas.md` : les sessions cloud ne voient pas le
Projet, elles n'ont donc lu ni écrit `claude/reprise-refonte-portail.md`. Lu à la place : la copie du plan
du lot 1 (`docs/lot1/PLAN.md`), `proto/REPRISE.md`, puis `CLAUDE.md` et `docs/canon/`, qui priment.

**Rien n'est codé pour le lot 2.** Ce plan attend la validation de l'auteur.

## Règles de la session

- Branche `claude/lot2-carte`, commits atomiques, **poussés après chaque commit**. Pas de sous-agents.
- Aucune PR fusionnée dans `main` sans accord explicite. Français de travail, masculin générique.
- Mesures et captures versées dans `docs/lot2/mesures/`, jamais laissées dans le conteneur.
- Correctif du lot 1 (art. 110 retiré de l'ouverture du lecteur) : branche et PR à part,
  [nstevanovic-ids/BK-Conf#84](https://github.com/nstevanovic-ids/BK-Conf/pull/84), en attente d'accord.

## Décisions déjà prises (rappel)

MapLibre remplace le globe d3 sur `#/map` (nouvel ADR) ; d3 reste pour la petite carte des fiches. Build lié et
chargement par page réutilisés ; MapLibre chargé à la demande, jamais au démarrage. La carte renvoie à
`#/state/<code>` sans dupliquer la fiche. Couches institutionnelles seulement : sièges (art. 103) et double
clé (art. 110), avec lien vers l'article ; aucune péréquation (art. 132). Un seul moteur : `portail/js/regles.js`.
Une seule recherche, celle du portail, qui reçoit les communes. Vol de caméra ajouté aux règles de mouvement.
Chefs-lieux de KJ-15, KM-16 et VS-45 non marqués, canon inchangé.

## Points à valider par l'auteur (recommandation en premier)

1. **Option « Peoples » du globe** : supprimer la palette à sept couleurs et fermer l'exception de l'ADR
   2026-10-14-pas-de-code-couleur-peuples (`CLAUDE.md`, « Ne pas faire »). La répartition par peuple reste
   comme filtre à une seule teinte : un peuple à la fois, ses États dans la couleur de l'indicateur, les
   autres estompés (chaînes existantes « Show only the serbs on the map »…, « Show all »). Atlas n'avait
   aucun code couleur par peuple ; la couche de l'art. 110 montre les peuples par aplat et hachure.
2. **Thème** : la carte suit le thème du portail (clair par défaut, sombre au bouton), au lieu du style
   « salle de situation » toujours sombre. Palette sombre dérivée des mêmes jetons, contrôlée au validateur de
   contraste.
3. **Routes** : `#/map` (Confédération), `#/map/LK-20` (État), `#/map/LK-20/gospic` (commune),
   `#/map/art-103` et `#/map/art-110` (couches). Une adresse inconnue est réécrite en `#/map`.
4. **Page plein écran** : sur `#/map`, la carte occupe l'écran sous l'en-tête et le pied de page n'est pas
   affiché (la molette zoome la carte ; sinon le pied de page serait inatteignable à la souris).
5. **Chargement de MapLibre** : sur `#/map` seulement, au repos après le premier rendu
   (`requestIdleCallback`) ou au premier geste (molette, double clic, pincement, `+`, choix d'un État), le
   premier des deux ; au geste seulement si l'appareil économise les données. Variante à mesurer : au geste
   seulement, si le TBT l'exige.
6. **Chaînes** : livrer 5 des 20 chaînes d'Atlas (1, 2, 15, 18, 20) ; 5 sont remplacées par des chaînes
   déjà traduites du lot 1 ; 10 tombent avec les couches abandonnées (section « Chaînes »).
7. **Fiche d'État** : un lien « Interactive map » (chaîne existante) vers `#/map/<code>` dans la carte
   « Location ».

## Critique d'Atlas, point par point

`NOTES.md` décrit l'état d'avant les corrections (une chaîne nouvelle, palette, MapLibre au premier rendu) ;
le code de `claude/proto-tour-2` a avancé depuis (20 chaînes, instruments, silhouette cliquable). Chaque point
ci-dessous a été revérifié le 23 novembre sur le prototype servi en gzip, Chromium Playwright avec WebGL
logiciel (SwiftShader), mêmes cas que la critique.

| Point | État dans le prototype (mesuré) | Dans le portail |
|---|---|---|
| B1 saut vers un article (bureau) | **Corrigé** : écart de 6 px (marge voulue) dans les cinq cas de la critique : palette « art 110 », LK-20 → art. 60, accueil → art. 1 quater, liens à froid 110 et 124 | Sans objet : la Constitution reste sur sa page |
| B2 carte périmée dans la Constitution | **Corrigé** : en entrant dans la Constitution, la carte revient à la Confédération et passe en retrait (1440 et 375 px) | Sans objet |
| B3 compteurs de communes | **Corrigé par libellé** : un seul décompte (`stats.json`), l'écart dit « 45 · 44 mapped outlines » ; 15 États concernés, plus SA-92 (9 · 1) et BG-91 (17 · 1) | Repris (chaîne 20) |
| B4 deux échelles pendant le zoom | **Corrigé** : au niveau des communes, un État non révélé passe en gris neutre ; légende « Municipalities » et « States · pending » | Repris |
| B5 dispositifs de la Constitution | **Non corrigé** | Sans objet (lot 1) |
| I1 paysage mobile | **Corrigé** : feuillet latéral de 320 px à 812 × 375, légende repliée | Repris |
| I2 interactivité, MapLibre pour tous | **En partie** : rien avant 3 s, mais MapLibre chargé au repos à 6,07 s sans aucun geste ; silhouette cliquable tant que MapLibre n'a pas pris la main | Repris avec la règle du point 5 |
| I3 focus perdu après Entrée | **Corrigé** : le focus reste sur la carte ; contour visible sur le feuillet | Repris |
| I4 feuillet mobile, poignée de 30 px | **Corrigé** : poignée de 373 × 44 px ; le contenu déplace le feuillet tant qu'il n'est pas plein ; plein et en haut, tirer vers le bas le replie | Repris ; jamais essayé au doigt |
| I5 légende amputée sur mobile | **Corrigé** : la légende repliée s'ouvre et montre hachures et sources | Repris |
| I6 « ⌘K » partout | **Corrigé** : « Ctrl K » hors Mac, masqué sur écran tactile | Sans objet (recherche du portail) |
| I7 palette | **Corrigé** : texte des articles, début de mot (« lika » ne trouve plus Dubrovačka Republika), actions | Sans objet ; la recherche du portail cherche déjà le texte des articles et reçoit les communes |
| I8 liste sans tri ni filtre | **Corrigé** : tri par l'indicateur actif, quatre filtres par type | Repris |
| I9 débordement de la légende | **Corrigé** : 137 px de contenu dans 137 px (SRE cyrillique, ZAP) | Repris, à revérifier dans le gabarit |
| I10 zoom dans le vide | **En partie** : zoom plafonné à l'échelle d'une commune (cadrage d'ensemble + 5,4, soit 10,9 à 1440 px), chefs-lieux marqués ; pas de routes (réseau `Bk-N` non arrêté, `docs/canon/routes.md`) | Repris |
| I11 routes héritées | **Corrigé** (`#/state/LK-20` → `#state-LK-20`) | Sans objet (routes du portail) |
| I12 villes-États pauvres | **En partie** : « 17 · 1 mapped outlines », les 17 communes de Beograd nommées, étiquette en double supprimée ; Beograd reste un aplat d'un seul contour GADM | Repris, limite dite |
| I13 fluidité | **Non mesuré** : pas de processeur graphique ici | Essai sur téléphone (section dédiée) |
| Fil d'Ariane tronqué à 375 px | **Corrigé** (tient en 221 px) | Repris dans la barre de la carte |
| Infobulle restée après clic | **Corrigé** | Repris |
| Voisins d'intensité égale | **Corrigé** : masque à 62 % hors de l'État ouvert | Repris |
| Bascule de langue sèche | **Corrigé** dans le prototype (transition de vue, glyphe par glyphe) | Abandonné : libellés remplacés d'un coup (règle de mouvement) |
| Texte de 10,5 à 11,5 px | **Non corrigé** (11,5 px dans la légende) | 12 px au moins |
| Codes courts et marque en latin en cyrillique | Inchangé | Codes en latin, `translate="no"` (règle du portail) ; marque du portail |
| Titre coupé au cran « peek », Sources sur l'échelle | **Non revérifié** | À vérifier dans le gabarit |
| Pas de mode sombre | **Non corrigé** | À faire (point 2) |

`vendor/maplibre-gl-shared.mjs` vide : c'est le fichier du paquet npm 6.18.0 lui-même, pas un défaut de copie.

## Mesure avant

`main` f0c5031, build lié, servi en gzip comme Pages, Lighthouse 13.6 mobile simulé, médiane de trois passages
(`docs/lot2/mesures/0-avant/lighthouse.json`, outils de `docs/lot1/outils/`).

| Page | Perf. | FCP | LCP | TBT | CLS | Poids | Requêtes | Élément LCP |
|---|---|---|---|---|---|---|---|---|
| `#/map` | 48 | 1,3 s | **6,3 s** | 2 375 ms | 0 | 999 ko | 16 | `<p>` sous le titre de la carte |

Le texte de la page attend `geo.json`, `lights.json`, `stats.json` et d3, puis l'animation d'entrée du globe
occupe le processeur (TBT). Visé après le lot : LCP au niveau de `#/constitution` (3,3 s), poids d'environ
400 ko avant MapLibre ; le budget de 2,5 s n'est pas promis, le plancher tenant au gabarit (128 ko gzip).

## Architecture

- **Page.** `vMap()` devient un point d'accroche. Code de page chargé avec la route, comme le lecteur :
  `portail/js/carte.js` (feuillet, silhouette SVG, légende, indicateurs, liste, filtre par peuple, clavier,
  couches, routes) et `portail/css/carte.css`, classes préfixées `ca-`. Script classique (export en
  `file://`). Interface vers le portail : `MAPX.html`, `MAPX.mounted`, `MAPX.inplace` (sous-route de la carte :
  le feuillet change, la caméra vole, la page n'est pas redessinée, MapLibre n'est pas détruit),
  `MAPX.rerender` (langue, écriture, thème), `MAPX.leave`.
- **Moteur.** `portail/js/carte-gl.js` (repris de `proto/atlas/map.js`) importe
  `vendor/maplibre-gl/maplibre-gl.mjs` par `import()` dynamique (autorisé dans un script classique). Sans
  fond de carte, tuile ni glyphe : libellés HTML positionnés par `map.project`, polices du portail. Si WebGL
  manque ou que le contexte est perdu, la carte reste en mode SVG.
- **Premier rendu sans MapLibre.** Silhouette SVG des 54 entités pré-projetée en Mercator (12 ko gzip),
  cliquable, coloriée par l'indicateur ; feuillet complet. MapLibre prend la main au même cadrage.
- **Données générées** (`scripts/build_carte.py`, d'après `proto/atlas/build.py`), dans `portail/data/carte/` :
  `index.json` (par entité : emprise, point d'étiquette, commune chef-lieu, nombre de contours ; classes des
  choroplèthes ; silhouette ; empreinte des entrées), `m/<CODE>.json` (54 fichiers, communes d'un État, au plus
  75 ko gzip, 662 ko en tout), `communes.json` (index de recherche, 16 ko gzip). Le reste vient des données
  existantes : `etats`, `stats`, `peuples`, `geo` (pour MapLibre).
- **Chargement par page.** `DATA_ROUTE.map` : `stats`, `carte` (index), `js/carte.js`, `css/carte.css` ; plus
  `core` (sommaire du lecteur, pour les liens d'articles) sur les couches. Retirés : `geo`, `lights`, d3,
  drapeaux. `carte-gl.js`, MapLibre et `geo.json` au repos ou au geste ; les communes d'un État quand on
  l'ouvre ou qu'on zoome dessus. Préchargement du `<head>` sur `#/map…` : index, chiffres, code et feuille.
- **Feuillet.** À gauche sur grand écran (416 px), en bas à trois crans sur téléphone, latéral en paysage bas.
  - Confédération : titre, totaux (population, superficie, communes, PIB par habitant), indicateurs, liste
    des 54 entités triée et filtrable, population par peuple (filtre à une teinte).
  - État : type, nom, code, peuple, valeur de l'indicateur et rang, **« Open state page »** vers
    `#/state/<code>`, liste des communes. Ni drapeau, ni données clés, ni communautés autonomes : ils sont sur
    la fiche.
  - Commune : nom, noms officiels, population et rang, superficie, densité, part de l'État, liens vers
    l'État sur la carte et vers sa fiche.
- **Couches institutionnelles**, calculées par `REGLES` (aucun calcul dans `carte.js`), disponibles dès le
  mode SVG :
  - `#/map/art-103` : cercles proportionnels aux sièges (`REGLES.sieges`), chiffres sur la carte ; feuillet :
    délégués, circonscriptions, habitants par délégué, sièges par État, hypothèse du lot 1 (chaîne existante),
    lien « Art. 103 → » vers l'article.
  - `#/map/art-110` : sept interrupteurs (comme la marge du lecteur) ; sur la carte, les États d'un peuple qui
    approuve en aplat, les autres hachurés, les entités confédérales neutres ; cliquer un État bascule son
    peuple. Verdict par `REGLES.cleDouble` : cinq sur sept, majorité des inscrits, « Adopted » ou
    « Not adopted ». Hypothèses du lot 1 (registres, plénière). Lien « Art. 110 → ».
- **Recherche.** Groupe « Municipalities » après les États : `carte/communes.json` chargé à la première
  frappe (comme le texte des articles), formes v3, officielles et cyrilliques cherchées. Résultat :
  `#/map/<code>/<commune>` ; une commune sans contour propre mène à son contour hôte, qui la nomme.
- **Export** (fichier unique) : MapLibre ne peut pas y entrer (son worker exige http(s)). La carte y reste en
  mode SVG : Confédération, indicateurs, liste, filtre, couches 103 et 110, feuillet d'État sans liste de
  communes ; une adresse de commune y mène à son État.

## Fonctions du globe actuel

| Fonction | Sort | Raison |
|---|---|---|
| Globe orthographique, rotation d'entrée, halo, graticule, texture, échos radar des capitales | Abandonnés | MapLibre en Mercator ; l'ADR 2026-10-14-carte-globe est remplacé |
| **Lumières par commune** (canevas, bouton « Lights ») | **Abandonnées** | La choroplèthe communale montre la même chose avec les vrais contours, les noms et les chiffres ; `lights.json` reste produit par `build_stats.py` comme source des populations communales, il n'est plus publié |
| **Option « Peoples »** (sept couleurs) | **Abandonnée**, sous réserve du point 1 | Remplacée par le filtre à une teinte |
| Population par peuple (barres) | Reprise | Devient le filtre |
| Totaux (population, superficie, densité, communes, PIB) | Repris | Feuillet de la Confédération |
| Anneau du PIB, colonnes de distribution | Abandonnés | La liste triée avec barres les remplace |
| Carte de sélection (drapeau, chiffres, jauge UE, rang) | Remplacée | Feuillet d'État bref, lien vers la fiche |
| Hachures des territoires occupés, sources, infobulle | Repris | |
| Boutons −, Fit, + | Repris | Seuls moyens de zoomer sans molette ni pincement |

## Fichiers touchés

| Fichier | État | Contenu |
|---|---|---|
| `scripts/build_carte.py` | nouveau | générateur repris de `proto/atlas/build.py` : contours GADM par État (même correspondance que `build_stats.py`, contrôlée par le contenu), population par les lumières (somme = `stats.json`, 54/54, sinon échec), noms d'`opstine.json`, communes hôtes, couverture simplifiée, silhouette, index, empreinte des entrées |
| `portail/data/carte/` | généré | `index.json`, `m/<CODE>.json` (54), `communes.json` ; mention « généré, ne pas éditer » |
| `portail/vendor/maplibre-gl/` | nouveau | MapLibre GL JS 6.18.0 (BSD-3), `.mjs`, worker, `.css`, licence ; empreinte npm dans `vendor/README.md` |
| `portail/js/carte.js`, `portail/js/carte-gl.js`, `portail/css/carte.css` | nouveaux | page, moteur, styles |
| `portail/index.html` | modifié | `vMap` réduit ; ancien globe retiré (`SR*`, `initMap`, `srRing`, `srDist`, lumières, CSS `.sr-*`) ; `DATA_SRC`, `DATA_ROUTE`, `DATA_LATER` ; routeur : `#/map/…` et `MAPX.inplace` ; recherche : communes ; préchargement ; lien de la fiche d'État |
| `scripts/build_portail.py` | modifié | liste blanche : `carte/`, `vendor/maplibre-gl/` (build lié seulement) ; `lights.json` retiré |
| `portail/data/textes.json` | modifié | 5 chaînes ; chaînes de l'ancien globe retirées |
| `.github/workflows/pages.yml` | modifié | contrôle « données de la carte à jour » par l'empreinte des entrées (sans shapely) ; `paths` |
| `docs/lot1/outils/dom.js`, `mesure.js` | modifiés | routes de la carte, attente de la carte, WebGL |
| `docs/decisions/` | 1 ADR, 2 amendements | carte MapLibre ; mouvement ; code couleur des peuples (si point 1) |
| `CLAUDE.md` | modifié | « Cartes GADM », « Architecture du portail » (carte, données générées, lumières), « Ne pas faire » |
| `docs/lot2/` | nouveau | ce plan, `MESURES.md`, `mesures/` |

`proto/` n'est pas touché.

## Étapes de build

1. Inchangées : `raccord_contours.py` puis `gen_geo.py` (si les contours changent), `build_carte_marge.py`,
   `build_stats.py`.
2. **Nouvelle** : `python scripts/build_carte.py`, à relancer après `build_stats.py` ou `gen_geo.py`
   (shapely ≥ 2.1, pyproj, numpy). Échoue si un fichier GADM n'est pas à 97 % dans son État, si une lumière
   tombe dans deux contours, si une unité peuplée n'a pas de commune, si la somme d'un État diffère de
   `stats.json`, si un fichier de communes dépasse 250 ko gzip.
3. `python scripts/build_portail.py` : `carte/` et `vendor/maplibre-gl/` dans `_site/` ; l'export n'embarque
   que `carte/index.json`.
4. Pages : nouvelle étape qui recalcule l'empreinte des entrées (`etats`, `stats`, `opstine`, `lights`,
   `geo`, sources GADM, version du générateur) et échoue si elle diffère de celle d'`index.json`.
   Regénérer en CI exigerait shapely et une version de GEOS identique (sorties non garanties bit à bit).
5. Inchangés avant chaque déploiement : `equilibre.py --check`, `textes.py check`, `test_regles.js`,
   données de la Constitution.

## Repris tel quel, réécrit, abandonné

**Tel quel** (chemins et sorties adaptés) : de `build.py`, la correspondance fichier → État, les populations
par les lumières, les noms et communes hôtes, la couverture simplifiée, l'encodage en deltas, les classes en
quantiles, la silhouette ; de `map.js`, les couches, le chargement des communes, leur révélation, les seuils du
zoom sémantique, le placement des libellés, le choix au pointeur, les vols, le masque, le curseur, le fondu
des couleurs ; de `app.js`, la navigation aux flèches (cône de 60°), le feuillet à trois crans, la liste triée
et filtrée, l'annonce vocale ; de `critical.css`, le feuillet, la légende, les libellés (préfixés).

**Réécrit** : routage (routeur du portail, `#/map/…`, `MAPX.inplace`) ; en-tête, langues, écriture, thème (ceux du
portail, sans copie de `i18n.js`) ; chaînes par `L` et `T` ; `inst.js` (couches 103 et 110 seulement, calcul par
`REGLES`) ; feuillets de la Confédération et de l'État ; CSS (préfixe, thème sombre, 12 px minimum) ; sorties de
`build.py` (dans `portail/data/carte/`, sans copie).

**Abandonné** : en-tête, palette ⌘K, menu des langues et bascule glyphe par glyphe d'Atlas ; accueil (titre,
chiffres, entrées) ; Constitution située (`places.json`, lecture d'articles dans le feuillet, `jumpArt`) ;
couches 111, 115 bis, 130 quater, 122, 106 bis et péréquation ; copies (polices, drapeaux PNG, emblème,
`constitution*.json`, `ui.json`, `geo.json`) ; `strings.json`, `U()` ; `demo.mp4`, gabarit et CSS en ligne.

## Commits

1. Ce plan et la mesure avant (`docs/lot2/`).

Après validation :

2. Générateur et données de la carte, contrôle d'empreinte dans Pages, `CLAUDE.md` (« généré »).
3. MapLibre dans `vendor/`, `build_portail.py` (liste blanche, build lié seulement, `lights.json` retiré).
4. Page `#/map` en mode SVG : `carte.js`, `carte.css`, routes, feuillets, légende, liste, filtre par peuple,
   clavier, préchargement ; ancien globe retiré. Mesure intermédiaire.
5. Moteur MapLibre (`carte-gl.js`) : zoom sémantique, communes, vols, thème sombre.
6. Couches des art. 103 et 110 par `REGLES`, liens vers les articles.
7. Recherche des communes ; lien de la fiche d'État vers la carte.
8. Chaînes (5) et retrait des chaînes du globe.
9. ADR de la carte, amendement du mouvement (et du code couleur), `CLAUDE.md`, outils, mesures de fin de lot.

Mesures à trois moments : avant (fait), après le commit 4, fin du lot. PR à la fin, sans fusion sans accord.

## Mouvement (amendement de l'ADR 2026-11-23-mouvement-lecteur.md, section « Carte »)

1. Entrée et sortie de `#/map` : glissement vertical du portail, inchangé.
2. Dans la carte (Confédération, État, commune, couches) : pas de glissement. La caméra vole (courbe 1,3,
   de 0,9 à 2,4 s selon la distance, interrompue par tout geste) ; le feuillet change de contenu sans
   animation, sauf le nom de l'entité, qui passe de la liste au titre (élément partagé). Le routeur délègue à
   `MAPX.inplace` : une seule transition à la fois.
3. Arrivée depuis une autre page sur un État ou une commune (recherche, fiche d'État) : la carte part de la
   Confédération et fait un seul vol vers la cible dès que le moteur est prêt. Exception déclarée à « rien ne
   s'anime à l'arrivée » : une commune n'existe qu'avec le moteur.
4. Au zoom, les limites communales apparaissent de proche en proche depuis le point d'entrée (0,76 s, fondu
   de 0,3 s par commune).
5. Changement d'indicateur : fondu des couleurs de 0,48 s.
6. Langue et écriture : libellés de la carte remplacés d'un coup ; feuillet converti comme le reste du portail.
7. Mouvement réduit : cadrage direct avec une coupe de 0,2 s, communes d'un bloc, ni fondu ni élément partagé ;
   le fil d'Ariane devient un indicateur de niveau numéroté.

## Risques

- **Carte détruite au rendu.** Le portail redessine `#app` à chaque route : sans `MAPX.inplace`, chaque clic
  recréerait MapLibre. Même mécanisme que `CX.inplace`, éprouvé au lot 1.
- **Conversion cyrillique.** L'observateur de `#app` réécrirait des centaines de libellés repositionnés à chaque
  image : couche des libellés exclue (`cyrSkip`), texte converti à la création.
- **Mémoire sur téléphone.** Atlas ne décharge jamais les communes chargées : garder au plus douze États en
  mémoire, retirer les plus anciens.
- **TBT.** MapLibre (288 ko gzip) et son worker (143 ko) s'analysent après le premier rendu : TBT mesuré avec
  et sans chargement au repos ; au besoin, chargement au geste seulement.
- **Molette.** Page plein écran (point 4), sinon conflit entre défilement de la page et zoom.
- **Export.** Mode SVG seulement ; `dom.js` compare les routes avant l'arrivée de MapLibre et liste l'écart
  attendu (liste des communes absente de l'export).
- **Données dérivées.** Superficie et densité communales, classes, population par commune (somme des
  lumières) : calculées, absentes du portail jusqu'ici ; dites dans les sources de la légende.
- **Reproductibilité.** Les sorties de shapely varient avec GEOS : la CI contrôle l'empreinte des entrées,
  pas les octets.
- **Safari.** MapLibre 6 exige WebGL 2 (Safari 15 et suivants) ; non essayé ici.
- **Recherche.** Homonymes État / commune (Zagreb, Beograd, Lika) : États d'abord, puis communes.
- **Navigateurs, appareils, lecteur d'écran** : non disponibles ici, dit dans le rapport.

## Vérification

Chromium Playwright à 375, 768 et 1440 px, et 812 × 375 ; EN, ZAP, SRE latin et cyrillique, IST cyrillique et
latin ; thèmes clair et sombre ; zéro erreur console, zéro débordement, focus visible, clavier complet,
mouvement réduit. Lighthouse mobile sur `#/map` et `#/map/LK-20` avant / après. `dom.js` : fichier unique
contre build lié sur les routes de la carte. Export ouvert en `file://`. Liste de ce qui n'a pas été vu.

## Essai sur un vrai téléphone

Deux appareils si possible : un Android de milieu de gamme (Chrome) et un iPhone (Safari). Noter le modèle,
la version du navigateur et, pour chaque point, ce qui saccade ou tarde.

1. Ouvrir `#/map` en 4G : temps avant de voir la carte, puis avant que le pincement zoome vraiment.
2. Pincer de la Confédération jusqu'à Lika, puis Gospić : fluidité, libellés qui suivent, limites communales
   qui apparaissent.
3. Au niveau des communes, déplacer vite la carte d'un bout à l'autre : saccades, libellés en retard.
4. Toucher un État dans la liste puis sur la carte : vol fluide ou saccadé, durée acceptable ou trop longue.
5. Feuillet : le tirer entre ses trois crans, faire défiler une longue liste, le replier en tirant vers le bas
   depuis le haut.
6. Population → Densité → PIB au niveau des communes : fondu fluide ou à-coup.
7. Couches Art. 103 et Art. 110 : basculer des États au doigt, lire les jauges.
8. Rechercher « Gospić », « gospic », « Госпић » : la carte vole-t-elle jusqu'à la commune ?
9. Tourner en paysage : feuillet latéral, carte utilisable.
10. SRE en cyrillique, IST : libellés convertis, sans blocage.
11. Thème sombre.
12. Deux minutes de manipulation : chauffe, rechargement forcé de la page par Safari.
13. Réglage « Réduire les animations » : cadrage direct, sans vol.
14. Bouton Retour : remonte-t-il d'un niveau à chaque fois ?

## Chaînes

Les 20 chaînes de `proto/atlas/strings-new.json`. Istočni rédigé en bulgare cyrillique, converti par
`scripts/textes.py` (`bg2lat`), aller-retour vérifié (`to_cyr`) ; `check_one` sans erreur ni avertissement dans
les trois standards ; termes du glossaire des trois standards. Statut : **livrée** au lot 2, **remplacée** par
une chaîne déjà traduite, **abandonnée** avec sa couche. Doute signalé par ⚠.

1. **Adopted** — livrée (verdict de la couche 110).
   ZAP Sprejeto · SRE Usvojeno · IST Prieto (Прието).
2. **Arrow keys move between neighbouring entities, Enter opens one, Escape goes up one level, plus and minus
   zoom, 0 fits the Confederation.** — livrée (aide clavier ; remplace « Map of the Confederation. Drag to
   move… », retirée).
   - ZAP Puščice vas vodijo med sosedñimi enotami, Enter odpre izbrano, Escape vas vrne za raven višje, plus in
     minus povečata ali pomañšata, 0 prikaže vso Konfederacijo.
   - SRE Strelice vode do susědnih entiteta, Enter otvara izabrani, Escape vraća na viši nivo, plus i minus
     uvećavaju i umañuju prikaz, a 0 prikazuje cělu Konfederaciju.
   - IST Strelkite vodjat do sãsednite edinici, Enter otvarja izbranata, Escape vrãšta edno nivo nagore, pļus i
     minus uveličavat i namaļavat izgleda, a 0 pokazva cjalata Konfederacija.
   - ⚠ SRE *nivo* est serbe (croate *razina*), pas de neutre trouvé. ⚠ En cyrillique, *Enter* et *Escape*
     deviendraient « Ентер », « Есцапе » : proposer les noms de touches dans `<kbd translate="no">` (la clé
     anglaise change alors avec eux).
3. **Assumption: “no more than half” is counted on the States making the request; city-States are States and
   belong to no people.** — abandonnée (couches 122 et 106 bis).
   - ZAP Predpostavka: „največ polovica“ se šteje med državami, ki vložijo zahtevo; mestne države so države in
     ne pripadajo nobenemu narodu.
   - SRE Pretpostavka: „najviše pola“ računa se na državama koje podnose zahtěv; gradovi-države su države i ne
     pripadaju nijednom narodu.
   - IST Dopuskane: „ne poveče ot polovinata“ se broi sprjamo dãržavite, koito podavat iskaneto; gradovete
     dãržavi sa dãržavi i ne prinadležat na nito edin narod.
   - ⚠ *city-State* : le glossaire dit *konfederalno ozemļe / konfederalna teritorija*, pas « ville-État ».
4. **Assumptions: each national register is approximated by the population of the territorial States attached
   to its people (docs/canon/equilibre.md), since no count of the registers exists yet.** — remplacée par
   l'hypothèse du lot 1 « No annual count exists yet (Art. 115 bis)… » (même hypothèse, déjà traduite, et pas de
   chemin interne sur la page publique).
   - ZAP Predpostavke: vsak narodni register je približno oceñen s prebivalstvom teritorialnih držav, ki
     pripadajo ñegovemu narodu (docs/canon/equilibre.md), ker štetje registrov še ne obstaja.
   - SRE Pretpostavke: svaki narodni registar približno se procěñuje stanovništvom teritorijalnih država koje
     pripadaju ñegovom narodu (docs/canon/equilibre.md), jer prebrojavañe registara još ne postoji.
   - IST Dopuskanija: vseki nacionalen registãr e ocenen priblizitelno po naselenieto na teritorialnite
     dãržavi, koito prinadležat na negovija narod (docs/canon/equilibre.md), tãj kato vse ošte ñama
     prebrojavane na registrite.
5. **Assumptions: fiscal capacity and tax resources per inhabitant are taken as GDP per capita (PPS, 2023); the
   52 States only; every contributing State gives the same share of its surplus; if the cap binds, receipts are
   reduced pro rata.** — abandonnée (art. 132).
   - ZAP Predpostavke: fiskalna zmogļivost in davčni prihodki na prebivalca so enačeni z BDP na prebivalca (SKM,
     2023); upoštevanih je le 52 držav; vsaka država vplačnica prispeva enak delež svojega presežka; če zgorña
     meja omeji odvzem, se prejemki sorazmerno zmañšajo.
   - SRE Pretpostavke: fiskalni kapacitet i poreski prihodi po stanovniku izjednačuju se s BDP-om po stanovniku
     (SKM, 2023); samo 52 države; svaka država koja uplaćuje daje isti děo svog viška; ako gorña granica
     ograniči izdvajañe, primaña se srazmerno umañuju.
   - IST Dopuskanija: fiskalnijat kapacitet i danãčnite prihodi na žitel se priemat za ravni na BVP na žitel
     (SPS, 2023); samo 52-te dãržavi; vsjaka dãržava, kojato vnasja, otdeļa edin i sãšt djal ot previšenieto si;
     ako tavanãt ograniči udrãžkata, postãplenijata namaļavat proporcionalno.
   - ⚠ SRE *poreski* est serbe (croate *porezni*) ; *děo* (deo / dio) : yat discutable devant *o*.
6. **Cap** — abandonnée. ZAP Zgorña meja · SRE Gorña granica · IST Gorna granica.
7. **Contributing States** — abandonnée. ZAP Države vplačnice · SRE Države koje uplaćuju · IST Dãržavi, koito
   vnasjat. ⚠ SRE en périphrase pour éviter *davaoci / davatelji*.
8. **Each delegation is taken as voting as a bloc; the plenary majority of Article 110 is not simulated
   separately.** — remplacée par « The plenary majority depends on seventy individual votes and is not modelled
   here. » (lot 1).
   - ZAP Predpostavļeno je, da vsaka delegacija glasuje enotno; večina v plenarni sestavi iz 110. člena ni
     posebej simulirana.
   - SRE Uzima se da svaka delegacija glasa jedinstveno; većina na plenarnoj sědnici iz člana 110 ne simulira se
     posebno.
   - IST Priema se, če vsjaka delegacija glasuva kato edno cjalo; mnozinstvoto v plenarno zasedanie po člen 110
     ne se simulira otdelno.
9. **Enrolled citizens represented** — remplacée par « Registered citizens » (lot 1).
   ZAP Zastopani prijavļeni državļani · SRE Zastupļeni prijavļeni državļani · IST Predstaveni registrirani graždani.
10. **Floor** — abandonnée. ZAP Spodña meja · SRE Doña granica · IST Dolna granica.
11. **Floor not reached within the cap** — abandonnée. ZAP Spodña meja ni dosežena znotraj zgorñe · SRE Doña
    granica nije dostignuta u okviru gorñe · IST Dolnata granica ne e dostignata v ramkite na gornata.
12. **Floor reached** — abandonnée. ZAP Spodña meja je dosežena · SRE Doña granica je dostignuta · IST Dolnata
    granica e dostignata.
13. **In favour** — remplacée par l'affichage du lecteur (« 5 / 7 », « ≥ 5 »). ZAP Za · SRE Za · IST Za (forme
    commune).
14. **Largest share of one people** — abandonnée. ZAP Največji delež enega naroda · SRE Najveći děo jednog
    naroda · IST Naj-goļam djal na edin narod. ⚠ SRE *děo* (comme en 5).
15. **Not adopted** — livrée. ZAP Ni sprejeto · SRE Nije usvojeno · IST Ne e prieto (Не е прието).
16. **Receiving States** — abandonnée. ZAP Države prejemnice · SRE Države koje primaju · IST Dãržavi
    polučateli. ⚠ SRE en périphrase (*primaoci / primatelji*).
17. **Reset** — remplacée par le bouton ↺ du lecteur (« Back »). ZAP Ponastavi · SRE Ispočetka · IST Nulirane.
    ⚠ SRE : adverbe faute de neutre (*resetuj / resetiraj*).
18. **Select States on the map.** — livrée (couche 110 : toucher un État bascule son peuple). ZAP Izberite
    države na zemļevidu. · SRE Izaberite države na karti. · IST Izberete dãržavi na kartata.
19. **Share of surpluses levied** — abandonnée. ZAP Delež odvzetih presežkov · SRE Izdvojeni děo viškova · IST
    Udãržan djal ot previšenijata. ⚠ sens (part ou taux) et *děo*.
20. **mapped outlines** — livrée, clé reprise en gabarit **{0} mapped outlines** pour l'accord du nombre
    (« 45 · 44 mapped outlines »).
    - ZAP {0} {0#one:obris na zemļevidu;two:obrisa na zemļevidu;few:obrisi na zemļevidu;other:obrisov na zemļevidu}
    - SRE {0} {0#one:obris na karti;few:obrisa na karti;other:obrisa na karti}
    - IST {0} {0#one:kontur na kartata;other:kontura na kartata}
    - ⚠ SRE *obris* ou *kontura* (les deux neutres).

Aucune autre chaîne nouvelle : couches nommées par des chaînes existantes (« Kongres seats », « 7 delegations »,
« Art. {0} »), groupe de recherche « Municipalities », lien « Interactive map », filtres et légende déjà traduits.
