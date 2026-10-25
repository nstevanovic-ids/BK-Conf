# ADR 2026-10-25 — Torlak (TL-40) : nouveau drapeau et blason

## Statut
Gelé. Décision de l'utilisateur du 2026-10-25 : « Change le drapeau du Torlak, et voici
son blason également » (drapeau fourni ensuite au format 3:2).

## Contexte
Le drapeau précédent reprenait les bordures du kilim de Pirot (frises crème et indigo à
rosettes) autour d'une bande rouge chargée de l'écu forteresse-et-croix, avec le
listel « ТОРЛАК ». TL-40 n'avait pas de blason sur le portail.

## Décision
**Drapeau** (3:2) : champ cramoisi de kilim ; au canton, la ligne de crête de la Stara
Planina en or ; au battant haut, la croix serbe aux quatre briquets en or ; en pointe, une
fasce ondée bleu ardoise bordée d'or (la Nišava) ; un triangle d'or à chaque angle, d'après
les motifs d'angle du kilim de Pirot.

**Blason** : écu bordé d'or, partagé en cinq champs autour d'un tourteau d'or chargé de la
croix serbe aux quatre briquets :
- de sinople, à un château d'or à deux tours ;
- d'azur, à une noisette feuillée et un piment d'or ;
- de gueules, à des pics de montagne d'or ;
- de cramoisi, à un losange de kilim d'or chargé d'un quatre-feuilles ;
- d'azur, à un pont de pierre à trois arches d'or sur des ondes d'or.

## Conséquences
- Sources brutes : `images-sources/drapeaux/Torlak-Flag-v2.jpg` (1728 × 1152) et
  `images-sources/symboles/Torlak-CoA.jpg` ; l'ancien `Torlak-Flag.png` est conservé.
- `portail/data/state_flags.json[TL-40]` réencodé par `encode_flag()` ; `FLAGNOTE.TL` réécrit.
- `portail/images/coa-TL-40.webp` produit par le nouveau `scripts/encode_blason.py` (fond
  détouré, frange décolorée du blanc, pas de liseré en mode sombre) : la fiche TL-40
  affiche désormais la carte « Coat of arms ».
- Le tracé SVG de secours de `flagSVG` pour `TL` (ancien drapeau) n'est plus atteint tant
  que `state_flags.json` porte l'image.
