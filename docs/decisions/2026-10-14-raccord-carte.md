# ADR 2026-10-14 — Raccord des contours de la carte (trous et recouvrements)

## Statut
Accepté (demande utilisateur du 2026-10-14 : « il reste toujours des trous dans la map »).

## Contexte
Les contours de la carte viennent de sources qui ne se raccordent pas :

- les États : communes GADM, par pays ;
- les villes-États : Natural Earth admin-1 (1:10m) ou geoBoundaries ;
- les communes ajoutées : geoBoundaries (par exemple Srebrenica) ;
- les pays voisins : Natural Earth 1:50m.

Ces écarts produisaient des trous et des recouvrements :

- autour de Brčko, Sofija, Beograd et Mostar ;
- sur la Drina ;
- près de Srebrenica ;
- le long du Danube, avec la Roumanie.

`gen_geo.py` simplifiait en plus chaque État séparément, ce qui ouvrait des
interstices le long de toutes les frontières internes. Sur un rendu de contrôle
(fond magenta, sans traits), le fond apparaissait à tous ces endroits.

## Décision

### 1. Sources corrigées une fois pour toutes
Le nouveau script `scripts/raccord_contours.py` corrige les fichiers sources. Il est
idempotent : une seconde exécution ne modifie rien.

- **Communes en double** retirées du fichier « perdant », selon les rattachements
  de l'ADR 2026-10-13-chiffres-cles-etats :
  - Baranja retirée de SL-32 ;
  - Stranxa retirée de CM-07 et TR-41 ;
  - Pojezerje retirée de DR-10 ;
  - Žagubica retirée de PO-26.

  La carte ne superpose plus ces communes.
- **Beograd, Sofija, Brčko, Mostar** : chacune est entièrement entourée d'États
  tracés en GADM. Son contour est donc **le trou que laissent ses voisins**, ce qui
  le rend cohérent avec eux par construction. geoBoundaries sert seulement à
  repérer le bon trou.

| Unité | Avant | Après | Superficie officielle |
|---|---|---|---|
| BG-91 Beograd | 3 239 km² (geoBoundaries) | 3 267 km² | 3 234 km² |
| SF-93 Sofija | 1 341 km² (geoBoundaries) | 1 353 km² | 1 349 km² |
| BK-95 Brčko | 487 km² (geoBoundaries) | 512 km² | 493 km² |
| MO-96 Mostar | 1 063 km² (geoBoundaries ADM3) | 1 170 km² | 1 175 km² |

  Les contours de SA-92 et ZG-94, déjà raccordés le 2026-10-13, sont inchangés.
- **Drina (PI-24 / PZ-28)** : le recouvrement de 54 km² est tranché par la
  frontière nationale Serbie / Bosnie-Herzégovine (geoBoundaries ADM0).
- **Trous résiduels** : 146 km² au total, tous en Bosnie-Herzégovine. Ce sont des
  interstices entre le contour geoBoundaries de Srebrenica et les communes GADM
  voisines. D'après geoBoundaries ADM3, ils appartiennent à Bratunac et à Milići,
  communes de PZ-28. Ils sont donc rattachés à PZ-28.
- **Résultat** : aucun recouvrement, aucun trou de plus de 0,01 km².

### 2. Carte générée comme une couverture unique
`scripts/gen_geo.py` traite désormais tous les polygones ensemble : États,
villes-États, territoires occupés et pays voisins. Il procède ainsi :

1. Il les projette ensemble.
2. Il les nettoie avec `shapely.coverage_clean`.
3. Il les simplifie avec `shapely.coverage_simplify`, qui simplifie chaque
   frontière commune une seule fois.

Les voisins gardent ainsi exactement la même frontière. Les écarts entre les pays
voisins (Natural Earth) et le territoire de la Confédération sont donnés au pays
voisin, pour que le contour des États ne bouge pas. Le script vérifie l'absence de
trou et de recouvrement : il échoue si la carte en contient.

Résultat du contrôle : 0 trou, 0 px² de recouvrement. Le rendu de contrôle ne
montre plus de fond qu'en mer.

Au passage, les territoires occupés sont rattachés à leurs codes d'État actuels :
KJ-15, KM-16, GV-11. Les codes d'avant la renumérotation n'étaient plus reconnus
par le portail.

## Propagation
- `portail/data/BG-91.geojson`, `SF-93.geojson` et `BK-95.geojson` sont nouveaux ;
  `MO-96.geojson` est remplacé.
- Fichiers d'États modifiés (noms de fichiers d'avant la renumérotation) :
  - `CM-08` ;
  - `DR-11` ;
  - `PI-24` ;
  - `PO-26` ;
  - `PZ-28` ;
  - `SL-32` ;
  - `TR-40`.
- `scripts/build_stats.py` : les superficies des villes-États sont lues dans les
  fichiers locaux, et geoBoundaries n'est plus consulté pour elles.
  - Les populations sont inchangées.
  - PZ-28 passe de 6 440 à 6 556 km² et PI-24 de 8 051 à 8 026 km².
  - Total de la Confédération : 357 278 km².
- `geo.json`, `stats.json` et le portail sont régénérés.

## Ordre d'exécution
```
python scripts/raccord_contours.py   # après toute modification d'un contour source
python scripts/build_stats.py
python scripts/gen_geo.py
python scripts/build_portail.py --inline
```
