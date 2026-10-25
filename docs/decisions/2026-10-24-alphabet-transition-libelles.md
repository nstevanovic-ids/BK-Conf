# ADR 2026-10-24 — Alphabet : transition toponymique, cyrillique confédéral, libellés de la carte

## Statut
Accepté le 2026-10-24 pour le point B de la liste de ce qui restait à faire (« Ok pour le
point B ») :
- **B7** : annexe de transition toponymique, à établir depuis les données ;
- **B8** : proposition de cyrillique confédéral ;
- **B9** : revue des libellés de la carte citoyenne.

Deux points sont reportés : les noms sud-slaves des nouveaux organes (B6), présentés
séparément pour validation, et l'interface multilingue (B10).

## Décisions
1. **Libellés de la carte citoyenne (B9)** : validés. Seul l'oriental change :
   - *Izdadena ot* remplace *Izdatel*. C'est la formule des cartes bulgares (*издадена от*)
     et macédoniennes (*издадена од*) ; *izdatel* désigne plutôt un éditeur.
   - Les autres libellés des trois standards sont confirmés, dont le central *Opština
     porěkla*, qui porte le yat.

   Fichiers modifiés : `docs/canon/citoyennete.md` (libellés « validés ») et `CARD_L` dans
   `portail/index.html`.
2. **Annexe de transition (B7)** : `docs/alfabet/transition-toponymique.md`. Elle recense :
   - la règle ;
   - 11 noms d'États, dont 8 touchés par ñ, ļ ou ě (le « 9 » de `v3.md` comptait Sredña
     Bosna, supprimé) et 3 en x depuis la v1 ;
   - 5 chefs-lieux et les formes des entités autonomes ;
   - les écarts.
3. **Écarts corrigés tout de suite**, par application directe de la règle :
   - `flagnotes.json` : *Baraña’s wetlands*, *the Srěm marten* ;
   - *Ļubļana* à l'art. 1 ter de la Constitution et sur la page Institutions. Ces deux
     corrections passent par la PR de la Constitution v4.7, pour ne pas régénérer
     `constitution.json` dans deux PR.
4. **Cyrillique confédéral (B8)** : `docs/alfabet/cyrillique-confederal.md`. Il fait
   correspondre une à une les 32 lettres et le cyrillique :
   - socle serbe et macédonien ;
   - ã → ъ, ě → ѣ, ć → ћ, đ → ђ ;
   - щ, ю, я et й sont écrits en toutes lettres.

   C'est une **proposition** : elle n'est pas canonique avant une décision expresse.

## Points alors ouverts (tous réglés le 2026-10-25)
- **Portée du yat dans les noms de lieux** : option 1 retenue (ADR
  2026-10-25-toponymie-v3-cyrillique.md), précisée le même jour : les noms ekaviens n'ont pas
  de yat (ADR 2026-10-25-ekavien-sans-yat.md). Cinq chefs-lieux changent : Rěka, Běļina,
  Široki Brěg, Osěk, Sloveñ Gradec ; Beli Manastir et Sremska Mitrovica gardent leur forme
  officielle.
- **Municipalités** : formes v3 produites par `scripts/toponymie_v3.py`, appelé par
  `build_stats.py` (`opstine.json` v 2, nom officiel en alias).
- **Nord du Kosovo** : formes serbes (Leposavić, Štrpce, Zvečan), forme albanaise en alias
  (`docs/alfabet/toponymes-v3.csv`).
- **Cyrillique confédéral** : adopté, avec *лю* → *ļu* et *ja* écrit ја
  (`docs/alfabet/cyrillique-confederal.md`).
