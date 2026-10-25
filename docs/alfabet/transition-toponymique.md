# Transition toponymique — alphabet v3

Annexe de transition annoncée par `docs/alfabet/v3.md`. Elle recense les noms que la règle
toponymique v3 a modifiés et ceux qu'elle aurait dû modifier. Elle propose aussi le
traitement des 1 461 municipalités du parcours citoyen.

Sources :
- `docs/alfabet/v3.md` ;
- annexe C de la Constitution (`docs/constitution/v4.md`) ;
- `docs/canon/nominations.md` et `docs/canon/etats.md` ;
- `portail/data/etats.json`, `entites-autonomes.json` et `opstine.json`.

Relevé fait le 2026-10-24.

## 1. La règle

La forme v3 se lit sur la **référence cyrillique** du nom (serbe, macédonienne ou bulgare).
Les autres lettres gardent la graphie latine établie.

| Référence cyrillique | v3 | Nature | Exemple |
|---|---|---|---|
| њ (SC, MK), нь (BG) | ñ | graphique | Baranja → Baraña |
| љ (SC, MK), ль (BG) | ļ | graphique | Podunavlje → Podunavļe |
| џ, дж | x | graphique | Dobrudža → Dobruxa |
| ъ (BG) | ã | graphique | Bălgari → Bãlgari |
| réflexe du yat (e / je / ije / ja) | ě | étymologique | Srem, Srijem → Srěm |

Précisions :
- **Lettres graphiques** : les quatre substitutions ne changent aucune prononciation. Elles
  sont mécaniques : la lettre cyrillique suffit à les appliquer.
- **Yat** : sa restauration suppose de connaître l'étymologie. Elle unifie les formes
  ekavienne et ijekavienne ; chacun lit ě selon son standard (art. 130).
- **Exception déclarée** : *Beograd* garde sa graphie, sans yat (annexe C,
  `nominations.md`).
- **Séquences maintenues** :
  - *-rje-* reste r + j (Zagorje, Ludogorje, Prekmurje) ;
  - *dz* reste d + z ;
  - ç est réservé aux noms albanais et turcs.
- **Hors champ** :
  - les noms non slaves des entités autonomes (albanais, turcs, hongrois) restent dans
    leur langue ;
  - les noms de personnes ne sont jamais réécrits (`docs/canon/citoyennete.md`).

## 2. Noms déjà convertis

### États (11)

Huit noms sont touchés par la v3 (ñ, ļ, ě). Le « 9 » annoncé par `v3.md` comptait Sredña
Bosna, supprimé le 2026-06-28. Trois noms portaient déjà x en v1.

| Code | Forme antérieure | Forme v3 | Lettre |
|---|---|---|---|
| BR-04 | Baranja | **Baraña** | ñ |
| KR-17 | Kranjska | **Krañska** | ñ |
| PI-24 | Istočno Podrinje | **Istočno Podriñe** | ñ |
| PZ-28 | Zapadno Podrinje | **Zapadno Podriñe** | ñ |
| PO-26 | Podunavlje | **Podunavļe** | ļ |
| SI-31 | Istočni Srem | **Istočni Srěm** | ě |
| SZ-38 | Zapadni Srijem | **Zapadni Srěm** | ě |
| TR-41 | Severna Trakija (Северна Тракия) | **Sěverna Trakija** | ě |
| DJ-09 | Južna Dobrudža (Южна Добруджа) | **Južna Dobruxa** | x (v1) |
| RS-30 | Raška Sandžak | **Raška Sanxak** | x (v1) |
| SX-37 | Strandža (Странджа) | **Stranxa** | x (v1) |

### Chefs-lieux (5)

| État | Forme officielle | Forme v3 |
|---|---|---|
| BN-03 | Zrenjanin | **Zreñanin** |
| BZ-05 | Banja Luka | **Baña Luka** |
| HI-12 | Trebinje | **Trebiñe** |
| KR-17 | Ljubljana | **Ļubļana** |
| SI-31 | Sremska Mitrovica | **Srěmska Mitrovica** |

### Entités autonomes (5 entités, 6 formes)

| Code | Forme v3 |
|---|---|
| SBO-PZ | Savez **Bošñačkih** Opština Zapadnog **Podriña** |
| SBO-RS | Savez **Bošñačkih** Opština **Raške-Sanxaka** |
| SO-CG | Samostalna Opština **Ulciñ** |
| BAO | **Bãlgarski** Avtonomni Opštini |
| SO-PR | Samostalna Opština Gorna **Xumaja** |

### Termes

*Bošñaci*, *Bošñak*, *Bošñakinja* (art. 102, `peuples.md`) ; *Bãlgari*, *Bãlgarin*,
*Bãlgarka* ; *Sofija*.

## 3. Écarts relevés

### a. Corrigés avec la présente annexe (application directe de la règle)

| Où | Avant | Après |
|---|---|---|
| Constitution, art. 1 ter (FR et EN) | Ljubljana | Ļubļana |
| Portail, page Institutions (Cour des comptes) | Ljubljana | Ļubļana |
| `flagnotes.json`, BR | Baranja’s wetlands | Baraña’s wetlands |
| `flagnotes.json`, SI | the Srem marten | the Srěm marten |

Les corrections de la Constitution et de la page Institutions passent par la branche de la
Constitution, pour ne pas régénérer `constitution.json` dans deux PR à la fois.

### b. Chefs-lieux non convertis (réglé le 2026-10-25)

La graphie de Srěmska Mitrovica montre que la règle a été appliquée aux chefs-lieux, mais
elle ne l'a pas été partout :

| État | Forme actuelle | Forme selon la règle | Motif |
|---|---|---|---|
| KJ-15 | Slovenj Gradec | **Sloveñ Gradec** | Словењ Градец (ñ) |
| PZ-28 | Bijeljina | **Běļina** | Бијељина (ļ) ; *bijel-*, yat |
| KV-18 | Rijeka | **Rěka** | yat (*rěka*) |
| BR-04 | Beli Manastir | **Běli Manastir** | yat (*bělъ*) |
| HZ-13 | Široki Brijeg | **Široki Brěg** | yat (*brěgъ*) |
| SL-32 | Osijek | **Osěk** | yat (*osěkъ*, étymologie à confirmer) |

Sloveñ Gradec est une application directe de la règle graphique. En slovène, *nj* final se
prononce [n], mais ñ ne prescrit aucune prononciation. Les cinq autres dépendent de la
portée donnée au yat.

**Réglé** : Sloveñ Gradec, Běļina, Rěka, Široki Brěg et Osěk sont convertis. Beli Manastir
garde sa forme officielle, comme tout nom ekavien (ADR 2026-10-25-ekavien-sans-yat.md).

### c. Municipalités du parcours citoyen (`opstine.json`, réglé le 2026-10-25)

Les 1 461 municipalités portent leur nom officiel national, sans conversion. La carte
citoyenne imprime donc « Trebinje » comme commune d'origine, alors que la fiche de l'État
affiche « Trebiñe ».

| Cas | Nombre | Exemples |
|---|---|---|
| *nj* ou *lj* (HR 94, SI 38, SR 27, BA 21, ME 7, MK 1) | 188 | Donji Vakuf → Doñi Vakuf, Celje → Ceļe, Cetinje → Cetiñe |
| *dž* | 6 | Ilidža → Ilixa, Hadžići → Haxići, Odžak → Oxak |
| Bulgarie, translittération officielle simplifiée (*sh, ch, zh, ts, y*) | au moins 118 sur 265 | Balchik → Balčik, Aytos → Ajtos, Apriltsi → Aprilci |
| Réflexe *ije* du yat (HR, BA, ME) | environ 12 | Bijelo Polje → Bělo Poļe, Prijepolje → Prěpoļe, Han Pijesak → Han Pěsak |
| Kosovo i Metohija : formes albanaises dans un État serbe | 4 | Leposaviq → Leposavić, Shtërpca → Štrpce, Zveçan → Zvečan |

Pour la Bulgarie, la translittération simplifiée note ъ et а par le même « a ». Elle n'est
donc pas réversible : il faut repartir des noms cyrilliques (NSI ou GADM, champ
`NL_NAME`). Pour les noms en *ekavien* (Serbie), le yat ne se voit pas dans la forme
officielle (Bela Palanka ← *bělъ*). Il faudrait une liste de racines à yat.

**Réglé** : toutes les municipalités sont converties par `scripts/toponymie_v3.py` (section 4).
La liste de racines est abandonnée : les noms ekaviens gardent *e*.

## 4. Options

**Décision du 2026-10-25 : option 1, appliquée** (ADR 2026-10-25-toponymie-v3-cyrillique.md).
- `scripts/toponymie_v3.py` produit la forme v3 des 1 461 communes, dont 345 changent : 211
  hors de Bulgarie et 134 en Bulgarie.
- Les formes validées qui ne découlent pas des substitutions graphiques sont dans
  `docs/alfabet/toponymes-v3.csv`.
- Le cyrillique bulgare des 265 communes est dans `docs/alfabet/toponymes-bg.csv`.
- Cinq des six chefs-lieux sont convertis ; Beli Manastir garde sa forme (ligne suivante).
- Les noms ekaviens n'ont pas de yat et gardent *e* (décision du 2026-10-25, ADR
  2026-10-25-ekavien-sans-yat.md). Beli Manastir et Sremska Mitrovica gardent donc leur
  forme officielle, et 342 communes changent au total.

**Option 1 (retenue) : la règle s'applique à tout nom slave affiché par la
Confédération.**
- **Substitutions graphiques** :
  - ñ, ļ, x et ã s'appliquent partout, aux municipalités comme aux chefs-lieux ;
  - les noms bulgares sont retranscrits depuis le cyrillique.
- **Yat** :
  - restauré dans les noms d'États, de chefs-lieux et d'entités ;
  - restauré dans les noms de municipalités dont la forme officielle montre le réflexe
    (*ije*, *je*) ;
  - les noms ekaviens gardent *e* (précision du 2026-10-25, voir plus haut).
- **Exception** : Beograd seul.
- **Recherche** : le nom officiel national reste un alias, et le parcours citoyen accepte
  déjà toutes les graphies.

Cette option prolonge ce que le canon a déjà fait (Srěm, Srěmska Mitrovica, exception
déclarée de Beograd, *porěklo* sur la carte). Six chefs-lieux changent : Rěka, Běļina,
Široki Brěg, Běli Manastir, Osěk, Sloveñ Gradec.

**Option 2 : le yat ne vaut que pour les noms créés par la Confédération** (États, entités,
institutions).
- ñ, ļ, x et ã s'appliquent partout.
- Les villes et les municipalités gardent le réflexe de leur nom officiel.
- Srěmska Mitrovica redevient Sremska Mitrovica, et l'exception de Beograd devient sans
  objet.

Cette option est plus simple et ne demande aucune étymologie. En revanche, elle revient sur
une graphie du canon.

**Dans les deux cas** :
- les formes v3 des municipalités seraient produites par `scripts/build_stats.py`, à partir
  d'une table de conversion versionnée dans `docs/alfabet/`, jamais à la main ;
- les quatre municipalités du nord du Kosovo passeraient en forme serbe, avec la forme
  albanaise en alias.
