# ADR 2026-11-08 — Sigle de l'Agence des situations d'urgence : KAVS

## Statut
Accepté le 2026-11-08 : « Oui », sur la proposition de commencer par ce sigle, seule
incohérence restante dans les noms des institutions.

Constitution portée en version 4.15 (article 62, section V de l'annexe).

Modifie :
- la décision « Nom sud-slave de l'ACGUB : le sigle est conservé », dans l'ADR
  2026-10-17-constitution-competences.md ;
- la remarque « le sigle ACGUB est gardé », dans l'ADR 2026-10-25-noms-sud-slaves-organes.md.

## Contexte
- L'agence qui dirige la protection civile (art. 62) a d'abord été nommée en français :
  *Agence confédérale de gestion des urgences balkaniques*, d'où le sigle ACGUB (ADR
  2026-10-17).
- Son nom sud-slave, *Konfederalna Agencija za Vanredne Situacije*, est venu le 25 octobre,
  mais le sigle ACGUB a été gardé.
- Depuis le 6 novembre, les noms des organes se traduisent dans chaque standard, et les
  sigles suivent les noms (ADR 2026-11-06-noms-officiels-traduits.md) : KIB, KPB et KBR ;
  KOA et KAR ; GS, MS et GO.
- ACGUB était le dernier sigle tiré d'un intitulé français. Il apparaissait dans les cinq
  textes de la Constitution et sur la page *Institutions* du portail.

## Décision
1. **Le sigle suit le nom dans chaque standard.**

   | Standard | Nom | Sigle |
   |---|---|---|
   | središñi (référence, anglais et français) | Konfederalna Agencija za Vanredne Situacije | **KAVS** |
   | zapadni | Konfederalna agencija za izredne razmere | **KAIR** |
   | istočni | Konfederalna agencija za izvãnredni situacii | **KAIS** |

   En cyrillique, le portail affiche КАВС (central) et КАИС (oriental).
2. **Intitulés descriptifs alignés sur le nom sud-slave** :
   - en français, *Agence confédérale des situations d'urgence* ;
   - en anglais, *Confederal Agency for Emergency Situations*.

   *Urgences balkaniques* ne venait que du sigle abandonné.
3. Rien d'autre ne change : missions (article 62) et rattachement au Département de la
   défense et de la sécurité.

## Propagation
- Constitution v4.15 :
  - `docs/constitution/v4.md` (note de version, article 62, section V de l'annexe) ;
  - `v4.en.md`, `v4.sre.md`, `v4.zap.md`, `v4.ist.md` (article 62, en-tête de version) ;
  - `portail/data/constitution*.json` régénérés.
- Portail :
  - `portail/index.html` : le Département de la défense et de la sécurité cite l'agence par
    son nom, traduit dans chaque standard ;
  - Journal officiel, entrée du 2026-11-08 ;
  - `portail/data/textes.json`.
- `docs/alfabet/glossaire-trois-standards.md`.
- Renvois dans les ADR 2026-10-17-constitution-competences.md,
  2026-10-25-noms-sud-slaves-organes.md et 2026-11-06-noms-officiels-traduits.md.
- `CLAUDE.md`.
- Les sections antérieures de l'annexe et les ADR antérieures gardent ACGUB, le sigle de
  leur date.
