# ADR 2026-11-23 — Lecteur de la Constitution (#/constitution), repris du prototype Codex

## Statut
Accepté le 2026-11-16 par l'auteur : Codex (`proto/codex/`, branche `claude/proto-tour-2`) remplace le
lecteur de `#/constitution` (lot 1, `proto/REPRISE.md`). Plan du lot : `docs/lot1/PLAN.md`. Décisions
de l'auteur appliquées : texte français public (décision 5), péréquation non livrée en attendant la
révision de l'art. 132 (décision 6) ; recommandations du plan acceptées le 2026-11-23 (moteur de Sabor
porté dès ce lot, chaînes 1, 3, 5, 6, 9, 10 et 11 livrées, lien d'évitement, chaîne 12 soumise) ;
chaîne 12 validée et lectures du moteur (`present`, `six`) tranchées le 2026-11-24 (`docs/lot1/MOTEUR.md`).

**Amendé le 2026-11-23 (retour de l'auteur)** : la lecture comparée est retirée (« complètement
inutile ») : un seul texte à la fois ; l'écriture d'un texte suit la règle de l'ADR
2026-11-06-istocni-cyrillique.md (décisions 3 et 6 ci-dessous, réécrites).

**Amendé le 2026-11-24 (retour de l'auteur)** : « une sélection UNIQUE en mode lecture, une seule
langue ou une seule écriture » ; « le cyrillique sous le latin est une manière illisible de lire et
inutile » ; « l'IST est toujours en écriture latine par défaut ». La double ligne est retirée ; la barre
n'a plus qu'une rangée à choix unique, un texte dans une écriture ; un texte s'ouvre toujours dans
l'écriture première de son standard (décisions 3, 4, 5 et 6, réécrites). Cause du défaut signalé, sur
le site publié : la double ligne, une fois activée, restait mémorisée (`bk-cx-dbl`) et mettait le latin
au-dessus du cyrillique, istočni compris ; la clé est effacée au premier passage.

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
3. **Une seule sélection : un texte dans une seule écriture**, parmi cinq textes : anglais, zapadni,
   središñi, istočni (officiels, art. 151) et le texte de travail français (`docs/constitution/v4.md`),
   découpés unité par unité (alinéa, lettre, intertitre). La barre les propose en une rangée à choix
   unique (`role="radiogroup"`), chaque option écrite dans sa propre écriture : **EN · ZAP · SRE · СРЕ ·
   ИСТ · IST · FR** (l'écriture première d'abord, l'autre collée à elle). Ni lecture comparée, ni double
   ligne. Par défaut, la langue de l'interface ; un autre texte se monte sur le même alinéa ; le même
   texte dans l'autre écriture bascule glyphe par glyphe, sans nouveau rendu ; un changement de langue
   de l'interface ramène au texte de cette langue. Le texte français porte une ligne : « French working
   text. The versions in the three regional standards are equally authentic (Art. 151). » (chaîne 11).
   Clavier : flèches dans la rangée. Écran étroit : les sept options sur une ligne, balayage horizontal
   de l'une à la suivante.
4. **Routes** : `#/constitution` (ouverture : titre, Journal officiel, préambule, puis les onze titres
   avec un trait par article ; amendé le 2026-11-23, voir plus bas) ; `/preamble` ; `/title-4` ;
   `/title-4/art-110` (inchangée) ; `/title-4/art-110/fr`, `/…/ist`, `/…/sre-cyr`, `/…/ist-lat` (texte ou
   écriture autres que ceux par défaut).
   `art-110`, `art-1-bis`, un mauvais titre et les anciennes adresses à plusieurs textes (`/en-sre-fr` :
   le premier) sont réécrits ; une adresse introuvable donne une vue « Not found » qui garde l'adresse
   et ouvre la recherche.
5. **Barre du lecteur** à la place du fil d'Ariane, collante sous l'en-tête : titre et article lus,
   rangée du texte et de l'écriture, compteur, règle graduée (onze titres, un trait par article) ; fil de
   lecture des renvois suivis ; j / k.
6. **Langue et écriture** : la langue de l'interface donne le texte par défaut ; sur sa page, le lecteur
   garde l'alinéa lu quand la langue change. Un texte s'ouvre **toujours** dans l'écriture première de son
   standard, latin pour le središñi, cyrillique pour l'istočni (ADR 2026-11-06-istocni-cyrillique.md),
   quelle que soit l'écriture de l'interface ou un réglage ancien ; seule la barre du lecteur la change,
   pour la visite (adresse comprise, rien n'est mémorisé d'une visite à l'autre). La bascule Lat / Ћир de
   l'en-tête ne change que l'interface (libellés, barre). Les cellules échappent à la conversion globale
   (`.cxl`, `.cxu` dans `cyrSkip`).
7. **Moteur unique** : `REGLES` (`portail/js/regles.js`, porté de `proto/sabor/js/rules.js`) calcule
   pour les instruments et pour la page Institutions (sièges). Vérification article par article :
   `docs/lot1/MOTEUR.md`, `scripts/test_regles.js` (au déploiement).
8. **Instruments de marge** (affichage de Codex, calcul du moteur) : art. 1 bis, 1 ter, 103, 109 b et
   110 ter, 110, 111, 115 bis. Ils écrivent leur résultat sur les alinéas, dans le texte affiché, et
   disent leurs hypothèses (« Assumption »). Pas d'instrument pour l'art. 132 tant que l'article n'est
   pas révisé.
9. **Recherche** : une seule, celle du portail, enrichie de Codex (accès par numéro, repli sans
   diacritiques, extraits marqués) ; la palette de Codex est abandonnée.
10. **Abandonné de Codex** : sa palette, sa fiche d'État et sa vue `#states` (le portail a les siennes),
    ses copies de polices, drapeaux, blasons, emblème et données ; la recherche des communes (lot 2,
    vers la carte).

## Amendement du 2026-11-23 : l'ouverture sans l'art. 110
L'art. 110 et son instrument, placés au-dessus du préambule (bloc `cx-hero`), se lisaient comme un
extrait du préambule. Ils sont retirés de l'ouverture : `#/constitution` s'ouvre sur le préambule puis
les onze titres. L'instrument de la double clé reste dans la marge de l'art. 110. L'ouverture ne charge
plus le titre 4 (ni à l'affichage ni au préchargement du `<head>`) ; aucune chaîne nouvelle.

## Mesures (docs/lot1/MESURES.md)
`#/constitution` : LCP 7,5 → 3,3 s, poids 1 310 → 394 ko, CLS 0,86 → 0,001, performance 33 → 92
(Lighthouse mobile simulé). Le budget de 2,5 s n'est pas tenu : le reste tient au gabarit du portail
(128 ko gzip, le code de toutes les pages), pas au lecteur. Le sortir page par page, comme le lecteur,
est hors de ce lot.

## Limites
- Le fil de lecture repart de zéro quand on navigue sans suivre un renvoi (comme dans Codex).
- L'instrument de l'art. 111 ne calcule ni le siège vacant, ni la voix prépondérante, ni les exceptions
  de l'al. 7 ; il le dit (chaîne 12, validée par l'auteur le 2026-11-24, `docs/lot1/CHAINES.md`).
- Non vu fonctionner : Safari, Firefox, un vrai téléphone ; la fluidité à 60 images/s de la bascule.

## Propagation
- `portail/index.html` : `vConstitution()` réduit à un point d'accroche ; ancien lecteur retiré ;
  routeur, langue et écriture confiés au lecteur sur sa page ; `artLink` et `routePlace` lisent
  `core.json` ; recherche unifiée ; lien d'évitement.
- `scripts/build_portail.py`, `scripts/textes.py` (lit aussi `portail/js/*.js`),
  `.github/workflows/pages.yml` ; `CLAUDE.md`.
