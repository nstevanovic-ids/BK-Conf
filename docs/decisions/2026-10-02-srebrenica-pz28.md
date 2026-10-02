# ADR 2026-10-02 — Réintégration de Srebrenica dans Zapadno Podriñe (PZ-28)

## Statut
Accepté (décision utilisateur du 2026-10-02).

## Contexte
Srebrenica figurait comme municipalité autonome `SO-PZ` (Samostalna Opština
Srebrenica, catégorie « Special ») hébergée par Zapadno Podriñe (PZ-28), et son
territoire était absent du GeoJSON de PZ-28 : la commune n'apparaissait donc pas
dans la surface de l'État sur la carte.

## Décision
Srebrenica est **pleinement réintégrée** à l'État de Zapadno Podriñe :
1. **Territoire** : le contour de la commune de Srebrenica (geoBoundaries ADM3,
   WGS84) est ajouté aux features de `portail/data/PZ-28.geojson` ; le polygone
   de PZ-28 l'inclut après dissolution.
2. **Autonomie dissoute** : l'entité `SO-PZ` est retirée de
   `entites-autonomes.json`. Total des entités autonomes : **25 → 24**.
   (La fédération bosniaque `SBO-PZ` du Podriñe reste inchangée.)

## Propagation
- `portail/data/PZ-28.geojson` (Srebrenica ajoutée), `geo.json` régénéré.
- `portail/data/entites-autonomes.json` (SO-PZ retirée).
- Compteurs : accueil, recherche et page Autonomy (24) ; `CLAUDE.md` ;
  `docs/canon/entites-autonomes.md` (titre + ligne SO-PZ supprimée).

## Note connexe (hors périmètre strict)
Le polygone réel de **Mostar (MO-96)** a été ajouté à la même occasion
(`portail/data/MO-96.geojson`, geoBoundaries ADM3) ; `gen_geo.py` consomme
désormais les fichiers `portail/data/<code>.geojson` pour les unités fédérales,
ce qui complète le dernier point en suspens (Mostar n'est plus un simple disque).
