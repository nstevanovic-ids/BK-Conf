# ADR 2026-11-23 — Lecteur de la Constitution (#/constitution), repris du prototype Codex

## Statut
Accepté le 2026-11-16 par l'auteur : Codex (`proto/codex/`, branche `claude/proto-tour-2`) remplace le
lecteur de `#/constitution` (lot 1, `proto/REPRISE.md`). Plan du lot : `docs/lot1/PLAN.md`. Décisions
de l'auteur appliquées : texte français public (décision 5), péréquation non livrée en attendant la
révision de l'art. 132 (décision 6) ; recommandations du plan acceptées le 2026-11-23 (moteur de Sabor
porté dès ce lot, chaînes 1, 3, 5, 6, 9, 10 et 11 livrées, lien d'évitement, chaîne 12 soumise).

**Amendé le 2026-11-23 (retour de l'auteur)** : la lecture comparée est retirée (« complètement
inutile ») : un seul texte à la fois ; l'écriture d'un texte suit la règle de l'ADR
2026-11-06-istocni-cyrillique.md (décisions 3 et 6 ci-dessous, réécrites).

Voir aussi : ADR 2026-11-23-deploiement-lie.md (build lié, chargement par page) et
2026-11-23-mouvement-lecteur.md (amendement du mouvement).

## Décision
1. **Le lecteur est du code de page**, chargé avec la route : `portail/js/constitution.js` (lecteur),
   `portail/css/constitution.css`, puis à l'approche d'un instrument `portail/js/marges.js` et
   `portail/js/regles.js`. Scripts classiques sur les globales du portail (`L`, `T`, `LANG`,
   `SCRIPTS`, `cyrText`, `cyrWord`, `cyr2lat`, `STATES`, `PEUPLES`, `need`), pas de modules ES : le
   fichier unique les embarque et marche en `file://`. Toutes leurs classes sont préfixées `cx-` (le
   portail a `.hero`, `.lead`, `.btn`, `.on`, `.g`… et un style global de `header`).
2. **Données générées, jamais éditées** : `portail/data/constitution/` par `scripts/build_lecteur.py`
   (appelé par `build_constitution.py`) : `core.json` (sommaire, préambules des cinq textes, 184 renvois
   inverses, 19 ancrages d'instruments), `t/<titre>.<lg>.json` (55 fichiers), `idx.<lg>.json`,
   `full.<lg>.json` ; `map.json` par `scripts/build_carte_marge.py`. Le générateur échoue, sans rien
   écrire, si le français ne s'aligne pas unité par unité, si les renvois diffèrent d'un texte à
   l'autre ou si un alinéa annoté est introuvable ; Pages refuse de déployer des données périmées.
3. **Un texte à la fois**, parmi cinq : anglais, zapadni, središñi, istočni (officiels, art. 151) et le
   texte de travail français (`docs/constitution/v4.md`), découpés unité par unité (alinéa, lettre,
   intertitre). Par défaut, celui de la langue de l'interface ; la barre en propose un autre (un seul
   choix, pas de lecture comparée), sur le même alinéa ; un changement de langue de l'interface y
   ramène. Le texte français porte une ligne : « French working text. The versions in the three regional
   standards are equally authentic (Art. 151). » (chaîne 11). Écran étroit : onglets et balayage
   horizontal entre les textes.
4. **Routes** : `#/constitution` (ouverture : titre, art. 110 manipulable, préambule, onze titres avec
   un trait par article, Journal officiel) ; `/preamble` ; `/title-4` ; `/title-4/art-110` (inchangée) ;
   `/title-4/art-110/fr` (texte autre que celui de l'interface). `art-110`, `art-1-bis`, un mauvais
   titre et les anciennes adresses à plusieurs textes (`/en-sre-fr` : le premier) sont réécrits ; une
   adresse introuvable donne une vue « Not found » qui garde l'adresse et ouvre la recherche.
5. **Barre du lecteur** à la place du fil d'Ariane, collante sous l'en-tête : titre et article lus,
   textes affichés, double ligne, compteur, règle graduée (onze titres, un trait par article) ; fil de
   lecture des renvois suivis ; j / k.
6. **Langue et écriture** : celles du portail. Sur sa page, le lecteur garde l'alinéa lu quand la langue
   change. Le texte de la langue de l'interface suit la bascule Lat / Ћир de l'en-tête (choix mémorisé
   par standard) ; le texte d'un autre standard s'ouvre dans son écriture première : latin pour le
   središñi, cyrillique pour l'istočni (ADR 2026-11-06-istocni-cyrillique.md). Les cellules échappent à
   la conversion globale (`.cxl`, `.cxu` dans `cyrSkip`). Double ligne (bouton « Lat/Ћир » ou
   « Кир/Lat » de la barre) : `<ruby>`, l'écriture première au-dessus, l'autre dessous.
7. **Moteur unique** : `REGLES` (`portail/js/regles.js`, porté de `proto/sabor/js/rules.js`) calcule
   pour les instruments et pour la page Institutions (sièges). Vérification article par article :
   `docs/lot1/MOTEUR.md`, `scripts/test_regles.js` (au déploiement).
8. **Instruments de marge** (affichage de Codex, calcul du moteur) : art. 1 bis, 1 ter, 103, 109 b et
   110 ter, 110 (aussi sur l'ouverture), 111, 115 bis. Ils écrivent leur résultat sur les alinéas, dans
   tous les textes affichés, et disent leurs hypothèses (« Assumption »). Pas d'instrument pour
   l'art. 132 tant que l'article n'est pas révisé.
9. **Recherche** : une seule, celle du portail, enrichie de Codex (accès par numéro, repli sans
   diacritiques, extraits marqués) ; la palette de Codex est abandonnée.
10. **Abandonné de Codex** : sa palette, sa fiche d'État et sa vue `#states` (le portail a les siennes),
    ses copies de polices, drapeaux, blasons, emblème et données ; la recherche des communes (lot 2,
    vers la carte).

## Mesures (docs/lot1/MESURES.md)
`#/constitution` : LCP 7,5 → 3,3 s, poids 1 310 → 394 ko, CLS 0,86 → 0,001, performance 33 → 92
(Lighthouse mobile simulé). Le budget de 2,5 s n'est pas tenu : le reste tient au gabarit du portail
(128 ko gzip, le code de toutes les pages), pas au lecteur. Le sortir page par page, comme le lecteur,
est hors de ce lot.

## Limites
- La double ligne garde des blancs irréguliers là où la forme du dessous est plus large que celle du dessus.
- Le fil de lecture repart de zéro quand on navigue sans suivre un renvoi (comme dans Codex).
- Chaîne 12 (ce que l'instrument de l'art. 111 ne calcule pas) : rédigée, soumise à l'auteur, non
  livrée (`docs/lot1/CHAINES.md`).
- Non vu fonctionner : Safari, Firefox, un vrai téléphone ; la fluidité à 60 images/s de la bascule.

## Propagation
- `portail/index.html` : `vConstitution()` réduit à un point d'accroche ; ancien lecteur retiré ;
  routeur, langue et écriture confiés au lecteur sur sa page ; `artLink` et `routePlace` lisent
  `core.json` ; recherche unifiée ; lien d'évitement.
- `scripts/build_portail.py`, `scripts/textes.py` (lit aussi `portail/js/*.js`),
  `.github/workflows/pages.yml` ; `CLAUDE.md`.
