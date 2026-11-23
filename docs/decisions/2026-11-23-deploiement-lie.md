# ADR 2026-11-23 — Pages publie le build lié, chargé par page ; le fichier unique devient un export

## Statut
Accepté le 2026-11-17 par l'auteur : décision 1 de `proto/REPRISE.md` (branche
`claude/proto-tour-2`), « build lié déployé sur Pages, fichier unique gardé comme export : oui ».
Le 2026-11-23, l'auteur a accepté la recommandation 1 du plan du lot 1 (`docs/lot1/PLAN.md`) :
le build lié et le chargement par page entrent dans ce lot, en commits séparés et mesurés à part.
Commit 1 : le déploiement (décisions 1 à 5). Commit 2 : le chargement par page (décisions 6 à 9).

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
   | `index.html` | le gabarit `portail/index.html`, avec la version des données (décision 8) |
   | `data/` | les 18 JSON de la liste blanche `DATA_FILES` |
   | `fonts/`, `vendor/` | polices OFL et licences, bibliothèques (d3-array, d3-geo, qrcode) |
   | `images/`, `videos/` | photos, blasons, images du pass Google Wallet, films d'États |
   | `favicon.ico`, `apple-touch-icon.png` | icônes |
   | `export/index.html` | le fichier unique (point 3) |

2. **Liste blanche des données.** Seuls les JSON que le gabarit charge sont publiés, jamais les
   GeoJSON sources de `portail/data/` (27 Mo). Le build échoue si la liste et la table `DATA_SRC`
   du gabarit (décision 6) divergent, dans un sens ou dans l'autre.
3. **Le fichier unique reste, comme export.** Il est publié à l'adresse `/export/`. Ses liens
   restés relatifs (photos, blasons, films, icône) y sont préfixés de `../` : servi par Pages, il
   affiche tout ; téléchargé, il s'ouvre en `file://` comme avant, sans photos ni films hors ligne,
   comme avant. `python scripts/build_portail.py --inline` écrit toujours
   `balkanska_konfederacija.html` à la racine du dépôt, pour un usage local.
4. **Adresses inchangées.** La racine du site reste le portail, toutes les routes `#/…` sont
   identiques, et `images/wallet-logo.png` et `images/wallet-hero.png` restent où le pass Google
   Wallet les attend (`registre/src/wallet.js`).
5. `_site/` et le fichier unique sont générés, jamais édités ; tous deux sont ignorés par git.
6. **Chargement par page.** Le gabarit n'attend plus toutes les données avant tout rendu. Table
   `DATA_SRC` : clé → fichier de `data/` et variable qu'il remplit.
   - **Socle**, attendu avant le premier rendu : `peuples`, `etats`, `entites-autonomes`, `i18n`,
     `registre` (8 ko gzip), plus `textes.json` hors anglais (111 ko).
   - **Données de la route** (`DATA_ROUTE`), attendues avant son rendu :

     | Route | Données |
     |---|---|
     | `#/states` | drapeaux, chiffres, films |
     | `#/state/<code>` | drapeaux, notes de drapeaux, contours, chiffres, films |
     | `#/map` | contours, lumières, chiffres |
     | `#/institutions`, `#/council` | Constitution anglaise, chiffres |
     | `#/security`, `#/identity` | Constitution anglaise |
     | `#/constitution…` | Constitution anglaise, plus le texte officiel de la langue hors anglais |
     | `#/alphabet` | alphabet |
     | `#/symbols`, `#/autonomy` | drapeaux |
     | `#/citizen`, `#/minor` | drapeaux si une carte est enregistrée dans le navigateur |
     | `#/verify/<numéro>` | drapeaux |
     | autres | le socle seul |

   - **Données des gestes** (`DATA_LATER`), chargées après le rendu : drapeaux sur `#/map` (fiche de
     la sélection), communes et drapeaux sur `#/register` et `#/minor`, drapeaux sur `#/citizen`.
   - **Recherche** : alphabet, drapeaux et Constitution de la langue, chargés à l'ouverture ; les
     résultats s'affichent quand ils sont là.
7. **Rendu.** Une route s'affiche quand ses données sont arrivées ; si l'on a changé de route
   entre-temps, seule la dernière demandée s'affiche. Un changement de langue charge le texte des
   pages et, sur la Constitution, le texte officiel de la langue, puis redessine. Le glissement entre
   sections part quand la page suivante est prête.
8. **Version des données.** Le build lié remplace `DATA_V` par `?v=` suivi des dix premiers
   caractères de l'empreinte SHA-256 des fichiers publiés : après un déploiement, un gabarit nouveau
   ne lit pas de données restées dans le cache.
9. **Fichier unique.** Le build inline injecte toutes les données et marque chaque clé comme
   chargée ; le rendu suit le même chemin.
10. **Règle de maintenance.** Une vue qui lit une donnée nouvelle l'ajoute à `DATA_SRC` (et à
    `DATA_FILES` de `build_portail.py`) et à la route qui la lit. Relevé :
    `docs/lot1/outils/usage.js` (lectures réelles de chaque route, par Proxy) ; contrôle :
    `docs/lot1/outils/dom.js` (DOM identique entre fichier unique et build lié, toutes routes, cinq
    langues et écritures, recherche, bascule de langue).

## Effet mesuré
Lighthouse 13.6, mobile simulé, servi en gzip comme Pages, médiane de trois passages
(`docs/lot1/MESURES.md`, sections 0 à 2 ; outils dans `docs/lot1/outils/`).

| Page | FCP (s) | LCP (s) | Poids (ko) | Perf. |
|---|---|---|---|---|
| `#/constitution` | 7,3 → 1,8 → 1,8 | 7,5 → 8,3 → **3,3** | 1 310 → 1 307 → **405** | 33 → 50 → 67 |
| `#/constitution/title-4/art-110` | 7,3 → 1,7 → 1,8 | 7,5 → 8,4 → **3,3** | 1 310 → 1 307 → **405** | 56 → 74 → 91 |
| `#/state/LK-20` | 7,3 → 1,8 → 1,8 | 7,5 → 8,4 → 6,7 | 1 351 → 1 348 → 1 040 | 29 → 50 → 52 |
| `#/map` | 7,4 → 1,8 → 1,8 | 7,4 → 1,8 → 1,8 | 1 310 → 1 307 → 1 005 | 6 → 45 → 45 |

(fichier unique → build lié → chargé par page)

Le build lié seul fait passer le premier affichage sous 2 s mais le contenu attend toujours les 18 JSON
(970 ko gzip) ; le chargement par page ramène `#/constitution` à 405 ko et 3,3 s. DOM identique au
fichier unique sur 31 routes × 5 langues, recherche et bascule de langue comprises (159 comparaisons).

## Limites
- **Cache.** Pages sert les fichiers avec `max-age=600`. Les données portent leur version
  (décision 8) ; le gabarit lui-même peut rester dix minutes en cache après un déploiement.
- **LCP du build lié seul** (commit 1) : il ne baisse pas, le gabarit attendant toutes les données
  avant tout rendu, dont 567 ko gzip de drapeaux. D'où le chargement par page (décisions 6 et 7).
- **LCP de `#/constitution` : 3,3 s**, au-dessus du budget de 2,5 s ; les polices (199 ko) font la
  moitié du poids restant. Traité en fin de lot (préchargement), mesuré là.
- **Drapeaux** : un seul fichier de 567 ko gzip pour les 54 ; il pèse sur les fiches d'États et
  s'ouvre avec la recherche. Hors de ce lot.
- **Poids publié.** Le site publié gagne `data/` (2 Mo bruts), `vendor/` (74 ko) et l'export
  (2,8 Mo) ; les GeoJSON sources restent hors du site.

## Propagation
- `scripts/build_portail.py` : mode par défaut réécrit (assemblage de `_site/`, liste blanche,
  contrôle contre `DATA_SRC`, version des données, export) ; `build_inline()` accepte une
  destination et un préfixe, et remplace l'amorce du socle par les données.
- `portail/index.html` : amorce réécrite (`DATA_SRC`, `DATA_ROUTE`, `DATA_LATER`, `need()`,
  `boot()`), `render()` attend les données de la route (`renderRoute()` = ancien `render()`),
  changement de langue et recherche attendent les leurs.
- `.github/workflows/pages.yml` : une seule étape de build, `python scripts/build_portail.py`.
- `.gitignore` : `/_site/`.
- `CLAUDE.md`, « Architecture du portail » : ligne `build_portail.py`.
