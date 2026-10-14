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
- par peuple constitutif ;
- par PIB par habitant (6 classes, rampe or) ;
- par densité (6 classes, rampe azur).

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
