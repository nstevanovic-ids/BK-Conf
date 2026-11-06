# ADR 2026-11-06 — Le loup pour la Žandarmerija, le lion ailé pour les forces armées

## Statut
Accepté le 2026-11-06 : « laisse tomber le lynx, ce sera le loup pour la gendarmerie […]
pour les forces armées ce sera plus institutionnel avec le lion ailé ».

Modifie l'ADR 2026-10-22-emblemes-services-securite.md (décisions 1 et 2, emblème des forces
armées). Les règles de dessin du loup (section 4) sont proposées par Claude.

## Contexte
- Le 22 octobre, le lynx des Balkans a été attribué à la Konfederalna Žandarmerija.
- Le 28 octobre, le loup a été retenu pour les forces armées. La PR #72, qui l'inscrivait
  au canon, n'a pas été fusionnée ; elle est remplacée par la présente décision.

## Décisions

### 1. Konfederalna Žandarmerija : le loup (*Canis lupus*)
Il remplace le lynx.
- **Natif de toute la région** : la population dinaro-balkanique, de la Slovénie à la
  Bulgarie, est l'une des plus importantes d'Europe. Il ignore les frontières intérieures,
  comme les missions de la Granična Straža.
- **Il vit en meute** : un corps organisé en unités, présent sur tout le territoire.
- **Il garde son territoire** : la Žandarmerija garde les frontières extérieures, les axes
  et les infrastructures d'intérêt confédéral (art. 139 a, c et d).

### 2. Le lynx n'est plus l'emblème d'aucun service
La raison qui l'écartait du totem confédéral (son attribution à la Žandarmerija) tombe : il
peut redevenir candidat. Le totem reste à choisir.

### 3. Konfederalne Oružane Snage : le lion ailé d'or
- L'emblème des forces armées est **institutionnel** : le lion ailé, emblème de la
  Confédération (art. 7 bis), en est le motif principal.
- C'est la suite logique de l'art. 7 bis : le drapeau d'État, qui porte le lion ailé, est
  réservé aux institutions confédérales, aux forces armées et aux représentations à
  l'étranger. L'armée est celle de la Confédération tout entière, pas un service parmi
  d'autres.
- **Exception à la règle commune** : le lion ailé n'apparaît qu'en petit sur les logos des
  services, sauf pour les forces armées.
- **Dessin retenu le même jour** (« ce sera ça pour les Oružane Snage ») :
  - lion ailé d'or, accroupi, tourné vers la droite, gueule ouverte ;
  - une patte avant levée tient un **buzdovan** (masse d'armes à ailettes, signe du
    commandement), qui reprend la piste du 22 octobre ;
  - trait gravé brun sur fond clair.
- C'est une variante militaire du lion du canon, qui est rampant. Elle reste sans
  filiation vénitienne : ni livre, ni auréole, ni épée. La posture accroupie rappelle le
  lion de saint Marc ; le buzdovan l'en distingue.

### 4. Le loup : associations existantes et règles de dessin
Le loup porte déjà trois associations dans la région. Elles ne remettent pas le choix en
cause, mais elles fixent ce que l'emblème ne doit pas montrer.

| Association | Ce qu'elle est | Conséquence |
|---|---|---|
| **Lika (LK-20)** | loup gris sur la cime du Velebit, au drapeau et à l'écu de l'État ; devise *Vuk i Velebit* (ADR 2026-10-01-symboles-lika.md) | ni montagne ni Velebit ; Lika garde son loup |
| **Guerres des années 1990** | surnom d'unités des deux côtés : la 9e brigade de la garde « Vukovi » de l'armée croate (Gospić) ; les « Vukovi s Vučjaka », unité paramilitaire serbe de Bosnie (Prnjavor) | aucune unité de la Žandarmerija ne s'appelle *Vukovi* ; jamais d'armoiries d'un peuple avec le loup |
| **Loups gris** (*Bozkurtlar*, Ülkü Ocakları) | mouvement ultranationaliste turc, dissous en France en novembre 2020 ; emblème : loup hurlant, souvent dans un croissant ; salut de la main en tête de loup | ni loup hurlant, ni croissant, ni geste de la main ; la communauté turque est l'une des quatre communautés autonomes |

Règles de dessin :
- tête de loup de profil, gueule fermée, à l'horizontale, jamais levée vers le ciel ;
- ni montagne, ni croissant, ni armoiries d'un peuple, ni geste de la main.

### 5. Écusson et portail
- Écusson retenu pour le portail :
  - écu noir bordé d'or, « ŽANDARMERIJA » en haut ;
  - drapeau civil tourné d'un quart de tour, bande rouge en haut ;
  - tête de loup noire de profil, gueule fermée.
- Il remplace la photo de l'écusson au lynx dans l'encart de la Žandarmerija (page
  *Security and Defence*, `portail/images/security-zandarmerija.jpg`).
- Deux variantes cyrilliques, montrées quand le cyrillique est actif :
  - **ЖАНДАРМЕРИЈА** (cyrillique central, standard središñi) :
    `security-zandarmerija-sre.jpg` ;
  - **ЖАНДАРМЕРИЯ** (cyrillique oriental, conventions bulgares, standard istočni) :
    `security-zandarmerija-ist.jpg`.
- Mécanisme général pour toute image qui porte du texte : table `SLOT_CYR` du portail,
  fichiers `<nom>-sre.jpg` et `<nom>-ist.jpg`.

### 6. Écusson des forces armées et camouflage
Retenus le même jour, « pour l'instant » (« ça fera l'affaire pour l'instant, go avec
ça »), après trois essais :
- un écusson au drapeau, avec le nom sur un bandeau noir puis sur la bande rouge, a été
  jugé « trop clair, trop voyant » ;
- un essai a cassé le drapeau en tricolore horizontal rouge-blanc-bleu, qui se lit comme le
  drapeau croate.

**Écusson de l'armée de terre (*vojska*)** :
- écu uni **kaki très foncé**, mat, bord du même ton ;
- lion ailé au buzdovan brodé en **or vieilli mat** ;
- ni texte, ni drapeau. Une seule image sert donc pour toutes les langues et les deux
  alphabets.

**Couleur de fond par composante** : kaki très foncé pour l'armée de terre (décidé). Pour
les forces aériennes (bleu ardoise foncé) et la marine (bleu marine presque noir), ce sont
des propositions non décidées ; leurs noms sud-slaves restent à fixer.

**Camouflage : le TAZ 90 suisse** (« il faudrait prendre un motif camo neutre donc partons
sur le suisse ») :
- quatre couleurs : vert, brun, beige et noir. Son successeur, le TAZ 16, garde le dessin
  et remplace le noir par un brun clair ;
- motif d'un pays neutre, sans lien avec les camouflages des guerres des années 1990 ;
- dans les visuels, ni drapeau ni croix suisses : l'écusson confédéral est le seul insigne.

Le kaki très foncé sort de la palette du drapeau, comme le noir de l'écusson de la
Žandarmerija : ce sont deux exceptions admises pour les insignes basse visibilité.

Portail : la photo de l'écusson sur la manche en TAZ 90 occupe l'encart des forces armées
(`portail/images/security-armed-forces.jpg`).

## Reste ouvert
- Écussons des forces aériennes et de la marine, et leurs noms sud-slaves.
- Animal totem de la Confédération.

## Propagation
- `docs/canon/couleurs-symboles.md` (table des emblèmes, règles communes).
- ADR 2026-10-22-emblemes-services-securite.md (renvois).
- `portail/images/security-armed-forces.jpg`.
- `portail/images/security-zandarmerija.jpg`, `-sre.jpg`, `-ist.jpg` ; `SLOT_CYR` dans
  `portail/index.html` ; `portail/images/README.md`.
- `CLAUDE.md`.
