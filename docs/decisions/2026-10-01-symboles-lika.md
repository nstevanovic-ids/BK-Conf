# ADR 2026-10-01 — Symboles de l'État de Lika (LK-20)

## Statut
Accepté (décisions adoptées, handoff symboles Lika).

## Contexte
L'État de Lika (LK-20, peuple croate, chef-lieu Gospić) abrite la communauté
serbe autonome SSO-LK. Il lui fallait un drapeau et des armoiries officiels,
intégrés au portail déployé (route `#/state/LK-20`).

## Décision
- **Scène identitaire commune** au drapeau (zastava) et à l'écu (grb) : ciel
  azur du Velebit, massif enneigé, loup gris sur la cime, šahovnica croate,
  marqueurs d'or.
- **Zastava officielle** = image (rendu Grok) : bande rouge en chef portant la
  šahovnica au guindant, champ azur, Velebit enneigé, loup sur la cime.
  Conservée **non vectorisée**. Encodée dans `state_flags.json["LK-20"]` via
  la fonction `encode_flag()` de `scripts/encode_drapeaux.py` (source :
  `images-sources/drapeaux/Lika-Flag-Velebit.webp`).
- **Grb officiel** = image (rendu Grok) : écu, chef rouge à la šahovnica,
  champ azur, Velebit enneigé, loup, bordure d'or. Conservé non vectorisé,
  **image de présentation** affichée sur la fiche d'État (carte « Coat of
  arms »), servie depuis `portail/images/coa-LK-20.webp` (source :
  `images-sources/symboles/Lika-CoA-Velebit.webp`).
- **Logique symbolique** : État croate (art. 126) ; loup + Velebit = identité
  ličkienne ; la šahovnica ancre l'appartenance croate.
- **FLAGNOTE** (anglais, livrable public) : « Official flag of Lika: a red band
  bearing the Croatian šahovnica at the hoist; azure field of the Velebit sky;
  a snow-capped massif; the grey wolf of Lika on the summit… »

## Points ouverts tranchés
- **Devise** : adoptée = **« Vuk i Velebit »** (« Le loup et le Velebit »). La
  banderole de l'écu est vide sur le rendu actuel ; la devise sera portée lors
  d'un futur re-rendu de l'écu. (Alternatives écartées : *Straža na Velebitu*,
  *Tvrd kao Velebit*.)
- **Éclair de Tesla** : **définitivement écarté** (déjà retiré des deux rendus).
- **Šahovnica** : les rendus portent l'**échiquier nu** (écusson en damier
  rouge-et-blanc, première case blanche, SANS la couronne des cinq blasons de la
  République de Croatie). C'est la forme voulue pour un État de la Confédération
  distinct de la Croatie réelle : **rien à changer**. (Une note antérieure
  évoquait par erreur une « version couronnée » à corriger ; il n'y en a pas.)

## Cohérence de code
- Code **confirmé = LK-20** (post-renumérotation alphabétique du 2026-06-28).
  Les mentions « Lika-Banovina / LB-21 » et « LK-21 » sont **obsolètes**.
- `balkanska_konfederacija.html` à la racine est la **sortie de build**
  (routes `#/state/…`, régénérée par `build_portail.py`) : ne pas éditer à la
  main. L'ancien artefact à routes `#/etat/` n'est plus présent dans le dépôt.

## Note technique
Le `MAPPING` de `scripts/encode_drapeaux.py` est **obsolète** (codes d'avant
la renumérotation et la suppression de BS-05, noms `XX.png` fictifs) : ne pas
lancer `main()` tel quel. L'entrée LK a été corrigée (`LK-20` →
`Lika-Flag-Velebit.webp`) et un avertissement ajouté en tête du dict ; une
reconstruction complète du MAPPING depuis `etats.json` reste à faire avant tout
run global.
