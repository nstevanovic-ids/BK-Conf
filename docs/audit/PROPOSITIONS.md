# Trois directions d'interface : point d'arrêt

Deuxième série, du 15 novembre 2026. La première série ne montrait qu'une fiche d'État et
tirait une direction de la structure du drapeau civil : elle est retirée.

Rien n'est implémenté dans `portail/`. Les prototypes sont des pages autonomes de `docs/audit/`,
construites par `build_protos.py`. Chacun montre les **mêmes quatre écrans** :

1. l'accueil (en-tête, navigation, hiérarchie des sections) ;
2. les États (recherche, filtres, 54 entités) ;
3. la Constitution, titre I (lecture longue) ;
4. une planche de composants (boutons, filtres, champ, fil d'Ariane, tableau, échelles, palette).

Un sélecteur bascule tout l'écran entre les cinq variantes : anglais, zapadni, središñi latin,
središñi cyrillique, istočni cyrillique. **Aucun texte n'est rédigé pour les prototypes** : les
libellés sont relevés dans le portail lui-même (`extract_strings.py` → `proto-strings.json`),
les données viennent de `portail/data/*.json`, l'emblème et la photo sont des assets existants.
Les intitulés en français de la planche sont des annotations, pas de l'interface.

## Socle commun aux trois

| Jeu de jetons | Avant | Prototypes |
|---|---|---|
| Couleurs | 99 dans le CSS | 4 canoniques et 8 neutres dérivés du bleu `#374078` |
| Tailles de police | 67 | 7 fixes, plus des titres fluides |
| Pas d'espacement | 36 | 9 (4, 8, 12, 16, 24, 32, 48, 72, 112 px) |
| Plus petit texte | 10,5 px | 12 px |
| Cibles tactiles | 24 sur 80 sous 44 px | toutes à 44 px ou plus |

Les neutres : encre `#1b2030`, gris de texte `#565c6e`, filet `#d7d9e4`, fond `#eef0f6` pour
le clair ; `#141a33`, `#1d2547`, `#3b4571`, `#c3c8dc` pour le sombre. Règles tenues partout :
l'or ne porte jamais de texte sur fond clair (1,62:1), le rouge et le bleu ne se touchent pas.

Vérifié par script sur les 3 prototypes × 4 écrans × 3 largeurs (375, 768, 1440 px), en anglais
et en istočni cyrillique : aucun débordement horizontal, aucun texte sous 12 px, aucune cible
sous 44 px, aucun drapeau plus haut que large. Les drapeaux sont toujours au format 3:2,
horizontaux, à côté du nom de l'État.

## 1. Titre (`proto-1.html`)

**Intention.** La typographie fait l'identité. Sofia Sans Extra Condensed, déjà la police des
titres, est poussée à très grande taille : le nom de la Confédération occupe toute la largeur
de l'écran, en bleu sur blanc, dans la langue et l'écriture choisies. Tout le reste est calme :
beaucoup de blanc, alignement à gauche, filets fins, le rouge réservé à ce qui est actif.

- En-tête : une barre claire translucide, navigation en texte, soulignement rouge de la page
  courante.
- États : une liste dense, une ligne par État (drapeau, code, nom, peuple, population).
  Les 54 entités tiennent en 7 écrans de téléphone au lieu de 25.
- Constitution : colonne de lecture de 66 caractères, sommaire fixe à gauche.
- Force : la plus lisible, la plus institutionnelle, la meilleure pour la lecture longue ;
  l'identité ne dépend d'aucune image.
- Limite : peu de couleur ; l'accueil repose sur une seule photo.

## 2. Mosaïque (`proto-2.html`)

**Intention.** Les quatre couleurs canoniques deviennent des surfaces. L'accueil est une grille
de tuiles arrondies de tailles inégales : une grande tuile bleue pour le titre, une tuile rouge
pour la devise, une tuile or pour le premier chiffre, des tuiles blanches pour le reste. La
navigation flotte dans une pastille translucide.

- États : tuiles à drapeau, deux par ligne sur téléphone (9 écrans), cinq sur grand écran.
- Constitution : le texte sur une feuille blanche, les articles en pastilles défilantes.
- Force : la plus colorée et la plus immédiate sur téléphone ; se prête bien aux captures pour
  les réseaux.
- Limite : c'est la grille « bento » que beaucoup de sites adoptent en ce moment, donc la moins
  singulière des trois. Avec huit entrées en cyrillique, la navigation ne tient pas dans la
  pastille à 1440 px et passe sur deux lignes.

## 3. Console (`proto-3.html`)

**Intention.** Une application plutôt qu'un site : fond bleu nuit, barre latérale sur grand
écran, barre d'onglets en bas sur téléphone. L'accueil s'ouvre sur la recherche, qui répond à
la frappe (essayer « lika », « soli », « Лика »). Les États sont une liste avec un panneau
d'aperçu qui se met à jour au clic.

- Force : la plus rapide pour qui sait ce qu'il cherche ; prolonge le style de `#/map` au reste
  du portail (constat V-8) ; l'or sur bleu nuit est très lisible (10,6:1).
- Limite : la plus éloignée du registre institutionnel et de l'existant ; un visiteur venu
  d'un post arrive devant un champ de recherche plutôt que devant un récit ; le thème clair
  serait à refaire.

## Animations

Cadre : l'ADR `2026-10-23-glissement-sections.md` (un seul glissement de 620 ms, rien d'autre
ne s'anime à l'arrivée).

| Animation | 1 | 2 | 3 | Technique | ADR |
|---|---|---|---|---|---|
| Glissement vertical entre sections, 620 ms, en-tête immobile | oui | oui | oui | View Transitions, existant | conforme |
| Filtrer les États : les cartes glissent vers leur nouvelle place, 320 ms | oui | oui | | View Transitions, un nom par carte | conforme (réponse à un geste, pas une arrivée) |
| Aperçu d'un État qui se remplace en fondu | | | oui | View Transitions | conforme |
| Soulignement rouge qui se trace au survol d'un lien de l'accueil | oui | | | CSS, 250 ms | conforme |
| Tuile qui passe au bleu au survol | | oui | | CSS, 180 ms | conforme |
| États des boutons, filtres et onglets | oui | oui | oui | CSS, 140 ms | conforme |

Aucune animation à l'arrivée, aucune apparition au défilement, aucune bibliothèque. Tout est
neutralisé sous `prefers-reduced-motion: reduce`. **Aucun amendement de l'ADR n'est nécessaire.**

## Coût

| | 1. Titre | 2. Mosaïque | 3. Console |
|---|---|---|---|
| CSS propre à la direction (prototype, 4 écrans) | 6,5 ko | 6,5 ko | 6,9 ko |
| Socle commun (prototype) | 5,2 ko | 5,2 ko | 5,2 ko |
| Variation estimée du CSS du portail (84,5 ko aujourd'hui) | −15 à −5 ko | −10 à 0 ko | 0 à +10 ko |
| Lot 1, fondations (jetons, en-tête, typographie) | 2 jours | 2,5 jours | 3,5 jours |
| Lot 2, composants (25 types de page) | 4 jours | 5 jours | 7 jours |
| Lot 3, animations | 0,5 jour | 0,5 jour | 1 jour |
| Risque multilingue | faible | moyen (navigation en pastille) | faible |
| Risque de régression | faible | moyen | élevé |

Le poids du JS des prototypes (13 ko) est celui de la maquette elle-même, pas un coût pour le
portail. Les efforts sont des ordres de grandeur.

## Recommandation

**Direction 1, Titre.** Elle est contemporaine sans suivre une mode, elle tire son identité de
la police que tu as déjà choisie et de l'alphabet lui-même, et c'est elle qui sert le mieux les
trois usages lourds du portail : lire la Constitution, parcourir 54 États, passer d'une langue
à l'autre. C'est aussi la moins chère et la moins risquée.

Si tu la trouves trop sobre, la direction 2 est la bonne alternative, en sachant qu'elle
vieillira plus vite. Je déconseille la direction 3 comme interface principale ; sa recherche
qui répond à la frappe mérite en revanche d'être reprise dans la direction retenue.

## Ce que les prototypes ne montrent pas

- La fiche d'État, la carte, les institutions, le parcours citoyen : ils suivront le système
  retenu, au lot 2.
- Le thème sombre des directions 1 et 2, et le thème clair de la direction 3.
- La recherche globale et le menu plein écran sur téléphone (la navigation défile à
  l'horizontale dans les prototypes).

## Chaînes d'interface nouvelles

Les prototypes n'en introduisent aucune. L'implémentation en demandera quelques-unes (lien
d'évitement, titres d'onglet, page introuvable, textes alternatifs des blasons) : elles
passeront par `L` avec leurs trois traductions, et je te soumettrai celles dont la forme n'est
pas évidente plutôt que de les inventer.

## Décisions attendues

1. **Direction** : 1, 2 ou 3.
2. **Palette** (constat V-1) : l'interface revient aux quatre couleurs canoniques et les neutres
   dérivés entrent dans `docs/canon/couleurs-symboles.md`. Recommandé : oui.
3. **Lot 0, partage et vitesse** (constats S-1, S-2, P-1, P-3) : adresses `s/<code>/` avec
   Open Graph et déploiement du build lié, avant le lot 1, en PR séparée. Recommandé : oui.
4. **Thème sombre** : recalé sur les nouveaux jetons sans être revu (recommandé), ou revu.

Ensuite : branche dédiée depuis `main`, commits atomiques, une PR par lot, captures et
Lighthouse avant et après dans chacune. Aucune PR vers `main` sans ton accord.
