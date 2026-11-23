# Bibliothèques tierces

| Fichier | Version | Licence | Source |
|---|---|---|---|
| `d3-array.min.js` | 3.2.4 | ISC, © 2010-2023 Mike Bostock | npm `d3-array` |
| `d3-geo.min.js` | 3.1.1 | ISC, © 2010-2024 Mike Bostock, 2008-2012 Charles Karney | npm `d3-geo` |
| `qrcode.min.js` | 2.0.4 | MIT, © 2009 Kazuhiko Arase | npm `qrcode-generator` (minifié avec terser) |
| `maplibre-gl/` (`maplibre-gl.mjs`, `maplibre-gl-worker.mjs`, `maplibre-gl.css`, `LICENSE.txt`) | 6.18.0 | BSD-3-Clause, © 2023 MapLibre contributors | npm `maplibre-gl@6.18.0` (`dist/`, inchangé ; intégrité `sha512-8ucT+RhJtEZGFvWGPioVQwvOPMAIuUehEgxl2dELw9aJmX4SpUi+OCHHAD33B9EuohNC7kC/gccJacUgTMQfQQ==`) |

d3 sert aux mini-cartes des fiches État (projection, découpage à l'horizon). `qrcode.min.js` dessine le code de
vérification au verso de la carte citoyenne (#/citizen). Chargées avec les pages qui s'en
servent (`DATA_ROUTE` du gabarit, dans cet ordre), et non plus au démarrage de toutes les pages
(ADR 2026-11-23-deploiement-lie.md) ; `scripts/build_portail.py --inline` les intègre dans le
fichier unique.

MapLibre GL JS dessine la carte (#/map, ADR 2026-11-23-carte-maplibre.md) : modules ES importés par
`import()` depuis `portail/js/carte-gl.js`, seulement sur `#/map`, au repos après le premier rendu ou
au premier geste. Son worker exige une adresse http(s) : le fichier unique ne l'embarque pas et y
garde la carte en SVG. `maplibre-gl-shared.mjs`, vide dans le paquet, n'est pas copié.
