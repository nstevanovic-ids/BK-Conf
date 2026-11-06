# ADR 2026-11-06 — Rodopi (RO-29) : drapeau ; le Ш passe à Šopluk

## Statut
Gelé, en deux décisions de l'utilisateur du 2026-11-06 :
- « Le drapeau de Rodopi correspond mieux au Shopluk. Échange. On va changer celui de
  Rodopi. » ;
- sur les pistes de Claude (lyre d'Orphée, fleur d'Orphée, vautour de l'Arda) : « combine
  les 3 », puis, sur l'image générée : « incroyable celui-là, juste le blason plus petit ».

## Contexte
Le drapeau au Ш (fichier `Rodopi-Flag-v2.png`), trouvé sur Reddit, était affecté à Rodopi.
Le Ш est l'initiale des Šopi : il va à Šopluk (SP-34). Rodopi réunit des Bulgares chrétiens, les
Pomaks de Smoļan et les Turcs de Kãrxali (entité TBB-RO) ; son emblème devait précéder les
églises comme les mosquées.

## Décision
**Šopluk (SP-34)** : le drapeau au Ш (vert, gueules et argent, triangle bleu marine au
guindant). Les six bandes or et gueules qu'il portait ne sont plus utilisées.

**Rodopi (RO-29)** : coupé de sinople et d'azur, les forêts au-dessus des eaux de l'Arda ;
brochant sur la lisière, un vautour fauve éployé d'or, colleté d'argent, tenant en ses serres
la lyre d'or d'Orphée, accosté en pointe de deux brins de fleurs d'Orphée (*Haberlea
rhodopensis*) de pourpre. L'emblème occupe la moitié de la hauteur.
- Orphée : les Rhodopes passent pour son pays natal ; la grotte de la Gorge du Diable, près
  de Trigrad, serait sa descente aux Enfers.
- La fleur d'Orphée (silivryak) est endémique des Rhodopes ; la légende la fait naître des
  larmes d'Orphée.
- Le vautour fauve : la seule population indigène de Bulgarie niche le long de l'Arda,
  autour de Maxarovo.
Ni croix ni croissant : le drapeau est commun aux trois communautés.

## Conséquences
- Sources : `images-sources/drapeaux/Rodopi-Flag-v3-genere.png` (image retenue, 1728 × 1152)
  et `Rodopi-Flag-v3.png` (emblème réduit de 71 % à 50 % de la hauteur, mis à l'échelle autour
  de la lisière des deux bandes, bandes refaites en aplat).
- `scripts/encode_drapeaux.py` : MAPPING `SP-34` → `Rodopi-Flag-v2.png`, `RO-29` →
  `Rodopi-Flag-v3.png` ; `--verify` : 54/54.
- Notes SP et RO (`portail/data/flagnotes.json`), traduites dans les trois standards.
