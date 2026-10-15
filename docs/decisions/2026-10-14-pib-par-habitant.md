# ADR 2026-10-14 — PIB par habitant des États

## Statut
Accepté (demande utilisateur du 2026-10-14 : « le gdp per capita est vide »).
Les 51 entités ont maintenant un PIB par habitant.

## Décision

### Unité et année
- **Unité** : PIB par habitant en **SPA** (standard de pouvoir d'achat, UE-27
  depuis 2020). C'est la parité de pouvoir d'achat d'Eurostat, ce qui permet de
  comparer des pays aux niveaux de prix différents. Le portail affiche aussi le
  pourcentage de la moyenne UE-27 (38 100 SPA en 2023).
- **Année** : **2023**, dernière année commune à tous les pays. Les régions serbes
  ne sont pas encore publiées pour 2024.

### Calcul
Le PIB par habitant d'une entité est la moyenne des PIB par habitant des régions
de ses communes, pondérée par la population de chaque commune (`build_stats.py`).
Les populations utilisées sont celles des chiffres clés (ADR 2026-10-13).

Une commune prend le PIB par habitant de sa région NUTS 3 :
- Serbie, Croatie, Bulgarie : par son district de recensement (oblast, županija, oblast) ;
- Slovénie : par sa région statistique GADM ;
- Macédoine du Nord : par une table commune → région (80 communes, 8 régions).

Le rattachement est dans `docs/data/pib/REGIONS.csv`.

### Sources (`docs/data/pib/PIB_2023.csv`)

| Pays | Source | Niveau |
|---|---|---|
| Slovénie, Croatie, Bulgarie | Eurostat `nama_10r_3gdp`, PPS_EU27_2020_HAB | NUTS 3 (12, 21, 28 régions) |
| Serbie | idem, données provisoires | NUTS 3 (25 oblasti, Beograd compris) |
| Macédoine du Nord | idem, estimations | NUTS 3 (8 régions) |
| Monténégro | idem | pays entier (une seule région NUTS 3) |
| Bosnie-Herzégovine | Eurostat `prc_ppp_ind` (13 600 SPA), réparti par entité | FBiH ; RS + Brčko |
| Kosovo (KM-16) | estimation : PIB PPA Banque mondiale converti en SPA | pays entier |

### Bosnie-Herzégovine
Aucun PIB n'est publié en dessous des entités : le FZS ne publie pas de PIB
cantonal. La valeur nationale est répartie entre les entités :

- FBiH : 14 868 KM/hab. (FZS) ;
- BiH : 14 588 KM/hab. (BHAS) ;
- RS + Brčko : calculé par différence, 14 115 KM/hab.

Résultat : **13 900 SPA** pour la FBiH et **13 200 SPA** pour RS + Brčko.

Limite assumée : les États bosniens ont des valeurs presque identiques, et
**SA-92 Sarajevo** reçoit la moyenne de la FBiH alors que le canton de Sarajevo
est le plus riche de la Fédération.

### Kosovo
Le Kosovo est absent des données SPA d'Eurostat. Son PIB PPA 2023 (Banque mondiale)
est de 15 817 $ int. Il est converti avec le rapport SPA / PPA médian des quatre
voisins (BA, ME, MK, RS : 0,6239), soit **9 900 SPA**. KM-16 (le nord) reçoit la
valeur du Kosovo entier.

## Contrôle
`build_stats.py` recalcule, pour chaque pays, la moyenne pondérée de toutes ses
communes (États et villes-États) et la compare à la valeur nationale Eurostat
(`docs/data/pib/CONTROLE_2023.csv`).

| Pays | Écart |
|---|---|
| Bulgarie | +0,4 % |
| Bosnie-Herzégovine | +0,3 % |
| Croatie | −0,3 % |
| Macédoine du Nord | +0,1 % |
| Monténégro | 0 % |
| Serbie | −0,4 % |
| Slovénie | +1,2 % (population de 2026) |

Ces écarts confirment le relevé des 95 valeurs NUTS 3.

## Résultats (extrêmes)
- **En tête** :
  - SF-93 Sofija : 52 000 SPA (136 % UE) ;
  - ZG-94 Zagreb : 48 200 SPA ;
  - KR-17 Krañska : 41 300 SPA.
- **En bas** :
  - TL-40 Torlak : 11 100 SPA ;
  - PI-24 Istočno Podriñe : 11 300 SPA ;
  - KM-16 : 9 900 SPA (estimation).

## Propagation
- `docs/data/pib/` : nouveau dossier, avec `PIB_2023.csv`, `REGIONS.csv` et
  `CONTROLE_2023.csv`.
- `scripts/build_stats.py` : nouveaux champs `gdp`, `gdp_eu` et `gdp_source`
  dans `stats.json`.
- `portail/index.html` : la ligne « GDP per capita (PPS, est.) » est remplie,
  avec la source. La note sous les chiffres clés est mise à jour : elle annonçait
  encore des données « in preparation ».
- ADR 2026-10-13-chiffres-cles-etats : le point ouvert « PIB par habitant » est clos.

## Pistes
- Un PIB cantonal pour la FBiH serait une estimation hors statistique officielle.
  On pourrait le construire à partir de la masse salariale par canton (emploi ×
  salaire moyen, FZZPR « Socioekonomski pokazatelji po općinama »).
- Passer à 2024 quand Eurostat publiera les régions serbes.
