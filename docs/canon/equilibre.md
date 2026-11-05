# Équilibre entre États et peuples

**Canon arrêté le 2026-11-05** (ADR `docs/decisions/2026-11-05-passe-de-fondation.md`,
Constitution v4.13). Contrôle : `python scripts/equilibre.py --check`, exécuté avant chaque
déploiement du portail (`.github/workflows/pages.yml`).

## 1. Règle

- Le **rapport** d'un peuple (part des États territoriaux ÷ part de la population) reste dans
  la bande **0,85 – 1,25**.
- Les **limites des États sont gelées** depuis la passe de fondation du 2026-11-05. Elles ne se
  redécoupent plus pour corriger un équilibre ; l'équilibre se règle par les mécanismes de vote
  (double majorité, double clé, règle de la moitié).
- Le **rattachement d'un État à son peuple** est une garantie renforcée (art. 150 e) : il ne
  change qu'avec le Narodni Sabor (deux tiers et majorité de chacune des sept délégations), le
  peuple et les États, et les électeurs de l'État concerné.
- Si un recensement fait sortir un rapport de la bande, le déploiement échoue. La réponse est
  une ADR, jamais un redécoupage silencieux.
- **Exception d'indivisibilité** : un peuple qui a exactement son nombre idéal d'États n'est pas
  en faute s'il sort de la bande, puisqu'aucun autre nombre entier ne ferait mieux. Le script le
  signale sans bloquer. Cela vise d'abord les Monténégrins, qui ont un seul État.

## 2. Méthode

- La population d'un peuple est celle des **États territoriaux** qui lui sont rattachés
  (`portail/data/etats.json`, champ `p`). Ce n'est pas un décompte ethnique.
- Les chiffres sont ceux de `portail/data/stats.json`, produit par `scripts/build_stats.py`
  depuis les recensements de `docs/data/population/` (Bulgarie : estimation NSI au
  31 décembre 2025 ; Bosnie-Herzégovine : recensement 2013 ; Croatie et Macédoine du Nord :
  2021 ; Serbie : 2022 ; Monténégro : 2023 ; Slovénie : registre au 1er janvier 2026).
- Une commune peuplée d'une autre communauté reste comptée avec son État. Les communautés
  minoritaires ont leurs associations de municipalités (entités autonomes,
  `docs/canon/entites-autonomes.md`).
- Les **quatre villes-États** sont **neutres** : elles votent comme des États (art. 124) mais
  ne relèvent d'aucun peuple. **Brčko et Mostar** ne sont pas des États.
- Le **nombre idéal** d'États d'un peuple est son quota exact (48 × part de la population),
  arrondi au plus fort reste.
- La **concentration** (HHI) est la somme des carrés des parts de population des États
  territoriaux ; plus elle est basse, plus les États sont de taille comparable.

## 3. Situation à la fondation (48 États territoriaux)

Sortie de `python scripts/equilibre.py --md` :

| Peuple | États | Part des États | Part de la population | Rapport | Population moyenne par État | Nombre idéal sur 48 |
|---|---|---|---|---|---|---|
| Slovènes | 5 | 10,4 % | 10,3 % | 1,01 | 427 000 | 5 (4,95) |
| Croates | 9 | 18,8 % | 15,8 % | 1,18 | 365 000 | 8 (7,60) |
| Serbes | 15 | 31,2 % | 31,3 % | 1,00 | 432 000 | 15 (15,02) |
| Bosniaques | 3 | 6,2 % | 6,6 % | 0,94 | 458 000 | 3 (3,18) |
| Monténégrins | 1 | 2,1 % | 2,4 % | 0,88 | 491 000 | 1 (1,14) |
| Macédoniens | 4 | 8,3 % | 8,9 % | 0,94 | 459 000 | 4 (4,26) |
| Bulgares | 11 | 22,9 % | 24,7 % | 0,93 | 465 000 | 12 (11,86) |

Population des États territoriaux : 20 717 469. Concentration (HHI) : 0,029 (0,032 en v4.12).

Deux peuples s'écartent d'une unité du nombre idéal : les **Croates** (9 au lieu de 8) et les
**Bulgares** (11 au lieu de 12). C'est voulu (section 4) : avec un douzième État bulgare, Serbes
et Bulgares atteindraient seuls la majorité des États.

## 4. Votations

- **52 États** votent (48 territoriaux et 4 villes-États). La majorité des États est de **27**.
- **Serbes et Bulgares** : 26 États. Il leur faut un État de plus, ville-État ou État d'un
  autre peuple ; avec Beograd et Sofija, 28.
- **Les cinq autres peuples** : 22 États ; avec Zagreb et Sarajevo, 24. Il leur faut cinq États
  de plus : par exemple Zagreb, Sarajevo et trois États serbes ou bulgares, ou les quatre
  villes-États et un État serbe ou bulgare.
- Aucun bloc n'atteint donc seul la majorité des États.

Le nombre d'États par peuple pèse là où chaque État vaut une voix : la double majorité des
votations (art. 123 et 124), les coalitions d'États pour l'initiative (8 États) et le
référendum (12 États), plafonnées à la moitié d'un même peuple (art. 106 bis et 122), et le
plancher de deux sièges au Kongres. Il ne pèse pas sur la composition du Kongres (Sainte-Laguë,
art. 103), ni sur le Narodni Sabor et le Konfederalno Veće (parité, avec la double clé des
art. 110 et 111).

## 5. Marges

Variation de la population d'un peuple, celle des autres restant égale, qui ferait sortir son
rapport de la bande :

| Peuple | Vers 1,25 | Vers 0,85 |
|---|---|---|
| Slovènes | −20,9 % | +21,6 % |
| Croates | **−6,2 %** | +50,4 % |
| Serbes | −26,8 % | +27,7 % |
| Bosniaques | −25,8 % | +11,8 % |
| Monténégrins | −30,2 % | **+3,5 %** (exception d'indivisibilité) |
| Macédoniens | −26,6 % | +11,7 % |
| Bulgares | −31,6 % | +12,5 % |

Le point à surveiller est la population des États croates : si elle recule de 6 % de plus que
celle des autres, le contrôle échoue et la question revient par ADR.

## 6. Historique

- **2026-10-25** : analyse `docs/analyses/equilibre-etats-peuples.md` ; frontières déclarées
  fixées à la fondation, double clé adoptée (ADR 2026-10-25-double-cle.md).
- **2026-11-04** : redécoupage bulgare pour des erreurs de géographie (ADR
  2026-11-04-redecoupage-bulgare.md).
- **2026-11-05** : passe de fondation, dernier redécoupage. Rapports en v4.12 : Croates 1,37,
  Bosniaques 1,31, Macédoniens 0,49, Serbes 0,90 ; en v4.13, tous entre 0,88 et 1,18. Le gel
  des limites s'applique sans exception à partir de cette date.
