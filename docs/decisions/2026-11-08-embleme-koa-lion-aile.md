# ADR 2026-11-08 — Emblème de la KOA : le lion ailé à la torche et à l'épée

## Statut
Accepté le 2026-11-07 :
- « Ça me va », sur l'emblème en couleur, médaillon agrandi ;
- « C'est celui que je veux dans le sol », sur la version monochrome.

Modifie :
- l'ADR 2026-10-22-emblemes-services-securite.md (décision 4 : le poskok) ;
- la règle commune « le lion ailé n'apparaît qu'en petit », dans
  `docs/canon/couleurs-symboles.md`.

## Contexte
- Le 22 octobre, le poskok (vipère ammodyte) a été attribué à la Konfederalna Obavěštajna
  Agencija (KOA, art. 145 bis et 145 ter), comme base d'un logo à dessiner.
- Les 6 et 7 novembre, plusieurs logos au poskok ont été écartés :
  - un sceau rond en aplat, avec la carte de la Confédération : « trop enfantin » ;
  - des rendus générés, en relief ou à plat : « trop IA », « on dirait un coin » ;
  - une marque vectorisée sur un globe : « grave nul » ;
  - une transposition de l'emblème du service de renseignement géorgien (écu rond au
    drapeau, écusson timbré).
- Modèles cités par l'utilisateur : le SVR russe, « méga stylé » (aigle tenant la torche et
  l'épée, médaillon à l'étoile et au globe), le service géorgien, la NSA, la DIA et la NGA
  américaines, la DGSE.
- Demandes successives :
  - « fais un lion ailé avec les ailes déployées. Pour un logo, donc le lion regarde de
    face » ;
  - « je veux qu'il les tienne dans la main » (la torche et l'épée) ;
  - « le médaillon rond, le globe, le soleil » ;
  - « il faut agrandir le médaillon au centre ».

## Décision

### 1. L'emblème de la KOA
**Le lion ailé d'or, de face, tenant la torche et l'épée, un médaillon sur la poitrine.**
- **Pose** :
  - debout sur les pattes arrière, tête de face, symétrique, gueule fermée, crinière
    bouclée ;
  - ailes d'aigle déployées et levées.
- **Torche et épée** :
  - la patte à gauche du spectateur tient une torche à flamme rouge ;
  - celle de droite tient une épée droite, à lame d'argent et à garde d'or ;
  - torche et épée se croisent derrière la poitrine, comme sur l'emblème du SVR.
- **Médaillon** :
  - anneau d'argent clouté de quatorze clous d'or ;
  - champ bleu marine ;
  - soleil d'or à trente-deux rais à facettes ;
  - au centre, un globe bleu clair quadrillé d'or tous les 30°, en projection
    orthographique centrée sur les Balkans, avec le contour exact de la Confédération en or.
- **Lecture proposée** :
  - la torche, la connaissance, c'est-à-dire le renseignement (comme à la DIA et au SVR) ;
  - l'épée, la protection, celle de la branche intérieure ;
  - le globe, le champ de la branche extérieure ;
  - le soleil et le lion, la Confédération.
- **Sans texte** : une seule image vaut pour toutes les langues et les deux alphabets.

### 2. Le poskok n'est plus l'emblème de la KOA
Aucun service ne le porte plus.

### 3. Deuxième exception au lion « en petit »
Le lion ailé est le motif principal de deux emblèmes seulement, et ils se distinguent :

| | Forces armées | KOA |
|---|---|---|
| Pose | accroupi, tourné vers la droite | debout, de face, ailes déployées |
| Gueule | ouverte | fermée |
| Objets | le buzdovan | la torche et l'épée |
| Médaillon | aucun | sur la poitrine |

Les autres services gardent la règle : le lion ailé n'y paraît qu'en petit, comme signe de
rattachement.

### 4. Aucune filiation vénitienne
Le lion ailé vu de face, ailes ouvertes, est aussi le lion de saint Marc *in moleca*, à
Venise. L'emblème n'a donc :
- ni auréole ;
- ni livre ;
- ni eau.

Le lion est représenté debout, en entier.

### 5. Le soleil du médaillon
Ses trente-deux rais le distinguent de deux autres soleils :
- le soleil à trente-six rais du drapeau d'État ;
- le soleil à sept rais, réservé au sceau.

## Versions
- **Couleur** : `images-sources/symboles/KOA-embleme.png`. Le lion et le médaillon sont
  générés par ChatGPT. Deux reprises ont suivi :
  - le globe a été redessiné en projection exacte, car le globe généré dorait la Turquie,
    le Proche-Orient et la péninsule arabique, et pas les Balkans ;
  - le médaillon a été agrandi de 22 %.
- **Monochrome**, vectorisée : `KOA-embleme-mono-noir.svg`, `KOA-embleme-mono-noir.png`,
  `KOA-embleme-mono-blanc-sur-noir.png`.
  - Les ombres des ailes et de la crinière deviennent des aplats.
  - La flamme est au trait.
  - Le globe est redessiné au trait : continents en contour, quadrillage, Confédération en
    plein.
  - Usages : tampon, gravure, gaufrage, incrustation.

## Le hall du siège
- Dans le hall du siège à Sarajevo, l'emblème monochrome est incrusté au centre du sol :
  - laiton dans du granit noir poli, d'après la version blanc sur noir ;
  - au milieu d'un médaillon de sol d'environ cinq mètres, cerclé de laiton.
- C'est la photo de l'encart KOA du portail (`portail/images/security-obavestajna-agencija.jpg`,
  page *Security and Defence*) :
  - des agents en costume traversent le hall, porte-badge au cou ;
  - les visages sont floutés, et le flou a été repris sur ceux qui restaient reconnaissables ;
  - aucun texte lisible, donc pas de variante par standard.

## Propagation
- `docs/canon/couleurs-symboles.md` (table des emblèmes, règles communes).
- ADR 2026-10-22-emblemes-services-securite.md (renvoi).
- `CLAUDE.md`.
- `portail/images/security-obavestajna-agencija.jpg`, `portail/images/README.md`.
- `images-sources/symboles/KOA-embleme*.{png,svg}`.

## Reste ouvert
- Insigne de manche ou basse visibilité de la KOA, qui peut partir de la version
  monochrome.
- Version vectorielle du lion en couleur : le lion reste l'image générée.
