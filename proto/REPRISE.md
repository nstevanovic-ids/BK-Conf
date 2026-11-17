# Reprise : intégrer Atlas, Codex et Sabor au portail

Document de passation, écrit le 17 novembre 2026 pour une nouvelle conversation.
Lis-le en entier, puis `CLAUDE.md` et `docs/canon/`, qui priment sur tout le reste.

## Décision de l'auteur (16 novembre 2026)

Les trois prototypes du tour 2 sont retenus, chacun pour une page :

| Lot | Prototype | Destination dans le portail |
|---|---|---|
| 1 | **Codex** (`proto/codex/`) | remplace le lecteur de `#/constitution` |
| 2 | **Atlas** (`proto/atlas/`), MapLibre GL | remplace le globe d3 de `#/map` |
| 3 | **Sabor** (`proto/sabor/`) | devient une NOUVELLE page sur le mécanisme de vote |

Le reste du portail ne change pas. Rien n'est encore intégré : `portail/` est intact.

## Où est quoi

- Dépôt `nstevanovic-ids/BK-Conf`. **`main` (7d96e3c) est la seule branche publiée**
  (GitHub Pages, `.github/workflows/pages.yml`). L'auteur écrit parfois que « main n'est pas à
  jour » : c'était vrai en octobre, plus maintenant ; `CLAUDE.md` fait foi.
- Branche **`claude/proto-tour-2`** (9664191), partie de `main` : tout ce qui suit est dedans.
- Le canon compte **54 entités** (52 États, dont 4 villes-États, et 2 municipalités
  confédérales), pas 47.

| Fichier | Contenu |
|---|---|
| `proto/<nom>/` | prototype autonome : `cd proto/<nom> && python -m http.server` |
| `proto/<nom>/build.py` | reconstruit le prototype depuis `portail/data/` (source de vérité) |
| `proto/<nom>/NOTES.md` | ce qui est fait, mesures, hypothèses de calcul, limites. Celui d'Atlas décrit l'état d'AVANT les corrections |
| `proto/<nom>/strings-new.json` | chaînes d'interface nouvelles, non traduites |
| `proto/critique-<nom>.md` | critique indépendante (avant corrections), avec cas de reproduction |
| `proto/SYNTHESE.md` | tableau comparatif et points de fond |
| `proto/CONCEPTS.md`, `proto/BRIEF.md`, `proto/BRIEF-CLIENT.md` | tri des concepts, cadre technique, brief de l'auteur |
| branche `claude/audit-refonte-visuelle`, `docs/audit/AUDIT.md` | audit du portail actuel : 47 constats chiffrés, Lighthouse avant |

## Règles non négociables

- Aucune PR vers `main`, aucune fusion, sans accord explicite de l'auteur. Une branche
  `claude/…` par lot, partie de `main`, commits atomiques, une PR par lot.
- L'auteur veut qu'on lui **propose puis qu'on attende son accord** avant de construire.
- `portail/data/*.json` est la source de vérité ; rien en dur dans le gabarit ; aucun contenu
  canonique modifié (noms, codes, textes constitutionnels, chiffres).
- Aucun emblème, blason ou logo dessiné en SVG : assets existants seulement.
- Aucun code couleur par peuple constitutif. Palette : rouge #99402F, bleu #374078,
  blanc #FFFFFF, or #DFCC68 et leurs dérivés tonaux. Arimo et Sofia Sans Extra Condensed.
- Drapeaux : jamais verticaux, jamais recadrés, toujours à leur proportion réelle
  (`object-fit: contain`). Jamais le sujet d'une page.
- Toute chaîne nouvelle passe par `L` et reçoit ses trois traductions (zapadni, središñi,
  istočni) : `python scripts/textes.py check` doit rester sans clé manquante. **Une traduction
  incertaine est listée et soumise à l'auteur, jamais inventée.**
- Une règle de vote ou de finance s'applique à la lettre de l'article, cité à l'écran ; une
  hypothèse que le texte ne tranche pas est affichée et listée.
- Français de travail : masculin générique, pas d'écriture inclusive. Livrables publics en anglais.
- Avant chaque déploiement : `python scripts/equilibre.py --check`.
- Un workstream par conversation (règle du projet) : un lot = une conversation.

## Décisions à obtenir de l'auteur AVANT d'écrire du code

Elles lui ont été posées le 16 novembre ; il n'a pas encore répondu. Recommandation entre
parenthèses.

1. **Déploiement.** MapLibre pèse 1,1 Mo et ne peut pas entrer dans le fichier unique
   (`build_portail.py --inline`, 2,9 Mo aujourd'hui). (Déployer le build lié sur Pages ; garder
   le fichier unique comme export. L'audit le recommandait déjà : constat P-1, premier
   affichage mobile à 7,3 s.)
2. **Globe.** L'ADR `2026-10-14-carte-globe.md` fixe un globe orthographique d3-geo pour
   `#/map`. (Un nouvel ADR le remplace par MapLibre en Mercator ; `portail/vendor/` d3 reste
   si autre chose s'en sert.)
3. **Transitions.** L'ADR `2026-10-23-glissement-sections.md` : un seul glissement de 620 ms,
   rien d'autre ne s'anime à l'arrivée. Les prototypes ajoutent des View Transitions à éléments
   partagés et la bascule d'écriture glyphe par glyphe. (ADR d'amendement limité aux trois pages.)
4. **Traductions.** Chaînes nouvelles à valider : 20 pour Atlas, 10 pour Codex, 29 pour Sabor
   (`strings-new.json`). Sabor reprend déjà 23 termes du texte constitutionnel traduit.
5. **Texte français.** Codex affiche `docs/constitution/v4.md` (texte de travail) à côté des
   quatre textes publiés. (À lui de dire s'il va sur le portail public.)
6. **Péréquation.** Appliqué à la lettre, l'art. 132 (plancher 85 %, plafond 30 %) ne se
   finance pas sur les PIB réels : au plafond, les contributeurs couvrent 56 % du besoin.
   Résultat valable sous l'hypothèse « capacité fiscale = PIB par habitant », que le texte ne
   fixe pas. (Publier le constat tel quel avec l'hypothèse visible, ou réviser l'article
   d'abord : c'est un point de fond, ne tranche pas.)
7. **Nom et route de la page Sabor**, et sa place dans la navigation (8 entrées aujourd'hui).
8. **Données incohérentes vues par Atlas**, à corriger ou non dans le canon : Sloveñ Gradec,
   chef-lieu de KJ-15, est rangé dans ST-35 ; Priština n'est dans aucune commune de KM-16 ;
   VS-45 n'a pas de commune « Skopje ».

## Ce que « intégrer » veut dire

Le portail est un gabarit unique (`portail/index.html`, 5 500 lignes : HTML, CSS, JS de rendu),
des données dans `portail/data/`, un build (`scripts/build_portail.py`, modes lié et inline).
Les prototypes sont des applications séparées, avec leurs propres routes (`#art-110`,
`#state-LK-20`), leur propre sélecteur de langue et leur propre copie des données.

Pour chaque lot :
- porter le code dans l'architecture du portail : routes `#/…` existantes, en-tête, thème
  clair et sombre, sélecteur EN / ZAP / SRE / IST et bascule Lat / Ћир du portail (fonctions
  `toCyr`, `cyrText`, `cyrWord` déjà présentes : ne pas les dupliquer) ;
- remplacer les copies de données par celles de `portail/data/` ; ce que `build.py` calcule
  (index des renvois, alignement des textes, géométries communales simplifiées, sièges) devient
  une étape de `scripts/` qui écrit dans `portail/data/`, avec la mention « généré, ne pas
  éditer » dans `CLAUDE.md` ;
- charger à la demande ce qui est lourd (MapLibre, d3-force, textes par titre) ;
- garder les liens profonds existants (`#/constitution/title-4/art-102`, `#/state/LK-20`) ;
- écrire l'ADR dans `docs/decisions/` et mettre `CLAUDE.md` à jour ;
- joindre à la PR : captures avant et après à 375, 768 et 1440 px
  (`docs/audit/capture.py` sur la branche d'audit), Lighthouse mobile avant et après.

## Par lot : portée, acquis, reste à faire

### Lot 1, Codex → `#/constitution` (commencer par lui)
- Acquis : 202 articles alignés dans cinq textes, renvois cliquables et 184 renvois inverses,
  fil de lecture, une à cinq colonnes, bascule glyphe par glyphe, instruments de marge
  (art. 103, 109, 110/111/115 bis, 132), carte SVG des 54 entités en marge, palette de
  commande. Aucune bibliothèque. Zéro erreur console, zéro débordement à 375 et 1440 px.
- Reste : LCP mobile à 3,2 s sur un article (budget 2,5 s) ; 10 chaînes à traduire ; la marge
  n'est plus collante en mode colonnes de 340 px ; blancs irréguliers de la vue double ligne ;
  le fichier `constitution.json` reste généré par `scripts/build_constitution.py`.
- La palette de commande de Codex et la recherche actuelle du portail (Ctrl+K) font double
  emploi : n'en garder qu'une, pour tout le portail.

### Lot 2, Atlas → `#/map`
- Acquis : zoom continu Confédération → État → commune (1 384 contours, au plus 79 ko gzip par
  État, chargés à la demande), choroplèthes population / densité / PIB sur une seule rampe
  bleue, la Constitution sur la carte (sièges de l'art. 103, double clé de l'art. 110 par clic
  sur un territoire, péréquation de l'art. 132), navigation au clavier, feuillet mobile à
  trois crans.
- Reste : le sous-agent a été interrompu pendant ses corrections. Vérifié depuis : zéro erreur
  console, drapeaux conformes, routes héritées redirigées. **Non revérifié** : chaque point de
  `critique-atlas.md` (reprends-les un par un), LCP et délai d'interactivité après
  corrections, paysage mobile, `NOTES.md`. La fluidité à 60 images/s n'a jamais été mesurée
  (machine de test sans processeur graphique) : à mesurer sur un vrai téléphone.
- Dans le portail, la fiche d'État existe déjà (`#/state/<code>`) : la carte y renvoie, elle
  ne la duplique pas dans un feuillet. La Constitution reste sur sa page (lot 1) ; de la carte
  on ne garde que les couches institutionnelles, avec un lien vers l'article.

### Lot 3, Sabor → nouvelle page
- Acquis : 54 unités pondérées par la population, neuf types de décision, chacun avec son
  article cité (moteur dans `proto/sabor/js/rules.js`, à reprendre tel quel), sept cas joués
  pas à pas, disposition par délégation ou géographique, état du vote dans l'adresse,
  péréquation, équivalent tabulaire complet, alternative « mouvement réduit ».
- Reste : 29 chaînes à traduire, dont les mots porteurs (For, Against, Abstention, Passes,
  Fails, Suspended) ; LCP à la limite (2,4 à 2,6 s) ; thème sombre non revu ; les marques
  ✓ et ✕ n'ont plus de texte pour lecteur d'écran ; commandes de délégation inaccessibles en
  disposition géographique ; onze hypothèses de calcul listées dans `NOTES.md` à faire valider.
- Vérifier le moteur contre le texte, article par article, avant publication : un verdict faux
  est le pire défaut possible ici. Le critique a confirmé les art. 103, 110, 111, 106 bis,
  122 à 124 ; l'art. 109 b a été corrigé depuis.
- Les trois instruments (Codex en marge, Atlas sur la carte, Sabor) calculent les mêmes
  règles avec trois moteurs : n'en garder qu'un, celui de Sabor.

## Non fait, à dire à l'auteur plutôt qu'à découvrir
- Aucune critique indépendante après corrections.
- Aucun essai sur appareil réel, Safari, Firefox ni lecteur d'écran.
- Transbalkanska et carte de citoyen : aucun traitement propre, texte d'articles seulement.
- Le plancher et le plafond de la péréquation sont à l'**art. 132** (les briefs de l'auteur
  citent 99 bis à 99 septies, qui sont le régime des finances).

## Vérification attendue à chaque lot
Chrome piloté par Playwright à 375, 768 et 1440 px, dans les quatre langues et en cyrillique :
zéro erreur console, zéro débordement horizontal, drapeaux à leur proportion, focus visible,
clavier complet, `prefers-reduced-motion` avec une vraie alternative, Lighthouse mobile
(LCP < 2,5 s). Regarder les captures, pas seulement les mesures. Dire ce qui n'a pas été vu
fonctionner.

## Économie d'usage
Le tour 2 a touché deux fois la limite de 5 heures de l'auteur. Pas de sous-agents sauf
demande explicite ; un lot par conversation ; lire les fichiers par parties.
