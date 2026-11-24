# ADR 2026-11-23 — Amendement du mouvement pour les pages refondues (lecteur de la Constitution)

## Statut
Accepté le 2026-11-17 par l'auteur : décision 3 de `proto/REPRISE.md` (branche `claude/proto-tour-2`),
« ADR d'amendement des transitions, limité aux trois pages : oui ». Lot 1 (`docs/lot1/PLAN.md`) : règle
complète pour `#/constitution` ; la carte (lot 2) et la page des votes (lot 3) ont ajouté la leur.

Amende l'ADR 2026-10-23-glissement-sections.md (« un seul glissement, rien d'autre ne s'anime à
l'arrivée ») et l'ADR 2026-10-24-etats-en-tete-mobile.md, **pour les trois pages refondues seulement**.
Le reste du portail garde la règle d'origine.

## Contexte
- La règle du 23 octobre donne une seule animation par changement de page : un glissement de 620 ms,
  vertical entre sections, horizontal entre les pages d'une même section.
- Le prototype Codex ajoute des mouvements qui disent quelque chose du texte : un renvoi suivi garde
  son numéro d'article à l'écran ; la table des titres se dessine au défilement ; la bascule
  latin / cyrillique se fait glyphe par glyphe sur le texte lu.
- Deux moteurs de transition se gêneraient : celui du portail (`render()`) et celui du prototype.

## Décision : `#/constitution`
1. **Entrée et sortie** : le glissement vertical du portail, inchangé (la Constitution est une section
   de la navigation).
2. **Entre titres** (page précédente ou suivante, table des titres, onglet d'un titre) : le glissement
   horizontal du portail, inchangé, dans l'ordre des titres.
3. **Renvoi suivi vers un autre titre** (lien d'article dans le texte, dans « In the Constitution »,
   dans un aperçu) : pas de glissement ; le numéro d'article sur lequel on a cliqué devient le grand
   numéro de l'article d'arrivée (élément partagé `cx-artnum`, 420 ms), le reste de la page change
   sans animation. Le routeur du portail reste le seul propriétaire de la transition : le lecteur lui
   remet l'élément de départ (`CX.takeRef()`) et lui désigne celui d'arrivée (`CX.target()`).
   Cela remplace, pour ce cas, « un renvoi vers un article d'un autre titre glisse directement sur
   l'article ».
4. **Renvoi dans le titre affiché** : défilement jusqu'à l'article (doux, sauf au-delà de trois
   écrans), puis l'en-tête de l'article s'éclaire 1,6 s.
5. **Dans la page, au défilement** : sur l'ouverture, chaque ligne de la table des titres prend sa
   graisse et lève ses traits en entrant, se replie en sortant (animations pilotées par le défilement,
   `animation-timeline: view()`) ; dans la lecture, le numéro de l'article courant prend sa graisse
   (560 → 800) et la barre annonce l'article lu (0,5 s). La règle graduée se remplit.
6. **Bascule d'écriture** (barre du lecteur : SRE ↔ СРЕ, ИСТ ↔ IST) : glyphe par glyphe sur ce qui est
   à l'écran, en une vague diagonale (moins d'une seconde), le reste converti ensuite par tranches ; la
   ligne lue reste à sa hauteur. La bascule Lat / Ћир de l'en-tête ne change que l'interface (amendé le
   2026-11-24 : la double ligne est retirée).
7. **Mouvement réduit** (`prefers-reduced-motion: reduce`) : aucune transition de page ni élément
   partagé, aucun défilement doux, aucune animation au défilement ; bascule d'écriture par un fondu de
   200 ms dans l'alinéa même ; l'arrivée sur un article est un éclairage fixe de 2,6 s.
8. **Rien d'autre** ne s'anime à l'arrivée : la page entre déjà positionnée (sur l'article demandé ou
   sur l'alinéa tenu avant un nouveau rendu).

## Décision : `#/map` (amendement du 2026-11-23, lot 2, ADR 2026-11-23-carte-maplibre.md)
1. **Entrée et sortie** : le glissement vertical du portail, inchangé (la carte est une section de la
   navigation). Toutes les adresses `#/map/…` sont une même page : le routeur ne glisse pas entre elles et
   délègue à la carte (`MAPX.inplace`), qui ne redessine rien.
2. **Dans la carte** (Confédération, État, commune, couches) : pas de glissement. La caméra vole (MapLibre,
   courbe 1,3, de 0,9 à 2,4 s selon la distance, interrompue par tout geste) ; le feuillet change de contenu
   sans animation, sauf le nom de l'entité, qui passe de la ligne de liste au titre du feuillet (élément
   partagé `ca-name`, 0,32 s ; `data-vt="ca"` : pas de fondu de la page). Une seule transition à la fois.
3. **Arrivée depuis une autre page** (lien, recherche, fiche d'État) : la carte entre déjà cadrée sur l'État
   ou la commune, sans vol (règle d'origine : rien ne s'anime à l'arrivée). Le moteur, prêt après le premier
   rendu, prend la main de la silhouette par un fondu de 0,45 s.
4. **Au zoom**, les limites communales apparaissent de proche en proche depuis le point d'entrée (0,76 s,
   fondu de 0,3 s par commune) ; les libellés s'allument en 0,32 s.
5. **Changement d'indicateur** : fondu des couleurs de 0,48 s.
6. **Langue et écriture** : libellés de la carte remplacés d'un coup (pas de bascule glyphe par glyphe sur
   la carte) ; feuillet converti comme le reste du portail.
7. **Mouvement réduit** : aucun vol (cadrage direct, coupe de 0,2 s), communes d'un bloc, ni fondu des
   couleurs ni élément partagé ; le fil d'Ariane de la carte devient un indicateur de niveau numéroté.

## Décision : `#/votes` (amendement du 2026-11-24, lot 3, ADR 2026-11-24-votes-majorites.md)
1. **Entrée et sortie** : glissement horizontal depuis `#/institutions` et `#/council` (même section de la
   navigation, la page est rangée après `#/council`), vertical depuis les autres sections ; règle d'origine.
2. **Adresses `#/votes/…`** (type, cas, composition, disposition, disque choisi) : une même page. Le routeur ne
   glisse pas entre elles et délègue à la page (`VOTES.inplace`) ; la composition s'écrit dans l'adresse par
   `history.replaceState`, sans transition.
3. **Regroupement des unités** : un disque qui change de camp (clic, glisser, délégation entière, type, cas)
   rejoint sa place par une simulation de forces (d3-force : rappel vers la place, collision ; au repos en
   0,6 à 1,5 s, reprise par tout geste). La place est celle de la grille de son camp, la même avec ou sans
   animation : les disques voisins se rangent avec lui. Les cadres de groupe suivent ; les jauges glissent en
   0,4 s et sont mises à jour en place, rien n'est redessiné.
4. **Passage d'une disposition à l'autre** (« Constituent peoples » ↔ « Map ») : les 54 disques voyagent de
   leur camp à la place de leur État (point intérieur de `constitution/map.json`, chevauchements écartés),
   environ une seconde ; les camps se replient sous la carte en liste de délégations, les cadres s'effacent et
   le fond de carte apparaît en 0,32 s ; l'inverse au retour.
5. **Konfederalno Veće** : les sept sièges changent de colonne par une transition à éléments partagés (un nom
   par siège, posé le temps de la transition seulement ; 0,32 s ; `data-vt="vo"` : pas d'animation de la
   page). Une seule transition à la fois : jamais pendant un glissement du routeur. Les 54 disques s'effacent.
6. **Pas à pas** : un cas choisi se joue une étape toutes les 1,9 s ; à chaque étape, les jauges de l'étape se
   remplissent ; Précédent ou Suivant arrêtent la lecture.
7. **Arrivée** (lien, recherche, renvoi d'un article ou d'Institutions) : la page entre composée, disques à
   leur place ; la simulation, chargée au repos, part au repos (rien ne bouge avant le premier geste) ; un cas
   ouvert par son adresse est à sa dernière étape, sans lecture automatique.
8. **Langue et écriture** : la page est redessinée à l'identique, à la même hauteur ; rien ne bouge.
9. **Mouvement réduit** : d3-force n'est pas chargé ; grille stable ; un disque qui change de camp s'efface et
   reparaît à sa place (fondu de 140 ms) ; changement de disposition par une coupe et un fondu de 0,2 s ;
   jauges sans transition ; pas de lecture automatique (Suivant) ; pas de transition des sièges. Le glisser est
   désactivé et la page le dit, sous la légende (relié à la scène par `aria-describedby`).
10. **Abandonnés de Sabor** : l'élément partagé disque → titre de la fiche d'État (la fiche est une autre
    section : glissement vertical) ; la bascule glyphe par glyphe des titres (hors du lecteur, le portail
    redessine).

## Mise en œuvre
- `portail/js/votes.js` : simulation (`startSim`, `retarget`), grille du mouvement réduit (`placeGrid`),
  dispositions (`setMode`, `relax`), sièges (`seatMove`) ; `portail/css/votes.css` : `:root[data-vt="vo"]`,
  variantes du mouvement réduit.
- `portail/index.html` : `render()` attend les données de la route puis `CX.prepare()` ; même titre :
  `CX.inplace()` ; transition `data-vt="ref"` pour un renvoi suivi, avec le nom `cx-artnum` posé sur
  l'élément de départ puis sur celui d'arrivée.
- `portail/css/constitution.css` : `:root[data-vt="ref"]` (pas d'animation de la page), groupe
  `cx-artnum`, animations au défilement de la table des titres, numéro courant, bascule d'écriture,
  variantes du mouvement réduit.
- `portail/js/constitution.js` : arrivée (`land`, `arrive`), bascule (`switchScript`, `glyphSwitch`,
  `fadeSwitch`).

## Vérification
Chromium (Playwright) : renvoi de l'art. 110 vers l'art. 150 (titre VIII) avec `data-vt="ref"` ;
page suivante en glissement horizontal ; entrée et sortie en glissement vertical ; bascule SRE latin →
cyrillique et retour, l'art. 110 restant à 1 px près à sa hauteur ; mouvement réduit sans erreur.
