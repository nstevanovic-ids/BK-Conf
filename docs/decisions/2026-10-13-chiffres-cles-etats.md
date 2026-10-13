# ADR 2026-10-13 — Chiffres clés des États (population, superficie, communes)

## Statut
Accepté (demande utilisateur du 2026-10-13). Population partielle, en attente des
tableaux croates, slovènes, bulgares et bosniaques.

## Décision
Les fiches d'État affichent : nombre de communes, population, superficie, densité.
Les chiffres sont calculés par `scripts/build_stats.py` → `portail/data/stats.json`.

- **Communes** : unités GADM du fichier d'État, après résolution des chevauchements.
  Le lac d'Ohrid et « Liberland » (unités GADM sans habitants) ne comptent pas comme communes.
- **Superficie** : surface ellipsoïdale (WGS84) de l'union des communes. Pour les
  villes-États : contours geoBoundaries (gbOpen) ; Mostar : `portail/data/MO-96.geojson`.
- **Population** : somme des populations communales du dernier recensement de chaque
  pays (`docs/data/population/`). Un État n'affiche sa population que si **toutes**
  ses communes sont couvertes ; sinon « Pending census data ».

| Pays | Source | Contrôle |
|---|---|---|
| Serbie | Recensement 2022, premiers résultats (RZS) | 6 690 887 = États + Beograd, au chiffre près |
| Monténégro | Recensement 2023 (MONSTAT) | 623 633, au chiffre près |
| Macédoine du Nord | Recensement 2021 (SSO) | 1 836 713, au chiffre près |
| Kosovo (KM-16) | Recensement 2011 (ASK) | le nord a boycotté 2011 et 2024 ; 2024 y compte 434 habitants à Zvečan |
| Croatie, Slovénie, Bulgarie, Bosnie | **en attente** | tableaux officiels par commune à déposer dans `docs/data/population/` |

## Chevauchements résolus (communes présentes dans deux fichiers d'État)
- Baranja (8 communes + Liberland) : **BR-04**, retirées de SL-32. La fusion de
  Baraña dans Slavonija (juin 2026) n'a jamais été appliquée à `etats.json`.
- Malko Tarnovo, Sredets, Tsarevo, Bolyarovo : **SX-37 Stranxa**, retirées de CM-07 et TR-41.
- Pojezerje : **DA-08**, avec le reste du delta de la Neretva (Opuzen, Metković, Ploče).
- Žagubica : **TK-39**, retirée de PO-26 (transfert de l'Homolje à Timok).

Ces rattachements ne valent que pour les statistiques : les fichiers GeoJSON gardent
les doublons, donc la carte superpose encore ces communes (workstream cartes).

## Points ouverts
- Istočni Stari Grad (fichier PZ-28) tombe dans le contour geoBoundaries du canton
  de Sarajevo (SA-92) : désaccord entre sources de contours à vérifier.
- PIB par habitant : toujours en attente.
