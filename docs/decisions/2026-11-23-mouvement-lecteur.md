# ADR 2026-11-23 — Amendement du mouvement pour les pages refondues (lecteur de la Constitution)

## Statut
Accepté le 2026-11-17 par l'auteur : décision 3 de `proto/REPRISE.md` (branche `claude/proto-tour-2`),
« ADR d'amendement des transitions, limité aux trois pages : oui ». Lot 1 (`docs/lot1/PLAN.md`) : règle
complète pour `#/constitution` ; la carte (lot 2) et la page des votes (lot 3) y ajouteront la leur.

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
6. **Bascule d'écriture** (Lat / Ћир du portail, double ligne du lecteur) : glyphe par glyphe sur ce
   qui est à l'écran, en une vague diagonale (moins d'une seconde), le reste converti ensuite par
   tranches ; la ligne lue reste à sa hauteur. Double ligne : fondu de 200 ms.
7. **Mouvement réduit** (`prefers-reduced-motion: reduce`) : aucune transition de page ni élément
   partagé, aucun défilement doux, aucune animation au défilement ; bascule d'écriture par un fondu de
   200 ms dans l'alinéa même ; l'arrivée sur un article est un éclairage fixe de 2,6 s.
8. **Rien d'autre** ne s'anime à l'arrivée : la page entre déjà positionnée (sur l'article demandé ou
   sur l'alinéa tenu avant un nouveau rendu).

## Place réservée
- **Carte** (`#/map`, lot 2) : zoom continu Confédération → État → commune ; sa règle s'ajoutera ici.
- **Votes et majorités** (lot 3) : déroulé des votes joués pas à pas ; idem.

## Mise en œuvre
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
