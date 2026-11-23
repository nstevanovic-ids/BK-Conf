# ADR 2026-11-23 — Carte de la Confédération (#/map) : MapLibre, reprise du prototype Atlas

## Statut
Accepté. Décision 2 de `proto/REPRISE.md` (branche `claude/proto-tour-2`), « globe d3 remplacé par
MapLibre : oui » (17 novembre 2026) ; plan du lot 2 (`docs/lot2/PLAN.md`) validé par l'auteur le
23 novembre 2026, avec ses sept recommandations.

**Remplace** l'ADR 2026-10-14-carte-globe.md (globe orthographique d3, salle de situation sombre,
lumières par commune). **Amende** l'ADR 2026-10-14-pas-de-code-couleur-peuples.md : l'exception de
l'option « Peoples » est fermée (décision 11). Le mouvement de la carte est réglé par l'amendement de
l'ADR 2026-11-23-mouvement-lecteur.md (section « Carte »).

## Contexte
- Le globe d3 attendait `geo.json`, `lights.json`, `stats.json` et d3 avant d'afficher son texte, puis
  son animation d'entrée occupait le processeur : LCP 6,3 s, TBT 2 375 ms, performance 48, 999 ko
  (Lighthouse mobile simulé, `docs/lot2/mesures/0-avant/`).
- Il ne descendait pas sous l'État : les 1 384 contours communaux du dépôt n'étaient pas montrés.
- Le prototype Atlas (`proto/atlas/`) montre un zoom continu Confédération → État → commune avec
  MapLibre GL JS ; sa critique (`proto/critique-atlas.md`) a été reprise point par point dans le plan.

## Décision
1. **Moteur.** MapLibre GL JS 6.18.0 (BSD-3), copié tel quel dans `portail/vendor/maplibre-gl/`
   (intégrité npm dans `vendor/README.md`), sans fond de carte, tuile, glyphe ni requête externe : seules
   les géométries du dépôt. Libellés HTML positionnés par `map.project`, dans les polices du portail.
   d3 reste, pour les mini-cartes des fiches d'États.
2. **Code de page**, chargé avec la route comme le lecteur : `portail/js/carte.js` (`MAPX` : feuillets,
   silhouette, légende, liste, clavier, couches, routes), `portail/js/carte-gl.js` (`CAGL` : moteur
   MapLibre, repris de `proto/atlas/map.js`), `portail/css/carte.css` (classes `ca-`, rien de global).
   Scripts classiques ; MapLibre, module ES, est importé par `import()`.
3. **Premier rendu sans MapLibre.** Silhouette SVG des 54 entités, pré-projetée en Mercator
   (`carte/index.json`, 14 ko gzip avec l'index), cliquable et coloriée par l'indicateur, et le feuillet.
   MapLibre prend la main au même cadrage (la boîte de la silhouette donne ses marges).
4. **Chargement de MapLibre** : sur `#/map` seulement, jamais au démarrage du portail ; au repos après le
   premier rendu (`requestIdleCallback`) ou au premier geste (molette, double clic, pincement, zoom, État
   ouvert), le premier des deux ; au geste seulement si l'appareil économise les données ; repli sur la
   silhouette sans WebGL 2. Communes chargées par État quand on l'ouvre ou qu'on zoome dessus, au plus
   douze États en mémoire.
5. **Données générées, jamais éditées** : `portail/data/carte/` par `scripts/build_carte.py` (repris de
   `proto/atlas/build.py`, shapely) : `index.json` (emprises, points d'étiquette, chefs-lieux, nombre de
   contours, classes des choroplèthes, silhouette, empreinte des entrées), `m/<CODE>.json` (54 fichiers,
   688 ko gzip, au plus 75 ko), `communes.json` (index de recherche, 1 461 communes). Population
   communale = somme des lumières de `lights.json`, égale à `stats.json` pour les 54 entités (sinon le
   générateur échoue). Pages refuse de déployer si les entrées ont changé sans régénération
   (`build_carte.py --check`, sans shapely).
6. **Routes** : `#/map` (Confédération), `#/map/<code>` (État), `#/map/<code>/<commune>`,
   `#/map/art-103` et `#/map/art-110` (couches). Une adresse inconnue est réécrite en `#/map`. Une
   sous-route ne redessine pas la page (`MAPX.inplace`) : la carte reste en place.
7. **La carte ne duplique pas la fiche d'État.** Le feuillet d'un État donne son type, son code, son peuple,
   la valeur de l'indicateur et son rang, le nombre de communes (et de contours, quand il diffère) et la
   liste de ses communes ; « Open state page » mène à `#/state/<code>` (drapeau, blason, données clés,
   communautés autonomes). La fiche d'État mène à la carte (« Interactive map »).
8. **Couches institutionnelles** seulement, calculées par le moteur unique `portail/js/regles.js` avec les
   hypothèses du lecteur, chacune avec un lien vers son article : sièges du Kongres (art. 103) et double
   clé (art. 110). Aucune couche de péréquation tant que l'art. 132 n'est pas révisé. La Constitution reste
   sur sa page.
9. **Recherche** : une seule, celle du portail ; les communes y entrent (chargées à la première frappe) et
   mènent à leur page de carte.
10. **Page plein écran** sous l'en-tête, sans pied de page (la molette zoome la carte). La carte suit le
    thème du portail (clair et sombre, jetons de `.ca`), au lieu d'un écran toujours sombre.
11. **Peuples** : la palette à sept couleurs de l'option « Peoples » est supprimée. La population par peuple
    reste, comme filtre à une seule teinte : un peuple à la fois, ses États dans la couleur de l'indicateur,
    les autres estompés. Aucune couleur n'est attribuée à un peuple, sans exception.
12. **Abandonnés** : le globe et son animation d'entrée, les lumières par commune (`lights.json` reste
    produit par `build_stats.py`, source des populations communales, et n'est plus publié), l'anneau du
    PIB, les colonnes de distribution, les échos radar des capitales.
13. **Fichier unique** : MapLibre n'y entre pas (son worker exige http(s)) ; la carte y reste en SVG
    (Confédération, indicateurs, liste, filtre, couches), sans communes : une adresse de commune y mène à
    son État.
14. **Chefs-lieux non marqués** : KJ-15 (Sloveñ Gradec), KM-16 (Priština) et VS-45 (Skopje) n'ont pas de
    commune homonyme dans leur État dans les données ; le canon n'est pas modifié.

## Mesures
Lighthouse 13.6, mobile simulé, servi en gzip comme Pages, médiane de trois passages
(`docs/lot2/MESURES.md`).

| Page | LCP | TBT | Perf. | Poids |
|---|---|---|---|---|
| `#/map`, avant (globe d3) | 6,3 s | 2 375 ms | 48 | 999 ko |
| `#/map`, silhouette seule (commit 4) | **3,2 s** | 57 ms | 93 | 358 ko |
| `#/map`, MapLibre au repos (fin) | 3,3 s | 1 305 ms (WebGL logiciel) | 69 | 1 541 ko |

## Limites
- Le TBT avec MapLibre est mesuré ici en WebGL logiciel (SwiftShader) sous un processeur ralenti quatre fois :
  ces valeurs ne disent rien d'un téléphone réel. La fluidité est à mesurer sur appareil (plan, « Essai sur
  un vrai téléphone ») ; si le chargement au repos pèse trop, il passe au premier geste seulement.
- Non vus : Safari (WebGL 2 exigé), Firefox, un vrai téléphone, un lecteur d'écran.
- Beograd reste un aplat d'un seul contour GADM (17 communes nommées) ; Sarajevo aussi (9 · 1).
- Superficie, densité et classes communales sont des chiffres dérivés (contours GADM, lumières), dits dans les
  sources de la légende.

## Propagation
- `portail/index.html` : globe retiré (`vMap` réduit à un point d'accroche, `SR*`, `initMap`, lumières, CSS
  `.sr-*`) ; mini-carte des fiches gardée ; `DATA_SRC` (`carte`, `communes`), `DATA_ROUTE.map`, préchargement ;
  routeur (`MAPX.inplace`, `leave`, `mounted`, `rerender`, `theme`) ; recherche ; lien de la fiche d'État ;
  `kbd` hors de la conversion cyrillique.
- `scripts/build_carte.py` (nouveau), `scripts/build_portail.py` (dossier `carte/`, MapLibre en build lié
  seulement, `lights.json` retiré), `.github/workflows/pages.yml` (contrôle d'empreinte).
- `portail/data/textes.json` : 5 chaînes, 24 chaînes du globe retirées.
- `docs/lot1/outils/` : `dom.js` et `mesure.js` connaissent la carte.
- `CLAUDE.md`.
