# ADR 2026-06-28 — Suppression de l'État Sredña Bosna (BS-05)

## Statut
Accepté (décision utilisateur du 2026-06-28).

## Contexte
Après l'ajout de Lašva, Soli et Vrhbosna, l'État Sredña Bosna (BS-05,
Bošnjaci, chef-lieu Travnik) faisait double emploi sur le territoire de la
Bosnie centrale.

## Décision
1. **Suppression** de l'État territorial Sredña Bosna (BS-05) : retrait de
   `etats.json`, de son drapeau (`state_flags.json`) et de son contour
   (`portail/data/BS-05.geojson`).
2. **Communauté autonome** : `SHO-BS` (Savez Hrvatskih Opština Sredñe Bosne,
   communauté croate de Bosnie centrale) est **conservée mais rerattachée** à
   l'État Lašva : devient `SHO-LV` — *Savez Hrvatskih Opština Lašve*, hôte
   `LV-21`. Le nombre d'entités autonomes reste 25.
3. **Renumérotation** alphabétique contiguë des 45 États territoriaux restants
   (cascade -1 à partir de BZ : BZ-06→BZ-05, … , ZA-46→ZA-45 ; LV-22→LV-21).
4. **Total** : 50 → **49 États** (45 territoriaux + 4 villes-États), plus les
   2 municipalités fédérales.

## Propagation (immédiate et cohérente)
- `portail/data/etats.json`, `state_flags.json` (clés), `entites-autonomes.json`
  (id/nom/hôte de SHO-LV + remap des autres hôtes), `geo.json` régénéré.
- `portail/data/BS-05.geojson` supprimé.
- Compteurs du portail (accueil 49, annuaire « Forty-five… », pied de page).
- `CLAUDE.md`, `docs/canon/etats.md`, `docs/canon/entites-autonomes.md`.

## Note
Le contour de Lašva (LV) couvre la vallée de la Lašva ; si une lacune
territoriale subsiste là où s'étendait Sredña Bosna, elle reflète l'absence
de polygone et pourra être comblée par extension de Lašva ou des États voisins.
