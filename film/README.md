# Film explicatif : « The Confederation in five minutes »

Film en motion design, sans son, 1280 × 720, 30 images par seconde, construit en code : une composition
SVG (`explainer/`) que `FILM.seek(t)` dessine pour n'importe quel instant, puis un rendu image par image.

- `explainer/index.html` : la composition ; servie depuis la racine du dépôt
  (`python docs/lot1/outils/serve.py . 8002`, puis `http://127.0.0.1:8002/film/explainer/`), elle se lit en
  direct (espace = pause, ← → = 5 s, `?t=60` pour partir de 60 s).
- `explainer/film.js` : les scènes (aucun texte) ; données lues dans `portail/data/` (carte de marge
  `constitution/map.json`, États, peuples, chiffres) et moteur des votes `portail/js/regles.js`.
- `explainer/<langue>.js` : tous les textes à l'écran ; une autre langue = un autre fichier de même forme.
- `render.js` : Chromium (Playwright) capture chaque image, ffmpeg encode (H.264, yuv420p, faststart).

```bash
NODE_PATH=$(npm root -g) node film/render.js --lang en
```

Options : `--from` / `--to` (secondes), `--fps`, `--crf`, `--out`, `--stills 3,12.5` (images PNG dans
`film/stills/`, non versé). Sortie par défaut : `portail/videos/explainer-<langue>.mp4`.

Couleurs du canon (`docs/canon/couleurs-symboles.md`), Arimo et Sofia Sans Extra Condensed ; aucune couleur
par peuple (un peuple à la fois, dans une seule teinte, comme le filtre de la carte).
