# ADR 2026-10-13 — Chiffres clés des États (population, superficie, communes)

## Statut
Accepté (demande utilisateur du 2026-10-13). Population partielle, en attente des
tableaux slovènes, bulgares et bosniaques.

## Décision
Les fiches d'État affichent : nombre de communes, population, superficie, densité.
Les chiffres sont calculés par `scripts/build_stats.py` → `portail/data/stats.json`.

- **Communes** : communes du recensement rattachées à l'État quand sa population
  est complète (découpage actuel : Tuzi et Zeta comptent à part de Podgorica) ;
  sinon, unités GADM du fichier d'État après résolution des chevauchements.
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
| Croatie | Recensement 2021 (DZS, fichier fourni par l'utilisateur) | 3 871 833 = États + Zagreb + 5 communes hors États, au chiffre près |
| Kosovo (KM-16) | Recensement 2011 (ASK) | le nord a boycotté 2011 et 2024 ; 2024 y compte 434 habitants à Zvečan |
| Slovénie, Bulgarie, Bosnie | **en attente** | tableaux officiels par commune à déposer dans `docs/data/population/` |

## Chevauchements résolus (communes présentes dans deux fichiers d'État)
- Baranja (8 communes + Liberland) : **BR-04**, retirées de SL-32. La fusion de
  Baraña dans Slavonija (juin 2026) n'a jamais été appliquée à `etats.json`.
- Malko Tarnovo, Sredets, Tsarevo, Bolyarovo : **SX-37 Stranxa**, retirées de CM-07 et TR-41.
- Pojezerje : **DA-08**, avec le reste du delta de la Neretva (Opuzen, Metković, Ploče).
- Žagubica : **TK-39**, retirée de PO-26 (transfert de l'Homolje à Timok).

Ces rattachements ne valent que pour les statistiques : les fichiers GeoJSON gardent
les doublons, donc la carte superpose encore ces communes (workstream cartes).

## Croatie : découpage GADM ancien
GADM précède la création de plusieurs communes (Tribunj, Kukljica, Kolan, Vrsi,
Kamanje, Klakar, Šodolovci, Štitar). Elles sont localisées sur le découpage actuel
(geoBoundaries ADM2) et rattachées à l'État qui contient leur point intérieur.
Les fragments GADM (îlots de Mali Lošinj, Premantura, Njivice, Blaca, unités
« Unknown ») comptent en superficie, pas comme communes.

## Points ouverts
- **Turopolje et banlieue de Zagreb hors de tout État** : Velika Gorica, Kravarsko,
  Orle, Stupnik et Bistra (74 994 hab.) ne figurent dans aucun fichier d'État ni
  dans le contour de Zagreb. La décision de juin 2026 rattachait le Turopolje à la
  ville-État de Zagreb : à appliquer (contour + population de ZG-94).
- Istočni Stari Grad (fichier PZ-28) tombe dans le contour geoBoundaries du canton
  de Sarajevo (SA-92) : désaccord entre sources de contours à vérifier.
- PIB par habitant : toujours en attente.
