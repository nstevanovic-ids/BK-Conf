# ADR 2026-10-13 — Ville-État de Zagreb : Turopolje, Stupnik et Bistra

## Statut
Accepté (décision utilisateur du 2026-10-13, application de la décision de juin 2026).

## Contexte
La décision de juin 2026 étendait la ville-État de Zagreb au **Turopolje**
(Velika Gorica, Pokupsko, Kravarsko, Orle), au titre de son identité communale
propre (*Plemenita opčina turopoljska*). Elle n'avait jamais été appliquée aux
données : la carte utilisait le seul contour de la Ville de Zagreb, Pokupsko
restait dans Zagorje, et cinq communes du comitat de Zagreb (Velika Gorica,
Kravarsko, Orle, Stupnik, Bistra, 74 994 hab.) n'appartenaient à aucun État.

## Décision
1. **ZG-94 Zagreb** = Grad Zagreb + Turopolje (Velika Gorica, Kravarsko, Orle,
   Pokupsko) + **Stupnik** : 6 unités, 837 607 hab. (recensement 2021), 1 204 km².
   Stupnik : dans les données, il ne touche aucun autre État que Zagreb, et sa zone
   logistique de Lučko forme un tout avec la ville.
2. **Bistra → ZA-45 Zagorje** : versant de Medvednica, contiguë au pays de Zaprešić
   et à Jakovlje, déjà dans Zagorje. L'extension de la ville-État reste fondée sur
   l'identité du Turopolje, pas sur la banlieue.
3. Pokupsko quitte ZA-45.

## Propagation
- `portail/data/ZG-94.geojson` (nouveau) : Grad Zagreb (geoBoundaries ADM1),
  Velika Gorica, Kravarsko, Orle, Stupnik (geoBoundaries ADM2), Pokupsko (GADM,
  retiré de ZA-43). Les unités geoBoundaries sont découpées pour ne pas empiéter
  sur les États GADM voisins, et les interstices de raccord sont attribués au
  voisin de plus longue frontière (aucun recouvrement, trous < 0,01 km²).
- `portail/data/ZA-43.geojson` : Pokupsko retiré, Bistra ajoutée.
- `scripts/gen_geo.py` : les trous de moins de 0,1 km² sont supprimés à la fusion
  des contours (raccords entre sources).
- `scripts/build_stats.py` : la population d'une ville-État dotée d'un contour
  communal se calcule par ses communes ; la Croatie boucle sans reste
  (États 3 034 226 + Zagreb 837 607 = 3 871 833).
- `docs/canon/etats.md` : composition de ZG-94 précisée.
