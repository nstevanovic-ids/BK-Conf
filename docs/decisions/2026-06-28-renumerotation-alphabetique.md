# ADR 2026-06-28 — Renumérotation alphabétique stricte des codes d'État

## Statut
Accepté (décision utilisateur du 2026-06-28). Fait suite à l'ADR
`2026-06-28-trois-etats-lv-so-vb.md` qui avait posé des codes provisoires.

## Contexte
L'ajout de trois États (Lašva, Soli, Vrhbosna) avait été fait en codes
provisoires (LV / SO / VB sans numéro). Par ailleurs, l'ordre HI / HZ était
incorrect dans les données (HZ-13 / HI-14 alors que I < Z). La règle d'or
« renumérotation des codes strictement alphabétique » impose un code `XX-NN`
où `NN` suit le rang alphabétique du code-lettres `XX`.

## Décision
Renumérotation complète des 46 États territoriaux, triés par code-lettres,
`NN` = 01…46. Les villes-États (9x) et municipalités (9x) ne changent pas.

Changements de code appliqués :

| Ancien | Nouveau | État |
|--------|---------|------|
| HI-14 | HI-13 | Istočna Hercegovina |
| HZ-13 | HZ-14 | Zapadna Hercegovina |
| LV | LV-22 | Lašva |
| MI-22 | MI-23 | Istočna Mizija |
| MZ-23 | MZ-24 | Zapadna Mizija |
| PI-24 | PI-25 | Istočno Podriñe |
| PM-25 | PM-26 | Prekmurje |
| PO-26 | PO-27 | Podunavļe |
| PR-27 | PR-28 | Pirin |
| PZ-28 | PZ-29 | Zapadno Podriñe |
| RO-29 | RO-30 | Rodopi |
| RS-30 | RS-31 | Raška Sanxak |
| SI-31 | SI-32 | Istočni Srěm |
| SL-32 | SL-33 | Slavonija |
| SO | SO-34 | Soli |
| SP-33 | SP-35 | Šopluk |
| ST-34 | ST-36 | Štajerska |
| SU-35 | SU-37 | Šumadija |
| SX-36 | SX-38 | Stranxa |
| SZ-37 | SZ-39 | Zapadni Srěm |
| TK-38 | TK-40 | Timok |
| TL-39 | TL-41 | Torlak |
| TR-40 | TR-42 | Sěverna Trakija |
| VB | VB-43 | Vrhbosna |
| VI-41 | VI-44 | Istočen Vardar |
| VZ-42 | VZ-45 | Zapaden Vardar |
| ZA-43 | ZA-46 | Zagorje |

## Propagation (immédiate et cohérente)
- `portail/data/etats.json` : champ `c` renuméroté.
- `portail/data/state_flags.json` : clés ré-indexées sur les nouveaux codes.
- `portail/data/entites-autonomes.json` : champ `host` remappé.
- `portail/data/geo.json` : régénéré (`gen_geo.py` relie les contours par
  code-lettres, donc indépendant des numéros de fichiers).
- `docs/canon/etats.md` : table reconstruite ; `CLAUDE.md` (note HZ-14).
- `docs/canon/entites-autonomes.md` : références `(XX-NN)` remappées.

## Non touché (volontairement)
- **Noms des fichiers GeoJSON** : le nom de fichier n'est pas source de vérité
  (règle CLAUDE.md) ; le rattachement se fait par code-lettres. Ils gardent
  leurs noms d'origine.
- `flagnotes.json` : indexé par code court `k`, donc inchangé.
