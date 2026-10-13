# ADR 2026-10-13 — Constitution v4 consolidée

## Statut
Accepté (décision utilisateur du 2026-10-13).

## Contexte
Le dépôt ne contenait que les versions 1 et 2 de la Constitution. Depuis, trois
« v3 » distinctes avaient été produites hors dépôt, chacune à partir de la v2 :

- v3 territoriale (2026-08-20) : Article 1 bis à 45 États territoriaux, codes et
  graphies v3, articles 129 (32 lettres) et 130 (lecture libre du yat) ;
- v3 préambule (2026-09-14) : préambule solennel, devise *Različiti narodi, jedan dom* ;
- v3 sécurité (2026-09-19) : *Savezno Veće* → *Konfederalno Veće*, « fédéral » →
  « confédéral », Titre 7 / De la sécurité confédérale (art. 137 à 145 :
  Konfederalna Žandarmerija + Granična Straža, Konfederalni Istražni Ured à
  directoire de trois), amendements des art. 109 et 118.

## Décision
`docs/constitution/v4.md` fusionne ces trois branches en un texte unique et
devient la Constitution en vigueur. Elle est alignée sur le canon du dépôt
(`portail/data/etats.json`, `portail/data/entites-autonomes.json`, ADR jusqu'au
2026-10-02) :

- **49 États** (45 territoriaux + 4 villes-États) + 2 municipalités confédérales
  autonomes ; majorité des États pour la double majorité : 25.
- **24 entités autonomes** (SO-PZ dissoute, SHO-LV « Lašve », SSO-ZA dans ZA-45).
- Entité désignée « Confédération balkanique » ; « sud-slave » réservé à la
  langue, à l'alphabet et aux peuples.
- Corrections de consolidation : Ç retirée de l'art. 129 ; codes SO-BA / SO-PR
  rétablis (la v3 territoriale les avait passés en SP-, en collision avec Šopluk).

## Publication sur le portail
- Texte publié en anglais (`docs/constitution/v4.en.md`, règle « livrables publics
  en anglais »), sans l'annexe de transition, qui reste interne.
- `scripts/build_constitution.py` le convertit en `portail/data/constitution.json`.
- `#/constitution` : préambule + table des titres ; `#/constitution/title-N` :
  lecture article par article avec sommaire, renvois cliquables entre articles
  et liens vers les fiches d'États ; lien direct `#/constitution/title-N/art-X`.
  Les 53 articles sont indexés dans la recherche du portail.
- `portail/index.html` : *Savezno Veće* → *Konfederalno Veće* (fait) ; correction
  de `html,body{height:100%}` qui libérait l'en-tête collant après un écran.

## Propagation restant à faire (workstream portail)
- `portail/index.html` : libellés « federal city / federal municipality /
  federal institutions » → « confederal ».
- `portail/data/etats.json` : `SF-93` « Sofia » → « Sofija » (forme retenue le
  2026-05-24 ; déjà affichée en pied de page).
- `portail/data/entites-autonomes.json` et `docs/canon/` : « Bošnjačkih » /
  « Bošnjaci » → « Bošñačkih » / « Bošñaci » (règle v3 : њ → ñ, déjà appliquée
  à « Podriña » dans le même nom).
- `CLAUDE.md` : « Sofia » → « Sofija », « Bošnjaci » → « Bošñaci ».
