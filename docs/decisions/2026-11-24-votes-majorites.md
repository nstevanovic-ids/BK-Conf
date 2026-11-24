# ADR 2026-11-24 — Page « Votes and majorities » (#/votes), reprise du prototype Sabor

## Statut
Accepté le 2026-11-24 par l'auteur : plan du lot 3 (`docs/lot3/PLAN.md`) validé (« go »), toutes ses
recommandations retenues. Décision 7 de `proto/REPRISE.md` (branche `claude/proto-tour-2`, nom, route et place
de la page Sabor), laissée ouverte au lot 1, tranchée selon la recommandation.

Le mouvement de la page est réglé par l'amendement de l'ADR 2026-11-23-mouvement-lecteur.md (section
« `#/votes` »). Amende l'ADR 2026-11-06-noms-officiels-traduits.md dans sa propagation (décision 9).

## Contexte
- Le prototype Sabor (`proto/sabor/`) montre un instrument : on compose un vote, les règles de la Constitution
  répondent jauge par jauge. Sa critique (`proto/critique-sabor.md`) a été reprise point par point et revérifiée
  sur le prototype (`docs/lot3/PLAN.md`, `docs/lot3/mesures/0-prototype/`).
- Son moteur (`proto/sabor/js/rules.js`) est déjà le moteur unique du portail (`portail/js/regles.js`, lot 1),
  vérifié contre le texte (`scripts/test_regles.js`, `docs/lot1/MOTEUR.md`).
- Le portail avait déjà le lecteur de la Constitution (lot 1), la carte (lot 2), les fiches d'États, la page
  Institutions et son rail « How a confederal law is made ».

## Décision
1. **Nom, route, place.** « Votes and majorities » (ZAP *Glasovaña in večine*, SRE *Glasaña i većine*, IST
   *Glasuvanija i mnozinstva*) ; route `#/votes` ; rangée sous Institutions comme `#/council` (fil d'Ariane
   Home › Institutions › Votes and majorities, entrée Institutions active), sans neuvième entrée de navigation.
   « Sabor » n'est pas un nom public : c'est celui d'un organe.
2. **Adresses.** `#/votes` (ouverture : le consentement donné par cinq délégations) ; `#/votes/<type>` (neuf
   types : `ordinary-law`, `consent`, `urgent-law`, `amendment`, `entrenched`, `popular-initiative`,
   `eight-states`, `twelve-states`, `council`) ; `#/votes/<type>/<cas>` (sept cas : `consent-given`,
   `two-peoples`, `five-delegations`, `alarm`, `six-of-seven`, `nine-of-twelve`, `four-councillors`) ;
   `#/votes/<type>/v-<code>` (composition, code de `REGLES.encode`) ; suffixes `/map` et `/<CODE>`. La
   composition s'écrit dans l'adresse par `history.replaceState` : un vote s'envoie par un lien. Une adresse
   inconnue est réécrite vers l'adresse valide la plus proche.
3. **Code de page**, chargé avec la route comme le lecteur et la carte : `portail/js/votes.js` (`VOTES`, script
   classique, classes `vo-`), `portail/css/votes.css` (tout sous `.vo`). Le portail appelle `VOTES.prepare`,
   `html`, `mounted`, `inplace`, `rerender`, `leave`.
4. **Un seul moteur.** `REGLES` calcule tout ; il reçoit les sept cas (`SCENARIOS`), l'adresse de chaque type,
   les alinéas qui le décrivent, et ses libellés (`LIB` : clés anglaises des chaînes, traduites dans
   `textes.json`). Aucune règle réécrite ; chaque cas et chaque seuil ajouté au test est recalculé à part contre
   le texte (336 vérifications). Les hypothèses de Sabor sont validées par l'auteur et affichées avec le
   résultat (`docs/lot1/MOTEUR.md`, section « Lot 3 »).
5. **Verdicts.** « Adopted », « Not adopted » (les mots de la couche de l'art. 110 sur `#/map`), « Suspended » ;
   pour les demandes d'États (art. 106 bis d, 122), « Admissible », « Not admissible ». Chaque verdict a sa
   marque (✓, ✕, ‖), aussi en texte pour les lecteurs d'écran, et sa ligne : une chaîne, ou l'alinéa du texte.
6. **Citations.** La règle d'un type et certaines lignes de verdict citent l'alinéa de la Constitution dans la
   langue de l'interface, lien vers l'article, depuis les titres déjà générés du lecteur
   (`constitution/t/title-4` et `title-8`) ; les alinéas sont désignés par des ancrages de
   `scripts/build_lecteur.py`, qui échoue si l'un d'eux change. Une ou deux unités, jamais un article entier.
7. **Ce que la page ne duplique pas.** De l'État, elle ne montre que code, nom, peuple ou statut, population et
   sièges, et renvoie à `#/state/<code>` ; du texte, les alinéas cités, et renvoie au lecteur ; de la carte, la
   disposition géographique sur les géométries de la marge du lecteur (`constitution/map.json`), sans en
   produire d'autres.
8. **Renvois vers la page**, réglée sur la règle concernée : le rail de la loi, les sièges, la démocratie directe
   et la révision d'Institutions ; `#/council` ; les instruments de marge du lecteur (art. 103, 109 b, 110,
   111, 115 bis ; pour 110 et 111, la composition montrée) ; la marge des articles qui fondent une règle sans
   instrument (106, 106 bis, 110 ter, 121 à 124, 123 bis, 147, 149, 150).
9. **Noms des organes.** `scripts/textes.py merge` remettait au nom središñi « Narodni Sabor », « Konfederalno
   Veće », « Ustavni Sud » et « Konfederalna Kancelarija » (liste `NAMES`), ce qui avait annulé leur traduction
   du 2026-11-06 ; ils passent dans une liste `ORGANS`, jamais réécrite, et reprennent les noms de l'ADR
   2026-11-06 (zapadni *Skupščina narodov*, *Konfederalni svet*… ; istočni *Sãbranie na narodite*,
   *Konfederalen sãvet*…). Le schéma d'Institutions n'affiche plus un rôle qui répète le nom.
10. **Aucun code couleur par peuple.** La couleur ne code que pour (azur plein), contre (gueules hachuré),
    abstention (contour pointillé) et le verdict ; la surface d'un disque suit la population, celle d'un siège
    du Veće le registre ; aucun peuple n'a de couleur.
11. **Accessibilité.** Types en groupe radio, cas en barre d'outils, scène en un arrêt de tabulation (flèches,
    Espace, Entrée, Échap) ; lien d'évitement vers la scène ; commandes de délégation atteignables dans les deux
    dispositions ; tableau des 54 entités avec trois boutons radio par ligne ; verdict annoncé (`aria-live`) ;
    en mouvement réduit, le glisser désactivé est dit.
12. **Bibliothèque.** d3-force 3.0.1 et ses dépendances (UMD de npm, `portail/vendor/`), chargés au repos après
    le premier rendu de la page, jamais au démarrage ni en mouvement réduit ; le fichier unique les embarque.
13. **Recherche.** Une seule, celle du portail : elle reçoit les neuf types et les sept cas.
14. **Art. 132.** Aucune péréquation tant que l'article n'est pas révisé (vérifié le 2026-11-24 : inchangé
    depuis la v4.16). L'instrument de Sabor, ses huit chaînes et son hypothèse sont laissés de côté.
15. **Abandonnés de Sabor** : routeur, en-tête, socle, palette, fiche d'État et majorités minimales, lecteur,
    péréquation, `build.py`, copies de données, de polices et de drapeaux, paquet ES de d3-force.

## Mesures
`docs/lot3/MESURES.md`.

## Limites
- Les hypothèses (vote en bloc au Kongres, vote populaire comme l'État est placé, consensus…) sont des choix de
  lecture affichés, pas le texte ; la conciliation (art. 110 ter) n'est montrée que par ses deux tiers.
- Non vus fonctionner : un vrai téléphone (fluidité, toucher des petits disques), Safari, Firefox, un lecteur
  d'écran réel.

## Propagation
- `portail/js/votes.js`, `portail/css/votes.css` (nouveaux) ; `portail/js/regles.js` (cas, libellés) ;
  `portail/js/marges.js` et `portail/js/constitution.js` (renvois) ; `portail/css/constitution.css` ;
  `portail/index.html` (route, données, préchargement, montage, recherche, lien d'évitement, renvois) ;
  `portail/vendor/` (d3-force) ; `portail/data/textes.json` ; `portail/data/constitution/core.json`.
- `scripts/build_lecteur.py` (ancrages), `scripts/build_portail.py` (`VENDOR`), `scripts/test_regles.js`,
  `scripts/textes.py` (`ORGANS`).
- `docs/lot1/MOTEUR.md`, `docs/lot1/outils/` (routes `#/votes`), `docs/lot3/`, ADR 2026-11-23-mouvement-lecteur.md,
  `CLAUDE.md`.
