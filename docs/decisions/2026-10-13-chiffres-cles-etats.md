# ADR 2026-10-13 — Chiffres clés des États (population, superficie, communes)

## Statut
Accepté (demande utilisateur du 2026-10-13). Population complète : 51 entités sur 51.

## Décision
Les fiches d'État affichent : nombre de communes, population, superficie, densité.
Les chiffres sont calculés par `scripts/build_stats.py` → `portail/data/stats.json`.

- **Communes** : communes du recensement rattachées à l'État quand sa population
  est complète (découpage actuel : Tuzi et Zeta comptent à part de Podgorica) ;
  sinon, unités GADM du fichier d'État après résolution des chevauchements.
  Le lac d'Ohrid et « Liberland » (unités GADM sans habitants) ne comptent pas comme communes.
- **Superficie** : surface ellipsoïdale (WGS84) de l'union des communes. Pour les
  villes-États : contours `portail/data/<CODE>.geojson`, raccordés aux États voisins
  (ADR 2026-10-14-raccord-carte).
- **Population** : somme des populations communales du dernier recensement de chaque
  pays (`docs/data/population/`). Un État n'affiche sa population que si **toutes**
  ses communes sont couvertes ; sinon « Pending census data ».

| Pays | Source | Contrôle |
|---|---|---|
| Serbie | Recensement 2022, premiers résultats (RZS) | 6 690 887 = États + Beograd, au chiffre près |
| Monténégro | Recensement 2023 (MONSTAT) | 623 633, au chiffre près |
| Macédoine du Nord | Recensement 2021 (SSO) | 1 836 713, au chiffre près |
| Croatie | Recensement 2021 (DZS, fichier fourni par l'utilisateur) | 3 871 833 = États + Zagreb, au chiffre près |
| Slovénie | Registre de population au 1er janvier 2026 (SURS, SiStat 05C4003S, fichier fourni par l'utilisateur) ; la Slovénie n'organise plus de recensement classique | 2 135 107, au chiffre près |
| Bulgarie | Population au 31 décembre 2025 (NSI, fichier fourni par l'utilisateur) | 6 423 207 = États + Sofija, au chiffre près |
| Bosnie-Herzégovine | Recensement 2013, résultats définitifs (BHAS, tableau 2.3, PDF fourni par l'utilisateur) | 3 531 159 = États + Sarajevo + Brčko + Mostar, au chiffre près |
| Kosovo (KM-16) | Recensement 2011 (ASK) | le nord a boycotté 2011 et 2024 ; 2024 y compte 434 habitants à Zvečan |

## Chevauchements résolus (communes présentes dans deux fichiers d'État)
- Baranja (8 communes + Liberland) : **BR-04**, retirées de SL-32. La fusion de
  Baraña dans Slavonija (juin 2026) n'a jamais été appliquée à `etats.json`.
- Malko Tarnovo, Sredets, Tsarevo, Bolyarovo : **SX-37 Stranxa**, retirées de CM-07 et TR-41.
- Pojezerje : **DA-08**, avec le reste du delta de la Neretva (Opuzen, Metković, Ploče).
- Žagubica : **TK-39**, retirée de PO-26 (transfert de l'Homolje à Timok).

Les doublons ont depuis été retirés des fichiers GeoJSON perdants
(ADR 2026-10-14-raccord-carte) : la carte ne superpose plus ces communes.

## Croatie et Slovénie : découpage GADM ancien
GADM précède la création de plusieurs communes : en Croatie Tribunj, Kukljica,
Kolan, Vrsi, Kamanje, Klakar, Šodolovci, Štitar ; en Slovénie une vingtaine
créées en 2006-2011 (Apače, Cirkulane, Gorje, Ankaran…). Elles sont localisées sur
le découpage actuel (geoBoundaries ADM2) et rattachées à l'État qui contient leur
point intérieur ; à défaut (nom absent ou mal encodé), par leur commune d'origine
(Središče ob Dravi et Sveti Tomaž ← Ormož, Straža et Šmarješke Toplice ← Novo
mesto, Šmartno pri Litiji ← Litija, Ankaran ← Koper).
Les fragments GADM (îlots de Mali Lošinj, Premantura, Njivice, Blaca, unités
« Unknown ») comptent en superficie, pas comme communes.

Total de la Confédération : 25 147 358 habitants sur 357 278 km² (sommes de
sources d'années différentes, 2011 à 2026 ; le Kosovo n'y compte que KM-16).
Superficie après raccord des contours le 2026-10-14 ; elle était de 357 015 km² avant.

## Points ouverts
- ~~Turopolje et banlieue de Zagreb hors de tout État~~ : résolu par l'ADR
  2026-10-13-zagreb-turopolje (Turopolje et Stupnik à ZG-94, Bistra à ZA-45).
- ~~Istočni Stari Grad dans le contour de SA-92~~ : résolu par l'ADR 2026-10-13-sarajevo-est
  (qui rattache aussi Istočna Ilidža et Istočno Novo Sarajevo à PZ-28).
- PIB par habitant : toujours en attente.
