# Mesures du lot 1

Trois moments, d'après le plan (`docs/lot1/PLAN.md`) : `main` (fichier unique), après le chargement
par page (commit 2), fin du lot. Le build lié seul (commit 1) est mesuré à part, la recommandation 1
du plan ayant été acceptée (commits séparés, mesurés à part).

## Méthode
- Outils dans `docs/lot1/outils/` : `serve.py` (serveur statique, gzip et `max-age=600` comme
  GitHub Pages), `mesure.js` (Lighthouse et captures), `compare.py` (écart de pixels entre deux jeux de
  captures), `tableau.py` (tableau ci-dessous), `usage.js` (données lues par chaque route),
  `dom.js` (DOM identique entre fichier unique et build lié).
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

## 2. Chargement par page (`2-par-page/`, commit 2)

| Page | Perf. | FCP (s) | LCP (s) | TBT (ms) | Poids (ko) | Requêtes | LCP : fichier unique → lié → par page |
|---|---|---|---|---|---|---|---|
| `#/home` | 42 | 1,7 | 47,9 | 357 | 13 708 | 66 | 50,1 → 47,0 → 47,9 |
| `#/states` | 52 | 1,8 | 6,8 | 29 | 1 808 | 76 | 10,4 → 11,0 → 6,8 |
| `#/state/LK-20` | 52 | 1,8 | 6,7 | 41 | 1 040 | 20 | 7,5 → 8,4 → 6,7 |
| `#/state/BA-01` | 51 | 1,8 | 7,1 | 42 | 3 012 | 22 | 7,4 → 9,0 → 7,1 |
| `#/constitution` | 67 | 1,8 | **3,3** | 40 | **405** | 14 | 7,5 → 8,3 → **3,3** |
| `#/constitution/title-4/art-110` | 91 | 1,8 | **3,3** | 51 | **405** | 14 | 7,5 → 8,4 → **3,3** |
| `#/map` | 45 | 1,8 | 1,8 | 2 495 | 1 005 | 17 | 7,4 → 1,8 → 1,8 |

- **`#/constitution` : LCP 7,5 → 3,3 s, poids 1 310 → 405 ko** (le plan estimait 0,4 Mo en anglais).
  La page n'attend plus que le gabarit, le socle (8 ko gzip) et `constitution.json` (43 ko). Les
  polices (199 ko) font maintenant la moitié du poids. Le budget de 2,5 s n'est pas encore tenu :
  préchargement des polices et du titre demandé à étudier en fin de lot (risque « LCP » du plan).
- Fiches d'États : LCP 7,5 → 6,7 s ; restent les drapeaux (567 ko gzip pour les 54, chargés en un
  fichier), puis le blason ou le film, élément LCP. Accueil : inchangé, ses photos dominent (constat
  P-2 de l'audit, hors lot).
- JSON chargés (`pages.json`, champ `json`) : `#/constitution` en anglais, le socle et
  `constitution.json` ; en istočni, plus `textes.json` et `constitution.ist.json` ; `#/home`, le
  socle seul ; une fiche d'État, le socle plus drapeaux, notes de drapeaux, contours, chiffres,
  films ; `#/register`, le socle puis, après le rendu, communes et drapeaux.
- **Non-régression** (`docs/lot1/outils/dom.js`) : DOM de `#app`, en-tête et `lang` identiques entre
  le fichier unique (toutes données) et le build lié chargé par page, sur 31 routes × 5 langues et
  écritures (EN, ZAP, SRE latin et cyrillique, IST cyrillique), recherche comprise (deux requêtes par
  route), plus la bascule EN → langue sur l'article 110 : **159 comparaisons, 0 divergence**. Contrôle
  du contrôle : en retirant les notes de drapeaux de la route `#/state/…`, `dom.js` signale les 5
  langues de `#/state/LK-20`.
- Gestes : sur `#/map`, la sélection de LK-20 affiche son drapeau (chargé après le rendu) ; sur
  `#/register`, les 1 461 communes sont chargées avant toute saisie.
- Captures : identiques au build lié (13 sur 13) et, hors arrivée sur l'article 110, au fichier unique
  (128 sur 141) ; non versées. Aucune page vide ni débordement ; seules erreurs, les 404 de blasons
  absents.

## 3. Fin du lot (`3-fin-de-lot/`)

Build lié chargé par page, lecteur, instruments, recherche unifiée, lien d'évitement, préchargement.

| Page | Perf. | Access. | FCP (s) | LCP (s) | TBT (ms) | CLS | Poids (ko) | LCP : main → par page → fin |
|---|---|---|---|---|---|---|---|---|
| `#/constitution` | **91** | 94 | 1,2 | **3,3** | 136 | **0,001** | **394** | 7,5 → 3,3 → 3,3 |
| `#/constitution/title-4/art-110` | **92** | 95 | 1,2 | **3,3** | 16 | 0,011 | 433 | 7,5 → 3,3 → 3,3 |
| `#/state/LK-20` | 74 | 95 | 1,3 | 6,5 | 107 | 0,09 | 1 033 | 7,5 → 6,7 → 6,5 |
| `#/state/BA-01` | 75 | 95 | 1,3 | 6,9 | 120 | 0 | 3 005 | 7,4 → 7,1 → 6,9 |
| `#/states` | 76 | 94 | 1,3 | 7,0 | 59 | 0 | 1 782 | 10,4 → 6,8 → 7,0 |
| `#/map` | 47 | 91 | 1,3 | 6,3 | 2 877 | 0 | 999 | 7,4 → 1,8 → 6,3 |
| `#/home` | 60 | 93 | 1,3 | 47,6 | 572 | 0 | 13 682 | 50,1 → 47,9 → 47,6 |

- **`#/constitution` et un article : LCP 7,5 → 3,3 s, poids 1 310 → 394 ko, CLS 0,86 → 0,001,
  performance 33 → 91, accessibilité 88 → 95.** Le budget de 2,5 s n'est pas tenu. Le rendu du lecteur
  ne pèse qu'environ 140 ms ; le reste est le gabarit du portail (128 ko gzip, le code de toutes les
  pages) à transférer et exécuter, plus les polices (194 ko). Essais : préchargement des polices et des
  données (3,6 → 3,6 s), bibliothèques `vendor/` sorties du chargement bloquant (3,6 → 3,3 s, FCP
  1,8 → 1,2 s), sans préchargement des polices (3,3 s, inchangé). Prochaine marche : sortir du gabarit
  le code des autres pages, comme le lecteur (hors de ce lot).
- **Premier affichage 7,3 → 1,2 à 1,3 s, CLS 0,84 à 0,95 → 0 à 0,09 sur toutes les pages** :
  `#app` vide réserve la hauteur de l'écran, le pied de page ne saute plus.
- `#/map` : le LCP de 1,8 s du point 2 était le pied de page, affiché avant la carte ; il n'est plus en
  haut de l'écran, l'élément mesuré est maintenant le texte de la carte (6,3 s, contre 7,4 s sur `main`).
  La carte change au lot 2.
- Accueil et fiches d'États : leurs images (photos d'ouverture, blason en `loading="lazy"`, film)
  restent l'élément LCP ; hors lot (constat P-2 de l'audit).
- **Captures** : 163 (27 routes à trois largeurs, 7 pages dans cinq langues et écritures, le lecteur en
  thème sombre), aucune page vide, aucun débordement, seules erreurs les 404 de blasons absents
  (constat C-1). **Hors de la Constitution, toutes les captures sont identiques à `main` à 0,5 % de
  pixels près** ; seules celles de la Constitution sont versées (`3-fin-de-lot/captures/`, 51 : 29
  comparables à `0-main-inline`, plus la vue à plusieurs textes, l'introuvable et le thème sombre).

### Vérification (section « Vérification » du plan)

| Contrôle | Résultat |
|---|---|
| Chrome (Playwright) 375, 768, 1440 px | 163 captures regardées, sans débordement |
| EN, ZAP, SRE latin et cyrillique, IST cyrillique et latin | captures et DOM ; bascule de langue et d'écriture sur l'article 110, l'alinéa lu reste à 1 px près |
| Erreurs console | aucune, hors 404 des blasons absents (déjà sur `main`) |
| Drapeaux | proportion d'origine (aperçu : largeur fixe, hauteur automatique ; le lecteur n'en affiche pas d'autre) |
| Focus visible, clavier | 24 arrêts dans le lecteur, tous avec un focus visible ; interrupteurs, curseurs, onglets, j / k au clavier ; lien d'évitement en premier |
| Mouvement réduit | captures en mouvement réduit ; bascule par fondu de 200 ms ; pas de transition de page |
| Non-régression | DOM de `#app`, en-tête et `lang` identiques entre fichier unique et build lié : 31 routes × 5 langues, recherche et bascule de langue, 159 comparaisons, 0 divergence (après chaque commit de code) |
| Moteur | `node scripts/test_regles.js` : 222 vérifications ; 5 000 votes identiques à Sabor |
| Export | `_site/export/` et `balkanska_konfederacija.html` ouverts en `file://` et sous `/export/` : lecteur, carte, fiches sans erreur |
| Lighthouse mobile | ci-dessus |

### Pas vu fonctionner
- Safari et Firefox (Playwright WebKit et Firefox non installés dans le conteneur) ; un vrai téléphone ;
  le balayage tactile réel entre textes (simulé seulement) ; la fluidité à 60 images/s de la bascule
  (machine sans processeur graphique).
- Un déploiement réel sur GitHub Pages (le workflow n'a tourné qu'en local, étape par étape).
- La carte citoyenne enregistrée (code QR chargé avec la page) : chemin de données vérifié, carte non
  dessinée dans un test.

## 4. Un texte à la fois (`4-texte-unique/`, retour de l'auteur du 2026-11-23)

Lecture comparée retirée ; un texte écrit dans une autre écriture que celle attendue était le défaut
signalé (« SRE d'abord en cyrillique, IST d'abord en latin »). Constat dans un navigateur vierge : SRE
s'ouvrait bien en latin et IST en cyrillique ; l'inversion venait de la double ligne (le latin au-dessus
pour l'istočni) et des colonnes de la lecture comparée, qui reprenaient la dernière écriture mémorisée
d'un standard sans que la bascule de l'en-tête soit visible.
- Un texte d'un autre standard que l'interface s'ouvre dans son écriture première (SRE latin, IST
  cyrillique) ; le texte de l'interface suit la bascule Lat / Ћир de l'en-tête.
- Double ligne : écriture première au-dessus (« Lat/Ћир » pour le središñi, « Кир/Lat » pour l'istočni).
- 51 captures des pages de la Constitution (trois largeurs, cinq langues et écritures, texte français,
  introuvable, thème sombre) : aucune erreur, aucun débordement. Les captures à plusieurs textes du
  point 3 sont retirées.
- Non-régression : 159 comparaisons, 0 divergence.
