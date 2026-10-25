# Équilibre entre États et peuples

**Analyse du 2026-10-25, à la demande de l'utilisateur** (« équilibre Croates, Macédoniens,
intéressant à creuser »). Révisée le même jour après discussion. Deux décisions en sont
sorties (ADR `docs/decisions/2026-10-25-double-cle.md`) :
- **les frontières des États sont fixées à la fondation** : aucun redécoupage ;
- **la double clé** est adoptée (Constitution v4.9, art. 110, 111 et 115 bis).

La pondération des voix d'États (section 5) reste une proposition.

## 1. Méthode

- La population d'un peuple est celle des **États territoriaux** qui lui sont rattachés
  (`etats.json`, `stats.json`). Ce n'est pas un décompte ethnique.
- Une commune peuplée d'une autre communauté reste comptée avec son État. Les communautés
  minoritaires ont leurs associations de municipalités (entités autonomes) : les communes
  bosniaques du Sandžak restent dans la population serbe, comme les communes serbes de la
  Lika restent dans la population croate.
- Les **quatre villes-États** sont **neutres** : elles votent comme des États (art. 124), mais
  ne sont rattachées à aucun peuple.
- Brčko et Mostar ne sont pas des États.
- Le **rapport** se calcule ainsi : part des voix d'États ÷ part de la population. À 1, la
  représentation est exacte ; au-dessus de 1, le peuple est surreprésenté.

## 2. Ce qui compte, et ce qui ne compte pas

Le nombre d'États par peuple pèse là où chaque État vaut une voix :
- la **double majorité** des votations (art. 123 et 124) ;
- les **coalitions d'États** pour l'initiative législative (8 États) et le référendum
  (12 États, art. 106 bis et 122), plafonnées à la moitié d'un même peuple ;
- le **plancher de deux sièges** au Kongres.

Il ne pèse **pas** sur la composition des institutions :
- au Kongres, Sainte-Laguë répartit les sièges en proportion de la population ;
- au Narodni Sabor et au Konfederalno Veće, la parité est stricte.

## 3. Situation (45 États territoriaux)

| Peuple | États | Part des États | Part de la population | Rapport | Population moyenne par État | Nombre idéal sur 45 |
|---|---|---|---|---|---|---|
| Slovènes | 5 | 11,1 % | 10,3 % | 1,08 | 427 000 | 5 (4,64) |
| Croates | 10 | 22,2 % | 15,8 % | **1,40** | 328 000 | 7 (7,13) |
| Serbes | 13 | 28,9 % | 31,3 % | 0,92 | 499 000 | 14 (14,08) |
| Bosniaques | 4 | 8,9 % | 6,6 % | **1,34** | 343 000 | 3 (2,98) |
| Monténégrins | 1 | 2,2 % | 2,4 % | 0,94 | 491 000 | 1 (1,07) |
| Macédoniens | 2 | 4,4 % | 8,9 % | **0,50** | 918 000 | 4 (3,99) |
| Bulgares | 10 | 22,2 % | 24,7 % | 0,90 | 512 000 | 11 (11,12) |

Le nombre idéal est calculé au plus fort reste ; le quota exact est entre parenthèses.

**Constats** :
- **Les Macédoniens sont le seul peuple fortement sous-représenté.** Leurs deux États
  comptent en moyenne 918 000 habitants, presque le double des autres.
- **Les Croates sont surreprésentés** à cause de leurs petits États : Baraña (29 000),
  Dubrovačka Republika (70 000) et Zapadni Srěm (133 000).
- **Les Bosniaques le sont aussi** (1,34). Pour un petit peuple, ce n'est pas forcément un
  défaut.
- **Serbes et Bulgares** sont légèrement sous-représentés (0,92 et 0,90).
- **Huit États ont moins de 150 000 habitants** : Stranxa (27 000), Baraña (29 000), Kosovo
  i Metohija (35 000, recensement boycotté), Južna Koroška (37 000), Dubrovačka Republika
  (70 000), Prekmurje (76 000), Istočna Hercegovina (106 000), Zapadni Srěm (133 000).

## 4. Pourquoi l'écart compte

- **Votations** : avec les villes-États, la majorité est de 25 États sur 49. Serbes et
  Bulgares (23 États) l'atteignent avec Beograd et Sofija. Les cinq autres peuples
  (22 États) ne l'atteignent pas, même avec Zagreb et Sarajevo.
- **Narodni Sabor et Konfederalno Veće** : la parité donnait le pouvoir à cinq peuples sur
  sept, quelle que soit leur taille. Les cinq autres peuples, environ 44 % de la population,
  pouvaient décider contre les Serbes et les Bulgares, qui en forment environ 56 %.
  **Réglé par la double clé** (v4.9).
- **Perception** : un peuple qui se compte peut se sentir lésé, même quand l'effet réel est
  faible.

## 5. Pondération des voix d'États (proposition, non décidée)

Pour les votations, chaque État recevrait un poids fixé par une formule, à la place d'une
voix égale. Les villes-États gardent un poids de 1. Le total reste 49 et la majorité, plus de
24,5. Les poids sont recalculés à chaque recensement ; aucune frontière ne change.

| Peuple | Poids par État, proportionnel | Poids du peuple | Poids par État, Penrose | Poids du peuple |
|---|---|---|---|---|
| Slovènes | 0,93 | 4,64 | 1,16 | 5,81 |
| Croates | 0,71 | 7,13 | 0,72 | 7,21 |
| Serbes | 1,08 | 14,08 | 0,78 | 10,13 |
| Bosniaques | 0,75 | 2,98 | 1,17 | 4,66 |
| Monténégrins | 1,07 | 1,07 | 2,79 | 2,79 |
| Macédoniens | 1,99 | 3,99 | 2,70 | 5,39 |
| Bulgares | 1,11 | 11,12 | 0,90 | 9,00 |

- **Proportionnel** : poids d'un État = 45 × part du peuple dans la population ÷ nombre
  d'États du peuple. Chaque peuple pèse exactement sa part de population. Les rapports
  passent tous à 1,00.
  - Limite : la clé des États reproduit alors la population, et ne protège plus les petits
    peuples mieux que le vote populaire.
  - Serbes et Bulgares (25,2) atteignent seuls la majorité, sans les villes-États.
- **Penrose (racine carrée)** : le poids d'un peuple est proportionnel à la racine carrée de
  sa population, puis réparti également entre ses États. C'est la règle qui égalise
  l'influence de chaque citoyen dans un vote à deux niveaux.
  - Les petits peuples pèsent plus que leur part de population, les grands moins.
  - Serbes et Bulgares (19,1) n'atteignent plus seuls la majorité, même avec Beograd et
    Sofija (21,1).

Dans les deux cas, il faut modifier l'art. 124, donc un vote du peuple et des États avec le
consentement du Narodni Sabor.

## 6. Scénarios écartés

- **Redécoupage** :
  - partage de la Macédoine en quatre États ;
  - fusions croates (Baraña avec Slavonija, Dubrovačka Republika avec Dalmacija).

  Écartés le 2026-10-25 : « On crée des États au début, on ne va pas changer des limites
  administratives tous les quatre matins. »
- **Demi-voix pour les États de moins de 150 000 habitants** (modèle des demi-cantons) : ne
  règle pas le cas macédonien et accentue la surreprésentation bosniaque.
- **Réaffectation de populations entre peuples** (communes bosniaques du Sandžak comptées
  comme bosniaques, par exemple) : contraire au rattachement par État et au rôle des
  associations de municipalités.
