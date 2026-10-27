# ADR 2026-10-26 — La Constitution dans les trois standards officiels

## Statut
Accepté le 2026-10-26 (« Il faut traduire tout le site maintenant, dans toutes les langues du
site et les alphabets » ; seconde des deux PR, traduite depuis le texte anglais publié, le
texte de travail français faisant foi pour le sens). Suite de l'ADR
2026-10-26-traduction-pages.md.

## Décision
- **Trois versions officielles** de la Constitution v4.11, qui font également foi avec
  l'anglais publié (art. 151) :
  - `docs/constitution/v4.zap.md` (zapadni, base slovène) ;
  - `docs/constitution/v4.sre.md` (središñi, štokavien commun, yat ě) ;
  - `docs/constitution/v4.ist.md` (istočni, base bulgare), en alphabet v3.
- **Même structure que l'anglais** : préambule, 10 titres, 192 articles, 13 sections, mêmes
  listes et intertitres. Les préfixes de structure restent en anglais dans les fichiers
  (« # Title II / », « ### Article 12 bis / ») pour que `build_constitution.py` les lise ;
  seuls les noms et les corps sont traduits. Le script refuse une version dont la structure
  diffère de l'anglais.
- **Données** : `build_constitution.py` produit `constitution.json` (anglais) et
  `constitution.zap.json`, `.sre.json`, `.ist.json` ; `build_portail.py` les intègre.
- **Lecteur** (`#/constitution`) : il suit la langue choisie, et le cyrillique en SRE et IST.
  - Libellés de structure traduits à l'affichage : *Poglavje / Glava / Glava* pour Title,
    *Razdelek / Poglavļe / Razdel* pour Chapter, *Oddelek / Oděļak / Podrazdel* pour Section,
    *Člen / Član / Člen* pour Article (*čl.* dans le sommaire).
  - Les renvois deviennent des liens dans chaque standard (*člen 109*, *član 109*,
    *člen 109*, déclinés ou abrégés *čl.*).
  - Le chapeau dit, hors anglais, que les textes des trois standards font également foi et
    que celui-ci est le texte officiel du standard choisi. La date suit la langue.
  - La recherche indexe les articles dans la langue choisie.
- **Cyrillique** : les lettres de listes (*a.*, *b.*) et les lettres qui suivent un numéro
  d'article (*član 109 a*) restent latines, comme les chiffres romains.
- **Istočni** : rédigé en bulgare cyrillique, converti en latin v3 par `scripts/textes.py`,
  vérifié ligne par ligne par aller-retour (aucun écart). Les noms officiels restent en latin.

## Termes harmonisés entre les morceaux
- Au središñi, *države članice* pour « confederated States » (ni *konfederisane* ni
  *konfederirane*), comme dans les pages.
- *nacionalni* pour la nation entière, *narodni* pour les peuples constitutifs, les registres
  et les délégations nationaux.
- Chambre spéciale du Ustavni Sud : *posebni senat* (zap.), *posebno veće* (sre.),
  *специалната камара* (ist.). Konfederalna skupščina / skupština / Конфедерално събрание.
- La devise reste *Naš dom* ; la glose qui la répétait est supprimée au zapadni et au
  središñi.

## Propagation
- `docs/constitution/v4.zap.md`, `v4.sre.md`, `v4.ist.md` (nouveaux) ;
  `scripts/build_constitution.py`, `scripts/build_portail.py` ;
  `portail/data/constitution.*.json` ; `portail/index.html` (lecteur, recherche) ;
  `portail/data/textes.json`.
- `CLAUDE.md` : toute modification de fond de la Constitution se fait désormais dans les cinq
  textes (français de travail, anglais publié, trois standards).
- `docs/alfabet/interface-trois-standards.md`, `glossaire-trois-standards.md`, Journal officiel.
