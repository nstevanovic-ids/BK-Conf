# ADR 2026-11-06 — Tunxa (TU-42) : drapeau

## Statut
Gelé. L'utilisateur a retenu le 2026-11-06 l'image générée à partir du prompt « couronne de
chêne et rose » (« Ça c'est bien mais le blason est trop gros »). Il avait écarté auparavant
la fasce ondée (« ça fait drapeau de municipalité »).

## Contexte
Tunxa, créé le 2026-11-04 (ADR 2026-11-04-redecoupage-bulgare.md), était le dernier État sans
drapeau. La piste retenue réunit deux symboles de la vallée de la Tunxa : la couronne d'or de
Seuthès III et la rose de Kazanlak. L'étendard de Samara, lié à la bataille de Stara Zagora
(1877), a été écarté pour ses couleurs panslaves.

## Décision
**Drapeau** (3:2) : tiercé en fasce de sinople, d'argent et de sinople. La bande blanche est la
Tunxa, droite et non ondée. Brochant sur le tout, la couronne de chêne d'or glandée enserre une
rose de Damas de gueules boutonnée d'or ; l'emblème occupe la moitié de la hauteur.
- La couronne de chêne d'or vient de la tombe de Seuthès III, roi des Odryses, à Golyamata
  Kosmatka près de Kazanlak. Sa capitale, Seuthopolis, est sous le réservoir de Koprinka, sur
  la Tunxa.
- La rose est la rose à huile de la vallée de Kazanlak, drainée par la Tunxa.

## Conséquences
- Sources : `images-sources/drapeaux/Tunxa-Flag-genere.jpg` (image retenue, 1728 × 1152) et
  `Tunxa-Flag.png` (même image, emblème réduit de 71 % à 50 % de la hauteur, bandes refaites en
  aplat).
- `scripts/encode_drapeaux.py` : MAPPING `TU-42` → `Tunxa-Flag.png` ; `--verify` : 54/54.
- `FLAGNOTE.TU` (`portail/data/flagnotes.json`), traduit dans les trois standards.
- Tous les États et les deux municipalités confédérales ont désormais leur drapeau.
