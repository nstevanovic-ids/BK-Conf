# Mesures du lot 2 : la carte (#/map)

Trois moments, d'après le plan (`docs/lot2/PLAN.md`) : `main` avant le lot (globe d3), après la page en SVG
(commit 4, sans MapLibre), fin du lot (MapLibre chargé au repos). Outils du lot 1 (`docs/lot1/outils/`),
complétés pour la carte : `mesure.js` (routes `#/map/…`, attente de MapLibre, thème sombre), `dom.js`
(MapLibre retiré avant comparaison, écarts voulus de l'export).

## Méthode
- Lighthouse 13.6, mobile simulé (Moto G Power, 4G lente), servi en gzip comme Pages (`serve.py`),
  médiane de trois passages ; Chromium de Playwright sans tête, **sans processeur graphique** : WebGL y est
  rendu en logiciel (SwiftShader).
- Captures : 33 routes à 375, 768 et 1440 px, puis dix pages dans cinq langues et écritures, puis cinq en
  thème sombre ; mouvement réduit. `main` (0607c77) et la fin du lot capturés le même jour, comparés par
  `compare.py`.
- Une machine de conteneur n'est pas un téléphone, et moins encore pour la carte : voir « TBT ».

## 1. Lighthouse

| Page | Moment | Perf. | FCP | LCP | TBT | CLS | Poids | Requêtes | Élément LCP |
|---|---|---|---|---|---|---|---|---|---|
| `#/map` | avant (globe d3, `0-avant/`) | 48 | 1,3 s | **6,3 s** | 2 375 ms | 0 | 999 ko | 16 | `<p>` sous le titre |
| `#/map` | silhouette seule (commit 4, `1-svg/`) | **93** | 1,3 s | **3,2 s** | **57 ms** | 0 | **358 ko** | 14 | `<h1>` du feuillet |
| `#/map` | fin, MapLibre au repos (`2-fin-de-lot/`) | 69 | 1,3 s | **3,3 s** | 1 305 ms | 0 | 1 541 ko | 19 | `<h1>` du feuillet |
| `#/map/LK-20` | silhouette seule (commit 4) | 92 | 1,3 s | 3,3 s | 75 ms | 0 | 383 ko | 15 | `<h2>` du feuillet |
| `#/map/LK-20` | fin (MapLibre, communes) | 55 | 1,3 s | 3,5 s | 10 148 ms | 0 | 1 841 ko | 34 | `<h2>` du feuillet |
| `#/constitution` | fin (contrôle) | 93 | 1,2 s | 3,2 s | 44 ms | 0 | 354 ko | 13 | introduction |
| `#/state/LK-20` | fin (contrôle) | 74 | 1,3 s | 6,5 s | 117 ms | 0,09 | 1 019 ko | 19 | blason |

- **LCP de `#/map` : 6,3 → 3,3 s**, le niveau de `#/constitution` ; le budget de 2,5 s n'est pas tenu, le reste
  tenant au gabarit du portail (comme au lot 1). La page n'attend plus que le gabarit, le socle, `stats.json`
  et `carte/index.json` (14 ko gzip, silhouette comprise) ; ni `geo.json`, ni `lights.json`, ni d3, ni drapeaux.
- **Poids** : 358 ko au premier rendu ; MapLibre (288 ko gzip), son worker (143 ko), `geo.json` (74 ko) et
  les communes de l'État ouvert s'y ajoutent ensuite.
- Contrôles hors carte : `#/constitution` et une fiche d'État au niveau de la fin du lot 1.

### TBT
Le TBT de fin de lot est celui de MapLibre rendu en WebGL **logiciel** sous un processeur ralenti quatre
fois : il ne dit rien d'un téléphone. Relevé complémentaire dans Chromium (processeur ×4, longues tâches
du fil principal sur 15 s, écran de 412 px) : `#/map` 0,6 s, `#/map/LK-20` 2,4 s (1,45 s en mouvement
réduit), le reste étant le rendu des images de la révélation des communes. Lighthouse, en simulation,
multiplie ces tâches. Deux essais n'ont rien gagné : supprimer le vol d'arrivée (gardé, il suit la règle
du portail) et différer les communes des États voisins (abandonné, plus de tâches au total). Si l'essai sur
téléphone le demande, MapLibre passe au premier geste seulement (`#/map` reviendrait à 57 ms).

## 2. Non-régression
- **Captures** (`compare.py`, `main` 0607c77 → fin) : 209 comparées ; hors de la carte, une seule au-delà de
  0,5 % de pixels, `constitution-art-1440` (4 %), même contenu, éclairage d'arrivée sur l'article pris à un
  autre instant. Les 49 captures de la carte sont versées (`2-fin-de-lot/captures/`).
- **Contrôles de page** (`pages.json`) : aucune erreur, aucun débordement, un seul `h1` sur toutes les pages
  de la carte ; ailleurs, les mêmes constats que sur `main` (404 des blasons absents, trois `h1` dans la vue
  à plusieurs textes de la Constitution).
- **DOM** (`dom.js`, fichier unique contre build lié, 34 routes dont `#/map`, `#/map/LK-20` et
  `#/map/LK-20/gospic`, cinq langues et écritures, recherche et bascule de langue) : **169 comparaisons,
  0 divergence** (MapLibre et la liste des communes, absents de l'export par conception, retirés avant
  comparaison ; la commune n'est contrôlée que pour ses erreurs).
- **Export** : `balkanska_konfederacija.html` ouvert en `file://` sur `#/map`, `#/map/LK-20`,
  `#/map/LK-20/gospic` (ramené à l'État) et `#/map/art-110` : rendu complet, sans erreur, carte en SVG.

## 3. Vérification

| Contrôle | Résultat |
|---|---|
| Chrome (Playwright) 375, 768, 1440 px et 812 × 375 | captures regardées ; feuillet bas à 375 px, latéral en paysage |
| EN, ZAP, SRE latin et cyrillique, IST cyrillique et latin | captures ; libellés de la carte convertis à la création ; codes en latin |
| Thème sombre | carte et feuillet suivent le thème ; rampe inversée (plus = plus clair) |
| Erreurs console | aucune sur la carte (des avertissements « GPU stall » du rendu logiciel seulement) |
| Clavier | flèches entre entités voisines, Entrée ouvre, Échap remonte, focus gardé sur la carte |
| Mouvement réduit | captures en mouvement réduit ; cadrage direct, fil d'Ariane numéroté |
| Couches | art. 103 : 250 délégués, 54 circonscriptions ; art. 110 : 5/7 et 44,0 % → « Not adopted », + Serbes → 6/7 et 75,3 % → « Adopted » (mêmes chiffres que la marge du lecteur) |
| Recherche | « gosp », « Госпић » → Gospić, la carte y vole ; « beograd » : l'État avant la commune |
| Moteur | `node scripts/test_regles.js` : 222 vérifications, 0 en échec |
| Données | `build_carte.py` : sorties identiques au prototype (LK-20, DA-08, BG-91, index des communes) |

## Pas vu fonctionner
- Un vrai téléphone, la fluidité à 60 images/s (aucun processeur graphique ici), le geste de pincement réel.
- Safari (WebGL 2 exigé), Firefox, un lecteur d'écran.
- Un déploiement réel sur Pages (le contrôle d'empreinte a tourné en local).
