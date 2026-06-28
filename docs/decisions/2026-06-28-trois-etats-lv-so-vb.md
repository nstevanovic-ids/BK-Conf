# ADR 2026-06-28 — Ajout de trois États (Lašva, Soli, Vrhbosna) et corrections de peuples

## Statut
Accepté (décision utilisateur du 2026-06-28).

## Contexte
L'intégration des contours territoriaux réels (GeoJSON par État, communes GADM
dissoutes) sur la carte du portail a fait apparaître trois territoires fournis
comme États à part entière mais absents de la liste canonique :

- `LV-LASVA.geojson` — vallée de la Lašva (Bosnie centrale)
- `SO-SOLI.geojson` — région de Soli / Tuzla (Bosnie du nord-est)
- `VB-VRHBOSNA.geojson` — hautes terres de Vrhbosna (autour de Sarajevo)

Elle a aussi révélé deux erreurs de peuple constitutif dans `etats.json`.

## Décision
1. **Trois nouveaux États territoriaux** sont reconnus :

   | Code prov. | Nom | Peuple | Chef-lieu |
   |------------|-----|--------|-----------|
   | LV | Lašva | Hrvati (Croates) | Vitez |
   | SO | Soli | Bošnjaci (Bosniaques) | Tuzla |
   | VB | Vrhbosna | Bošnjaci (Bosniaques) | Ilijaš |

2. **Corrections de peuple constitutif** (erreurs canon) :
   - `BZ-06` Zapadna Bosna : Bošnjaci → **Srbi (Serbes)**
   - `RS-30` Raška Sanxak : Bošnjaci → **Srbi (Serbes)**

3. **Total** : 47 → **50 États** (46 territoriaux + 4 villes-États), plus les
   2 municipalités fédérales inchangées.

## Provisoire / à faire
- **Codes** : LV / SO / VB sont **provisoires**. La règle d'or de numérotation
  strictement alphabétique impose, à terme, d'insérer ces États à leur rang et
  de **renuméroter l'ensemble** des codes (impact : `etats.json`, fichiers
  GeoJSON, `state_flags.json`, drapeaux). Reporté à une passe dédiée.
- **Chefs-lieux** (Vitez, Tuzla, Ilijaš) : retenus par défaut, à confirmer.
- **Drapeaux** : pas de drapeau propre fourni ; rendu systémique par les
  pan-couleurs du peuple en attendant.
- **Cohérence narrative** : les notes de drapeau de BZ-06 et RS-30 décrivaient
  une héraldique bosniaque ; à revoir suite au changement de peuple.
- **Proportionnalité démographique** (HHI) : à recalculer après stabilisation.

## Conséquences propagées immédiatement
- `portail/data/etats.json` : peuples corrigés + 3 entrées ajoutées.
- `portail/data/geo.json` régénéré (carte : 46 polygones d'États).
- Compteurs du portail (accueil, annuaire, pied de page) : 47 → 50, 43 → 46.
- `CLAUDE.md` et `docs/canon/etats.md` mis à jour.
