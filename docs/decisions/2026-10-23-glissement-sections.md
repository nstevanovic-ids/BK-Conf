# ADR 2026-10-23 — Transition entre sections : un seul glissement vertical

## Statut
Accepté sous réserve de validation du rendu. Demande de l'utilisateur du 2026-10-23 :
« qu'il n'y ait qu'un glissement, comme une one page ».

## Constat
Un changement de section empilait jusqu'à quatre animations :
1. fondu enchaîné de toute la page, en-tête compris (View Transitions, 220 ms + 300 ms,
   décalage de 6 à 10 px) ;
2. `.reveal` : chaque section montait en fondu (500 ms, délais échelonnés) ;
3. `.io` : les enfants de chaque section visible remontaient ensuite en cascade
   (600 ms, +60 ms par enfant) ;
4. sur la fiche d'un État filmé : zoom de la vidéo (2,8 s) et montée du titre (0,8 s) ;
   sur l'accueil, comptage des grands chiffres depuis zéro.

## Décision
- **Un seul mouvement** : la page sortante et la page entrante glissent d'un bloc,
  verticalement, sans fondu, comme le défilement d'une one page. L'en-tête (et le filet
  rouge au-dessus) reste immobile ; les deux pages se suivent bord à bord sous lui (la
  zone qu'il occupe est retranchée des captures, variable `--vt-top`).
- **Sens** : ordre de la navigation principale (Home → Participation). Vers une section
  située après, le contenu monte ; vers une section située avant, il descend. À
  l'intérieur d'une section : fiches d'États dans l'ordre des codes, titres de la
  constitution dans leur ordre, sous-pages dans l'ordre de `ROUTES`
  (`routePlace()`, `placeCmp()`).
- **Durée** : 620 ms, courbe `cubic-bezier(.65,0,.35,1)` (accélération puis freinage,
  celle d'un défilement fluide).
- **Pas de glissement** au premier affichage, sur la même page (nouveau rendu), ni pour
  un renvoi vers un article du titre déjà affiché : simple défilement jusqu'à l'article.
  Un renvoi vers un article d'un autre titre glisse directement sur l'article.
- **Arrivée immobile** : ce qui est visible à l'arrivée entre avec le glissement, déjà
  en place. `.reveal` n'anime plus rien (la classe reste dans le balisage) ; le zoom et
  la montée du titre des films d'États sont retirés ; les grands chiffres et le schéma
  des institutions ne s'animent que s'ils entrent à l'écran en défilant.
- **Conservé** (mouvements internes aux pages, pas des transitions) : apparition au
  défilement des sections situées sous l'écran, vidéos et diaporamas en boucle,
  introduction du globe de la carte (une fois par session).
- `prefers-reduced-motion: reduce` ou navigateur sans View Transitions : changement de
  page instantané.

## Mise en œuvre
- `portail/index.html` : bloc CSS « transition entre sections » (noms `bk-header` et
  `bk-topline` sur `body>header` et `body>.topline`, animations `vt-next-*` et
  `vt-prev-*`, sens par `:root[data-vt]`) ; `render()` calcule le sens et pose
  `data-vt` et `--vt-top` avant `document.startViewTransition()`.
- `renderNow()` remonte en haut de page avant les montages (leurs mesures en dépendent)
  et positionne l'article de la constitution avant la capture (`cJump(id, true)`).

## Vérification
Chromium 153 (Playwright), 1366 × 820 et 390 × 844, thèmes clair et sombre : une seule
paire d'animations (`vt-*-out` / `vt-*-in`) pendant chaque transition, aucune
animation finie qui démarre à l'arrivée, sens correct sur 13 parcours (navigation,
fiches d'États, titres et articles de la constitution, mode réduit, clics en rafale).
