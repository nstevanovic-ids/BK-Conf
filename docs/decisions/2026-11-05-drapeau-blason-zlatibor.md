# ADR 2026-11-05 — Zlatibor (ZL-48) : drapeau et blason

## Statut
Gelé. L'utilisateur a fourni le drapeau et sa planche explicative le 2026-11-05, pour
Zlatibor, créé le même jour par la passe de fondation (ADR 2026-11-05-passe-de-fondation.md).

## Contexte
Zlatibor n'avait pas de drapeau : le portail affichait le drapeau provisoire au code de
l'État. La planche fournie (« Zlatibor district flag ») donne le sens des couleurs et
décompose le blason en trois pièces.

## Décision
**Drapeau** (8:5) : tricolore horizontal de gueules, d'or et d'argent, à bandes égales :
- gueules : le sang versé pour la liberté ;
- or : le Zlatibor, le « pin d'or » (*zlatni bor*) ;
- argent : la paix.

Au centre, à cheval sur les trois bandes, le blason de Zlatibor.

**Blason** : écu bordé d'argent et d'or. Le champ d'or s'élève en cimes de pins vers un chef
d'argent chargé de la croix serbe aux quatre briquets d'or ; sur le champ, le faucon blanc
d'Užice, becqué et armé de fauve.

Le drapeau reprend le gueules et l'argent des pan-couleurs serbes, sans l'azur ; l'or
propre au Zlatibor prend la place de la bande centrale. La croix aux quatre briquets marque le
rattachement au peuple serbe, comme sur Istočno Podriñe, Šumadija et Torlak.

## Conséquences
- Sources brutes : `images-sources/drapeaux/Zlatibor-Flag.png` (2171 × 1368) et
  `images-sources/symboles/Zlatibor-Planche.png` (planche d'origine).
- `images-sources/symboles/Zlatibor-CoA.png` : blason isolé de la planche (pièce « Coat of
  arms of Zlatibor district »), fond gris de la planche remplacé par du blanc. Le blason du
  drapeau n'est pas réutilisé : son liseré d'or se confond avec la bande d'or.
- `portail/data/state_flags.json[ZL-48]` encodé par `scripts/encode_drapeaux.py ZL-48`
  (MAPPING : `ZL-48` → `Zlatibor-Flag.png`, contrôlé par `--verify`).
- `portail/images/coa-ZL-48.webp` produit par `scripts/encode_blason.py` : la fiche ZL-48
  affiche la carte « Coat of arms ».
- `FLAGNOTE.ZL` (`portail/data/flagnotes.json`), traduit dans les trois standards
  (`portail/data/textes.json`).
- Drapeaux encore à créer : Bregalnica, Severen Vardar, Usora et Tunxa.
