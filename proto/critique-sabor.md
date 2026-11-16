# Critique indépendante : prototype « Sabor »

Évalué le 2026-11-15 sur http://localhost:8103/ avec Playwright et Chrome, à 1440 × 900 et à 375 × 812 (tactile), plus 768, 1024 et 1280 de large. Grille : `proto/BRIEF-CLIENT.md` seul. Notes des concepteurs non lues. Captures dans `/tmp/critique-sabor/`.

Verdict en une phrase : une vraie idée (composer un vote et voir les règles constitutionnelles répondre), correctement calculée, mais posée dans une coque de tableau de bord convenue, sans carte, avec un tiers de l'accueil en anglais dans trois langues sur quatre, un tableau des États cassé et une ergonomie d'accueil qui cache ses propres commandes. Pas montrable en l'état.

## 1. Notes

**Originalité : 6 / 10.** L'instrument de vote (54 disques pondérés par la population, trois camps, jauges liées aux articles, URL partageable) n'est pas un produit de générateur et se rapproche d'un explicatif Bloomberg ou Pudding. Tout le reste (en-tête à quatre liens, fiche État en tuiles de chiffres, tableau triable, lecteur à sommaire latéral, cartes de titres) est un gabarit d'application soigné qu'un bon thème produit, et aucune des signatures demandées (carte, bascule glyphe par glyphe, éléments partagés) n'est là.

**Exécution : 5 / 10.** Zéro erreur console, zéro requête externe, LCP mobile 4G simulé de 1,4 à 2,1 s, CLS nul, drapeaux irréprochables, mode sombre et mouvement réduit propres. Mais le répertoire masque ses deux premières lignes, l'accueil à 1440 × 900 place scénarios et fiche de survol sous la ligne de flottaison, le mobile empile deux bandeaux collants sur la scène, et le mouvement se limite à une simulation de forces et à des jauges qui glissent.

**Utilité réelle : 5 / 10.** Un visiteur motivé comprend en deux minutes pourquoi cinq délégations sans les deux grandes échouent (44,0 % des inscrits) : c'est le meilleur moment du prototype. Mais l'entrée est abrupte (neuf types de décision, sept scénarios, 54 pastilles dont 11 anonymes, aucun pas-à-pas malgré la promesse du chapeau), l'instrument annonce « Passes » là où le texte dit « suspendue », et la péréquation affiche des transferts en points de PIB qui ne veulent rien dire.

## 2. Défauts

### Bloquant avant de montrer au client

**B1. Répertoire des États : l'en-tête recouvre les premières lignes.**
- Où : `#states`, `.dt thead th` (sticky, `top:56px`) dans `.tblw` (`overflow-x:auto`).
- Reproduire : ouvrir `#states` sans défiler. À 1440 : `th` occupe 289 à 346 px, la ligne BA-01 290 à 323 px, BC-02 commence à 323 px ; le tableau commence visuellement à BE-03. À 375 : BA-01 masquée. Un vide de 56 px sépare le sous-titre du tableau et les intitulés sont sur deux lignes de base.
- Pourquoi : le collant est calculé par rapport au conteneur défilant, pas à la fenêtre. Il décale l'en-tête de 56 px et ne colle jamais (après 1200 px de défilement, `th` est à -911 px). Deux États sur 54 disparaissent de la liste censée les recenser.
- Correction : retirer `overflow` de `.tblw` au-dessus de 760 px (le tableau y tient, 1116 px) et garder `top:56px` ; en dessous, `top:0` ou pas de collant.

**B2. Accueil non traduit dans trois langues sur quatre, et patchwork en cyrillique.**
- Où : accueil en ZAP, SRE, IST ; `[data-untranslated]`.
- Reproduire : cliquer SRE puis Ћир. Mesure : 67 éléments visibles en anglais, 959 caractères sur environ 2 900, dont le `h1` « Compose a majority », « Decision », six types de décision sur neuf, les sept scénarios, « For / Abstention / Against », « Simple majority », « Double key ». Finance : 15 éléments ; fiche État : 7 (« Contributes », « Minimal majorities of the Kongres »…). 75 chaînes au total (`strings-new.json`).
- Pourquoi : le brief exige que toute chaîne existe dans toutes les langues et écritures. Lister plutôt qu'inventer est permis, mais ici ce sont les mots porteurs du concept qui manquent : en cyrillique, un titre anglais géant surplombe un paragraphe serbe.
- Correction : faire valider les 75 chaînes avant la démo, ou ne montrer que l'anglais et masquer les sélecteurs de langue sur les vues non traduites. Ne pas livrer le mélange.

**B3. Accueil à 1440 × 900 : les commandes et les retours sont hors écran.**
- Où : `.rail .scn`, `#ro`, `#panel`.
- Reproduire : charger `/` à 1440 × 900. « Choose a case » commence à y ≈ 860, le premier scénario à 875, les six autres plus bas, alors que le chapeau dit « Choose a case ». Survoler un disque : la fiche `#ro` s'écrit à y = 1085 (statique, sous la scène), donc invisible ; aucun `title` ni infobulle sur `.u`. Le panneau (`max-height:812px`, contenu 938 px) coupe son texte en pleine phrase, « Copy link » invisible sans défilement interne non signalé.
- Pourquoi : la porte d'entrée conseillée, l'identification d'un État et le partage sont tous trois sous la ligne de flottaison du format d'ordinateur portable le plus courant. Cliquer un scénario oblige à descendre, ce qui fait sortir le haut de la scène.
- Correction : scénarios en rangée horizontale au-dessus de la scène (comme à 768), type de décision en menu compact ; fiche de survol en infobulle ancrée au disque ou en bandeau collant ; panneau sans hauteur maximale ou avec dégradé et description repliée.

**B4. Loi ordinaire, alarme levée, deux tiers au Kongres : l'instrument affiche « Passes ».**
- Où : `js/rules.js`, branche `law`.
- Reproduire : scénario « One delegation raises the alarm », puis passer en « pour » les dix États contre (Kongres 212 pour). Verdict : « PASSES ».
- Pourquoi : l'article 109 b dit que la loi est suspendue et renvoyée en conciliation dès que l'alarme est votée ; les deux tiers ne jouent que si la conciliation échoue (art. 110 ter). Le verdict contredit le texte, sur le mécanisme que le client cite dans son brief.
- Correction : verdict « Suspended » dans les deux cas, la ligne précisant que les deux tiers sont déjà réunis.

**B5. Aucune carte.**
- Où : tout le prototype (0 `svg`, 0 `canvas`, aucun GeoJSON chargé).
- Pourquoi : le brief nomme « le rapport aux données et à la carte » parmi les sujets et liste les GeoJSON jusqu'à la municipalité comme matière. Une fiche État sans le moindre contour, pour un projet territorial présenté à un géomaticien, se verra tout de suite. La palette renvoie les communes vers la fiche de leur État, où elles ne figurent pas.
- Correction : au minimum un contour de l'État dans la fiche et une vue géographique alternative de la scène (mêmes disques posés sur leurs centroïdes). Sinon l'assumer explicitement comme parti pris au moment de la présentation.

### Important

**I1. Mobile : la scène est écrasée et toucher pour identifier change le vote.**
- Reproduire à 375 × 812 tactile : toucher un disque. La fiche `#ro` (collante, 122 px) s'empile sur le panneau fixe (66 px) et l'en-tête (56 px) : 244 px sur 812 sont pris. Le toucher fait à la fois sélection et changement de camp : impossible de savoir qui est une pastille sans modifier le scénario. 9 pastilles font 12 à 13 px, 37 moins de 24 px, 11 n'ont pas de sigle. Au premier toucher sur un disque proche du bas (KR-17 à y = 645), la fiche s'est déployée et le vote n'a pas changé.
- Correction : premier toucher = sélection seule, vote par les trois boutons de la fiche ; zone de toucher de 44 px par pseudo-élément ; fiche et verdict fusionnés en un seul bandeau.

**I2. Péréquation : des ordres de grandeur trompeurs.**
- Où : `#equalisation`, tuiles de synthèse ; fiche État, tuile « Equalisation ».
- Reproduire : valeurs canoniques 85 / 30 : « Needed to reach the floor : 10.73 % of the GDP of the Confederation », « 4.69 % left to the Confederation », Lika « Contributes −30 PPS per inhabitant », jauge « 100 % → 100 % ».
- Pourquoi : le calcul assimile capacité fiscale et PIB par habitant, donc exprime des transferts fiscaux en points de PIB entiers. Un lecteur retiendra « la péréquation coûte 11 % du PIB ». L'hypothèse est dans un `details` replié en bas de page. Les colonnes « +9,130 » n'ont pas d'unité.
- Correction : n'afficher que des indices (moyenne = 100) et des parts de l'excédent, ou appliquer un taux de prélèvement déclaré ; hypothèse visible sous le titre ; unité dans l'en-tête de colonne. Le constat utile (le plafond de 30 % ne finance que 56 % du plancher de 85 %) doit devenir le message principal, formulé comme résultat d'un modèle.

**I3. Constitution : un lecteur, pas un texte explorable.**
- Où : `#constitution`, `#title-4`, `#art-110`.
- Mesures : aucun bouton ni sélecteur dans la vue ; titre IV = 38 articles sur 20 669 px (27 832 px en mobile) sans sommaire interne ; pas de vue parallèle des cinq textes (le français est absent, on change de standard par l'en-tête global) ; les renvois ne lient que le numéro (« 115 bis », cible de quelques pixels) ; `#art-999` retombe en silence sur le préambule.
- Ce qui existe : renvois cliquables et 14 cartes « Open in the instrument » dans le titre IV. C'est le bon pont, mais c'est le seul.
- Correction : comparaison côte à côte de deux textes par article, sommaire d'articles du titre, lien sur « Article 115 bis » entier, message « article introuvable ».

**I4. Palette de commande : recherche de titres seulement, classement faux.**
- Reproduire (Ctrl+K) : « double key », « dvostruk », « veto », « flag », « map », « card » : rien ou hors sujet (« veto » → Vetovo). « alarm » : un scénario, pas l'article 109. « 110 » : 110 ter et 110 bis avant 110. « zagreb » : « Zagreb · Zagreb » et « Grad Zagreb · Zagreb » en doublon. Les communes mènent à la fiche de l'État. Sur mobile, le bouton affiche « Ctrl K ».
- Bon point : recherche insensible aux diacritiques et à l'écriture (« ljubljana » et « Љубљана » trouvent Krañska), focus rendu à la fermeture.
- Correction : indexer le corps des articles et les notions (double clé, alarme, péréquation) dans les quatre langues ; correspondance exacte du numéro en tête ; actions (langue, thème, écriture) ; masquer le raccourci sur écran tactile.

**I5. Clavier : 70 tabulations avant le premier État.**
- Reproduire : Tab depuis le chargement. 12 arrêts d'en-tête, 9 types, 7 scénarios, puis 5 commandes par délégation avant `.u`. Le lien d'évitement mène à `#app`, pas à la scène. Une fois dessus, c'est bien fait (flèches, Espace, Entrée, anneau visible, annonce `aria-live`).
- Correction : types en vrai groupe radio (un seul arrêt, flèches), second lien d'évitement vers `#units`, scène avant les commandes de délégation dans l'ordre du DOM.

**I6. Le chapeau promet un pas-à-pas qui n'existe pas.**
- Où : `.lead`, « Choose a case to follow it step by step ».
- Pourquoi : un scénario pose l'état final d'un coup, toutes jauges ensemble ; rien ne déroule la procédure (Kongres, puis Narodni Sabor, puis peuple et États). C'est la narration qui ferait passer l'outil de tableau de bord à explicatif.
- Correction : chaque scénario en trois à cinq étapes légendées, pilotées par le défilement ou par « Suivant », les disques se déplaçant à chaque étape.

**I7. Mode Konfederalno Veće : 80 % de l'écran ne sert à rien.**
- Reproduire : `#vote-council`. Les 54 disques restent affichés, estompés et inertes ; la décision tient en sept bascules. Les en-têtes annoncent « 5 Konfederalno Veće ».
- Correction : scène dédiée à sept sièges pondérés par les registres, ou retirer ce type de l'instrument.

**I8. Mouvement en deçà du brief.**
- Mesures : bascule latin ↔ cyrillique instantanée (0 animation, re-rendu complet) ; aucune View Transition ; changement de page = remplacement sec du contenu ; aucune animation pilotée par le défilement ; aucune typographie variable en mouvement. En Chrome sans GPU, 47 images sur 222 dépassent 33 ms pendant cinq changements de scénario (pic à 190 ms), le panneau étant reconstruit en `innerHTML` à chaque vote : à vérifier sur un vrai téléphone avant de promettre 60 fps.
- Correction : élément partagé disque → titre de la fiche État, bascule d'écriture glyphe par glyphe au moins sur les titres, mise à jour des jauges sans reconstruction.

**I9. La fiche État ne revient jamais vers l'instrument.**
- Où : `#state-LK-20` : les liens sortants sont `#states`, précédent / suivant et trois articles.
- Pourquoi : la fiche montre « 50.16 % » et « 3.84 % » (indices de pouvoir) en deux phrases opaques (« Belongs to 216,299,574,328,048 of the 431,242,122,158,383 coalitions… ») sans permettre de le voir jouer. Le fil conducteur du concept se rompt à la deuxième page, qui redevient une fiche de chiffres classique.
- Correction : lien « Voir cet État dans un vote » qui ouvre l'instrument avec le disque sélectionné ; reformuler les deux indices en une phrase lisible, le nombre exact en note.

### Finition

- **F1.** À 768 px : unités des compteurs tronquées (« Kon… », « Kongre… »), métadonnées des couloirs réduites à « 9… », « 1… ».
- **F2.** Anglais approximatif : « 1 States », « Croats state · seat Gospić », « 0.00 M », « 85% » et « 85 % » dans la même page.
- **F3.** Sigles de 8,5 px dans les disques moyens ; 11 disques sans sigle, différenciés seulement au survol (invisible, cf. B3).
- **F4.** Répertoire mobile : colonnes Peuple, Chef-lieu et PIB supprimées, dernière colonne coupée (« CONI FI EQUA F »), tableau de 412 px dans 347 sans indice de défilement.
- **F5.** Lecteur mobile : le texte de l'article ciblé touche le filet doré (aucune marge intérieure).
- **F6.** Loi ordinaire, 2 sièges pour et 248 abstentions : « Passes », seuil affiché « ≥ 2 ». Défendable par l'hypothèse « tous présents », mais le quorum de l'article 106 mérite une ligne visible.
- **F7.** Majorité des deux tiers du Narodni Sabor comptée sur 70 membres (≥ 47) alors que la majorité simple l'est sur les suffrages exprimés : deux conventions dans le même panneau, non signalées.
- **F8.** Hash inconnu (`#foo`, `#vote-bogus`) : retour silencieux à l'accueil.
- **F9.** Cyrillique : « НУТС 3 », « ЕУ-27 » translittérés mécaniquement.
- **F10.** Mouvement réduit : le glisser-déposer est désactivé sans le dire (le clic reste), fondu de 140 ms correct.

## 3. Manquements au brief, point par point

| Exigence du brief | État |
|---|---|
| Niveau Linear / Stripe Press / Pudding / Bloomberg | Atteint par intermittence sur l'instrument seul ; les trois autres vues sont d'un niveau « bon produit SaaS ». |
| Le sujet est l'interface, pas les drapeaux | Respecté. Un seul drapeau par fiche, jamais ailleurs. |
| Drapeaux jamais verticaux, jamais recadrés, proportion réelle | Respecté, mesuré sur les 54 : `object-fit: fill`, rapport affiché = rapport natif (1,48 à 2,0), aucun `clip-path`. |
| Rapport aux données et à la carte | Données : oui. Carte : absente (B5). |
| Au moins 3 vues navigables sur vraies données | Oui : accueil, État, répertoire, Constitution, Finance. |
| Palette ⌘K sur États, articles, municipalités | Présente, mais titres seulement et communes sans destination propre (I4). |
| Bascule latin ↔ cyrillique animée glyphe par glyphe | Absente : bascule instantanée (I8). |
| Constitution explorable : renvois cliquables | Oui, partiellement (numéro seul). |
| Vue parallèle des 5 textes | Absente ; quatre textes, un à la fois, pas de français (I3). |
| Simulateurs manipulables (double majorité, péréquation) | Oui, c'est le cœur. Un verdict contraire au texte (B4), ordres de grandeur trompeurs (I2). |
| Droit d'alarme | Modélisé, verdict faux dans un cas (B4). |
| View Transitions, scroll, typographie variable | Absents (I8). |
| Transbalkanska, carte de citoyen | Absentes. |
| LCP < 2,5 s mobile 4G | Tenu en simulation (1,35 à 2,14 s, serveur local sans compression, 257 Ko). |
| 60 fps en interaction | Non démontré (I8). |
| `prefers-reduced-motion` : vraie alternative | Oui : grille rangée sans simulation, d3-force non chargé, aucun chevauchement. |
| Site statique, bibliothèques à la demande | Oui : d3-force (16 Ko) chargé à l'inactivité, vues en modules dynamiques, aucune requête externe. |
| Palette canonique, Arimo + Sofia Sans Extra Condensed | Respecté ; aucune police ajoutée. |
| Aucun contenu canonique modifié | Rien de visible ne le contredit ; les registres nationaux sont approximés par la population des États, hypothèse affichée. |
| Aucun emblème dessiné en SVG | Respecté : `emblem.png` seul, 0 SVG. |
| Aucun code couleur par peuple | Respecté : bleu / rouge hachuré / pointillé = pour / contre / abstention, doublés par la forme. |
| Toute chaîne dans toutes les langues et écritures | Non : 75 chaînes en anglais seulement, listées mais affichées (B2). |
| Prototype cliquable hors portail en ligne | Oui (`proto/sabor/`). |
| Vidéo de 30 s | `demo.mp4` présent, 30,0 s, 1280 × 720 (contenu non visionné). |

Contrôle des règles de vote contre `portail/data/constitution.json` :
- **Art. 103** (250 délégués, 2 à 20 sièges, Sainte-Laguë, Brčko et Mostar au moins 1) : conforme. Recalcul indépendant : 54 circonscriptions, total 250, minimum 1 (les deux municipalités), maximum 16, aucun écart.
- **Art. 110** (majorité simple en plénière, 5 délégations sur 7 qui représentent la majorité des inscrits ; 6 sur 7 et deux tiers pour une révision ; 7 sur 7 pour l'art. 150) : conforme. Scénario « Five delegations, without the two largest » : 5 / 7 atteint, double clé à 44,0 %, verdict « Fails ».
- **Art. 111** (consensus, sinon 4 conseillers avec la majorité des inscrits ou 5 ; suspension si 3 contre) : conforme.
- **Art. 106 bis, 122, 123, 123 bis, 124** : conformes aux hypothèses affichées.
- **Art. 109 b** : non conforme dans un cas (B4).

## 4. Ce qui est réellement réussi

- L'idée centrale : le même geste (déplacer un État) relu par neuf procédures. Passer de « Law requiring consent » à « Constitutional amendment » sans toucher aux votes et voir le verdict s'inverser est une vraie trouvaille pédagogique.
- La rigueur : moteur de règles séparé, article cité sur chaque jauge, hypothèses nommées, sièges exacts.
- L'état dans l'URL (`#vote-consent-…`), conservé au retour arrière.
- Le codage pour / contre / abstention par forme et texture, lisible sans couleur et en mode sombre.
- Les ponts article → instrument dans la Constitution.
- La propreté technique : 125 Ko de JS et CSS écrits à la main, aucune dépendance externe, aucune erreur console, aucun débordement horizontal de page de 375 à 1440 px.
- La recherche qui replie diacritiques et écritures.
- Le mouvement réduit traité comme une mise en page à part entière.
