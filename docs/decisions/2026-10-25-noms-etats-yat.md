# ADR 2026-10-25 — Yat dans les noms d'États : Srěm gardé, Severna Trakija

## Statut
Accepté le 2026-10-25 (« Ok pour tous les points A », point A2), sur proposition de Claude.
Constitution portée en version 4.10 (annexe Q), sans article nouveau.

## Contexte
L'ADR 2026-10-25-ekavien-sans-yat.md retire le yat des noms ekaviens. Elle laissait hors de
son champ trois noms d'États du canon v3, qui sont des noms confédéraux et non des formes
officielles : Istočni Srěm, Zapadni Srěm et Sěverna Trakija.

## Décision

| Code | Avant | Après | Motif |
|---|---|---|---|
| SI-31 | Istočni Srěm | **Istočni Srěm** (inchangé) | le Srem est une région partagée entre Serbes et Croates ; la forme croate *Srijem* montre le réflexe du yat, et Srěm unifie *Srem* et *Srijem* |
| SZ-38 | Zapadni Srěm | **Zapadni Srěm** (inchangé) | même région, même nom |
| TR-41 | Sěverna Trakija | **Severna Trakija** | nom purement bulgare (*Северна Тракия*), au réflexe ekavien ; aucun standard concerné ne l'écrit avec *je* |

La règle qui en découle : un nom d'État garde le yat seulement si l'une de ses formes
officielles montre le réflexe ijekavien. Les chefs-lieux suivent leur propre forme officielle
(Sremska Mitrovica, chef-lieu d'Istočni Srěm, reste sans yat).

## Propagation
- `portail/data/etats.json`, `docs/canon/etats.md`.
- Constitution v4.10 : art. 1 bis, annexe C, annexe Q (`v4.md`, `v4.en.md`) ;
  `portail/data/constitution.json` régénéré.
- `docs/alfabet/transition-toponymique.md`, `docs/alfabet/cyrillique-confederal.md` (exemple
  remplacé par Istočni Srěm / Источни Срѣм).
- ADR 2026-10-25-ekavien-sans-yat.md (renvoi).
- Portail : Journal officiel.
- `CLAUDE.md`.
