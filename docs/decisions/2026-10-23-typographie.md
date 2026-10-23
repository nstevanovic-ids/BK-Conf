# ADR 2026-10-23 — Typographie : Arimo pour le texte, Sofia Sans Extra Condensed pour les titres

## Statut
Accepté. Demande de l'utilisateur du 2026-10-23 : le jat' latin (ě) ne s'affichait pas
dans la même police que le reste du texte. Choix d'Arimo, puis de Sofia Sans Extra
Condensed pour les titres (« titres Sofia, texte Arimo »).

## Constat
- Les fichiers Zurich BT (`zurich-regular.woff2`, `zurich-bold.woff2`) ne contenaient
  que 229 caractères : Latin-1 plus Š š Ž ž. Absents : Č č Ć ć Đ đ Ě ě Ļ ļ, tout le
  cyrillique et l'API.
- 84 des 114 caractères non-ASCII du portail retombaient donc sur Inter (Google Fonts).
  Mesure dans Chrome (`CSS.getPlatformFontsForNode`) sur cinq pages : 26 éléments
  accentués sur 34 mélangeaient deux polices (« Istočni Srěm », « Bačka », grille de
  l'alphabet).

## Décision
- **Texte** : Arimo (SIL OFL 1.1), police variable, graisses 400 à 700.
- **Titres** (h1 à h4), marque de l'en-tête et grands chiffres (`.fig b`, `.kpi .kn`) :
  Sofia Sans Extra Condensed (SIL OFL 1.1), police variable limitée à 400 à 800, avec
  `size-adjust: 110%` pour retrouver la hauteur de capitale des titres Zurich pour
  lesquels la mise en page a été dessinée (0,655 → 0,72 em).
- Les deux polices sont **auto-hébergées** dans `portail/fonts/` avec leurs licences
  (`OFL-Arimo.txt`, `OFL-Sofia-Sans.txt`) et intégrées en base64 par
  `scripts/build_portail.py --inline`. Plus aucun appel à Google Fonts. Zurich et Inter
  sont retirés.
- Pas de fichier italique : l'italique d'Arimo est quasi oblique, le navigateur incline
  le romain (deux usages, la devise de l'accueil).

## Couverture
- Sous-ensemble : latin, latin étendu A et B, API, grec, cyrillique et cyrillique
  étendu, ponctuation, flèches, symboles mathématiques et géométriques.
- Arimo couvre tout le texte affiché par le portail, ѣ et les onze symboles API de
  l'alphabet compris. Seuls les symboles d'interface ↵ ⌘ ▾ ◇ ✓ ✕ passent par la
  police système.
- Sofia Sans Extra Condensed couvre ě č ć đ ļ ñ et le cyrillique serbe et macédonien,
  mais ni ѣ ni l'API : un titre qui en contiendrait retomberait sur Arimo.

## Conséquences
- Build inline : 1 499 ko → 1 723 ko (arimo.woff2 124 ko, sofia 70 ko).
- Toute nouvelle police doit couvrir č ć đ ě ļ ñ, le cyrillique (ѣ compris) et l'API,
  vérifiés sur `portail/data/*.json` et `portail/index.html` avant intégration.

## Reproduire les fichiers
Depuis les polices variables Google Fonts (fontTools + brotli) :

```
U="U+0000-024F,U+0250-02FF,U+0300-036F,U+0370-03FF,U+0400-052F,U+2000-206F,U+20A0-20CF,U+2100-214F,U+2190-21FF,U+2200-22FF,U+25A0-25FF,U+FB00-FB06"
pyftsubset Arimo-VariableFont_wght.ttf --unicodes="$U" --layout-features='*' \
  --flavor=woff2 --output-file=portail/fonts/arimo.woff2
fonttools varLib.instancer SofiaSansExtraCondensed-VariableFont_wght.ttf wght=400:800 -o sofia.ttf
pyftsubset sofia.ttf --unicodes="$U" --layout-features='*' \
  --flavor=woff2 --output-file=portail/fonts/sofia-sans-extra-condensed.woff2
```
