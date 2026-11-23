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
