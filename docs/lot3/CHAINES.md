# Chaînes du lot 3

Plan (`docs/lot3/PLAN.md`, section « Chaînes ») validé par l'auteur le 2026-11-24 : chaînes livrées telles que
proposées. Chacune est versée avec sa fonction, pour que `scripts/textes.py check` reste sans clé manquante
à chaque commit. Istočni écrit en bulgare cyrillique, converti par `scripts/textes.py merge`, aller-retour
sans écart (sources : `docs/lot3/mesures/0-prototype/chaines.json`, colonne `bg`).

## Les 29 chaînes de `proto/sabor/strings-new.json`

| N° | Anglais | Sort | Commit |
|---|---|---|---|
| 1 | Skip to content | déjà livrée au lot 1 (`i18n.json`, clé `skip`) | – |
| 2 | Open in the instrument | abandonnée : les renvois portent le nom de la page | – |
| 5 | Assumptions of the instrument | livrée sous l'anglais « Assumptions of the calculation » | 4 |
| 3, 4, 6 à 11 | péréquation (art. 132) | en attente de la révision de l'article ; traductions dans le plan | – |
| 12 à 14 | For, Abstention, Against | livrées (`REGLES.LIB.vote`) | 1 |
| 15, 16 | Passes, Fails | abandonnées : « Adopted » / « Not adopted » (lot 2), « Admissible » / « Not admissible » | – |
| 17 | Suspended | livrée (`LIB.verdict`) | 1 |
| 18, 19 | Link copied, Copy link | livrées (page) | 4 |
| 20, 21, 23 à 27 | hypothèses `bloc`, `present` (anglais retouché), `pop`, `mun`, `alarm`, `coal`, `cons` | livrées (`LIB.hyp`) | 1 |
| 22 | hypothèse `reg` | remplacée par la chaîne 5 du lot 1 (même hypothèse) | – |
| 28, 29 | majorités minimales, indice de Banzhaf | abandonnées (fiche d'État non touchée) | – |

## Chaînes nouvelles

| Anglais | ZAP | SRE | IST | Commit |
|---|---|---|---|---|
| Votes and majorities | Glasovaña in večine | Glasaña i većine | Glasuvanija i mnozinstva | 4 |
| Place the States, the national delegations and the councillors, … | Razporedite države, … | Rasporedite države, … | Razpredelete dãržavite, … | 4 |
| 7 noms de cas (Consent given by five delegations, Two peoples alone, …) | voir le plan | | | 1 |
| The double key also applies to six delegations of seven: … (Art. 110) | Dvojni kļuč veļa tudi … | Dvostruki kļuč priměñuje se i … | Dvojnijat kļuč se prilaga i … | 1 |
| Met / Not met | Izpolñeno / Ni izpolñeno | Ispuñeno / Nije ispuñeno | Izpãlneno / Ne e izpãlneno | 4 |
| With reduced motion, the discs are not dragged: … | Pri zmañšanem gibañu … | Uz smañeno kretañe … | Pri namaleno dviženie … | 4 |
| Admissible / Not admissible | Dopustno / Ni dopustno | Dopustivo / Nije dopustivo | Dopustimo / Nedopustimo | 1 |
| {0} States | {0} {0#one:država;two:državi;few:države;other:držav} | {0} {0#one:država;few:države;other:država} | {0} {0#one:dãržava;other:dãržavi} | 4 |
| {0} Kongres seats | {0} {0#one:sedež;two:sedeža;few:sedeži;other:sedežev} v Kongresu | {0} {0#one:mandat;few:mandata;other:mandata} u Kongresu | {0} {0#one:mjasto;other:mesta} v Kongresa | 4 |

« {0} States » (« Initiative · 8 States ») et « {0} Kongres seats » (en-têtes des rangées) ne figuraient pas
dans le plan : la forme nue « 8 States » aurait donné « 8 Države » au lieu de « 8 držav ». Pluriels sur le
modèle des chaînes existantes.

## Termes repris des Constitutions traduites

Right of mandatory consent (art. 109 a), Urgent laws (123 bis), Entrenched guarantees (150), Conciliation
(110 ter), plus « Popular initiative » et « Optional referendum », copiés des clés `h_initiative` et
`h_referendum` de `i18n.json` (commit 1).

## Restaurées

« {0} confederal territories », « {0} confederal municipalities », « {0} territorial states », retirées au
lot 2 avec le globe (4801ab8), reprises avec leurs traductions (commit 4).

## Noms des organes (point 4 du plan)

`scripts/textes.py merge` remettait de force au nom središñi, dans les trois standards, les quatre noms de sa
liste `NAMES` : « Narodni Sabor », « Konfederalno Veće », « Ustavni Sud », « Konfederalna Kancelarija ». C'est
ce qui avait annulé, au premier `merge` suivant (c0a292d, a9713fd), leur traduction du 2026-11-06 (97c5340).
Ces quatre noms passent dans une liste `ORGANS` (au catalogue, jamais réécrits) ; leurs entrées reprennent la
table de l'ADR 2026-11-06-noms-officiels-traduits.md :

| Clé | ZAP | SRE | IST |
|---|---|---|---|
| Narodni Sabor | Skupščina narodov | Narodni Sabor | Sãbranie na narodite |
| Konfederalno Veće | Konfederalni svet | Konfederalno Veće | Konfederalen sãvet |
| Ustavni Sud | Ustavno sodišče | Ustavni Sud | Konstitucionen sãd |
| Konfederalna Kancelarija | Konfederalna kanclerija | Konfederalna Kancelarija | Konfederalna kancelarija |

Effet hors de la page des votes : schéma d'Institutions (le rôle « Assembly of Nations », qui répète alors le
nom en zapadni et en istočni, n'est plus affiché), étape « Narodni Sabor » du rail de la loi, titre et fil
d'Ariane de `#/council`, tableau du registre de la carte citoyenne, recherche.
