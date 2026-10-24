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

## Restent à trancher
- **Portée du yat dans les noms de lieux** (`transition-toponymique.md`, § 4). Option 1,
  recommandée : le yat s'applique à tous les noms slaves affichés, Beograd excepté. Six
  chefs-lieux changent alors : Rěka, Běļina, Široki Brěg, Běli Manastir, Osěk, Sloveñ
  Gradec. Option 2 : le yat se limite aux noms créés par la Confédération, et Srěmska
  Mitrovica redevient Sremska Mitrovica.
- **Municipalités** : formes v3 des 1 461 municipalités (188 en *nj*/*lj*, 6 en *dž*, au
  moins 118 noms bulgares à retranscrire depuis le cyrillique), produites par
  `build_stats.py`.
- **Nord du Kosovo** : quatre municipalités de Kosovo i Metohija portent leur forme
  albanaise (Leposaviq, Shtërpca, Zveçan).
- **Cyrillique confédéral** : adoption, avec la règle bulgare *лю* → *ļu*. Cette règle
  vient de `v1.md` ; la saisie actuelle du parcours citoyen donne *lju*.
