# ADR 2026-11-06 — Konfederalni Istražni Biro (ex-Ured)

## Statut
Accepté le 2026-11-06 : « oui », sur la proposition de remplacer *Ured* par *Biro*, après la
question « on dit istražni ured en bulgare ? ». Constitution portée en version 4.14
(annexe U), sans article nouveau.

## Contexte
- Le Konfederalni Istražni Ured, agence d'enquête confédérale (art. 141 à 145, siège à
  Zagreb), porte un nom fixé par l'ADR 2026-10-25-noms-sud-slaves-organes.md. Ce nom est
  le même dans les trois standards : le glossaire ne traduit pas les noms officiels des
  organes.
- **En bulgare et en macédonien, *уред* signifie « appareil, instrument »**. Un Bulgare lit
  donc ИСТРАЖНИ УРЕД à peu près comme « appareil d'enquête ». *Истражни* n'est pas bulgare
  non plus : on y dit *разследване* ou *следствие*. Le nom bulgare naturel serait
  *Конфедерално бюро за разследване*, sur le modèle du FBI (*Федерално бюро за
  разследване*).
- *Ured* est en outre un mot marqué croate. Le serbe dit plutôt *kancelarija* ou *biro*, et
  la règle du središñi évite les mots marqués quand il existe une forme neutre
  (`docs/alfabet/interface-trois-standards.md`).
- La question est venue en dessinant l'écusson, dont la version cyrillique portait
  ИСТРАЖНИ УРЕД.

## Décision
1. **Le Konfederalni Istražni Ured devient le Konfederalni Istražni Biro**, sigle **KIB**.
   *Biro* se comprend partout :
   - *biro* en croate, en serbe et en slovène ;
   - *бюро* en bulgare ;
   - *биро* en macédonien.
2. **Noms par standard** (ADR 2026-11-06-noms-officiels-traduits.md, décidée le même jour) :
   - *Konfederalni Istražni Biro* (KIB) est le nom du središñi et le nom de référence ;
   - zapadni : *Konfederalni preiskovalni biro* (KPB ; KPU désigne déjà les écoles
     polytechniques, art. 66) ;
   - istočni : *Konfederalno bjuro za razsledvane* (KBR).

   En središñi, le nom se décline comme un nom commun : *Konfederalnog Istražnog Biroa*,
   *Konfederalnom Istražnom Birou*, *Konfederalnim Istražnim Biroom*.
3. Rien d'autre ne change : compétences, organisation (directoire de trois membres),
   siège à Zagreb, emblème (balance et épée).

## Écusson
- **Forme** : celle de l'écusson des forces armées de la PMR, montré par l'utilisateur comme
  modèle (haut en légère pointe, côtés droits, bas en pointe à angles vifs).
- **Couleurs** :
  - écu noir ;
  - bordure d'épaisseur constante dans le **jaune du drapeau d'État** (`#F4CC21`,
    échantillonné sur le soleil), à la demande de l'utilisateur (« le jaune est pas le même
    que le jaune de la confédération »).
- **Contenu** :
  - sigle **KIB** en lettres très larges et grasses (Montserrat Black étirée ; le B
    d'Unbounded, entaillé à gauche, a été écarté) ;
  - drapeau civil étiré sur presque toute la largeur, portant la balance et l'épée en jaune
    (le fléau repose sur une épée verticale, pointe en haut) ;
  - nom sur deux lignes en Sofia Sans Black.
- **Versions** : une par standard et par alphabet, puisque les noms se traduisent :
  - KPB (zapadni) ;
  - KIB et КИБ (središñi) ;
  - КБР (istočni, cyrillique seulement).

  Le cyrillique garde les formes de lettres bulgares, « totalement lisible pour un Serbe ».
- **Sources** : `images-sources/symboles/KIB-ecusson-zap.png`, `-sre-lat.png`,
  `-sre-cyr.png`, `-ist-cyr.png`.
- **Photo de l'encart du portail** : à produire (`portail/images/security-istrazni-biro.jpg`).

## Propagation
- Constitution v4.14 : `docs/constitution/v4.md` (note de version, annexe U), `v4.en.md`,
  `v4.zap.md`, `v4.sre.md`, `v4.ist.md` ; `portail/data/constitution*.json` régénérés.
- Portail :
  - institutions, Department of Justice, page *Security and Defence* (`portail/index.html`) ;
  - emplacement `security-istrazni-biro` (ex-`security-istrazni-ured`) ;
  - `portail/data/textes.json` ;
  - Journal officiel.
- `docs/canon/couleurs-symboles.md` (emblème, écusson, jaune du drapeau),
  `docs/alfabet/glossaire-trois-standards.md`, ADR 2026-10-25-noms-sud-slaves-organes.md
  (renvoi), `portail/images/README.md`, `CLAUDE.md`.
- Les ADR antérieures gardent l'ancien nom, qui était celui de leur date.
