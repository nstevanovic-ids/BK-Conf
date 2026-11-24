# Mesures du lot 3 : la page des votes (#/votes)

Trois moments, d'après le plan (`docs/lot3/PLAN.md`) : le prototype Sabor tel quel, `main` avant le lot
(5869445, pages de contrôle), fin du lot. Outils du lot 1 (`docs/lot1/outils/` : `serve.py`, `mesure.js`,
`compare.py`, `dom.js`, `usage.js`, routes `#/votes` ajoutées) et du lot 3 (`docs/lot3/outils/` :
`verif-sabor.js`, `verif-votes.js`, `fluidite.js`, `chaines.py`).

## Méthode
- Lighthouse 13.6, mobile simulé (Moto G Power, 4G lente), servi en gzip comme Pages (`serve.py`), médiane de
  trois passages (cinq pour la remesure d'Institutions) ; Chromium de Playwright sans tête, sans processeur
  graphique.
- Captures : pages de la page des votes (ouverture, cas, carte, Veće, alarme) à 375, 768 et 1440 px, puis dans
  cinq langues et écritures, puis en thème sombre ; mouvement réduit. `main` et la fin du lot capturés le même
  jour, comparés par `compare.py`.
- Une machine de conteneur n'est pas un téléphone : la fluidité est à confirmer sur appareil (plan, « Essai
  sur un vrai téléphone »).

## 0. Le prototype (`mesures/0-prototype/`)
Critique reprise point par point sur `proto/sabor/` servi tel quel (`verif-sabor.js`, `verif.json`) ; résultats
dans le plan, section « Critique de Sabor ». Propositions de chaînes vérifiées par `chaines.py` (`chaines.json`).

## 1. Lighthouse

| Page | Moment | Perf. | Access. | FCP | LCP | TBT | CLS | Poids | Requêtes | Élément LCP |
|---|---|---|---|---|---|---|---|---|---|---|
| `#/votes` | fin | 90 | 94 | 1,3 s | **3,5 s** | 73 ms | 0 | 409 ko | 22 | chapeau (`p.vo-lead`) |
| `#/votes/consent/five-delegations` | fin | 90 | 94 | 1,3 s | 3,6 s | 56 ms | 0 | 409 ko | 22 | chapeau |
| `#/votes/consent/five-delegations/map` | fin | 90 | 94 | 1,3 s | 3,6 s | 86 ms | 0 | 409 ko | 22 | chapeau |
| `#/votes/council/four-councillors` | fin | 90 | 94 | 1,3 s | 3,6 s | 66 ms | 0 | 409 ko | 22 | chapeau |
| `#/constitution` | avant → fin | 93 → 93 | 94 → 94 | 1,3 s | 3,2 → 3,2 s | 61 → 41 ms | 0 | 354 → 355 ko | 13 | introduction |
| `#/map` | avant → fin | 66 → 64 | 96 → 96 | 1,3 s | 3,2 → 3,3 s | 1 980 → 1 721 ms | 0 | 1 541 → 1 542 ko | 19 | `h1` |
| `#/institutions` | avant → fin, 5 passages | 76 → 85 | 95 | 1,3 s | 7,4 → 4,1 s | 56 → 65 ms | 0 | 1 331 → 1 335 ko | 17 | photo |

- **Budget de 2,5 s : non tenu.** LCP de `#/votes` 3,5 à 3,6 s, au niveau du lecteur (3,2 s) et de la carte
  (3,3 s), comme le plan l'attendait. La page charge 409 ko : gabarit du portail (118 ko gzip, le code de toutes
  les pages), polices (194 ko), socle, puis 30 ko pour elle (code, styles, moteur, deux titres du lecteur,
  `stats.json`). Le chapeau, élément LCP, attend les citations et le moteur (préparation de la page) ; d3-force
  et `map.json` arrivent après, au repos. Le levier connu reste de sortir du gabarit le code des autres pages
  (hors de ce lot).
- **TBT de 56 à 86 ms, CLS 0** : la simulation de forces, chargée au repos, part au repos.
- **Institutions** : la photo du bandeau, chargée en différé, donne un LCP bimodal (4,1 s ou 7,4 à 8,4 s) dans
  les deux builds ; sur cinq passages, `main` 4 fois lent, la fin du lot 2 fois (`institutions.json`) : écart de
  passage, pas d'effet des renvois ajoutés (4 ko).
- Contrôles `#/constitution` et `#/map` inchangés.

## 2. Corrections vérifiées dans le portail (`2-fin-de-lot/verif.json`)

| Point | Résultat |
|---|---|
| B3, 1440 × 900 | types finis à y = 307, cas à y = 366, scène à y = 441, verdict entier à y = 464 |
| I5, clavier | 23 tabulations jusqu'au premier disque, en-tête du portail compris (lien d'évitement : 1) |
| ✓ ✕ ‖ | marque `aria-hidden`, texte « Met » / « Not met » sur chaque jauge ; verdict en toutes lettres |
| Commandes de délégation | 27 boutons de délégation et 14 de membres visibles et atteignables dans les deux dispositions ; carte : 0 chevauchement de disques |
| B4, art. 109 b | cas de l'alarme, dix États passés pour (212 sièges) : « Suspended », ligne = art. 109 b |
| I1, toucher (375 px) | toucher = sélection (BC-02 choisi, vote inchangé, fiche ouverte) ; 38 disques sous 24 px, zone de toucher de 22 px ; pas de débordement |
| F10, mouvement réduit | avis visible, relié à la scène (`aria-describedby`) ; d3-force non chargé |
| I7, Veće | 7 sièges, aucun disque visible ; cas des quatre conseillers : « Suspended » |
| Thème clair | textes 6,56 à 6,8 : 1 ; blanc sur azur 9,69, sur gueules 6,71 ; azur, gueules, contour d'abstention contre le fond ≥ 3,21 : 1 |
| Thème sombre | textes 4,87 à 8,93 : 1 ; blanc sur azur 5,54, sur gueules 4,87 ; formes ≥ 3,25 : 1 |
| Erreurs console | aucune |

L'or (‖, verdict « Suspended ») ne sert que de fond à un texte (encre 10 : 1). Deux corrections au passage de
la mesure : texte secondaire en `--ink-2` plutôt qu'en `--ink-3` (3,4 : 1 en clair), seconde teinte du hachure
« contre » éclaircie en sombre (2,86 → 3,25 : 1).

## 3. Fluidité (`2-fin-de-lot/fluidite.json`)

Durée des images pendant les sept cas joués et cinq changements de disposition (`requestAnimationFrame`) :

| | Images | Moyenne | Médiane | 95e centile | Max | > 20 ms | > 50 ms |
|---|---|---|---|---|---|---|---|
| 1440 px | 3 566 | 16,7 ms | 16,7 ms | 16,7 ms | 67 ms | 2 | 1 |
| 375 px, processeur ×4 | 3 511 | 17,2 ms | 16,7 ms | 16,8 ms | 150 ms | 76 | 10 |

Rendu logiciel, sans processeur graphique ; 60 images par seconde tenues sur ordinateur, quelques à-coups sous
processeur ralenti. À confirmer sur un vrai téléphone.

## 4. Non-régression
- **DOM** (`dom.js`, fichier unique contre build lié, 37 routes dont quatre `#/votes…`, cinq langues et
  écritures, recherche à trois requêtes dont « alarm », bascule de langue) : **189 comparaisons, 0
  divergence** (positions des disques retirées avant comparaison).
- **Captures** (`compare.py`, `main` → fin, 44 captures communes) : identiques à 0,5 % de pixels près, sauf
  l'art. 110 à 375 px dans quatre langues (7 à 8 %) : le bas de l'instrument de l'art. 109 montre le renvoi
  « Votes and majorities », voulu. Versées : ces quatre-là et les 51 captures de la page des votes
  (`2-fin-de-lot/captures/`).
- **Contrôles de page** (`pages.json`) : 82 captures, aucune erreur, aucun débordement, un seul `h1`.
- **Moteur** : `node scripts/test_regles.js`, 336 vérifications, 0 en échec.
- **Chaînes** : `textes.py check`, aucune clé manquante.
- **Fichier unique** : `balkanska_konfederacija.html` ouvert en `file://` sur `#/votes`, une composition en
  disposition carte et le Veće : rendu complet, citations, carte et d3-force, sans erreur.

## Pas vu fonctionner
- Un vrai téléphone (fluidité, toucher des plus petits disques, bandeau bas), Safari (View Transitions dès
  iOS 18), Firefox, un lecteur d'écran réel.
- Un déploiement réel sur Pages.
