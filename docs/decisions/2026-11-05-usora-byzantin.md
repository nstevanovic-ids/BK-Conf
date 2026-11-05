# ADR 2026-11-05 — Usora (US-43) : drapeau et blason byzantins

## Statut
Gelé. Remplace l'ADR 2026-11-05-drapeau-blason-usora.md (chevron et croissants). Le même soir,
l'utilisateur a relevé le problème (« c'est un État serbe… des croissants et pas de signe serbe
sur le drapeau ») ; il a écarté trois croix serbes sur le chevron (« ça fait beaucoup ») et
demandé « un design type byzantin avec les couleurs de Usora et les 4C au lieu des 4B », en
fournissant `File:Serbian_Cross.svg` ; il a validé le résultat (« oui »).

## Contexte
Trois croissants d'argent, sans signe serbe, se lisent aujourd'hui en Bosnie comme un signe
bosniaque et musulman ; Usora est un État serbe (62,8 % de Serbes en 2013). Le blason trouvé
n'est pas celui de l'actuelle commune d'Usora (coupé d'azur et d'or, cinq besants sur un
chevron renversé), et il n'a pas d'origine historique établie : rien n'obligeait à le garder.
Les couleurs d'Usora, l'or et le gueules, sont celles de la bannière des Paléologues
(armorial de Wijnbergen : écu de gueules à la croix et aux briquets d'or). Usora a été un
domaine Nemanjić : Ladislas IV de Hongrie l'a confiée, avec la Mačva et Soli, au roi Stefan
Dragutin en 1284, qui l'a tenue jusqu'à sa mort en 1316.

## Décision
**Drapeau** (3:2) : de gueules à la croix d'or traversante, de 0,15 de la hauteur, cantonnée
de quatre briquets d'or. Chaque briquet est centré dans son quartier, haut de 0,74 fois le
quartier, le dos plat tourné vers la croix, les volutes vers l'extérieur.

**Blason** : même dessin dans l'écu d'Usora (forme inchangée), avec une bordure d'argent et un
liseré sombre. La traverse est placée haut (centre à 245 sur 620) et les briquets sont réduits
à 0,9, pour que ceux du bas tiennent dans la pointe de l'écu.

**Briquets** : tracé du symbole « elm » de `File:Serbian_Cross.svg` (Wikimedia Commons),
sans contour, en or. Couleurs : or #FAC033, gueules #B63033, comme dans la version
précédente.

## Conséquences
- `scripts/construction_usora.py` réécrit : il produit `images-sources/drapeaux/Usora-Flag-v2.svg`,
  `images-sources/symboles/Usora-CoA-v2.svg` et `Usora-CoA-v2.png`. Les sources de la version au
  chevron (`Usora-Flag.svg`, `Usora-CoA.svg`, `Usora-CoA.png`, `Usora-CoA-source.png`) restent
  dans le dépôt, non utilisées.
- Référence : `images-sources/symboles/Serbian_Cross-Commons.svg`, copie du fichier fourni.
  Licence à vérifier sur la page Commons du fichier avant toute diffusion hors du portail.
- `state_flags.json[US-43]` réencodé (MAPPING : `Usora-Flag-v2.svg`, `--verify` 51/51) ;
  `portail/images/coa-US-43.webp` refait ; `FLAGNOTE.US` réécrit et traduit dans les trois
  standards, l'ancienne description retirée de `textes.json`.
