# Trois directions visuelles : point d'arrêt

Rien n'est implémenté dans `portail/`. Les trois prototypes sont des pages autonomes de
`docs/audit/`, construites par `build_protos.py` depuis `portail/data/*.json` : une mini-grille
de six États et leur fiche (Lika, Soli, Torlak, Usora, Vrhbosna, Zlatibor, les six États
territoriaux qui ont un blason). Emblème, drapeaux, blasons et carte sont les assets du portail ;
aucun n'est redessiné.

Les trois partagent le même socle, qui répond aux constats indépendants du style :
palette canonique seule, textes alternatifs des drapeaux, lien d'évitement, focus porté au titre
après navigation, titre d'onglet par page, chiffres clés en tête, liens précédent et suivant,
bouton de copie du lien, cibles de 44 px, aucun texte sous 12 px.

## Les directions

### 1. Chancellerie (`proto-1.html`)

**Intention.** Le registre officiel : fond blanc, en-tête bleu `#374078` coiffé d'un filet rouge
et souligné d'un filet or, surtitres rouges, chiffres bleus. C'est l'esprit « institutionnel
suisse » actuel, ramené à la palette canonique et à une hiérarchie nette : drapeau à gauche,
nom et note à droite, quatre chiffres clés sur toute la largeur, puis blason et carte.

- Force : la plus lisible, la plus proche de l'existant, la moins risquée dans les quatre langues.
- Limite : sobre au point d'être peu mémorable dans un fil de réseau social.
- Neutres dérivés : encre `#1b2030`, gris `#565c6e`, filet `#d7d9e4`, tous tirés du bleu.

### 2. Pavillon (`proto-2.html`)

**Intention.** La page est construite comme le drapeau civil : une bande rouge au guindant, qui
porte le code de l'État à la verticale, et un champ bleu où le nom s'écrit en très grand, blanc.
Viennent ensuite une bande blanche de chiffres rouges sous filets or, puis une bande bleue pour
le blason et la carte. Bleu, blanc, bleu : l'identité vient de la structure, sans ornement.

- Force : immédiatement reconnaissable, forte sur mobile, donne aux 48 fiches sans film une
  ouverture à la hauteur des 6 qui en ont un (constat C-2).
- Limite : le nom en très grand supporte mal les noms longs (« Dubrovačka Republika »,
  « Kosovo i Metohija » en cyrillique) ; il faudra une taille adaptative. Le rouge et le bleu
  se touchent (contraste 1,44) : aucun texte ne doit jamais passer de l'un à l'autre.
- Neutres dérivés : les mêmes que la direction 1.

### 3. Atlas (`proto-3.html`)

**Intention.** La carte d'abord, sur fond sombre : la fiche s'ouvre sur la carte de la
Confédération, l'État en or. Le drapeau, le blason et un panneau « parmi les 48 États
territoriaux » (rang et barre pour la population, le PIB et la superficie, calculés depuis
`stats.json`) suivent en trois colonnes. C'est le style de `#/map` étendu à tout le portail,
ce qui règle l'écart V-8.

- Force : unifie la carte et le reste, valorise les données, l'or sur bleu nuit est très lisible
  (10,6:1).
- Limite : la plus éloignée de l'existant et du registre institutionnel ; le thème clair devient
  secondaire ; les drapeaux à fond sombre se détachent moins bien ; l'effort est le plus élevé.
- Neutres dérivés : fond `#141a33`, panneau `#1d2547`, filet `#3b4571`, texte secondaire
  `#c3c8dc`, tous tirés du bleu.

## Animations

Le cadre est l'ADR `2026-10-23-glissement-sections.md` : un seul glissement de 620 ms, rien
d'autre ne s'anime à l'arrivée, l'apparition au défilement de ce qui est sous l'écran est conservée.

| Animation | 1 | 2 | 3 | Technique | ADR |
|---|---|---|---|---|---|
| Glissement entre routes, 620 ms | oui | oui | oui | View Transitions, existant | conforme |
| **Drapeau partagé** : la vignette de la grille devient le drapeau de la fiche pendant le glissement | oui | oui | oui | `view-transition-name`, une dizaine de lignes de JS natif pour poser le nom sur la bonne vignette | **demande un amendement** : c'est un second mouvement pendant le glissement |
| Apparition au défilement du blason et de la carte (sous l'écran seulement) | oui | oui | oui | CSS pur, `animation-timeline: view()` ; sans prise en charge, rien ne bouge | conforme |
| Survol des cartes de la grille (soulèvement de 3 px, bordure) | oui | oui | oui | CSS, 140 ms, `hover: hover` seulement | conforme |
| Survol des régions de la carte | oui | oui | oui | CSS, 150 ms | conforme |
| Barres de rang qui se remplissent en entrant à l'écran | | | oui | CSS pur, liée au défilement | conforme (même règle que les grands chiffres) |

Toutes sont neutralisées sous `prefers-reduced-motion: reduce`. Aucune ne retarde le contenu :
le texte est présent dès le premier rendu, les animations liées au défilement partent d'un état
déjà lisible. Aucune bibliothèque.

Si tu refuses l'amendement, le drapeau partagé disparaît et le reste tient sans lui.

## Coût

Poids mesuré dans les prototypes ; effort estimé pour tout le portail (25 types de page).

| | 1. Chancellerie | 2. Pavillon | 3. Atlas |
|---|---|---|---|
| CSS propre à la direction (prototype) | 2,2 ko | 2,7 ko | 2,4 ko |
| Socle commun (prototype) | 4,9 ko de CSS, 2,8 ko de JS | idem | idem |
| Variation estimée du gabarit complet | de −5 à 0 ko (les jetons remplacent 99 couleurs et 67 tailles) | de 0 à +5 ko | de +10 à +15 ko, plus le calcul des rangs |
| Lot 1, fondations | 2 jours | 2 jours | 3 jours |
| Lot 2, composants | 3 jours | 4 jours | 6 jours |
| Lot 3, animations | 1 jour | 1 jour | 1,5 jour |
| Risque multilingue | faible | moyen (noms longs en grand) | faible |
| Risque de régression | faible | moyen | élevé (thème clair à refaire) |

Les estimations d'effort sont des ordres de grandeur, pas des mesures.

## Recommandation

**Direction 1 pour tout le portail, avec l'ouverture de la direction 2 sur les fiches d'État
sans film.**

La Chancellerie corrige les constats majeurs au moindre risque et garde le ton institutionnel
que tu as fixé. Seule, elle laisse les 48 fiches sans film un cran en dessous des 6 filmées.
Le bandeau Pavillon (guindant rouge, champ bleu, nom en grand, drapeau) leur donne une ouverture
de même tenue, et c'est la page qu'un visiteur venu d'un post voit en premier. Les deux
partagent les mêmes neutres, donc un seul jeu de jetons.

Je déconseille la direction 3 pour l'instant : elle est cohérente, mais elle refait le portail
plutôt qu'elle ne l'améliore, et elle dépend d'un chantier de performance de la carte (P-4)
qui n'est pas fait.

## Chaînes d'interface nouvelles

Toutes passeront par `L` et recevront leurs trois traductions avant fusion
(`textes.py check`). Je ne les ai pas traduites : elles sont à rédiger avec le glossaire, et je
te soumettrai celles dont la forme n'est pas évidente.

| Anglais | Où | Remarque |
|---|---|---|
| Skip to content | lien d'évitement | |
| Flag of {0} / Coat of arms of {0} | textes alternatifs | génitif du nom d'État dans les trois standards : **incertain**, à valider nom par nom ou à tourner sans génitif (« {0}: flag ») |
| Previous state / Next state | bas de fiche | « state » ne convient pas aux villes-États ni à Brčko et Mostar : libellé à décider |
| Copy link / Link copied | fiche | |
| Page not found, et sa phrase d'aide | route inconnue | |
| Titres d'onglet | 25 types de page | réemploi des titres déjà traduits |
| Among the 48 territorial states / Rank {0} of {1} | direction 3 seulement | |

## Décisions attendues

1. **Direction** : 1, 2, 3, ou la combinaison recommandée (1 + ouverture 2 sur les fiches).
2. **Drapeau partagé** : amender l'ADR du 23 octobre, oui ou non.
3. **Palette** (constat V-1) : l'interface revient aux quatre couleurs canoniques et les trois
   neutres dérivés entrent dans `docs/canon/couleurs-symboles.md`. Recommandé : oui.
4. **Lot 0, partage et vitesse** (constats S-1, S-2, P-1, P-3) : adresses `s/<code>/` avec
   Open Graph, déploiement du build lié. Ce n'est pas du visuel, mais ce sont les trois
   constats bloquants. Recommandé : le faire avant le lot 1, en une PR séparée.
5. **Thème sombre** : conservé tel quel et recalé sur les nouveaux jetons (recommandé), ou revu.

Ensuite, comme prévu : branche dédiée depuis `main`, commits atomiques, une PR par lot,
captures et Lighthouse avant et après dans chacune. Aucune PR vers `main` sans ton accord.
