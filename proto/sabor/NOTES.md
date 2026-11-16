# Sabor : notes du prototype

Prototype autonome : `python proto/sabor/build.py`, puis `python -m http.server 8103` dans
`proto/sabor/`. Aucune requête hors du dossier (vérifié par Playwright sur toutes les routes).

## Ce qui est nouveau

Le portail s'ouvre sur un instrument, pas sur une page à lire. Les 52 États et les 2 municipalités
confédérales sont 54 unités dont la surface porte la population réelle (`stats.json`). La scène a
deux dispositions, entre lesquelles les unités voyagent : par délégation (une rangée par peuple,
dans l'ordre de l'art. 110, et trois camps : pour, abstention, contre) et géographique (chaque
unité à la place de son État, sur les contours réels de `geo.json`, chevauchements écartés). On
déplace les unités par clic, par glisser, au clavier ou par délégation entière ; les jauges de la
Constitution se remplissent et un verdict se forme. Neuf types de décision appliquent chacun leurs
seuils, article cité et lié à côté de chaque jauge ; sept cas se jouent pas à pas, dans l'ordre de
la procédure. La composition d'un vote tient dans le hash, donc un vote s'envoie par un lien.
Aucune couleur ne distingue les peuples : la couleur ne code que l'état du vote et le verdict,
toujours doublée d'une forme. Un second instrument applique l'art. 132 au PIB par habitant réel.

## Second tour : réponse à la critique (`proto/critique-sabor.md`)

| Point | État | Preuve |
|---|---|---|
| B1 répertoire masqué | corrigé | `.dir .tblw` sans `overflow` au-dessus de 760 px ; capture à 1440 : BA-01 est la première ligne visible ; en mobile, pas de collant |
| B2 chaînes non traduites | réduit, pas clos | 75 → 29 chaînes nouvelles ; 23 termes ou alinéas repris du texte constitutionnel dans les quatre langues, article cité dans `strings-new.json` ; aucune traduction inventée. Accueil SRE : 16 éléments anglais visibles (490 caractères sur 2 157), contre 67 (959) |
| B3 accueil à 1440 × 900 | corrigé | types et cas en rangées au-dessus de la scène (bas de la rangée des cas à y = 267) ; fiche en infobulle ancrée au disque (y = 446 à 540 pour KR-17) ; panneau sans hauteur maximale ni défilement interne ; « Copy link » sous le verdict (y = 439) |
| B4 art. 109 b | corrigé | alarme levée et 212 sièges pour : verdict « Suspended », jauge des deux tiers cochée, ligne = texte de l'art. 109 b |
| B5 carte | corrigé | disposition « Map » : 54 unités sur leurs centroïdes, 0 chevauchement mesuré, fond = contours de `geo.json` ; fiche État : contour réel de l'État dans la Confédération. Pas de zoom jusqu'à la commune |
| I1 mobile | corrigé | toucher = sélection seule (vote inchangé, vérifié) ; vote par les trois boutons de la fiche ; toucher à 22 px près d'un disque ; un seul bandeau fixe (étape, fiche, verdict) |
| I2 péréquation | corrigé | indices (moyenne = 100) et parts de l'excédent seulement ; hypothèse sous le titre ; constat en phrase principale ; unité dans l'en-tête de colonne |
| I3 Constitution | partiel | sommaire d'articles par titre, lien sur « Article 115 bis » entier, `#art-999` affiche « Not found ». Pas de vue parallèle des textes, pas de français |
| I4 palette | partiel | numéro exact en tête (« 110 » avant 110 bis) ; recherche dans le corps des articles de la langue courante, avec extrait ; doublon Zagreb retiré ; communes vers la fiche avec la liste des communes ouverte ; pas de « Ctrl K » sur écran tactile. Pas d'actions (langue, thème) ; les notions ne se trouvent que dans la langue affichée |
| I5 clavier | corrigé | 18 tabulations avant le premier État (70 avant), 2 avec le second lien d'évitement ; types en groupe radio (un arrêt, flèches) ; cas en barre d'outils ; scène avant les commandes de délégation dans le DOM |
| I6 pas à pas | corrigé | chaque cas se joue en 3 à 5 étapes (« Step 2 of 4 », libellés existants), jauges révélées dans l'ordre, lecture automatique, Précédent / Suivant ; manuel en mouvement réduit |
| I7 Konfederalno Veće | corrigé | scène à sept sièges, surface selon les registres, trois colonnes ; les 54 disques n'y sont plus |
| I8 mouvement | partiel | View Transition à élément partagé disque ↔ titre de la fiche ; sièges du Veće animés par View Transition ; jauges mises à jour en place (plus de `innerHTML` du panneau) ; bascule Lat/Ћир glyphe par glyphe sur les titres. Pas d'animation pilotée par le défilement, pas de typographie variable en mouvement |
| I9 fiche → instrument | corrigé | « Open in the instrument » ouvre `#select-LK-20`, disque sélectionné et fiche épinglée ; indice reformulé en une phrase, décompte exact en note |
| F1 | corrigé | capture à 768 : unités et métadonnées entières |
| F2 | partiel | « 1 States » et « 0.00 M » corrigés, pourcentages sans espace en anglais ; « Croats state · seat Gospić » est une chaîne du portail, laissée |
| F3 | corrigé sur ordinateur | sigle de 10 px dans tous les disques (rayon plancher de 10 px : en dessous de 250 000 habitants environ, la surface n'est plus proportionnelle) ; en mobile, les plus petits restent sans sigle |
| F4 | corrigé | 5 colonnes en mobile, en-têtes entiers, défilement interne si besoin, aucun débordement de page |
| F5 | corrigé | filet doré avec marge intérieure sous 960 px |
| F6, F7 | corrigé | l'hypothèse « tous présents » est affichée sous les jauges du Kongres et des deux tiers ; l'art. 106 (quorum) est cité dans le panneau |
| F8 | corrigé | `#foo`, `#vote-bogus` : page « Not found » |
| F9 | corrigé | NUTS, FZS, BHAS, NSI ajoutés aux mots laissés en latin (écart déclaré avec la liste du portail) |
| F10 | non | rien n'annonce que le glisser est désactivé en mouvement réduit (aucune chaîne existante) |

## Vues et routes

| Route | Vue |
|---|---|
| `#home`, `#vote-<type>`, `#vote-<type>-<États>-<délégations>-<conseillers>`, suffixe `-map` | l'instrument, disposition par délégation ou géographique |
| `#select-LK-20` | l'instrument, ce disque sélectionné |
| `#state-LK-20` (les 54 codes), `#states` | fiche d'un État par son poids ; répertoire triable |
| `#constitution`, `#title-4`, `#art-110bis` | lecture des 202 articles, renvois cliquables |
| `#equalisation`, `#equalisation-70-10` | péréquation (plancher, plafond) |
| tout autre hash | « Not found » |

Les articles qui fondent une règle (103, 106, 106 bis, 109, 110, 110 ter, 111, 115 bis, 121 à 124,
123 bis, 131 à 133, 147, 149, 150) portent un bouton qui ouvre l'instrument réglé sur cette règle ;
chaque jauge et chaque type de décision renvoient à leur article.

## Règles implémentées (js/rules.js)

| Type | Jauges | Articles |
|---|---|---|
| Loi ordinaire | Kongres, majorité simple ; motion d'alarme (7 membres sur 10 d'une délégation) : la loi est suspendue dès que l'alarme est votée ; la jauge des deux tiers (167) dit seulement ce qui se passerait si la conciliation échouait | 106, 109 b, 110 ter |
| Loi soumise au consentement | Kongres ; Narodni Sabor en plénière ; 5 délégations sur 7 ; double clé (majorité des inscrits) | 109 a, 110, 115 bis |
| Loi urgente | Kongres 126 ; Narodni Sabor 36 ; 5 délégations ; double clé | 123 bis, 110 |
| Révision | Kongres ; deux tiers du Narodni Sabor (47) ; 6 délégations ; peuple ; 27 États sur 52 | 147, 110, 123, 124 |
| Garantie renforcée | comme la révision, avec les 7 délégations | 150 |
| Initiative populaire | peuple ; 27 États sur 52 | 121, 124 |
| Initiative de huit États | 8 États ; la moitié au plus d'un même peuple | 106 bis d |
| Référendum demandé par douze États | 12 États ; la moitié au plus d'un même peuple | 122 |
| Konfederalno Veće | consensus ; sinon 4 conseillers et la majorité des inscrits, ou 5 ; suspension de trente jours si 3 conseillers sont contre | 111 |

Sièges du Kongres : Sainte-Laguë en diviseur commun, 2 à 20 par État, 1 au moins pour Brčko et
Mostar, 250 sièges (art. 103), même méthode que `kongresSeats` du portail ; calculés par `build.py`.

**Écart avec la commande.** La commande place la péréquation aux art. 99 bis à 99 septies. Dans le
texte v4.16, ces articles sont le régime des finances (frein à l'endettement, impôts, TVA) ; le
plancher de 85 % et le plafond de 30 % sont à l'**art. 132 b et c** (titre 6). L'instrument cite
l'art. 132. La part de TVA de l'art. 99 sexies (30 % aux États selon la population) n'est pas
modélisée.

## Hypothèses de calcul (le texte ne tranche pas)

Toutes sont affichées dans l'instrument (« Assumptions of the instrument », et sous la jauge
concernée).

1. **Registres nationaux.** Aucun relevé de la Chancellerie n'existe (art. 115 bis). La population
   d'un peuple est celle des États territoriaux qui lui sont rattachés (`docs/canon/equilibre.md`,
   section 2) : Slovènes 10,3 %, Croates 15,8 %, Serbes 31,3 %, Bosniaques 6,6 %, Monténégrins
   2,4 %, Macédoniens 8,9 %, Bulgares 24,7 %.
2. **Vote en bloc au Kongres.** Les délégués d'un État votent ensemble, comme l'État est placé.
   Le texte ne dit rien de tel : c'est la contrainte d'un instrument dont l'unité est l'État.
3. **Présence.** Tous les membres sont présents ; une abstention n'est pas un vote exprimé.
   Majorité simple : plus de pour que de contre. Majorité absolue des membres : 126 sur 250, 36 sur
   70. Deux tiers : 167 sur 250, 47 sur 70, 7 sur 10 (art. 109 b). Le quorum (art. 106) est donc
   toujours atteint et n'a pas de jauge.
4. **Vote populaire.** Les électeurs d'un État votent tous comme leur État est placé ; le poids est
   la population résidante, pas le corps électoral. L'art. 124 dit l'inverse (le vote populaire
   détermine le vote de l'État) : l'instrument lit la règle dans l'autre sens.
5. **Brčko et Mostar** (art. 124) votent avec le territoire confédéral le plus proche à vol
   d'oiseau, d'après `geo.json` : Sarajevo pour les deux (117 km et 75 km ; Beograd est à 130 km
   de Brčko). Leur population s'ajoute à celle de Sarajevo pour décider du vote de cet État.
6. **Motion d'alarme.** Un membre placé « contre » est compté comme votant la motion.
7. **Coalitions d'États.** La coalition est l'ensemble des États placés « pour » ; une ville-État
   compte comme État et ne relève d'aucun peuple ; Brčko et Mostar ne comptent pas.
8. **Consensus** du Konfederalno Veće : aucun conseiller contre.
9. **Double clé** : appliquée là où le texte exige cinq délégations sur sept (art. 110, 123 bis).
   Pour six sur sept, le texte ne la prévoit pas et elle n'est pas affichée (elle serait toujours
   satisfaite : six délégations représentent au moins 68,7 % des inscrits).
10. **Péréquation.** La capacité fiscale par habitant est prise proportionnelle au PIB par
    habitant (SPA 2023), seul indicateur de l'art. 132 a publié pour chaque État. La moyenne est
    celle des 52 États, pondérée par la population, avant péréquation. Chaque contributeur verse la
    même fraction de son excédent, sans dépasser le plafond. Ce que le plafond ne couvre pas est
    affiché comme reste à la charge de la Confédération, puisque le plancher est garanti sans
    réserve. Résultat aux valeurs constitutionnelles : 33 États reçoivent, 15 contribuent, les
    contributions plafonnées couvrent 56 % de ce que le plancher exige. L'instrument n'affiche
    que des indices (moyenne = 100) et des parts d'excédent, aucun montant.
11. **Majorités minimales** (fiche d'un État). Jeu de vote pondéré des 54 circonscriptions, quota
    126. Décompte **exact** (polynômes générateurs, entiers Python, vérifié par force brute sur un
    petit jeu) : 431 242 122 158 383 coalitions gagnantes minimales ; pour chaque État, le nombre
    de celles dont il est membre, et le nombre exact d'alignements des 53 autres circonscriptions
    où ses voix font basculer le résultat (décompte de Banzhaf). Même hypothèse de vote en bloc.

Non modélisé : l'approbation du corps électoral de l'État concerné (art. 150 e), le déroulement de
la conciliation (art. 110 ter), le vote populaire qui suit une demande de référendum (art. 122),
les partis confédéraux (art. 130 quater), la vacance d'un siège (art. 111).

## Bibliothèques et poids

- `d3-force` 3.0.1 avec `d3-quadtree`, `d3-dispatch`, `d3-timer` 3.0.2 (ISC), installés par npm,
  réunis en un module ES par esbuild : `vendor/d3-force.min.js`, 15,3 ko. Chargé par import
  dynamique, par l'instrument seulement, à l'inactivité, et jamais en mouvement réduit.
- Aucune autre dépendance à l'exécution : la carte est un SVG dont les tracés viennent de
  `data/map.json` (47 ko), produit par `build.py` depuis `portail/data/geo.json` (projection
  équirectangulaire à la latitude moyenne, simplification de Douglas-Peucker, centroïdes
  pondérés par la surface). Rien n'est dessiné à la main.
- `build.py` écrit aussi `css/sabor.min.css` et `m/*.js` (commentaires et retraits retirés) : ce
  sont les fichiers servis ; les sources sont `css/sabor.css` et `js/*.js`. Il utilise fontTools
  et brotli s'ils sont installés (sous-ensemble des polices), sinon il copie les polices entières.
- Aucune police ajoutée. Arimo et Sofia Sans Extra Condensed réduites au latin, au latin étendu A,
  au cyrillique (ѣ compris) et à la ponctuation, axe de graisse conservé : 43,1 ko et 58,8 ko
  (sources : 124,0 et 70,1 ko).

Poids transféré par vue, premier chargement, sans compression (serveur Python) :

| Vue | Requêtes | Poids |
|---|---|---|
| Accueil (instrument) | 12 | 263 ko |
| Accueil, disposition géographique | 13 | 310 ko |
| État (avec la carte de situation) | 14 | 304 ko |
| Constitution, un titre | 13 | 266 ko |
| Péréquation | 11 | 218 ko |

La palette charge à sa première ouverture l'index des articles (35 ko) et des communes (37 ko),
puis, à partir de trois caractères, le corps des articles de la langue courante (121 à 143 ko).

## Mesures

Lighthouse 13.6 mobile (4G simulé, processeur ralenti 4 fois), serveur Python local sans
compression, 2026-11-15, après le second tour :

| Vue | Performance | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|
| Accueil (5 passages) | 0,88 à 0,98 | 0,9 s | 2,5 à 2,6 s | 40 à 370 ms | 0 |
| Accueil, disposition géographique (1) | 1,00 | 0,9 s | 0,9 s | 80 ms | 0 |
| `#state-LK-20` (2) | 0,98 | 0,9 s | 2,5 s | 0 ms | 0 |
| `#art-110` (2) | 0,97 | 0,9 s | 2,6 s | 0 à 10 ms | 0 |
| `#equalisation` (1) | 0,98 | 1,0 s | 2,4 s | 20 ms | 0 |

Le budget de 2,5 s est atteint ou dépassé de 0,1 s selon la vue et le passage : il n'est pas tenu
avec marge. Le TBT de l'accueil varie beaucoup d'un passage à l'autre (machine partagée). Le
critique a mesuré 1,35 à 2,14 s avec sa propre méthode. Un hébergement qui compresse ferait
baisser ces chiffres ; ce n'est pas mesuré.

Images par seconde pendant cinq cas joués à la suite (Chrome sans interface, rendu logiciel,
machine à 2 cœurs) : 1440 px, 16,9 ms par image en moyenne, 3 images sur 268 au-delà de 20 ms,
maximum 50 ms ; 375 px avec processeur ralenti 4 fois, 19,5 ms en moyenne, 30 images sur 241
au-delà de 20 ms, maximum 83 ms. Non mesuré sur un vrai téléphone : 60 images par seconde n'est
donc démontré que sur ordinateur, dans cet environnement.

Contrôles Playwright : 375 et 1440 px, en, zap, sre (latin et cyrillique), ist (latin et
cyrillique), 20 routes et 8 à 54 fiches d'États par combinaison (28 à 74 routes) : zéro erreur
console, zéro débordement horizontal, aucun drapeau recadré ni plus haut que large, aucune requête
externe. Vérifiés aussi à 768 et 1024 px sur capture.

## Mouvement réduit

Un autre rendu, pas l'animation en moins. La simulation de forces n'est pas chargée. En
disposition par délégation, les unités sont rangées dans une grille stable à trois colonnes ; en
disposition géographique, elles sont posées à la place calculée (mêmes positions qu'avec
animation). Un changement fait disparaître l'unité, la range et la fait reparaître (fondu de
140 ms). Les jauges changent sans transition. Les cas ne se lisent pas tout seuls : on avance par
« Next ». Pas de View Transition, pas de bascule glyphe par glyphe. Le glisser est désactivé (non
annoncé à l'écran). Vérifié : `d3-force` n'est pas demandé, cas joué jusqu'à l'étape 5 sur 5.

## Clavier et lecteur d'écran

- Deux liens d'évitement : contenu, scène.
- Types de décision : groupe radio, un arrêt, flèches. Cas : barre d'outils, un arrêt, flèches.
- La scène est un arrêt : flèches haut et bas d'une unité à l'autre, gauche et droite d'un camp à
  l'autre, Espace pour le camp suivant, Entrée pour ouvrir la fiche, Échap pour fermer l'infobulle.
- Chaque délégation a trois boutons (`aria-pressed`, libellé complet) et, pour le Narodni Sabor,
  deux boutons qui déplacent un membre. Les sept sièges du Veće sont des boutons.
- « Show the figures as a table » : les 54 entités, trois boutons radio par ligne.
- Le verdict est annoncé dans une région `aria-live`.
- Les marques ✓ et ✕ des jauges n'ont plus de texte de remplacement (les deux chaînes ont été
  retirées avec le reste). Non testé avec un vrai lecteur d'écran.

## Chaînes

- **164** chaînes reprises de `i18n.json` et de `textes.json`.
- **23** termes ou alinéas repris du texte constitutionnel dans les quatre langues, article cité
  (`strings-new.json`, clé `from_constitution`) : « Right of mandatory consent » (109 a),
  « Urgent laws » (123 bis), « Entrenched guarantees » (150), l'alinéa de l'art. 109 b affiché
  quand la loi est suspendue, les lettres b et c de l'art. 132 sous les deux curseurs, etc.
- **29** chaînes nouvelles, en anglais dans toutes les langues, marquées `data-untranslated`
  (`strings-new.json`, clé `new`) : les trois états du vote, les trois verdicts, « Copy link » et
  « Link copied », « Skip to content », « Open in the instrument », « Assumptions of the
  instrument », les huit hypothèses, huit libellés de la péréquation, deux phrases de la fiche.
- Les seuils sont écrits en signes (« ≥ 5 / 7 », « > 50 % », « ≥ ⅔ ») et les cas sont nommés par
  leur type et leur chiffre (« 5 / 7 · 44.0% »), sans chaîne.
- `strings-new.json` est devenu un objet à deux clés (il était une liste).
- Le titre de l'accueil reprend « How a confederal law is made » du portail.

## Limites connues

- LCP à la limite du budget ; 60 images par seconde non démontré sur téléphone.
- 29 chaînes restent en anglais dans trois langues sur quatre.
- Pas de vue parallèle des textes constitutionnels, pas de français, pas d'animation pilotée par
  le défilement, pas de zoom cartographique jusqu'à la commune.
- En disposition géographique, les commandes de délégation (et les membres du Narodni Sabor) ne
  sont pas accessibles : il faut revenir à la disposition par délégation.
- Au toucher, on ne glisse pas une unité. Sur mobile, les plus petits disques font 12 px ; le
  toucher les atteint à 22 px près, et choisit le plus proche quand deux sont voisins.
- Rayon plancher des disques : sous 250 000 habitants environ (ordinateur), la surface n'est plus
  proportionnelle à la population.
- La part des majorités minimales varie peu d'un État à l'autre (40,1 % à 51,5 %) ; c'est le
  décompte de Banzhaf (1,9 % à 32,6 %) qui est mis en avant sur la fiche.
- Verdicts en trois mots génériques pour les neuf types.
- Le thème sombre n'a pas été revu au second tour.
- La fiche d'un État ne reprend ni le film ni le blason du portail.
- ✓, ✕ et ‖ viennent de la police du système. Le nom « Balkanska Konfederacija » du titre d'onglet
  reste en latin.
- La démonstration montre la Constitution deux secondes et s'arrête avant la palette.

## Coût pour généraliser aux 25 types de page

Estimation, pour une personne : 6 à 8 semaines.

- Socle réutilisable tel quel (langues, cyrillique, routes, palette, en-tête, thème, gabarits de
  lecture et de table) : fait. Les pages de lecture (identité, alphabet, symboles, sécurité,
  journal officiel, participation) sont des variantes de la vue Constitution : 2 à 3 jours chacune,
  soit 3 semaines pour une douzaine.
- Pages à données (institutions, tableau de bord, carte) : l'instrument couvre déjà « qui élit
  qui » et « comment se fait une loi ». La carte (globe d3-geo) est à reprendre du portail et ne
  gagne rien à ce concept : 1 semaine.
- Parcours citoyen (inscription, carte, vérification, mineurs) : formulaires sans rapport avec
  l'instrument, à porter : 1,5 à 2 semaines.
- Traduction des 29 chaînes dans les trois standards et passage par `textes.py check` : 1 jour.
- Risque principal : Sabor est une page d'accueil forte et une grammaire (unités, camps, jauges)
  qui sert bien les pages institutionnelles et financières, mais n'apporte rien aux pages de
  lecture et aux formulaires, qui resteraient classiques.
