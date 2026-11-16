# Critique indépendante : prototype « Atlas »

Évalué le 2026-11-15 sur http://localhost:8101/ avec Chrome piloté par Playwright, à 1440 × 900, 375 × 812, 320 × 568, 812 × 375, 820 × 1180 et 1024 × 768. Seule grille : `proto/BRIEF-CLIENT.md`. Les notes des concepteurs n'ont pas été lues. Captures dans `/tmp/critique-atlas/`.

Verdict : pas montrable en l'état. Le socle est propre (zéro erreur console, zéro débordement, drapeaux irréprochables, quatre langues complètes), mais le paradigme est celui de tout visualiseur cartographique, la Constitution est le parent pauvre, et un bogue casse l'accès direct aux articles sur bureau.

## 1. Notes

**Originalité : 5/10.** Un thème Tailwind ne produit pas ça, mais « carte plein écran + panneau latéral + choroplèthe + fil d'Ariane » est le gabarit de n'importe quel visualiseur SIG ou d'Apple Plans ; rien ici n'atteint Bloomberg Graphics ou The Pudding. La seule idée neuve, l'article de la Constitution qui pilote la carte, ne concerne que 17 articles sur 202.

**Exécution : 6/10.** Finition typographique et cartographique sérieuse, LCP mesuré à 0,3–0,6 s, alternative réelle au mouvement réduit. Mais le saut vers un article tombe à côté sur bureau, les compteurs de communes se contredisent, le mobile en paysage est inutilisable, et le seul mouvement est le vol de caméra de MapLibre.

**Utilité réelle : 6/10.** Pour le territoire (trouver une commune, comparer des États, descendre d'un niveau), c'est nettement mieux qu'un site classique. Pour la Constitution, c'est un lecteur ordinaire dans une colonne de 520 px à côté d'une carte qui n'a rien à dire, et rien de non géographique (alphabet, carte de citoyen, mécanismes de vote) n'a de place dans l'architecture.

## 2. Défauts

### Bloquant avant de montrer au client

**B1. Le saut vers un article atterrit sur un autre article (bureau).**
- Où : `jumpArt()` dans `app.js`, toute arrivée sur `#art-N` depuis une vue non constitutionnelle, y compris par la palette.
- Reproduire à 1440 × 900 : depuis `#home`, Ctrl+K, « art 110 », Entrée. Le fil d'Ariane affiche « Art. 110 », mais le premier article visible est le 110 ter : le 110 est 915 px au-dessus. Mesures identiques : `#home` → `#art-124` : cible à −171 px ; `#state-LK-20` → `#art-60` : −1111 px (on lit l'article 62) ; `#home` → `#art-1quater` : −487 px. En lien direct à froid : `#art-110` à −165 px, `#art-124` à −67 px. Même résultat avec `reduced_motion="reduce"`.
- Ne se produit pas : entre deux titres de la Constitution, ni à 375 px.
- Pourquoi c'est grave : c'est le cas d'usage central de la palette (« articles ») et de tout renvoi depuis une fiche d'État (« Art. 1 quater »). Le client tapera un numéro d'article dans la première minute.
- Cause probable (non vérifiée dans le code) : la position est calculée pendant que le feuillet passe de 416 à 520 px de large et avant l'arrivée des polices ; le texte se recompose ensuite.
- Correction : calculer la position après la fin de la transition de largeur et après `document.fonts.ready`, ou utiliser `scrollIntoView` avec `scroll-margin-top` et recaler via un `ResizeObserver` tant que l'utilisateur n'a pas défilé.

**B2. Dans la Constitution, la carte est un décor périmé.**
- Où : `#constitution`, `#title-*`, `#art-*`.
- Reproduire : ouvrir `#state-DR-10`, puis `#constitution` : la carte reste zoomée sur les communes de Dubrovnik, légende « Municipalities » (capture `d-constitution.png`). À 375 px, `#state-LK-20` puis `#title-4` : la moitié de l'écran montre Gospić pendant qu'on lit « Organs of the Confederation » (`m-title-4.png`). La même URL ouverte à froid montre la Confédération entière : l'état de la carte dépend de l'historique.
- Mesure : `data/places.json` ne situe que 17 articles sur 202. Pour les 185 autres, la carte occupe 60 % de l'écran sans rien dire.
- Pourquoi : la promesse du concept (« le territoire est l'interface ») s'effondre sur la moitié du contenu ; sur mobile le texte de loi n'a que la moitié basse.
- Correction : en entrant dans la Constitution sans lieu, ramener la carte à la Confédération et la mettre en retrait (feuillet plein sur mobile, colonne de lecture élargie sur bureau) ; donner à la carte un rôle pour les articles institutionnels (répartition des sièges par État, sept délégations, 12 États de 3 peuples de l'art. 130 ter) ou assumer un mode lecture sans carte.

**B3. Les compteurs de communes se contredisent.**
- Où : fiche d'État, cellule « Municipalities » (`nm`) contre la liste `#muList` et le rang des communes.
- Mesure sur les 54 fiches : 15 incohérences. LK-20 : 45 affiché, 44 listées, « Rank 5 of 44 » sur Gospić. KR-17 : 78/69. ST-35 : 90/81. DA-08 : 121/117. CG-06 : 17/15. GV-11 : 18/16. IS-14 : 45/43. RS-30 : 16/14. TR-41 : 20/18. RO-29 : 32/31. SL-32 : 115/114. SZ-38 : 27/26. VB-44 : 26/25. SA-92 : 9 affiché, 1 listée. BG-91 : « — » affiché, 1 listée.
- Pourquoi : un client attentif aux données le voit sur le premier État ouvert ; cela jette le doute sur tous les chiffres.
- Correction : une seule source pour le compte (celle de la géométrie réellement affichée), ou libeller l'écart (« 45 communes, 44 unités cartographiées »). Ne pas toucher aux JSON canoniques : c'est le `build.py` du prototype qui doit trancher.

**B4. Deux échelles de couleur à l'écran en même temps pendant le zoom.**
- Où : `#home`, zoom à la molette.
- Reproduire à 1440 × 900 : souris en (900, 450), trois crans de molette de 300 px, attendre 3 s (`d-wheel-moderate.png`). L'ouest est peint par commune (classes 2,2 k à 20 k), l'est reste peint par État (classes 200 k à 740 k : Šumadija foncé, Timok pâle). La légende n'affiche que « Municipalities ».
- Pourquoi : la même teinte signifie 20 000 ou 740 000 habitants selon l'endroit. C'est une faute de dataviz au cœur de l'interaction signature.
- Correction : basculer tout le champ visible d'un coup (charger les communes de tous les États visibles avant de changer de classe), ou garder les États non chargés en gris neutre hachuré « en chargement » ; la légende doit montrer l'échelle réellement peinte.

**B5. La Constitution ne contient aucun des dispositifs demandés.**
Pas de simulateur, pas de vue parallèle, pas de texte français : voir section 3. C'est ce que le client regardera en premier après deux séries rejetées pour « basique ».

### Important

**I1. Paysage mobile inutilisable.** 812 × 375, `#state-LK-20` (`m-land-LK.png`) : fil d'Ariane et légende occupent 115 px, le feuillet commence à 188 px, la carte se réduit à une bande d'environ 75 px. Correction : en paysage, feuillet latéral comme sur bureau à partir de 600 px de large, légende repliée.

**I2. La carte, qui est le menu, n'est interactive qu'après 4 à 14 s sur mobile.** Mesure, 375 px, CPU ×4 : carte hydratée à 4,1 s en 4G rapide (9 Mbit/s), 14,3 s en 4G lente (1,6 Mbit/s), serveur local sans compression. Le LCP (0,33 s et 0,62 s) est porté par le paragraphe statique : le budget est tenu sur le papier, pas sur l'usage. Poids du premier écran : 2,35 Mo bruts, environ 0,81 Mo gzip, dont MapLibre 1,1 Mo et son worker 0,5 Mo chargés pour tout visiteur, pas « à la demande ». La silhouette SVG d'attente n'est pas cliquable (`#silwrap{pointer-events:none}`). Correction : rendre la silhouette cliquable par État (elle a déjà les tracés), ne charger MapLibre qu'au premier geste de zoom ou d'ouverture d'État.

**I3. Clavier : le focus disparaît après chaque Entrée.** Sur la carte, flèches puis Entrée ouvre l'État, mais le focus part sur `#sheetBody` (`tabindex=-1`, `outline: none` mesuré avec `:focus-visible` vrai) : focus invisible, et il faut Maj+Tab pour revenir à la carte et continuer à descendre. Même chose après la palette et après Échap. Correction : rester sur `#map` quand l'action vient de la carte ou de la palette, donner un contour visible à `#sheetBody` sinon.

**I4. Le feuillet mobile ne se pilote que par une poignée de 30 px.** `#grip` mesure 373 × 30 px (seule cible sous 44 px). Glisser vers le bas sur le contenu en haut de défilement, feuillet plein, ne le replie pas ; glisser vers le haut à mi-hauteur fait défiler au lieu d'agrandir. C'est le contraire du comportement appris sur Plans et Google Maps. Correction : poignée de 44 px, et enchaînement défilement → déplacement du feuillet aux butées.

**I5. Légende amputée sur mobile.** À 375 px, `.lg-f` est en `display:none` : les hachures « Occupied territories » restent visibles sur la carte sans explication, et les sources sont inaccessibles. Correction : pictogramme d'information ouvrant ces deux lignes.

**I6. « ⌘K » partout.** Affiché sous Linux et Windows (où le raccourci est Ctrl+K) et sur écran tactile, où il ne veut rien dire et sert d'unique libellé du bouton de recherche (`#palBtn`). Correction : détecter la plate-forme ; sur tactile, une loupe (glyphe de police, pas de SVG dessiné) ou le mot « Search ».

**I7. La palette est une recherche, pas une palette de commande.** « alarm » : aucun résultat (le droit d'alarme est introuvable, le texte des articles n'est pas indexé). « lika » : deuxième résultat « Dubrovačka Republika » (sous-chaîne de « Republika »). Aucune commande : ni langue, ni écriture, ni indicateur, ni « copier le lien ». Correction : indexer le corps des articles, exiger une correspondance en début de mot pour les États, ajouter un groupe d'actions.

**I8. Liste des 54 entités sans tri ni filtre.** `#stList` reste triée par code quel que soit l'indicateur ; les barres changent, pas l'ordre. Aucun contrôle dans le feuillet (0 mesuré). Comparer des États oblige à lire 54 lignes. Correction : tri par l'indicateur actif, filtre par type (territorial, ville-État, municipalité confédérale).

**I9. Débordement de texte dans la légende.** Bouton « БДП по становнику » (SRE cyrillique) : 128 px de contenu dans 104 px ; « BDP na prebivalca » (ZAP) : 118 px dans 104 px (`d-sre-cyr.png`). Correction : colonnes à largeur de contenu ou libellé court.

**I10. Zoom profond dans le vide.** Zoom maximal 11,6 sans fond de carte : dans une grande commune, l'écran est un aplat uni avec une étiquette (`d-wheel-zoom.png`). En mode PIB, toutes les communes d'un État ont la même teinte : à ce niveau la carte n'apporte rien. Correction : plafonner le zoom à l'étendue de la plus petite commune visible, ou ajouter chefs-lieux, routes confédérales (art. 91 bis) et tracé de la Transbalkanska.

**I11. Routes héritées ignorées.** `#/state/LK-20` (format cité dans le brief) retombe en silence sur l'accueil. Correction : accepter les deux formats.

**I12. Villes-États mal servies.** `#state-BG-91` : un aplat foncé sans structure, entouré de communes voisines plus bavardes que lui, double étiquette « Beograd », « Municipalities — ». La capitale économique est la fiche la plus pauvre du prototype.

**I13. Fluidité non démontrée.** En rendu logiciel (SwiftShader), le vol vers LK-20 produit 9 images en 2,5 s et le changement de langue une image de 554 ms : chiffres non représentatifs d'un vrai GPU, mais aucune preuve des 60 fps demandés n'existe. À mesurer sur un téléphone de milieu de gamme avant toute promesse (des milliers de polygones communaux et des étiquettes DOM repositionnées).

### Finition

- Fil d'Ariane mobile tronqué à gauche sans fondu : « Ɔonfederation › Lika » (`m-state-LK-20.png`).
- Cran « peek » du feuillet : le titre de l'État est coupé à mi-hauteur (`m-peek.png`).
- Après un clic sur une commune, l'infobulle `#tip` reste posée sur l'étiquette qu'elle répète (`d-mun.png`).
- Le volet « Sources » s'ouvre par-dessus l'échelle de la légende (`d-home-list.png`).
- Texte à 10,5–11,5 px sur bureau (légende, `dt`, `small`, sur-titres).
- En cyrillique, les codes courts sur la carte (KV, HZ, ZL, MZ) et la marque restent en latin ; « Госпић » garde ћ en istočni : à confronter au canon, non tranché ici.
- État ouvert : les États voisins sont peints au même niveau de détail et presque à la même intensité ; seul un contour distingue le sujet du contexte.
- Bascule de langue et d'écriture : remplacement sec du texte, sans transition.
- Pas de mode sombre (permis par le brief, non exigé).

## 3. Manquements au brief, point par point

| Exigence du brief | Constat |
|---|---|
| Niveau Linear, Stripe Press, The Pudding, Bloomberg | Non atteint. Niveau d'un bon visualiseur de données publiques. |
| Zoom sémantique continu Confédération → État → municipalité | Présent et fonctionnel ; entaché par B4 et I10. |
| La carte remplace le menu | Vrai pour le territoire seulement. La Constitution passe par un bouton du feuillet ; rien d'autre n'est atteignable. |
| Palette ⌘K sur États, articles, municipalités | Présente, cyrillique et digrammes reconnus. Articles par titre et numéro seulement ; le saut est faussé par B1. |
| Bascule latin ↔ cyrillique animée glyphe par glyphe | Absente. Bascule instantanée. |
| Renvois cliquables | Présents (« Article 123 », codes d'État). |
| Vue parallèle des 5 textes | Absente. Un seul texte à la fois ; le texte français n'est pas chargé du tout (4 fichiers `constitution*.json`). |
| Simulateurs (double majorité, péréquation) | Absents. Aucun champ ni curseur hors la palette. |
| View Transitions à éléments partagés | Absentes (aucune occurrence de `startViewTransition` ni `view-transition-name`). |
| Animations pilotées par le défilement | Une seule : l'article lu déplace la carte, pour 17 articles. |
| Typographie variable en mouvement | Absente. |
| Bibliothèques chargées à la demande | Non : MapLibre est chargé pour tous après le premier rendu (I2). |
| LCP < 2,5 s mobile 4G | Tenu (0,33–0,62 s), mais par un paragraphe statique ; voir I2. |
| 60 fps en interaction | Non démontré (I13). |
| `prefers-reduced-motion` : vraie alternative | Tenu : coupe franche et fil d'Ariane numéroté mis en évidence. |
| Site statique, sans backend, aucune requête externe | Tenu : 14 requêtes, toutes locales. |
| Palette canonique, Arimo et Sofia Sans Extra Condensed | Tenu. |
| Drapeaux : jamais le concept, verticaux, recadrés ; proportion réelle | Tenu sur 54/54 : `object-fit: contain`, écart de ratio ≤ 1,5 %, aucun plus haut que large, 132 px de large. |
| Aucun code couleur par peuple | Tenu : une seule rampe bleue liée à l'indicateur. |
| Aucun emblème dessiné en SVG | Tenu : `emblem.png` ; le seul SVG est la silhouette de la carte. |
| Toute chaîne dans toutes les langues ; l'incertain est listé | Tenu : une chaîne nouvelle (aide clavier de la carte), laissée en anglais et listée dans `strings-new.json`. |
| Contenu canonique non modifié | Non vérifiable depuis le navigateur ; B3 montre au moins un écart de comptage introduit par la préparation des données. |
| Au moins 3 vues navigables sur vraies données | Tenu : accueil, État, commune, Constitution, titre, article. |
| Vidéo de 30 s | `demo.mp4` présent (4 Mo), non visionné. |
| Matière disponible : Transbalkanska, carte de citoyen, droit d'alarme, péréquation 85 % / 30 % | Aucune de ces matières n'a de traitement propre ; la Transbalkanska n'existe que comme art. 95 bis. |

## 4. Ce qui est réussi

- Aucune erreur console, aucun débordement horizontal de 320 à 1440 px, CLS nul.
- Drapeaux exemplaires au regard du brief : petits, entiers, à leur proportion, jamais décoratifs.
- Quatre langues complètes, deux cyrilliques distincts (formes bulgares en istočni), nombres et dates localisés, recherche qui accepte « Софија », « ljubljana », « gospic ».
- Le lien texte → lieu de l'article 91 bis (pastilles « Zagreb, Sofija, Zadar, Brčko », toponymes surlignés, la carte y vole) : c'est la seule idée qui n'existe pas ailleurs, et elle fonctionne. Il faut la généraliser ou en faire le cœur du concept.
- Navigation de la carte aux flèches avec annonce vocale (`#live`), Échap qui remonte d'un niveau.
- Alternative au mouvement réduit pensée, pas seulement une suppression.
- Cartographie sobre et lisible : une rampe, des hachures, des étiquettes hiérarchisées ; premier écran peint en moins d'une seconde grâce à la silhouette.
