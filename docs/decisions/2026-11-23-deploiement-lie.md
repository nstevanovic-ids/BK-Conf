# ADR 2026-11-23 — Pages publie le build lié ; le fichier unique devient un export

## Statut
Accepté le 2026-11-17 par l'auteur : décision 1 de `proto/REPRISE.md` (branche
`claude/proto-tour-2`), « build lié déployé sur Pages, fichier unique gardé comme export : oui ».
Le 2026-11-23, l'auteur a accepté la recommandation 1 du plan du lot 1 (`docs/lot1/PLAN.md`) :
le build lié et le chargement par page entrent dans ce lot, en commits séparés et mesurés à part.
Ce commit fait la première moitié : le déploiement. Le chargement par page suit (commit 2).

Répond au constat P-1 de l'audit (`docs/audit/AUDIT.md`, branche `claude/audit-refonte-visuelle`),
premier affichage à 7,3 s sur toutes les pages.

## Contexte
- Pages publiait le fichier unique (`build_portail.py --inline`) : 2,8 Mo bruts, 1,34 Mo en gzip,
  données, polices et bibliothèques comprises. Rien ne s'affiche avant qu'il soit arrivé et exécuté.
  Un visiteur venu voir un drapeau télécharge les cinq Constitutions et les 54 drapeaux.
- MapLibre (lot 2, 1,1 Mo) ne peut pas entrer dans un fichier unique raisonnable.
- Le gabarit savait déjà charger `data/*.json` par `fetch()`, mais ce build lié n'était pas
  déployé, et `build_portail.py` sans option ne faisait que vérifier la présence des données.

## Décision
1. **Pages publie le build lié.** `python scripts/build_portail.py` assemble `_site/` :

   | Chemin | Contenu |
   |---|---|
   | `index.html` | le gabarit `portail/index.html`, copié tel quel |
   | `data/` | les 18 JSON de la liste blanche `DATA_FILES` |
   | `fonts/`, `vendor/` | polices OFL et licences, bibliothèques (d3-array, d3-geo, qrcode) |
   | `images/`, `videos/` | photos, blasons, images du pass Google Wallet, films d'États |
   | `favicon.ico`, `apple-touch-icon.png` | icônes |
   | `export/index.html` | le fichier unique (point 3) |

2. **Liste blanche des données.** Seuls les JSON que le gabarit charge sont publiés, jamais les
   GeoJSON sources de `portail/data/` (27 Mo). Le build échoue si la liste et les `fetch()` du
   gabarit divergent, dans un sens ou dans l'autre.
3. **Le fichier unique reste, comme export.** Il est publié à l'adresse `/export/`. Ses liens
   restés relatifs (photos, blasons, films, icône) y sont préfixés de `../` : servi par Pages, il
   affiche tout ; téléchargé, il s'ouvre en `file://` comme avant, sans photos ni films hors ligne,
   comme avant. `python scripts/build_portail.py --inline` écrit toujours
   `balkanska_konfederacija.html` à la racine du dépôt, pour un usage local.
4. **Adresses inchangées.** La racine du site reste le portail, toutes les routes `#/…` sont
   identiques, et `images/wallet-logo.png` et `images/wallet-hero.png` restent où le pass Google
   Wallet les attend (`registre/src/wallet.js`).
5. `_site/` et le fichier unique sont générés, jamais édités ; tous deux sont ignorés par git.

## Effet mesuré
Lighthouse 13.6, mobile simulé, servi en gzip comme Pages, médiane de trois passages
(`docs/lot1/MESURES.md`, sections 0 et 1 ; outils dans `docs/lot1/outils/`).

| Page | FCP (s) | LCP (s) | TBT (ms) | Perf. |
|---|---|---|---|---|
| `#/constitution` | 7,3 → 1,8 | 7,5 → 8,3 | 169 → 64 | 33 → 50 |
| `#/constitution/title-4/art-110` | 7,3 → 1,7 | 7,5 → 8,4 | 195 → 67 | 56 → 74 |
| `#/state/LK-20` | 7,3 → 1,8 | 7,5 → 8,4 | 281 → 47 | 29 → 50 |
| `#/map` | 7,4 → 1,8 | 7,4 → 1,8 | 3 390 → 2 459 | 6 → 45 |

Le premier affichage passe sous 2 s partout ; le contenu, lui, attend toujours les 18 JSON
(970 ko gzip), d'où un LCP en léger recul. 128 captures sur 141 sont identiques au fichier unique ;
les 13 autres montrent l'arrivée sur un article, désormais exacte.

## Limites
- **Cache.** Pages sert les fichiers avec `max-age=600` : pendant dix minutes après un déploiement,
  un navigateur peut associer un gabarit et des données de versions différentes. Le chargement par
  page (commit 2) ajoute aux adresses des données un paramètre de version calculé au build.
- **LCP.** Ce commit seul ne le fait pas baisser : le gabarit attend toutes les données avant tout
  rendu, dont 567 ko gzip de drapeaux. Le chargement par page (commit 2) ne charge que ce que la
  route demande.
- **Poids publié.** Le site publié gagne `data/` (2 Mo bruts), `vendor/` (74 ko) et l'export
  (2,8 Mo) ; les GeoJSON sources restent hors du site.

## Propagation
- `scripts/build_portail.py` : mode par défaut réécrit (assemblage de `_site/`, liste blanche,
  contrôle contre le gabarit, export) ; `build_inline()` accepte une destination et un préfixe.
- `.github/workflows/pages.yml` : une seule étape de build, `python scripts/build_portail.py`.
- `.gitignore` : `/_site/`.
- `CLAUDE.md`, « Architecture du portail » : ligne `build_portail.py`.
