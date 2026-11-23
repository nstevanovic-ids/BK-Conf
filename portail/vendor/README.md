# Bibliothèques tierces

| Fichier | Version | Licence | Source |
|---|---|---|---|
| `d3-array.min.js` | 3.2.4 | ISC, © 2010-2023 Mike Bostock | npm `d3-array` |
| `d3-geo.min.js` | 3.1.1 | ISC, © 2010-2024 Mike Bostock, 2008-2012 Charles Karney | npm `d3-geo` |
| `qrcode.min.js` | 2.0.4 | MIT, © 2009 Kazuhiko Arase | npm `qrcode-generator` (minifié avec terser) |

Utilisées par la carte (#/map) et les mini-cartes des fiches État : projection
satellite, découpage à l'horizon, graticule. `qrcode.min.js` dessine le code de
vérification au verso de la carte citoyenne (#/citizen). Chargées avec les pages qui s'en
servent (`DATA_ROUTE` du gabarit, dans cet ordre), plus au démarrage de toutes les pages
(ADR 2026-11-23-deploiement-lie.md) ; `scripts/build_portail.py --inline` les intègre dans le
fichier unique.
