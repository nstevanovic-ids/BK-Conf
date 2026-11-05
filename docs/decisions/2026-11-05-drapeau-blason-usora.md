# ADR 2026-11-05 — Usora (US-43) : drapeau et blason

## Statut
**Remplacé** le 2026-11-05 par l'ADR 2026-11-05-usora-byzantin.md (croix d'or et briquets sur
gueules) : les croissants, sans signe serbe, ne convenaient pas à un État serbe.

Gelé jusque-là. Le 2026-11-05, l'utilisateur a fourni le blason d'Usora et demandé un drapeau 3:2 ; il a
validé le drapeau (« c'est parfait ») et demandé que le blason soit refait de la même façon.
Usora a été créée le même jour par la passe de fondation (ADR 2026-11-05-passe-de-fondation.md).

## Contexte
Le blason fourni (`images-sources/symboles/Usora-CoA-source.png`, 580 × 720) est une image
floue sur fond noir, surmontée du mot « USORA ». Le drapeau et le blason du portail en sont
reconstruits par géométrie, à partir de mesures prises sur l'image, sans dessin à main levée.

## Décision
**Blason** : parti d'or et de gueules, au chevron contre-changé, chargé de trois croissants
d'argent. Celui de la pointe est montant ; ceux des branches sont tournés vers la pointe du
chevron.

**Drapeau** (3:2) : bannière de ces armes.
- Le chevron garde la pente du blason (1,26, soit 51,6°). Sur un champ 3:2, cette pente fait
  passer son bord extérieur exactement par les deux coins du bas.
- L'épaisseur verticale du chevron vaut 0,36 de la hauteur, comme sur le blason.
- Les croissants gardent leur taille rapportée au chevron (diamètre à 82 % de sa largeur).
  Ceux des branches sont placés au milieu des branches, plus longues que sur l'écu.
- Couleurs relevées sur le blason : or #FAC033, gueules #B63033, argent #FFFFFF.

**Mesures communes** : croissant = disque de rayon R moins un disque de rayon 0,937 R décalé
de 0,50 R vers l'ouverture. Sur le blason (champ de 510 × 620), le bas de l'écu suit deux
courbes de Bézier ajustées sur le contour source (écart moyen de 1,4 px). Le blason a une
bordure d'argent et un liseré sombre (#1E1B1B).

## Conséquences
- `scripts/construction_usora.py` écrit `images-sources/drapeaux/Usora-Flag.svg`,
  `images-sources/symboles/Usora-CoA.svg` et `Usora-CoA.png` (fond blanc, pour le détourage).
- `portail/data/state_flags.json[US-43]` encodé par `scripts/encode_drapeaux.py US-43`
  (MAPPING : `US-43` → `Usora-Flag.svg`).
- `portail/images/coa-US-43.webp` produit par `scripts/encode_blason.py` : la fiche US-43
  affiche la carte « Coat of arms ».
- `FLAGNOTE.US` (`portail/data/flagnotes.json`), traduit dans les trois standards.
- Au passage, le MAPPING de `encode_drapeaux.py` pointe TK-39 et TL-40 sur
  `Timok-Flag-v2.jpg` et `Torlak-Flag-v2.jpg`, les drapeaux affichés depuis le 2026-10-25
  (ADR 2026-10-25-drapeau-timok.md, 2026-10-25-drapeau-blason-torlak.md). Le contrôle
  `--verify` passe de 48 à 51 drapeaux conformes sur 51 ; un réencodage complet (`--all`) ne
  remettrait plus les anciens drapeaux.
- Drapeaux encore à créer : Bregalnica, Severen Vardar et Tunxa.
