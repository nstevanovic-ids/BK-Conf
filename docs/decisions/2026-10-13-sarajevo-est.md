# ADR 2026-10-13 — Sarajevo-Est dans Zapadno Podriñe ; contour de la ville-État de Sarajevo

## Statut
Accepté (2026-10-13, dans le cadre de l'intégration du recensement bosnien de 2013).

## Contexte
Deux communes de Sarajevo-Est (Republika Srpska) n'appartenaient à aucun État :
**Istočna Ilidža** (14 763 hab.) et **Istočno Novo Sarajevo** (10 642 hab.).
Elles formaient un trou d'environ 60 km² sur la carte. Par ailleurs, le contour
geoBoundaries du « canton de Sarajevo » englobait à tort Istočni Stari Grad
(commune de RS, déjà dans PZ-28), et les contours GADM des communes voisines
débordaient sur le canton ou laissaient des interstices.

## Décision
1. **Istočna Ilidža et Istočno Novo Sarajevo → PZ-28 Zapadno Podriñe**, qui
   contient déjà Pale, Istočni Stari Grad et Sokolac : la ville de Sarajevo-Est
   reste entière dans un même État serbe. Même principe qu'à Zagreb : la
   ville-État ne s'agrandit pas par sa banlieue.
2. **SA-92 Sarajevo = canton de Sarajevo** (9 communes : Centar, Hadžići, Ilidža,
   Ilijaš, Novi Grad, Novo Sarajevo, Stari Grad, Trnovo FBiH, Vogošća),
   413 593 hab. (2013), 1 201 km².

## Propagation (contours)
- `portail/data/SA-92.geojson` (nouveau) : canton geoBoundaries (ADM2) sans
  Istočni Stari Grad ; les unités GADM voisines sont découpées sur ce contour
  (Trnovo RS, Kalinovik, Konjic, Pale, Sokolac, Foča-Ustikolina) ; les bandes
  étroites du canton qui recouvraient Istočni Stari Grad reviennent à PZ-28.
- Interstices entre sources attribués à la commune qui les possède selon
  geoBoundaries ADM3 : Breza, Vareš, Olovo (VB-42), Trnovo RS (HI-12), Konjic
  (LV-21). Résultat : aucun recouvrement, aucun trou autour de Sarajevo.
- `portail/data/PZ-28.geojson` : les deux communes ajoutées (geoBoundaries ADM3).
- `docs/canon/etats.md` : composition de SA-92 précisée.
