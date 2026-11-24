# Plan du lot 3 : Sabor → `#/votes` (« Votes and majorities »)

Rédigé le 24 novembre 2026 sur `claude/lot3-votes`, partie de `main` (5869445, lots 1 et 2 fusionnés). Copie
destinée au Projet claude.ai sous `claude/plan-lot3-votes.md` : les sessions cloud ne voient pas le Projet,
elles n'ont donc lu ni `claude/reprise-refonte-portail.md` ni `claude/plan-lot1-codex.md`. Lus à la place :
leurs copies versées (`docs/lot1/PLAN.md`, `docs/lot2/PLAN.md`), puis `CLAUDE.md` et `docs/canon/`, qui
priment, `docs/lot1/MOTEUR.md`, `docs/lot1/MESURES.md`, `docs/lot1/CHAINES.md`, `docs/lot2/PLAN.md`,
`docs/lot2/MESURES.md`, les quatre ADR du 2026-11-23 ; sur `claude/proto-tour-2` (dc71255) : `proto/sabor/`
(code, `build.py`, `NOTES.md`, `strings-new.json`) et `proto/critique-sabor.md`.

**Validé par l'auteur le 24 novembre 2026 (« go »)** : toutes les recommandations du plan sont retenues, y
compris le point 9 (lien dans la marge des articles qui fondent une règle) ; les chaînes proposées sont
livrées telles quelles. Cause trouvée en écrivant : les noms d'organes du point 4 sont remis au nom
središñi par `scripts/textes.py merge` lui-même (liste `NAMES`), d'où la correction de l'outil avec les
chaînes.

## Règles de la session

- Branche `claude/lot3-votes`, commits atomiques, **poussés après chaque commit**. Pas de sous-agents.
- Aucune fusion dans `main` sans accord explicite ; PR ouverte quand l'auteur la demande. Français de
  travail, masculin générique.
- Mesures et captures versées dans `docs/lot3/mesures/`, jamais laissées dans le conteneur.

## Décisions déjà prises (rappel)

Un seul moteur, `portail/js/regles.js` : les règles ne sont pas réécrites, on y ajoute les libellés (avec
leurs traductions) et ce qui manque à la page ; toute règle ajoutée est vérifiée contre le texte et entre
dans `scripts/test_regles.js` (227 vérifications aujourd'hui). Lectures du 24 novembre : majorité simple =
plus de pour que de contre, l'abstention ne compte pas ; double clé appliquée aussi aux six délégations sur
sept. Art. 132 : aucun instrument tant qu'il n'est pas révisé. Aucun code couleur par peuple : la couleur
ne code que pour, contre, abstention et le verdict, toujours doublée par la forme. Build lié, chargement
par page, recherche unifiée, lien d'évitement réutilisés ; d3-force chargé avec la page, jamais au
démarrage ; types de décision et cas dans la recherche. La page ne duplique ni la fiche d'État, ni le
lecteur, ni la carte, elle y renvoie ; disposition géographique sur `data/constitution/map.json`.
Instruments de `#/institutions` et des marges du lecteur : renvoi vers la page, réglée sur la règle
concernée. Règle de mouvement ajoutée à l'ADR 2026-11-23-mouvement-lecteur.md. Outils de
`docs/lot1/outils`, LCP < 2,5 s sur mobile, mesures données tenues ou non. Corrections : ✓ et ✕ sans texte,
commandes de délégation inaccessibles en disposition géographique, thème sombre non revu, glisser désactivé
sans le dire en mouvement réduit.

**État de l'art. 132, vérifié le 24 novembre** : inchangé depuis la v4.16 (9 novembre ; dernier commit sur
`docs/constitution/` : 36d009e). La formule reste renvoyée à la loi (a à e), le texte ne dit toujours pas
qui couvre l'écart entre plancher et plafond. **La péréquation de Sabor n'est pas intégrée** (`equal.js`,
`equalise()`, huit chaînes, hypothèse 10).

## Points à valider par l'auteur (recommandation en premier)

1. **Nom, route, place** — les trois champs de la consigne sont restés vides. Le plan est bâti sur la
   recommandation : nom public « Votes and majorities » (ZAP *Glasovaña in večine*, SRE *Glasaña i većine*,
   IST *Glasuvanija i mnozinstva*), route `#/votes`, rangée sous Institutions comme `#/council` (fil
   d'Ariane Home › Institutions › Votes and majorities, entrée Institutions active), pas de neuvième entrée de
   navigation. « Sabor » n'apparaît nulle part en public (code : `VOTES`, classes `vo-`). Un autre choix ne
   change que des noms et des adresses.
2. **Adresses** : `#/votes` (ouverture), `#/votes/<type>`, `#/votes/<type>/<cas>`, `#/votes/<type>/v-<code>`
   (vote composé, code de `REGLES.encode`, 35 caractères), suffixes `/map` (disposition géographique) et
   `/<CODE>` (disque sélectionné). Types en anglais lisible : `ordinary-law`, `consent`, `urgent-law`,
   `amendment`, `entrenched`, `popular-initiative`, `eight-states`, `twelve-states`, `council` ; cas :
   `consent-given`, `two-peoples`, `five-delegations`, `alarm`, `six-of-seven`, `nine-of-twelve`,
   `four-councillors`. Une adresse inconnue est réécrite vers la plus proche valide (`#/votes` au pire),
   comme sur la carte. Variante : les identifiants du moteur (`law`, `stinit`, `stref`…), plus courts mais
   opaques.
3. **Verdicts** : reprendre « Adopted » / « Not adopted » du lot 2 (mêmes mots que la couche de l'art. 110
   sur `#/map`, mêmes chiffres), « Suspended » nouveau ; pour les deux coalitions d'États (8 États,
   art. 106 bis d ; 12 États, art. 122), « Admissible » / « Not admissible », car une demande n'est pas
   « adoptée ». « Passes » / « Fails » de Sabor ne sont alors pas livrés (traductions données quand même).
   Variante : les trois mots génériques de Sabor partout.
4. **Noms des organes en zapadni et istočni** : l'ADR 2026-11-06-noms-officiels-traduits.md veut
   *Skupščina narodov* / *Sãbranie na narodite* et *Konfederalni svet* / *Konfederalen sãvet* ; or les entrées
   « Narodni Sabor » et « Konfederalno Veće » de `textes.json`, traduites ainsi en 97c5340, sont revenues au
   nom središñi en zap et en ist dans c0a292d et a9713fd (aucune explication dans ces commits). La page en
   ferait ses intitulés de jauges. Recommandation : rétablir les noms traduits (deux entrées) ; effet aussi sur
   le schéma d'Institutions (ligne de rôle « Assembly of Nations » masquée quand elle répète le nom), l'étape
   de la loi, le titre de `#/council` et le tableau du registre. Variante : garder l'état actuel et le dire
   dans l'ADR.
5. **Citations du texte** : la description d'un type et la ligne du verdict citent l'alinéa de la
   Constitution dans la langue de l'interface, avec le lien vers l'article (comme Sabor, point fort relevé par
   la critique). Source : les titres déjà générés du lecteur (`constitution/t/title-4.<lg>.json`, 9,5 ko gzip,
   et `title-8`, 1,7 ko), unités désignées par des ancrages nouveaux de `build_lecteur.py` (qui échoue si le
   texte change). Pas de chaîne à traduire, pas de copie : c'est le texte officiel. Une à deux unités par
   écran, jamais un article entier : ce n'est pas un second lecteur.
6. **Lectures du texte encore ouvertes** : hypothèses 2, 4, 5, 6, 7, 8 et le cas 47 sur 70 de
   l'hypothèse 3 (section « Hypothèses de calcul ») ; recommandation : les garder telles quelles, affichées.
7. **Hypothèse `present`, anglais retouché** : « Every member is present. Simple majority: more votes for
   than against; abstentions do not count. » (dit la lecture du 24 novembre) au lieu de « Every member is
   present; an abstention is not a vote cast. » ; et « Assumptions of the calculation » au lieu de
   « Assumptions of the instrument ».
8. **Abandons** : majorités minimales et indice de Banzhaf (hypothèse 11, deux chaînes) : la fiche d'État
   n'est pas touchée ; élément partagé disque → titre de la fiche (la fiche est une autre section, elle garde
   le glissement vertical) ; bascule glyphe par glyphe des titres (règle du portail hors lecteur : nouveau
   rendu).
9. **Facultatif, recommandé** : un lien « Votes and majorities » dans la marge des articles qui fondent une
   règle sans instrument (106, 106 bis, 121, 122, 123, 123 bis, 124, 147, 149, 150 ; table `ART_RULE` du
   moteur), même chaîne, aucun calcul. Non recommandé dans ce lot : un lien depuis la fiche d'État (critique
   I9) ou depuis les couches de `#/map`.

## Critique de Sabor, point par point

`NOTES.md` (second tour) donne l'état annoncé par les concepteurs. Les points qui comptent pour la page ont
été revérifiés le 24 novembre sur le prototype servi tel quel (`proto/sabor/`, http.server), Chromium
Playwright, mêmes cas que la critique (`docs/lot3/outils/verif-sabor.js`, résultats dans
`docs/lot3/mesures/0-prototype/verif.json`). Les vues que le portail a
déjà (répertoire, fiche, lecteur, palette, péréquation) sont « sans objet » : elles ne sont pas reprises.

| Point | Dans le prototype (constaté le 24 novembre) | Dans le portail |
|---|---|---|
| B1 répertoire masqué | Corrigé selon NOTES (non revérifié) | Sans objet : `#/states` reste |
| B2 chaînes non traduites | **Non corrigé** : réduit à 29 chaînes ; en SRE, 16 éléments en anglais visibles (490 caractères sur 2 157) | Corrigé : 29 chaînes traduites ici, plus les nouvelles ; `textes.py check` sans clé manquante |
| B3 commandes hors écran à 1440 × 900 | **Corrigé** : rangée des cas finie à y = 267, « Copy link » à y = 407, infobulle de KR-17 à y = 446–540, panneau de 744 px sans défilement interne. Reste : la rangée des cas défile sans indice, le 7e coupé à 1440 | Repris ; rangée des cas sur deux lignes au-dessus de 1024 px, défilement avec ombre de bord en dessous |
| B4 « Passes » malgré l'alarme | **Corrigé** : cas de l'alarme, dix États passés pour (212 sièges) : « Suspended », ligne = art. 109 b | Déjà dans `regles.js` (vérifié au lot 1) |
| B5 aucune carte | **Corrigé** : disposition « Map », 54 disques, 0 chevauchement, fond de carte ; contour dans la fiche | Repris sur `constitution/map.json` (mêmes projection et largeur) ; contour de la fiche : sans objet |
| I1 mobile, toucher = vote | **Corrigé** : toucher = sélection (BC-02 sélectionné, vote inchangé, fiche ouverte). Reste : à 375 px, 38 disques sous 24 px, 30 sans sigle | Repris (zone de toucher de 22 px, plus proche voisin) ; tableau accessible gardé |
| I2 péréquation trompeuse | Corrigé selon NOTES (indices seuls) | Sans objet : art. 132 non révisé |
| I3 lecteur pauvre | Partiel | Sans objet : le lecteur du lot 1 |
| I4 palette | Partiel | Sans objet : recherche du portail ; types et cas y entrent |
| I5 70 tabulations | **Corrigé** : 18 tabulations jusqu'au premier disque (en-tête de Sabor) | Repris : groupe radio des types, barre d'outils des cas ; lien d'évitement du portail mené à la scène sur `#/votes` ; recompté avec l'en-tête du portail |
| I6 pas à pas promis | **Corrigé** : « Step 1 of 4 », lecture automatique, Précédent / Suivant | Repris ; à l'arrivée par une adresse de cas, le cas s'ouvre à sa dernière étape, sans lecture (règle de mouvement) |
| I7 Konfederalno Veće | **Corrigé** : 7 sièges, aucun disque visible | Repris |
| I8 mouvement | Partiel : transitions à éléments partagés (disque ↔ fiche, sièges), jauges en place, bascule glyphe par glyphe des titres | Jauges en place et sièges repris ; disque ↔ fiche et glyphes abandonnés (point 8) ; règle dans l'ADR |
| I9 fiche → instrument | Corrigé selon NOTES | Sans objet (fiche non touchée), facultatif (point 9) |
| F1 768 px tronqué | Corrigé selon NOTES | À revérifier dans le portail (captures à 768) |
| F2 anglais approximatif | Partiel | « 1 States » et « 0.00 M » ne se posent plus (chaînes au pluriel du portail) |
| F3 sigles minuscules | Corrigé sur ordinateur ; en mobile, les plus petits sans sigle | Idem, sigle dans l'infobulle et le tableau |
| F4, F5 | Corrigés selon NOTES | Sans objet |
| F6, F7 conventions de majorité | Corrigés : hypothèse « tous présents » affichée, art. 106 cité | Hypothèse `present` retouchée (point 7) ; 47 sur 70 à confirmer (hypothèse 3) |
| F8 adresse inconnue | **Corrigé** : « Not found » | Réécriture vers l'adresse valide la plus proche (point 2) |
| F9 sigles en cyrillique | Corrigé (liste propre) | Liste `LAT_KEEP` du portail ; codes d'États en `translate="no"` |
| F10 glisser en mouvement réduit | **Non corrigé** : d3-force non chargé (bien), glisser sans effet (BC-02 reste « pour »), aucun avis | Corrigé : avis visible sous la légende et `aria-describedby` de la scène (chaîne A3) |
| ✓ ✕ sans texte (NOTES) | **Non corrigé** : marque `aria-hidden`, aucun texte de remplacement sur les jauges | Corrigé : texte masqué « Met » / « Not met » (chaînes A1, A2), verdict en toutes lettres |
| Commandes de délégation en carte (NOTES) | **Non corrigé** : en disposition carte, 0 des 27 boutons de délégation et 0 des 14 boutons de membres visibles | Corrigé : les rangées se replient en une liste de délégations sous la carte (mêmes boutons, même ordre de tabulation) |
| Thème sombre (NOTES) | **Non revu** : palette sombre propre à Sabor ; textes relevés entre 5,5 et 16,7 : 1 | Refait sur les jetons du portail (`[data-theme="dark"] .vo`), contraste contrôlé : texte ≥ 4,5 : 1, disques, hachures et filets ≥ 3 : 1 |

Ce que NOTES dit non modélisé reste non modélisé : approbation de l'État concerné (art. 150 e), vote
populaire après une demande de référendum (art. 122), vacance d'un siège (art. 111, chaîne 12 du lot 1). La
conciliation (art. 110 ter) a son calcul dans `regles.js` depuis le lot 1 ; la page la montre seulement par
la jauge des deux tiers (`k23`) et le renvoi à la marge de l'art. 110 ter.

## Architecture

- **Code de page**, chargé avec la route, comme le lecteur et la carte : `portail/js/votes.js` (`VOTES`,
  script classique, classes `vo-`), `portail/css/votes.css` (tout sous `.vo`, rien de global). API pour le
  routeur : `VOTES.prepare(h)`, `html(h)`, `mounted()`, `inplace(h)`, `rerender()`, `leave()`.
- **Moteur** : `REGLES.contexte(STATES, STATS, PEUPLES)` donne sièges, registres, rattachement de Brčko et
  Mostar ; `evaluate`, `encode` / `decode`, `setGroup`, `blank`. Ajouts : `SCENARIOS` (les sept cas de
  Sabor, données pures) et `LIB` (libellés : clés anglaises marquées `N()` pour types, organes, lignes de
  verdict, hypothèses, verdicts ; aucune traduction dans le moteur, la page passe par `L`). `marges.js` lit
  ses hypothèses `reg`, `sl`, `al`, `exc` dans `LIB` (une seule source).
- **Données** (rien de nouveau à générer) : socle ; `stats.json` ; `constitution/core.json` (liens d'articles,
  ancrages) ; à la préparation, `constitution/t/title-4.<lg>.json` et `title-8.<lg>.json` (citations) ;
  `constitution/map.json` à l'entrée en disposition géographique (ou à la préparation si l'adresse finit
  par `/map`), préchargé au repos sinon. Dans le fichier unique, ces fichiers viennent de `CX_DATA` (déjà
  embarqués).
- **d3-force** : les quatre fichiers UMD officiels de npm (`d3-dispatch` 3.0.2, `d3-quadtree` 3.0.2,
  `d3-timer` 3.0.2, `d3-force` 3.0.1, ≈ 16 ko minifiés), dans `portail/vendor/`, intégrité notée dans
  `vendor/README.md`, scripts classiques (le portail n'a pas de modules ES hors MapLibre). Chargés par
  `need()` au repos après le premier rendu de `#/votes`, ou au premier geste ; jamais en mouvement réduit ;
  le fichier unique les embarque (`VENDOR`). Le paquet ES de Sabor (esbuild) est abandonné.
- **Routeur** : `ROUTES.votes = [vVotes, '#/institutions']`, placé après `council` (glissement horizontal
  depuis Institutions) ; `DATA_ROUTE.votes = ['core', 'stats', 'js/regles.js', 'js/votes.js', 'css/votes.css']` ;
  `render()` attend `VOTES.prepare(h)` ; même page → `VOTES.inplace(h)` ; changement de langue ou
  d'écriture → `VOTES.rerender()` (libellés remplacés, scène gardée) ; préchargement dans le `<head>` pour
  `#/votes` (core, stats, code, titres 4 et 8 de la langue). La composition s'écrit dans l'adresse par
  `history.replaceState` (pas de `hashchange`, pas d'entrée d'historique par geste).

## La page

- En-tête : fil d'Ariane, titre « Votes and majorities », chapeau (chaîne N2).
- Commandes : types en groupe radio (neuf, un arrêt de tabulation, flèches), cas en barre d'outils (sept,
  nom du cas et son chiffre, par exemple « Five delegations without the two largest · 5 / 7 · 44,0 % »).
- Scène : disposition « Constituent peoples » (une rangée par peuple dans l'ordre de l'art. 110, puis
  territoires confédéraux et municipalités ; trois camps : pour, abstention, contre) ou « Map » (chaque
  disque au point intérieur de son État de `map.json`, chevauchements écartés, liste des délégations
  sous la carte) ; pour le Konfederalno Veće, sept sièges dont la surface suit les registres. Surface d'un
  disque = population (`stats.json`), plancher de lisibilité dit dans la légende.
- Panneau (collant à droite au-dessus de 1024 px, bandeau bas sur mobile) : verdict en toutes lettres et sa
  marque, ligne du verdict (chaîne ou citation), « Copy link », lien vers l'article, jauges (organe, seuil
  en signes, articles liés, valeurs, hypothèse), hypothèses repliées, pas à pas.
- Sous la scène : légende, avis du mouvement réduit, « Show the figures as a table » (54 lignes, trois
  boutons radio par ligne : l'alternative complète à la scène).
- Infobulle d'un disque : code, nom, peuple ou statut, population, sièges ; épinglée : trois boutons de
  vote et « Open state page » → `#/state/<code>`. La page ne montre rien d'autre de l'État.

## Renvois vers la page

| D'où | Vers | Chaîne |
|---|---|---|
| Institutions, « How a confederal law is made » (rail des cas) | le type du cas affiché (ordinary → `ordinary-law`, consent et refused → `consent`, alarm → `ordinary-law/alarm`, referendum → `twelve-states`, amendment → `amendment`) ; le lien suit le cas choisi | N1 + « → » |
| Institutions, sièges du Kongres | `ordinary-law` | idem |
| Institutions, démocratie directe | `popular-initiative`, `twelve-states` | idem |
| Institutions, révision | `amendment`, `entrenched` | idem |
| `#/council`, « How the council works » | `council/four-councillors` | idem |
| Marge, art. 110 (`dk110`) | `consent/v-<code>` : les délégations telles que l'instrument les montre | idem |
| Marge, art. 111 (`dk111`) | `council/v-<code>` : idem | idem |
| Marge, art. 109 b / 110 ter (`alarm`) | `ordinary-law/alarm` | idem |
| Marge, art. 103 (`sl`) | `ordinary-law` | idem |
| Marge, art. 115 bis (`reg`) | `consent` | idem |

Pas de renvoi depuis les marges des art. 1 bis et 1 ter (aucune règle de vote).

## Recherche

Une seule, celle du portail. `buildIndex()` reçoit neuf types (libellé du type, articles, organes de ses
jauges et ses hypothèses, en anglais et dans la langue) et sept cas (nom du cas, type), groupe « Votes and
majorities » ;
`SB_PAGES` reçoit la page (N1, N2). Aucune donnée de plus à l'ouverture : libellés tirés de `LIB` et de
`textes.json`, `regles.js` chargé avec la recherche (7 ko gzip) ou index des types écrit dans le gabarit
(à trancher à l'écriture selon le poids mesuré). « alarm », « uzbuna », « double », « 150 » trouvent le cas
ou le type ; un numéro d'article reste d'abord l'article.

## Accessibilité et thème (corrections demandées)

- **✓ ✕ ‖** : marque `aria-hidden`, texte masqué « Met » / « Not met » sur chaque jauge ; verdict en toutes
  lettres, annoncé par une région `aria-live` après chaque changement.
- **Disposition géographique** : les rangées se replient en liste de délégations sous la carte (nom, trois
  boutons, membres ±) ; mêmes boutons, même ordre ; contrôle : 27 boutons de délégation et 14 de membres
  atteignables au clavier dans les deux dispositions.
- **Thème sombre** : jetons `.vo` clair et sombre dérivés de la palette canonique (azur plein = pour, gueules
  hachuré = contre, contour pointillé = abstention ; verdict azur ✓, gueules ✕, or ‖ sur encre foncée) ;
  contrastes mesurés dans les deux thèmes, captures à 375 et 1440 px.
- **Mouvement réduit** : avis visible sous la légende (A3), relié à la scène par `aria-describedby`.
- Clavier repris de Sabor (flèches haut / bas d'un disque à l'autre, gauche / droite d'un camp à l'autre,
  Espace, Entrée vers la fiche, Échap) ; focus visible du portail ; lien d'évitement vers la scène.

## Mouvement (à ajouter à l'ADR 2026-11-23-mouvement-lecteur.md, section « `#/votes` »)

1. **Entrée et sortie** : glissement horizontal depuis `#/institutions` et `#/council` (même section),
   vertical depuis les autres sections ; règle d'origine.
2. **Adresses `#/votes/…`** : une même page ; le routeur délègue (`VOTES.inplace`), pas de glissement.
3. **Regroupement des unités** : un disque qui change de camp (clic, glisser, délégation entière, cas, type)
   rejoint son camp par la simulation de forces (d3-force, collision ; repos en 0,6 à 1,5 s, interrompu par
   tout geste) ; les cadres de groupe suivent ; les jauges glissent en 0,4 s, mises à jour en place.
4. **Passage d'une disposition à l'autre** : les 54 disques voyagent de leur camp à la place de leur État
   (forces plus raides, environ 1 s) ; rangées et cadres s'effacent en 0,32 s, le fond de carte apparaît en
   0,32 s ; l'inverse au retour.
5. **Konfederalno Veće** : les sept sièges changent de colonne par une transition à éléments partagés
   (`vo-seat-<peuple>`, 0,32 s, `data-vt="vo"` : pas d'animation de la page) ; les 54 disques s'effacent.
   Une seule transition à la fois : jamais pendant une transition du routeur.
6. **Pas à pas** : un cas choisi se joue une étape toutes les 1,9 s ; à chaque étape, les jauges de l'étape se
   remplissent ; Précédent ou Suivant arrêtent la lecture.
7. **Arrivée** : la page entre composée ; disques à leur place, la simulation démarre au repos (rien ne
   bouge) ; un cas ouvert par son adresse est à sa dernière étape, sans lecture automatique.
8. **Langue et écriture** : libellés remplacés d'un coup, scène immobile.
9. **Mouvement réduit** : d3-force non chargé ; grille stable ; un disque qui change de camp s'efface et
   reparaît à sa place (fondu de 140 ms) ; changement de disposition par une coupe et un fondu de 0,2 s ;
   jauges sans transition ; pas de lecture automatique (Suivant) ; pas de transition des sièges ; avis du
   glisser désactivé.

## Fichiers touchés

| Fichier | État | Contenu |
|---|---|---|
| `portail/js/votes.js` | nouveau | page : scène, dispositions, gestes, panneau, pas à pas, tableau, Veće, adresses |
| `portail/css/votes.css` | nouveau | styles sous `.vo`, thèmes clair et sombre, mouvement réduit |
| `portail/js/regles.js` | modifié | `SCENARIOS`, `LIB` ; aucune règle réécrite |
| `portail/js/marges.js` | modifié | hypothèses lues dans `LIB` ; renvois des instruments 103, 109 b, 110, 111, 115 bis |
| `portail/index.html` | modifié | `vVotes`, `ROUTES`, `routePlace`, `DATA_ROUTE`, préchargement, `render` / `inplace` / `leave` / `rerender`, `skipTo`, `SB_PAGES`, `buildIndex`, renvois d'Institutions et de `#/council` |
| `portail/vendor/d3-{dispatch,quadtree,timer,force}.min.js`, `vendor/README.md` | nouveau, modifié | bibliothèques UMD, intégrité npm |
| `portail/data/textes.json` | modifié | chaînes validées (section « Chaînes ») ; deux noms d'organes si le point 4 est accepté |
| `portail/data/constitution/core.json` | régénéré | ancrages des citations |
| `scripts/build_lecteur.py` | modifié | `ANCRES` : 106 (majorité, quorum), 106 bis (initiative, d, dépôt), 109 a, 121, 122 (demande, rejet), 123 bis, 124 (municipalités), 150 |
| `scripts/build_portail.py` | modifié | `VENDOR` + d3-force |
| `scripts/test_regles.js` | modifié | cas, seuils des types non encore testés, rattachement de Brčko et Mostar |
| `docs/lot1/outils/{mesure,dom,usage}.js` | modifié | routes `#/votes…` ; `dom.js` retire les positions de la scène avant comparaison |
| `docs/lot1/MOTEUR.md` | modifié | nouvelles vérifications, hypothèses validées |
| `docs/decisions/2026-11-2x-votes-majorites.md` | nouveau | ADR de la page |
| `docs/decisions/2026-11-23-mouvement-lecteur.md` | modifié | section `#/votes` (ci-dessus) |
| `docs/lot3/` | nouveau | `PLAN.md`, `CHAINES.md`, `MESURES.md`, `mesures/` |
| `CLAUDE.md` | modifié | architecture du portail, mouvement, recherche |

`proto/` n'est pas touché. `.github/workflows/pages.yml` ne change pas (`test_regles.js`, `textes.py check`,
contrôle des données du lecteur y sont déjà).

## Étapes de build

1. `python scripts/build_constitution.py` (→ `build_lecteur.py`) : ancrages nouveaux dans `core.json` ;
   échoue si un alinéa cité est introuvable ou ambigu.
2. `node scripts/test_regles.js` : moteur, cas compris.
3. `python scripts/textes.py extract` / `merge` / `check` (istočni rédigé en bulgare, aller-retour).
4. `python scripts/build_portail.py` (build lié) et `--inline` (export, d3-force embarqué).
5. Inchangés : `equilibre.py --check`, `build_carte.py --check`. Aucun générateur nouveau : `map.json`
   et les titres du lecteur existent déjà.

## Repris tel quel, réécrit, abandonné

**Tel quel** : `rules.js` (déjà porté dans `regles.js`) ; ses `SCENARIOS`, données pures ; de
`instrument.js` : rangées (`flow`), écartement géographique (`relax`), cibles et grille (`retarget`,
`placeGrid`), cadres de groupe (`caps`), simulation (`startSim`), gestes (`hit`, glisser, clavier, `nearest`),
pas à pas (`staged`, `tick`, `stepTo`), jauges construites une fois puis mises à jour en place (`gaugeHTML`,
`gaugeSet`), scène du Veće, tableau.

**Réécrit** : `instrument.js` → `votes.js` (module ES → script classique ; `S.C` → `REGLES.contexte` ;
`T` / `H` → `L` ; `artLink`, `fmtN`, `esc`, cyrillique et thème du portail ; citations depuis les titres du
lecteur ; `map.json` du portail ; adresses `#/votes/…` ; corrections d'accessibilité) ; `sabor.css` →
`votes.css` (parties de l'instrument seulement, préfixe `vo-`, jetons du portail, sombre refait) ;
`d3-force.min.js` → fichiers UMD officiels.

**Abandonné** : `app.js` (routeur, en-tête, langues, `glyphSwap`), `core.js` (données, cyrillique, `T`,
`fold` : ceux du portail), `state.js` (fiche, majorités minimales), `constitution.js` (lecteur),
`palette.js` (recherche), `equal.js` et `equalise()` (art. 132), `build.py` (sièges : moteur ; carte :
`build_carte_marge.py` ; citations : ancrages ; polices, drapeaux, chaînes : ceux du portail), `data/`,
`m/`, `sabor.min.css`, `index.html`, `flags/`, `fonts/`, `emblem.png`, `demo.mp4`. Les 23 entrées
`from_constitution` de `strings-new.json` ne deviennent pas des chaînes : les alinéas sont cités depuis les
données du lecteur, et seuls quatre termes courts deviennent des chaînes (section « Chaînes »).

## Commits (après validation)

1. Moteur : `SCENARIOS`, `LIB`, `marges.js` sur `LIB` ; tests : verdict et motif des sept cas recalculés
   indépendamment (registres, seuils), seuils de la loi urgente (126 sur 250, 36 sur 70, art. 123 bis),
   initiative (121, 124), coalitions (106 bis d, 122 : moitié au plus d'un peuple, villes-États neutres,
   Brčko et Mostar exclus), rattachement de Brčko et Mostar au territoire confédéral le plus proche calculé
   depuis `geo.json` (art. 124 al. 3), 2 pour et 248 abstentions = adoptée (lecture `present`) ;
   `MOTEUR.md`.
2. Ancrages des citations, `core.json` régénéré.
3. d3-force (quatre fichiers, intégrité), `build_portail.py`.
4. Page, disposition par délégation : routes, chargement, panneau, cas, tableau, Veće.
5. Disposition géographique (`map.json`), liste des délégations sous la carte.
6. Accessibilité, thème sombre, mouvement réduit.
7. Recherche (types, cas, page) ; lien d'évitement vers la scène.
8. Renvois : Institutions, `#/council`, marges du lecteur.
9. Chaînes (`textes.json`, `docs/lot3/CHAINES.md`) ; noms d'organes si validé.
10. Mesures (`docs/lot3/MESURES.md`, `mesures/`) et outils.
11. ADR de la page, amendement du mouvement, `CLAUDE.md`.

Mesures à trois moments : `main` (pages de contrôle), après le commit 4, fin du lot.

## Mesures et vérification

- Lighthouse 13.6 mobile simulé, servi en gzip (`serve.py`), médiane de trois passages : `#/votes`,
  `#/votes/consent/five-delegations`, `#/votes/consent/map`, `#/votes/council` ; contrôles `#/institutions`,
  `#/constitution`, `#/map`.
- **Budget LCP 2,5 s : probablement pas tenu.** Attendu 3,2 à 3,4 s, comme `#/constitution` (3,3 s) et
  `#/map` (3,3 s) : la page ajoute environ 30 ko gzip (code, styles, moteur, deux titres), mais le gabarit
  (118 ko gzip, le code de toutes les pages) et les polices (194 ko) restent. L'élément LCP sera le titre ou
  le chapeau. Le levier connu (sortir du gabarit le code des autres pages) est hors de ce lot sauf décision.
  TBT : d3-force au repos ; Sabor mesurait 40 à 370 ms sur l'accueil.
- Captures : `#/votes…` à 375, 768, 1440 px ; cinq langues et écritures ; thème sombre ; mouvement réduit ;
  non-régression des autres pages à 0,5 % de pixels près (`compare.py`).
- `dom.js` (fichier unique contre build lié, routes `#/votes…`, positions retirées), `usage.js` (données
  lues), `pages.json` (erreurs, débordement, un seul `h1`).
- Clavier : nombre de tabulations jusqu'au premier disque ; toutes les commandes dans les deux dispositions.
- Moteur : `test_regles.js` ; les chiffres de la page égaux à ceux de la marge de l'art. 110 et de la couche
  `#/map/art-110` (5 / 7, 44,0 % → refusé ; + Serbes : 6 / 7, 75,3 % → adopté).
- Fluidité : images par seconde pendant les sept cas joués (Chromium sans processeur graphique, 375 px,
  processeur ×4) ; ne remplace pas l'essai sur téléphone.

## Risques

- **Transitions concurrentes** : routeur, transitions des sièges et simulation ; un seul propriétaire par
  changement (`data-vt="vo"` seulement hors transition du routeur).
- **Adresse et historique** : `replaceState` à chaque geste ne doit pas relancer le routeur ; retour arrière
  vers un cas ou un type → `VOTES.inplace`.
- **d3 global** : les fichiers UMD de d3-force étendent `window.d3`, déjà créé par d3-array et d3-geo sur les
  fiches ; ordre de chargement à respecter (dispatch, quadtree, timer, force).
- **Citations** : l'ancrage par motif anglais vaut pour les cinq textes alignés ; un texte révisé fait
  échouer le build (voulu). Liens `cx-rf` des unités repris tels quels, stylés par `votes.css`.
- **Mobile** : 38 disques sous 24 px à 375 px ; bandeau bas et en-tête de 56 px ; toucher au plus proche
  voisin. Tableau accessible en recours.
- **Cyrillique** : la conversion globale du portail convertit libellés et citations (langue de
  l'interface) ; sigles et codes en `translate="no"`.
- **Noms d'organes** (point 4) : décision qui touche d'autres pages.
- **LCP** : voir plus haut.
- **Non vus fonctionner** : Safari (View Transitions dès iOS 18), Firefox, lecteur d'écran réel, téléphone.

## Essai sur un vrai téléphone (à faire par l'auteur)

1. `#/votes` en 4G : délai avant la scène, aucun saut de mise en page.
2. Jouer les sept cas : les disques rejoignent leur camp sans à-coups, jauges fluides.
3. Basculer « Constituent peoples » ↔ « Map » cinq fois : voyage des 54 disques, sans saccade.
4. Toucher les petits disques (Brčko, Mostar, Sarajevo, Zagreb) : sélection sans changer le vote, boutons
   de l'infobulle ; deux disques voisins : le bon est choisi.
5. En disposition carte : délégation entière (trois boutons) et membres ±.
6. Faire défiler la page pendant que la simulation tourne.
7. Konfederalno Veće : sièges qui changent de colonne.
8. Réglage « réduire les animations » du téléphone : rien ne bouge, avis du glisser visible.
9. Thème sombre ; SRE et IST en cyrillique ; paysage.
10. « Copy link », ouvrir le lien dans un autre onglet : même vote ; retour arrière depuis une fiche d'État.

Me dire pour chacun : fluide, saccadé (où), ou cassé.

## Chaînes

Istočni rédigé en bulgare cyrillique, converti par `scripts/textes.py` (`bg2lat`), aller-retour sans écart
pour toutes ; `check_one` sans erreur ni avertissement dans les trois standards (`docs/lot3/outils/chaines.py`,
sortie dans `docs/lot3/mesures/0-prototype/chaines.json`, bulgare cyrillique compris). Termes repris des
Constitutions traduites quand ils existent, article cité. Doutes marqués « ? ».

### Les 29 chaînes de `proto/sabor/strings-new.json`

| N° | Anglais | Statut proposé |
|---|---|---|
| 1 | Skip to content | déjà livrée (lot 1, `i18n.json`, clé `skip`) |
| 2 | Open in the instrument | abandonnée : les renvois portent le nom de la page (N1) |
| 3, 4, 6 à 11 | péréquation | en attente de la révision de l'art. 132 |
| 5 | Assumptions of the instrument | livrer, anglais retouché (point 7) |
| 12 à 14 | For / Abstention / Against | livrer |
| 15, 16 | Passes / Fails | abandonnées si le point 3 est accepté |
| 17 | Suspended | livrer |
| 18, 19 | Link copied / Copy link | livrer |
| 20, 21, 23 à 27 | hypothèses `bloc`, `present` (anglais retouché), `pop`, `mun`, `alarm`, `coal`, `cons` | livrer |
| 22 | hypothèse `reg` | abandonnée : remplacée par la chaîne 5 du lot 1 (même hypothèse, décision du lot 1) |
| 28, 29 | majorités minimales, Banzhaf | abandonnées (fiche d'État non touchée) |

1. **Skip to content** — ZAP Preskoči na vsebino · SRE Preskoči na sadržaj · IST Kãm sãdãržanieto (livrée).
2. **Open in the instrument** — ZAP Odpri v instrumentu · SRE Otvorite u instrumentu · IST Otvorete v instrumenta.
3. **Fiscal capacity per inhabitant is taken as proportional to GDP per capita, the only indicator of Article
   132 a published for every State.** (art. 132 a : *fiskalna zmogļivost*, *fiskalni kapacitet*, *fiskalen kapacitet*)
   - ZAP Fiskalna zmogļivost na prebivalca je vzeta kot sorazmerna z BDP na prebivalca, edinim kazalnikom iz člena 132 a, ki je objavļen za vsako državo.
   - SRE Fiskalni kapacitet po stanovniku uzima se kao proporcionalan BDP-u po stanovniku, jedinom pokazateļu iz člana 132 a koji je objavļen za svaku državu.
   - IST Fiskalnijat kapacitet na žitel se priema za proporcionalen na BVP na žitel – edinstvenijat pokazatel ot člen 132 a, publikuvan za vsjaka dãržava.
4. **Confederal average = 100** (art. 132 b) — ZAP Konfederalno povprečje = 100 · SRE Konfederalni prosěk = 100 ·
   IST Sredno konfederalno ravnište = 100.
5. **Assumptions of the instrument** → proposé **Assumptions of the calculation** (point 7) — ZAP Predpostavke
   izračuna · SRE Pretpostavke izračunavaña · IST Dopuskanija pri izčisļavaneto. (« Assumption » du lot 1 :
   Predpostavka, Pretpostavka, Dopuskane.)
6. **The confederal average is that of the 52 States, weighted by population, before equalisation. Brčko and
   Mostar are not States.**
   - ZAP Konfederalno povprečje je povprečje 52 držav, tehtano s prebivalstvom, pred izravnavo. Brčko in Mostar nista državi.
   - SRE Konfederalni prosěk računa se za 52 države, prema broju stanovnika, prě izravnaña. Brčko i Mostar nisu države. (*ponderisan / ponderiran* évité, comme au lot 1)
   - IST Srednoto konfederalno ravnište e tova na 52-te dãržavi, pretegleno s naselenieto, predi izravñavaneto. Brčko i Mostar ne sa dãržavi.
7. **Every contributor gives the same fraction of its surplus, never more than the ceiling. What the ceiling
   leaves uncovered falls to the Confederation, since the floor is guaranteed without reservation.** ? Contenu
   à revoir avec la révision : le texte ne dit pas qui couvre l'écart (chaîne 8 du lot 1).
   - ZAP Vsaka država plačnica prispeva enak delež svojega presežka, nikoli več od zgorñe meje. Kar zgorña meja ne pokrije, gre v breme Konfederacije, saj je spodña meja zajamčena brez pridržka.
   - SRE Svaka država koja doprinosi daje isti děo svog viška, nikad više od gorñe granice. Ono što gorña granica ne pokrije pada na teret Konfederacije, jer je doña granica zajamčena bez zadrške.
   - IST Vsjaka dãržava vnositel dava ednakva čast ot previšenieto si, nikoga poveče ot gornata granica. Tova, koeto gornata granica ne pokriva, ostava za smetka na Konfederacijata, tãj kato dolnata granica e garantirana bezuslovno.
8. **Result of the model: with a ceiling of {0}, the contributors fund {1} of what a floor of {2} requires.**
   - ZAP Izid modela: pri zgorñi meji {0} države plačnice pokrijejo {1} tega, kar zahteva spodña meja {2}.
   - SRE Rezultat modela: uz gorñu granicu od {0} države koje doprinose pokrivaju {1} onoga što zahtěva doña granica od {2}.
   - IST Rezultat ot modela: pri gorna granica {0} dãržavite vnositeli pokrivat {1} ot tova, koeto iziskva dolna granica {2}.
9. **Receives** — ZAP Prejema · SRE Prima · IST Polučava.
10. **Contributes** (art. 132 c : *država plačnica*, *država koja doprinosi*, *dãržava vnositel*) — ZAP Prispeva ·
    SRE Doprinosi · IST Vnasja.
11. **of the surplus** (art. 132 c : *presežek*, *višak*, *previšenie*) — ZAP presežka · SRE viška · IST ot previšenieto.
12. **For** — ZAP Za · SRE Za · IST Za.
13. **Abstention** — ZAP Vzdržani · SRE Uzdržani · IST Vãzdãržali se. ? Forme des procès-verbaux de vote
    (« vzdržani », « uzdržani », « въздържали се ») plutôt que le nom abstrait.
14. **Against** — ZAP Proti · SRE Protiv · IST Protiv.
15. **Passes** — ZAP Uspe · SRE Uspěva · IST Uspjava. ? (voir point 3)
16. **Fails** — ZAP Ne uspe · SRE Ne uspěva · IST Ne uspjava. ? (voir point 3)
17. **Suspended** — ZAP Zadržano (art. 109 b : *se zakon zadrži*) · SRE Obustavļeno (art. 109 b et 111 :
    *obustavļa se*) · IST Sprjano (art. 109 b et 111 : *se spira*). ? En zapadni, l'art. 111 dit *se izvršitev
    odloži* : « Zadržano » vaut pour la loi, moins pour une décision du Veće.
18. **Link copied** — ZAP Povezava je kopirana · SRE Link je kopiran · IST Vrãzkata e kopirana (*povezava*,
    *link*, *vrãzka* : termes du parcours citoyen).
19. **Copy link** — ZAP Kopiraj povezavo · SRE Kopirajte link · IST Kopirajte vrãzkata (impératif des boutons
    existants de chaque standard).
20. **The delegates of a State vote together, as their State is placed.** (`bloc`)
    - ZAP Delegati posamezne države glasujejo skupaj, tako kot je postavļena ñihova država.
    - SRE Delegati jedne države glasaju zajedno, onako kako je postavļena ñihova država.
    - IST Delegatite na edna dãržava glasuvat zaedno, kakto e postavena dãržavata im.
21. **Every member is present. Simple majority: more votes for than against; abstentions do not count.**
    (`present`, anglais retouché, point 7 ; art. 106 et 110 : *navadna večina*, *prosta većina*, *obiknoveno
    mnozinstvo*)
    - ZAP Vsi člani so navzoči. Navadna večina: več glasov za kot proti; vzdržani glasovi se ne štejejo.
    - SRE Svi članovi su prisutni. Prosta većina: više glasova za nego protiv; uzdržani glasovi se ne računaju.
    - IST Vsički členove prisãstvat. Obiknoveno mnozinstvo: poveče glasove „za“, otkolkoto „protiv“; vãzdãržalite se ne se brojat.
    - Anglais d'origine, si l'auteur le garde (*Every member is present; an abstention is not a vote cast.*) :
      ZAP Vsi člani so navzoči; vzdržani glas ni oddan glas. · SRE Svi članovi su prisutni; uzdržani glas nije
      dat glas. · IST Vsički členove prisãstvat; vãzdãržaneto ne e podaden glas.
22. **Registers: population of the territorial States attached to each people, as no register count exists
    yet.** (`reg`, abandonnée au profit de la chaîne 5 du lot 1)
    - ZAP Registri: prebivalstvo teritorialnih držav, ki pripadajo posameznemu narodu, ker letnega štetja še ni.
    - SRE Registri: stanovništvo teritorijalnih država koje pripadaju svakom narodu, jer godišñe prebrojavañe još ne postoji.
    - IST Registri: naselenieto na teritorialnite dãržavi, koito prinadležat na vseki narod, tãj kato vse ošte ñama godišen otčet.
23. **The voters of a State all vote as their State is placed; the weight is the resident population.** (`pop` ;
    art. 121 : *glasujoči*, *birači koji su glasali*, *glasuvalite*)
    - ZAP Vsi volivci posamezne države glasujejo tako, kot je postavļena ñihova država; utež je ñeno prebivalstvo.
    - SRE Svi birači jedne države glasaju onako kako je postavļena ñihova država; težina je broj ñenih stanovnika.
    - IST Vsički izbirateli na edna dãržava glasuvat, kakto e postavena dãržavata im; težestta e nejnoto naselenie.
24. **Brčko and Mostar vote with Sarajevo, the nearest confederal territory (Art. 124).** (`mun` ; art. 124 al. 3)
    - ZAP Brčko in Mostar glasujeta s Sarajevom, najbližjim konfederalnim ozemļem (čl. 124).
    - SRE Brčko i Mostar glasaju zajedno sa Sarajevom, najbližom konfederalnom teritorijom (čl. 124).
    - IST Brčko i Mostar glasuvat zaedno sãs Sarajevo, naj-blizkata konfederalna teritorija (čl. 124).
25. **A member placed against votes the alarm motion.** (`alarm` ; art. 109 b : *alarmni predlog*, *zahtěv za
    uzbunu*, *alarmeno iskane*)
    - ZAP Član, postavļen med glasove proti, glasuje za alarmni predlog.
    - SRE Član postavļen među glasove protiv glasa za zahtěv za uzbunu.
    - IST Člen, postaven sred glasovete „protiv“, glasuva alarmeno iskane.
26. **The coalition is the set of States placed in favour; a confederal territory belongs to no people.** (`coal`)
    - ZAP Koalicijo sestavļajo države, postavļene med glasove za; konfederalno ozemļe ne pripada nobenemu narodu.
    - SRE Koaliciju čine države postavļene među glasove za; konfederalna teritorija ne pripada nijednom narodu.
    - IST Koalicijata se sãstoi ot dãržavite, postaveni sred glasovete „za“; konfederalnata teritorija ne prinadleži na nito edin narod.
27. **Consensus: no councillor against.** (`cons` ; art. 111 : *soglasje*, *konsenzus*, *konsensus* ; *svetnik*,
    *većnik*, *sãvetnik*) — ZAP Soglasje: noben svetnik ni proti. · SRE Konsenzus: nijedan većnik nije protiv. ·
    IST Konsensus: nito edin sãvetnik ne e protiv.
28. **Share of the possible votes of the Kongres in which its delegates decide the outcome.** (abandonnée)
    - ZAP Delež možnih glasovañ v Kongresu, v katerih ñeni delegati odločijo izid.
    - SRE Uděo mogućih glasaña u Kongresu u kojima ñeni delegati odlučuju o ishodu.
    - IST Djal ot vãzmožnite glasuvanija v Kongresa, v koito nejnite delegati rešavat izhoda.
29. **Exact count over every alignment of the other 53 constituencies. It also belongs to {0} of the minimal
    majorities of 126 seats ({1} of {2}).** (abandonnée)
    - ZAP Natančno štetje vseh razporeditev drugih 53 volilnih enot. Država je tudi v {0} minimalnih večin s 126 sedeži ({1} od {2}).
    - SRE Precizno prebrojavañe svih rasporeda ostalih 53 izborne jedinice. Država je i u {0} minimalnih većina od 126 mandata ({1} od {2}).
    - IST Točno prebrojavane na vsički razpoloženija na ostanalite 53 izbiratelni rajona. Dãržavata učastva i v {0} ot minimalnite mnozinstva ot 126 mesta ({1} ot {2}).

Au središñi, doublets serbe / croate évités : *tačan / točan* (→ *precizan*), *ponderisan / ponderiran*,
*važi / vrijedi* (→ *priměñuje se*), *dugme / gumb* et *taster / tipka* (→ *klik*, *strelice*), *šta / što*.

### Chaînes nouvelles hors des 29 (soumises comme la chaîne 12 du lot 1)

- **N1 Votes and majorities** — ZAP Glasovaña in večine · SRE Glasaña i većine · IST Glasuvanija i mnozinstva.
- **N2 Place the States, the national delegations and the councillors, and see which majority the
  Constitution requires: each threshold cites its article, and every assumption is stated.** (chapeau)
  - ZAP Razporedite države, narodne delegacije in svetnike ter poglejte, kakšno večino zahteva Ustava: pri vsakem pragu je naveden ñegov člen, vsaka predpostavka je izrecno navedena.
  - SRE Rasporedite države, narodne delegacije i većnike i pogledajte kakvu većinu zahtěva Ustav: uz svaki prag naveden je ñegov član, a svaka pretpostavka je izričito navedena.
  - IST Razpredelete dãržavite, narodnite delegacii i sãvetnicite i vižte kakvo mnozinstvo iziskva Konstitucijata: kãm vseki prag e posočen členãt mu, a vsjako dopuskane e izrično posočeno.
- **Noms des sept cas** (recherche et boutons ; Sabor ne nommait les cas que par leur chiffre) :
  - C1 **Consent given by five delegations** — ZAP Soglasje petih delegacij · SRE Pristanak pet delegacija · IST Sãglasie na pet delegacii.
  - C2 **Two peoples alone** — ZAP Samo dva naroda · SRE Samo dva naroda · IST Samo dva naroda.
  - C3 **Five delegations without the two largest** — ZAP Pet delegacij brez dveh največjih · SRE Pet delegacija bez dvě najveće · IST Pet delegacii bez dvete naj-golemi.
  - C4 **One delegation raises the alarm** — ZAP Ena delegacija izglasuje alarmni predlog · SRE Jedna delegacija izglasa zahtěv za uzbunu · IST Edna delegacija glasuva alarmeno iskane (art. 109 b).
  - C5 **Six delegations of seven on an entrenched guarantee** — ZAP Šest od sedmih delegacij pri utrjenem jamstvu · SRE Šest od sedam delegacija za ojačanu garanciju · IST Šest ot sedemte delegacii pri zasilena garancija (art. 110 et 150).
  - C6 **Twelve States, nine of one people** — ZAP Dvanajst držav, devet istega naroda · SRE Dvanaest država, devet iz istog naroda · IST Dvanadeset dãržavi, devet ot edin i sãšt narod (art. 122).
  - C7 **Four councillors for, three against** — ZAP Štirje svetniki za, trije proti · SRE Četiri većnika za, tri protiv · IST Četirima sãvetnici „za“, trima „protiv“.
- **H6 The double key also applies to six delegations of seven: six are "at least five of the seven" (Art.
  110).** (hypothèse `six`, lecture du 24 novembre ; « double key » : chaînes existantes *dvojni kļuč*,
  *dvostruki kļuč*, *dvoen kļuč*)
  - ZAP Dvojni kļuč veļa tudi za šest delegacij od sedmih: šest je »najmañ pet od sedmih« (čl. 110).
  - SRE Dvostruki kļuč priměñuje se i na šest od sedam delegacija: šest je „najmañe pet od sedam“ (čl. 110).
  - IST Dvojnijat kļuč se prilaga i za šest ot sedemte delegacii: šest sa „pone pet ot sedemte“ (čl. 110).
- **A1 Met**, **A2 Not met** (texte des marques ✓ ✕) — ZAP Izpolñeno, Ni izpolñeno · SRE Ispuñeno, Nije ispuñeno ·
  IST Izpãlneno, Ne e izpãlneno.
- **A3 With reduced motion, the discs are not dragged: select one, then place it by clicking or with the arrow
  keys.**
  - ZAP Pri zmañšanem gibañu krogov ni mogoče vleči: izberite krog in ga postavite s klikom ali s puščicami.
  - SRE Uz smañeno kretañe krugovi se ne prevlače: izaberite krug, a zatim ga postavite klikom ili strelicama.
  - IST Pri namaleno dviženie krãgovete ne se vlačat: izberete krãg i go postavete s štrakvane ili sãs strelkite.
- **V1 Admissible**, **V2 Not admissible** (si le point 3 est accepté) — ZAP Dopustno, Ni dopustno · SRE
  Dopustivo, Nije dopustivo · IST Dopustimo, Nedopustimo.

### Termes repris des Constitutions traduites (chaînes, sans traduction nouvelle)

Titre ou terme de l'article, tel quel dans les quatre textes (v4.16) :

| Anglais | ZAP | SRE | IST | Article |
|---|---|---|---|---|
| Right of mandatory consent | Pravica obveznega soglasja | Pravo obaveznog pristanka | Pravo na zadãlžitelno sãglasie | 109 a |
| Urgent laws | Nujni zakoni | Hitni zakoni | Spešni zakoni | 123 bis |
| Entrenched guarantees | Utrjena jamstva | Ojačane garancije | Zasileni garancii | 150 |
| Conciliation | Usklajevañe | Usaglašavañe | Sãglasitelna procedura | 110 ter |

Les alinéas longs de `from_constitution` (106, 106 bis, 109 b, 110, 111, 121, 122, 123 bis, 124, 150) sont
cités depuis les titres du lecteur (point 5), pas copiés dans `textes.json` ; `132 b`, `132 c` et le nom de
l'art. 132 tombent avec la péréquation ; « Double majority » (124), « Alarm-bell procedure » (109 b) et le nom
de l'art. 111 ne servent plus (leur usage était dans la fiche et la péréquation de Sabor).

### Chaînes restaurées et reprises

- Restaurées de `textes.json` avant le lot 2 (4801ab8^), avec leurs traductions au pluriel : « {0} confederal
  territories », « {0} confederal municipalities » (en-têtes de rangées).
- Reprises telles quelles (161 des 164 chaînes du portail que Sabor emploie existent encore dans `textes.json`
  ou `i18n.json` ; des trois retirées au lot 2, deux sont restaurées ci-dessus, « {0} territorial states »
  ne sert plus) : noms des
  types (« Ordinary law », « Constitutional amendment », « Initiative », `h_initiative`, `h_referendum`),
  organes et jauges (« Kongres », « Narodni Sabor », « 7 delegations », « Registered citizens », « Citizens »,
  « States », « Alarm motion », « Constituent people », « Konfederalno Veće »), lignes de verdict (« No
  consent is needed and no alarm is raised. », « In force, with the consent of the peoples. », « Consent
  refused », « The law enters into force. », « The amendment enters the Constitution. », « Rejected by the
  people. », phrases du Veće de `#/council`), « Choose a case », « Step {0} of {1} », « Previous », « Next »,
  « Show the figures as a table », « Open state page », « Kongres seats », « Population », etc. ; hypothèses
  `reg` (chaîne 5), `sl` (9), `al` (10), `exc` (12) du lot 1.

## Hypothèses de calcul (`NOTES.md`, onze)

| N° | Hypothèse de Sabor | Clé du moteur | État |
|---|---|---|---|
| 1 | Registres : population des États territoriaux de chaque peuple, faute de relevé (art. 115 bis) | `reg` | **Tranchée** (MOTEUR.md ; chaîne 5 du lot 1, livrée) |
| 2 | Vote en bloc au Kongres : les délégués d'un État votent comme l'État est placé | `bloc` | **À valider** : contrainte d'un instrument dont l'unité est l'État ; MOTEUR.md la range dans « hypothèses de Sabor, inchangées, lot 3 » |
| 3 | Présence : tous présents ; l'abstention n'est pas un vote exprimé ; majorité simple = plus de pour que de contre ; majorité absolue des membres 126 sur 250 et 36 sur 70 ; deux tiers 167 sur 250, 47 sur 70, 7 sur 10 ; quorum toujours atteint | `present`, `al` | **Tranchée** pour la majorité simple et la présence (24 novembre, `present`) et pour 7 sur 10 et 167 sur 250 (chaîne 10, `al`). Les majorités absolues sont le texte (art. 123 bis : « of its members »), pas une hypothèse. **47 sur 70 à confirmer** : deux tiers « in plenary assembly » (art. 110 al. 6) comptés sur les membres, comme `al`, alors que la majorité simple l'est sur les voix exprimées (critique F7) |
| 4 | Vote populaire : les électeurs d'un État votent tous comme l'État est placé ; poids = population résidante (l'art. 124 fait l'inverse : le vote populaire détermine celui de l'État) | `pop` | **À valider** |
| 5 | Brčko et Mostar votent avec le territoire confédéral le plus proche à vol d'oiseau : Sarajevo pour les deux (117 et 75 km ; Beograd à 130 km de Brčko) | `mun` | **À valider** (MOTEUR.md : « lot 3 ») ; le moteur l'applique déjà (`MUN_AVEC`) ; le test recalculera les distances depuis `geo.json` |
| 6 | Motion d'alarme : un membre placé « contre » vote la motion | `alarm` | **À valider** |
| 7 | Coalitions d'États : les États placés « pour » ; une ville-État compte comme État et ne relève d'aucun peuple ; Brčko et Mostar ne comptent pas | `coal` | **À valider** (la neutralité des villes-États est le canon, `docs/canon/equilibre.md` ; le reste est lecture) |
| 8 | Consensus du Konfederalno Veće : aucun conseiller contre (et au moins un pour, dans le moteur) | `cons` | **À valider** : avec cette lecture, six pour et une abstention font un consensus |
| 9 | Double clé seulement là où le texte exige cinq délégations ; pas pour six | — | **Tranchée autrement** le 24 novembre : la double clé s'applique aussi aux six (`six`, chaîne H6) ; la lecture de Sabor n'est pas reprise |
| 10 | Péréquation : capacité fiscale ∝ PIB par habitant, moyenne pondérée, taux uniforme, écart à la charge de la Confédération | — | **Sans objet** : art. 132 non révisé |
| 11 | Majorités minimales et Banzhaf (fiche d'un État), vote en bloc, quota 126 | — | **Sans objet** si le point 8 est accepté (abandon) |

Tranchées ailleurs et reprises sans changement : `sl` (Sainte-Laguë et limites, chaîne 9), `exc` (art. 111 non
calculé, chaîne 12).
