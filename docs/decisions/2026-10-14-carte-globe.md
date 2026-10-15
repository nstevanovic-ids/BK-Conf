# ADR 2026-10-14 — Carte refondue : globe et salle de situation

## Statut
Accepté (demande utilisateur du 2026-10-14 : « il faut revoir complètement la map », sur
le modèle d'un tableau de bord sombre avec un globe et des panneaux de données).

## Décision

### Fond de carte
La page #/map est un écran sombre aux couleurs confédérales : azur profond, or pour
les lumières et les accents. Il est toujours sombre, quel que soit le thème du portail,
comme un écran d'instrument.

La carte est un **globe orthographique** (d3-geo) :
- à l'ouverture, la Terre tourne puis la vue descend sur la Confédération (2,6 s,
  supprimé si l'utilisateur demande moins d'animations) ;
- dézoomer fait réapparaître le globe entier, avec son halo d'atmosphère.

Une vue satellite inclinée, qui montrerait l'horizon courbe au-dessus des Balkans,
a été écartée. Pour que l'horizon soit visible, la perspective grossissait la
Macédoine 3 à 7 fois plus que la Slovénie, ce qui est inacceptable pour une carte
de données.

### Lumières
Une lumière par commune (1 407 points), dont l'intensité dépend de la population
(`portail/data/lights.json`, produit par `build_stats.py`). C'est l'équivalent, avec
des données réelles, des lumières nocturnes de la référence.

### Coloration au choix
- **États**, par défaut : ton azur profond commun, frontières lumineuses, villes-États
  et municipalités fédérales en or. Les peuples n'ont pas de code couleur
  (ADR 2026-10-14-pas-de-code-couleur-peuples).
- **PIB par habitant** : dégradé chaud continu, échelle logarithmique.
- **Densité** : dégradé froid continu, échelle logarithmique.
- **Peuples** : simple option, en dernier choix du sélecteur. Chaque peuple y prend
  une teinte vive :

| Peuple | Couleur | Code |
|---|---|---|
| Slovenci | bleu | `#0794f8` |
| Hrvati | cramoisi | `#f10f4f` |
| Srbi | violet | `#b53ddd` |
| Bošnjaci | cyan | `#0bd7d9` |
| Crnogorci | jaune | `#eeda1b` |
| Makedonci | orange | `#ff8c00` |
| Bãlgari | vert | `#2fbf5b` |

  Contrôle OKLab sur les voisinages réels de la carte :
  - le pire couple de voisins s'écarte de 24 ΔE en vision normale ;
  - sous simulation du daltonisme, le pire couple est orange / vert à 7,1 ΔE ; les
    frontières et les infobulles portent la différence ;
  - tous les couples de la légende s'écartent d'au moins 16 ΔE.

### Panneaux flottants
- population de la Confédération, répartie entre États, villes-États et
  municipalités confédérales ;
- superficie, densité et nombre de communes ;
- PIB par habitant en anneau, en pourcentage de la moyenne UE-27 ;
- fiche de l'État survolé ou épinglé : drapeau, chiffres, jauge UE et lien vers
  la fiche. Sans sélection, le panneau affiche le classement du critère choisi ;
- population par peuple en barres cliquables, qui filtrent la carte.

### Interaction
- glisser pour déplacer, molette ou pincement pour zoomer, double-clic ;
- clavier : flèches, +, −, 0 pour recadrer, Échap pour désélectionner ; chaque
  État est atteignable avec Tab, et Entrée ouvre sa fiche.

### Finitions (2026-10-14, « manque de punch et de finesse, il faut du dégradé »)
- **Dégradés tirés des couleurs canoniques** :
  - froid : de l'azur `#374078` au bleu électrique et au cyan ;
  - chaud : des gueules `#99402F` à l'orange et à l'or `#DFCC68`.

  La luminosité croît à chaque pas de chaque dégradé. Ils servent aux
  choroplèthes, aux barres, au compteur et aux boutons.
- **Territoire** :
  - halo lumineux autour des États (froid, ou chaud en mode PIB) ;
  - reflet en dégradé et trame de points fins, découpés sur les États ;
  - frontières plus fines ;
  - villes-États et municipalités fédérales en dégradé or et orange ;
  - lumières communales ambrées.
- **Graphiques** :
  - le PIB par habitant passe de l'anneau plein à 60 graduations éclairées le long
    du dégradé chaud ;
  - les barres sont en dégradé, avec un trait lumineux en bout ;
  - un histogramme des 51 entités suit le critère actif, avec une colonne par
    entité, triées et fondues vers le bas. Survoler une colonne l'éclaire, cliquer
    l'épingle ;
  - la fiche épinglée montre la même série en miniature, avec le rang de l'État ;
  - une barre de répartition de la population (États, villes-États,
    municipalités) est ajoutée sous le total.
- **Cartes** : bordures en dégradé, chiffres en dégradé argenté, fond à trame de
  points discrète.
- **Sources** : déplacées dans la légende.

### Animations légères (2026-10-14)
Toutes sont supprimées si le système demande moins d'animations.

- **Chiffres** : population, superficie, PIB et pourcentage montent jusqu'à leur
  valeur à l'ouverture (1,3 s).
- **Anneau du PIB** : les graduations s'allument une à une, puis une lueur parcourt
  l'arc toutes les 4,8 s.
- **Barres et jauges** : les barres poussent depuis la gauche en décalé, puis un
  reflet glisse lentement le long de chaque dégradé ; la jauge UE et la barre de
  répartition se remplissent aussi.
- **Histogramme** : les colonnes montent depuis la ligne de base à l'ouverture et
  à chaque changement de critère.
- **Légende et bouton** : la légende en dégradé et le bouton « Open state page »
  portent le même reflet lent.
- **Carte** : un écho radar discret pulse autour des six villes-États et
  municipalités fédérales.

Les effets coûteux, comme l'animation du halo du territoire, sont évités.

## Conséquences techniques
- **`geo.json` v2** :
  - coordonnées lon/lat en 1/1000 de degré, codées en delta par anneau ;
  - sens des anneaux conforme à d3-geo ;
  - couches : États, villes-États, territoires occupés, voisins 1:50m (fenêtre
    élargie), frontières terrestres, reste du globe 1:110m.
  - Le contrôle de `gen_geo.py` reste bloquant : 0 trou, 0 recouvrement.
- **Bibliothèques** : `portail/vendor/d3-array.min.js` et `d3-geo.min.js` (ISC),
  intégrés au fichier unique par `build_portail.py --inline`.
- **Mini-cartes** : celles des fiches État utilisent la même projection.
- **Performance** :
  - les entités hors de l'écran ou derrière le globe ne sont pas recalculées ;
  - pendant un geste près du territoire, les calques sont seulement déplacés par
    transformation CSS ;
  - le tracé exact suit dès que le geste s'arrête.
- **Codes des territoires occupés** : alignés sur les codes actuels (KJ-15, KM-16,
  GV-11) depuis l'ADR 2026-10-14-raccord-carte.
