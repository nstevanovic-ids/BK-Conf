# ADR 2026-10-25 — Les noms ekaviens n'ont pas de yat

## Statut
Accepté le 2026-10-25. Message de l'utilisateur :

> « Les noms ekaviens n'ont pas de yat donc pas besoin de e háček. »

Cette décision précise l'option 1 de la toponymie v3 (ADR
2026-10-25-toponymie-v3-cyrillique.md) et l'emporte sur elle pour les noms ekaviens.

## Décision
- Le **yat (ě) ne se restaure que là où la forme officielle montre le réflexe ijekavien** (ije,
  je) : Rěka, Běļina, Bělo Poļe, Bělovar, Osěk, Široki Brěg, Sěnica, Prěpoļe, Plěvļa, Han
  Pěsak, Němci, Gorña Rěka, Vukovarsko-srěmska.
- **Les noms ekaviens gardent *e*** : serbes, slovènes, macédoniens et bulgares. Le réflexe
  bulgare *ja* reste *ja* (Bjala).
- **Retours à la forme officielle** :
  - Beli Manastir (chef-lieu de Baraña), qui était passé à Běli Manastir le matin même ;
  - Sremska Mitrovica (chef-lieu d'Istočni Srěm) et Sremski Karlovci.
- La liste de racines `docs/alfabet/yat-racines.md` est abandonnée ; le fichier consigne
  désormais la décision.

## Hors du champ de cette décision
Les noms d'États **Istočni Srěm**, **Zapadni Srěm** et **Sěverna Trakija** sont des noms
confédéraux du canon v3 (annexe C de la Constitution). Ils ne sont pas des noms officiels
ekaviens et gardent leur graphie. Pour les aligner sur cette règle, il faudrait une décision
distincte, qui se propagerait aux codes, aux données, à la Constitution et au portail.

**Réglé le même jour** (ADR 2026-10-25-noms-etats-yat.md) : Istočni Srěm et Zapadni Srěm
gardent le yat ; Sěverna Trakija devient Severna Trakija.

## Propagation
- `docs/alfabet/toponymes-v3.csv` : trois lignes retirées.
- `opstine.json` : 342 communes en forme v3.
- `etats.json` et `etats.md` (chefs-lieux).
- `v3.md`, `transition-toponymique.md`, `yat-racines.md`.
- `CLAUDE.md`.
