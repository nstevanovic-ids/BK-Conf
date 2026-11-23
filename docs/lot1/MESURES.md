# Mesures du lot 1

Trois moments, d'après le plan (`docs/lot1/PLAN.md`) : `main` (fichier unique), après le chargement
par page (commit 2), fin du lot. Le build lié seul (commit 1) est mesuré à part, la recommandation 1
du plan ayant été acceptée (commits séparés, mesurés à part).

## Méthode
- Outils dans `docs/lot1/outils/` : `serve.py` (serveur statique, gzip et `max-age=600` comme
  GitHub Pages), `mesure.js` (Lighthouse et captures), `compare.py` (écart de pixels entre deux jeux de
  captures), `tableau.py` (tableau ci-dessous).
- Lighthouse 13.6, mobile simulé par défaut (Moto G Power, 4G lente), Chromium de Playwright sans
  tête, sans processeur graphique ; médiane de trois passages par page, valeurs de chaque passage dans
  `lighthouse.json`. Même outil et mêmes pages que l'audit (`docs/audit/lighthouse-avant.json`, branche
  `claude/audit-refonte-visuelle`), plus un article (`#/constitution/title-4/art-110`).
- Captures : 27 routes à 375, 768 et 1440 px, puis six pages en zapadni, središñi latin et
  cyrillique, istočni cyrillique et latin, à 375 et 1440 px ; mouvement réduit. Pour chacune, dans
  `pages.json` : erreurs console, débordement horizontal, h1, longueur du texte de `#app`, JSON chargés.
- Une machine de conteneur n'est pas un téléphone : les valeurs absolues comptent moins que l'écart
  entre deux builds mesurés de la même façon, le même jour.

## 0. `main` 7d96e3c, fichier unique (`0-main-inline/`)

| Page | Perf. | Access. | FCP (s) | LCP (s) | TBT (ms) | CLS | SI (s) | Poids (ko) | Requêtes |
|---|---|---|---|---|---|---|---|---|---|
| `#/home` | 11 | 92 | 7,2 | 50,1 | 1 091 | 0,843 | 7,2 | 14 656 | 57 |
| `#/states` | 28 | 93 | 7,3 | 10,4 | 288 | 0,845 | 7,3 | 2 199 | 64 |
| `#/state/LK-20` | 29 | 94 | 7,3 | 7,5 | 281 | 0,939 | 7,3 | 1 351 | 6 |
| `#/state/BA-01` | 26 | 94 | 7,3 | 7,4 | 390 | 0,843 | 7,3 | 3 323 | 8 |
| `#/constitution` | 33 | 92 | 7,3 | 7,5 | 169 | 0,857 | 7,3 | 1 310 | 4 |
| `#/constitution/title-4/art-110` | 56 | 88 | 7,3 | 7,5 | 195 | 0,014 | 7,3 | 1 310 | 4 |
| `#/map` | 6 | 91 | 7,4 | 7,4 | 3 390 | 0,857 | 7,4 | 1 310 | 4 |

- Conforme à l'audit du 15 novembre (même commit) : premier affichage à 7,3 s partout, LCP de 7,4 à
  7,5 s hors accueil et grille. L'écart sur `#/states` (10,4 s contre 7,5 s) et `#/home` vient des
  photos et affiches chargées après le fichier.
- Élément LCP de `#/constitution` : le paragraphe d'introduction (`<p class="lead">`, relevé par un
  passage isolé ; `mesure.js` ne savait pas encore lire l'élément dans Lighthouse 13, corrigé depuis).
- Captures : 141, aucune page vide ni débordement. Seules erreurs : la 404 du blason absent sur
  `#/state/BA-01`, `DA-08` et `BK-95`, à toutes les largeurs (constat C-1 de l'audit, hors lot).

## 1. Build lié, gabarit inchangé (`1-build-lie/`, commit 1)

| Page | Build | Perf. | FCP (s) | LCP (s) | TBT (ms) | CLS | SI (s) | Poids (ko) | Requêtes |
|---|---|---|---|---|---|---|---|---|---|
| `#/home` | fichier unique | 11 | 7,2 | 50,1 | 1 091 | 0,843 | 7,2 | 14 656 | 57 |
| `#/home` | lié | 40 | 1,8 | 47,0 | 410 | 0,857 | 1,8 | 14 654 | 79 |
| `#/states` | fichier unique | 28 | 7,3 | 10,4 | 288 | 0,845 | 7,3 | 2 199 | 64 |
| `#/states` | lié | 50 | 1,8 | 11,0 | 57 | 0,857 | 1,8 | 2 197 | 86 |
| `#/state/LK-20` | fichier unique | 29 | 7,3 | 7,5 | 281 | 0,939 | 7,3 | 1 351 | 6 |
| `#/state/LK-20` | lié | 50 | 1,8 | 8,4 | 47 | 0,947 | 1,8 | 1 348 | 28 |
| `#/state/BA-01` | fichier unique | 26 | 7,3 | 7,4 | 390 | 0,843 | 7,3 | 3 323 | 8 |
| `#/state/BA-01` | lié | 50 | 1,8 | 9,0 | 39 | 0,857 | 1,8 | 3 320 | 30 |
| `#/constitution` | fichier unique | 33 | 7,3 | 7,5 | 169 | 0,857 | 7,3 | 1 310 | 4 |
| `#/constitution` | lié | 50 | 1,8 | 8,3 | 64 | 0,857 | 1,8 | 1 307 | 26 |
| `#/constitution/title-4/art-110` | fichier unique | 56 | 7,3 | 7,5 | 195 | 0,014 | 7,3 | 1 310 | 4 |
| `#/constitution/title-4/art-110` | lié | 74 | 1,7 | 8,4 | 67 | 0,014 | 1,7 | 1 307 | 26 |
| `#/map` | fichier unique | 6 | 7,4 | 7,4 | 3 390 | 0,857 | 7,4 | 1 310 | 4 |
| `#/map` | lié | 45 | 1,8 | 1,8 | 2 459 | 0,857 | 3,2 | 1 307 | 26 |

- **Premier affichage : 7,3 s → 1,8 s** sur toutes les pages. L'en-tête, la navigation et le pied de
  page s'affichent dès que le gabarit (131 ko gzip) est arrivé, au lieu d'attendre le fichier entier.
- **TBT divisé par 3 à 7** (sauf la carte, 3,4 → 2,5 s) : le navigateur n'analyse plus 2,8 Mo de
  JavaScript d'un bloc.
- **LCP en léger recul, 7,5 → 8,3 à 9,0 s** : le contenu de la page attend toujours les 18 JSON
  (970 ko gzip), téléchargés en parallèle, puis le rendu. Le poids transféré est le même. Le build lié
  seul ne règle donc pas le LCP ; c'est l'objet du chargement par page (commit 2). Sur `#/map`, le
  LCP de 1,8 s est le pied de page (`<p data-i18n="f_tag">`), la carte n'étant pas un élément LCP.
- **CLS inchangé** (0,84 à 0,95 hors article) : le contenu arrive sous le pied de page déjà affiché.
  Hors lot ; à reprendre avec le chargement par page, qui peut réserver la place.
- Éléments LCP : photo d'ouverture (`#/home`), drapeau de la première carte (`#/states`), blason
  (`LK-20`), film (`BA-01`), paragraphe d'introduction (`#/constitution`), premier alinéa
  (`art-110`).
- **Captures** (`compare.py`) : 128 sur 141 identiques au fichier unique à 0,5 % de pixels près, non
  versées ; les 13 qui diffèrent sont dans `1-build-lie/captures/`. Toutes sont des
  `#/constitution/title-4/art-110` : le build lié arrive exactement sur l'article 110, quand le fichier
  unique le dépassait à 375 px et s'arrêtait avant lui à 768 et 1440 px (cause probable : position
  calculée pendant que la page se met encore en place ; non approfondi, ce lecteur est remplacé au
  commit 5). Mêmes contrôles qu'avant : aucune page vide ni débordement, seules erreurs les 404 de
  blasons absents.
- Export : `_site/export/index.html` ouvert en `file://` (`#/state/LK-20`, article 110) et servi
  sous `/export/` : rendu complet, sans erreur ; il ne diffère du fichier unique que par le préfixe
  `../` de ses liens d'images et de films.
