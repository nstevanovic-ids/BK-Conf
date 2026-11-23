# ADR 2026-11-23 — Lecteur de la Constitution (#/constitution), repris du prototype Codex

## Statut
Accepté le 2026-11-16 par l'auteur : Codex (`proto/codex/`, branche `claude/proto-tour-2`) remplace le
lecteur de `#/constitution` (lot 1, `proto/REPRISE.md`). Plan du lot : `docs/lot1/PLAN.md`. Décisions
de l'auteur appliquées : texte français public (décision 5), péréquation non livrée en attendant la
révision de l'art. 132 (décision 6) ; recommandations du plan acceptées le 2026-11-23 (moteur de Sabor
porté dès ce lot, chaînes 1, 3, 5, 6, 9, 10 et 11 livrées, lien d'évitement, chaîne 12 soumise).

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
3. **Cinq textes** : anglais, zapadni, središñi, istočni (officiels, art. 151) et le texte de travail
   français (`docs/constitution/v4.md`), alignés unité par unité (alinéa, lettre, intertitre) dans une
   même grille. La colonne française porte une ligne : « French working text. The versions in the three
   regional standards are equally authentic (Art. 151). » (chaîne 11). Un à cinq textes sur écran large
   (au-delà, colonnes de 340 px défilant de côté, le premier texte et la marge restant en place) ; un
   seul sur écran étroit (onglets, balayage horizontal, même alinéa).
4. **Routes** : `#/constitution` (ouverture : titre, Journal officiel, préambule, puis les onze titres
   avec un trait par article ; amendé le 2026-11-23, voir plus bas) ; `/preamble` ; `/title-4` ; `/title-4/art-110` (inchangée) ;
   `/title-4/art-110/en-sre-fr` (textes). `art-110`, `art-1-bis`, un mauvais titre sont réécrits ; une
   adresse introuvable donne une vue « Not found » qui garde l'adresse et ouvre la recherche.
5. **Barre du lecteur** à la place du fil d'Ariane, collante sous l'en-tête : titre et article lus,
   textes affichés, double ligne, compteur, règle graduée (onze titres, un trait par article) ; fil de
   lecture des renvois suivis ; j / k.
6. **Langue et écriture** : celles du portail. Sur sa page, le lecteur garde l'alinéa lu quand la langue
   change ; ses cellules suivent chacune l'écriture de leur standard (središñi et istočni) et échappent
   à la conversion globale (`.cxl`, `.cxu` dans `cyrSkip`). Double ligne : `<ruby>`, chaque mot avec sa
   forme cyrillique dessous.
7. **Moteur unique** : `REGLES` (`portail/js/regles.js`, porté de `proto/sabor/js/rules.js`) calcule
   pour les instruments et pour la page Institutions (sièges). Vérification article par article :
   `docs/lot1/MOTEUR.md`, `scripts/test_regles.js` (au déploiement).
8. **Instruments de marge** (affichage de Codex, calcul du moteur) : art. 1 bis, 1 ter, 103, 109 b et
   110 ter, 110, 111, 115 bis. Ils écrivent leur résultat sur les alinéas, dans
   tous les textes affichés, et disent leurs hypothèses (« Assumption »). Pas d'instrument pour
   l'art. 132 tant que l'article n'est pas révisé.
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
- La double ligne garde des blancs irréguliers là où le mot cyrillique est plus large que le latin.
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
