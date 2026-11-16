# Codex — la Constitution est le site

Prototype autonome : `python proto/codex/build.py`, puis `cd proto/codex && python -m http.server 8102`.
Routes : `#home`, `#preamble`, `#title-4`, `#art-110`, `#art-110-sre`, `#art-110-en-sre-fr`,
`#state-LK-20`, `#state-LK-20-gospic` (commune mise en évidence), `#states`. Tolérées et réécrites :
`#art-1-bis`, `#Art-110`, `#/state/LK-20`, `#/constitution/title-4/art-109` (schéma du portail).

## Second tour (après la critique indépendante) : ce qui a changé

| Point | État | Preuve |
|---|---|---|
| B1 anglais affiché | Partiel | 29 chaînes nouvelles → 10. Les 19 autres sont remplacées par une chaîne déjà traduite du portail ou par un signe (table `replaced_by_existing` de `strings-new.json`, avec la source). Restent en anglais, soulignées en pointillé avec l'infobulle « To be translated » : « Assumption », les six phrases d'hypothèse, « Skip to content », « Alignment failed… », et l'infobulle elle-même. Aucune traduction inventée. |
| B2 fondu « mouvement réduit » | Corrigé | Le fantôme est dans la cellule même (test : 10 fantômes, tous enfants de leur cellule, même corps que le titre, index resté sur 3 colonnes). |
| B3 carte | Corrigé dans le concept | `data/map.json` (75 ko) : 54 entités de `geo.json`, simplifiées en couverture, rien de dessiné. Instrument de marge des art. 1 bis (liste et carte liées), 1 ter (quatre capitales), 103 (sièges), 132 (qui verse, qui reçoit, lié aux curseurs) ; index des États ; fiche d'État (contour agrandi, voisins dans l'ordre de tabulation, flèches pour passer de l'un à l'autre). Une seule couleur en échelle tonale (bleu en clair, or en sombre). Pas de zoom continu jusqu'à la commune : les communes n'ont pas de géométrie dans les données chargées, elles sont en liste. |
| B4 instrument hors de la marge | Corrigé | La marge existe à toute largeur ≥ 1100 px, quel que soit le nombre de textes (test à trois textes : instrument large de ≤ 320 px, à droite des alinéas, en haut de l'article). |
| I1 trous sur mobile | Corrigé | Un seul texte monté ; onglets ou balayage horizontal pour changer, même alinéa (test : écarts entre alinéas ≤ 2 px ; balayage `en → zap`, même unité, même hauteur à 2 px près). |
| I2 colonnes trop étroites | Corrigé | Sous 300 px par colonne : colonnes de 340 px, défilement horizontal aimanté, numéro et premier texte figés à gauche, marge figée à droite. Dans ce mode la marge n'est plus collante verticalement. |
| I3 extraits de palette | Corrigé | Recherche sur le texte replié, extrait pris aux mêmes positions dans le texte d'origine, coupé aux mots, occurrence dans `<mark>` (test : « Ļubļan… » affiché, jamais « lublana »). |
| I4 communes | Corrigé | Liste réelle des communes sur la fiche (`opstine.json`), lien `#state-LK-20-gospic`, commune demandée surlignée et amenée à l'écran. Pas de commune sur la carte. |
| I5 hash | Corrigé | Formes tolérées réécrites ; `#art-999` et `#foo` donnent une vue « Not found » qui garde le hash et ouvre la palette préremplie. |
| I6 mouvement | Corrigé pour l'essentiel | View Transitions à éléments partagés : numéro d'article (sommaire, index de titre, renvoi → marge), code et drapeau (index, carte, liste → fiche) ; pseudo-éléments `artnum`, `stcode`, `stflag` observés pendant la transition. Piloté par le défilement (`animation-timeline: view()`) : chaque ligne du sommaire prend sa graisse (400 → 800) et lève ses graduations en entrant, se referme en sortant ; la règle graduée de l'en-tête (onze segments, un trait par article) prend le relais en lecture. Graisse variable : numéro de l'article courant (560 → 800), numéro dans le titre courant. Mouvement réduit : états fixes, aucune de ces animations. La « fermeture en règle » est deux animations coordonnées, pas un morphing unique. |
| I7 accueil | Corrigé | L'art. 110 et sa double clé, manipulables, à côté du titre : alinéas 4 et 5 réels dans la langue choisie, marqués par l'instrument. Les quatre phrases de promesse sont supprimées. |
| I8 cibles tactiles | Corrigé | Graduations non interactives sur mobile, burger 44 px, curseurs 44 px au toucher, numéros « cité par » ≥ 44 px, lien « Art. 103 » 44 px (matrice : 0 échec). Les entités de la carte restent petites au toucher : les listes voisines offrent les cibles. |
| Droit d'alarme (art. 109 b, 110 ter) | Ajouté | Instrument de marge de l'art. 109 : voix dans la délégation (≥ 7 / 10), jour (≤ 30), puis conciliation (≥ 8 / 14, dont le membre de la délégation), puis Kongres (≥ 167 / 250). Marque l'alinéa b de l'art. 109 et les alinéas 2, 3, 5 et b de l'art. 110 ter. |
| LCP de la fiche d'État | Partiel | Voir « Mesures » : 4,3 s → 3,3 s, toujours hors budget. |
| F1 « г. » | Corrigé | « 9 ноември 2026 г. » lu dans le DOM. |
| F2 interligne cyrillique | Corrigé | Capture : le Ц ne touche plus la ligne suivante. |
| F3 double ligne | Partiel | La ponctuation fermante suit son mot sur les deux lignes. Les blancs irréguliers restent : ils tiennent au principe de la glose mot à mot. |
| F4 barre collante | Corrigé | Fond opaque. |
| F5 fil de lecture | Corrigé | Bandeau sous l'en-tête, hors du texte ; un lieu déjà visité n'est pas empilé deux fois (test). |
| F6 fiche d'État | Corrigé | Le nom mène, le code est son étiquette ; la colonne gauche porte les communes. |
| F7 drapeau flou | Partiel | Affiché à 75 % de la largeur de la source (400 à 600 px) : encore 1,33× sur écran 2×. La source du portail ne permet pas mieux. |
| F8 deux-points français | Corrigé à l'affichage | Espaces insécables posées par `build.py` dans le texte français ; non revu en capture à cinq colonnes. |
| F9 étiquettes | Partiel | « min 2 : 9 · max 20 : 0 », « ±0 % ». Le bouton de recherche mobile montre le libellé du portail tronqué. |
| F10 marque | Corrigé | « Балканска Конфедерация » en cyrillique. |
| F11 clavier | Corrigé | `j` / `k` : article suivant, précédent (test) ; le menu mobile se ferme au choix de l'écriture. |
| F12 langue en cours de lecture | Corrigé | Même unité à la même hauteur avant et après (unité 3 à 77 px). |

Non traités : Transbalkanska et carte de citoyen comme mécanismes manipulables.

## Ce qui est nouveau

On entre par le texte et on n'en sort pas : l'accueil est l'ouverture de la Constitution (préambule,
table des onze titres avec un trait par article, soit 202 liens), la lecture aligne de un à cinq
textes unité par unité (alinéa, lettre, intertitre) dans une même grille, de sorte que les hauteurs
se réalignent d'elles-mêmes et qu'il n'y a qu'un seul défilement ; sur écran étroit, la même grille
devient un défilement horizontal à crans, et l'on passe d'un texte à l'autre sur le même alinéa.
Tout renvoi (« Article 110 », « članovi 109 a i b, 110 i 110 ter », « articles 131 à 136 »,
« Title VIII », « glava VIII », « titre 8 ») est un lien avec aperçu au survol et au focus ; le
suivre empile un fil de lecture visible en bas d'écran, et chaque article affiche ses renvois
inverses (« Cited by »). Les mécanismes chiffrés vivent dans la marge de l'article qui les fonde et
écrivent leur résultat sur les alinéas eux-mêmes, dans tous les textes affichés. La bascule latin ↔
cyrillique se fait glyphe par glyphe sur le texte visible. Un État s'ouvre depuis l'article qui le
nomme, comme une annexe, avec la liste des articles qui le nomment et de ceux qui visent sa catégorie.

## Bibliothèques et poids

Aucune bibliothèque, aucun dossier `vendor/` : CSS, View Transitions, animations pilotées par le
défilement, Web Animations API, IntersectionObserver, `content-visibility`. Scripts : 100 ko en neuf
modules, chargés à la demande (`map.js` 3 ko et `map.json` 75 ko avec le premier instrument à carte).
Le tableau ci-dessous date du premier tour ; les poids mesurés à jour sont dans « Mesures ». Aucune police ajoutée (Arimo, Sofia Sans Extra Condensed
de `portail/fonts/`). Poids non compressés (le serveur de test ne compresse pas) :

| Vue | Chargé | Octets |
|---|---|---|
| Socle (toutes vues) | `index.html` 2 k, `codex.css` 35 k, `app.js` 18 k, `cyr.js` 19 k, `core.json` 30 k, emblème 8 k, deux polices 199 k | ≈ 311 k |
| Accueil | le socle seul | 306 KiB mesurés |
| Lecture | `reader.js` 13 k, un fichier par titre et par texte (3 à 63 k), `idx.<lg>.json` 35 à 40 k au premier aperçu, `instr.js` 13 k et `instr.json` 4 k à l'approche d'un instrument | 503 KiB mesurés sur `#art-110` |
| État | `state.js` 7 k, `instr.js` 13 k, `states.json` 67 k, `outl.json` 35 k, `idx` 38 k, les titres des articles cités, drapeaux PNG | 678 KiB mesurés sur `#state-LK-20` |
| Palette | `palette.js` 7 k, `idx` 38 k, `full.<lg>.json` 127 à 148 k, `opstine.json` 50 k | à l'ouverture seulement |

## Mesures Lighthouse mobile (réelles, 4G simulée, Chrome sans tête, second tour)

| Vue | Score | LCP | FCP | TBT | CLS | Speed Index | Poids |
|---|---|---|---|---|---|---|---|
| `#home` | 0,99 | 1,1 s | 1,1 s | 40 à 140 ms | 0,001 à 0,054 | 1,1 s | 383 KiB |
| `#art-110` | 0,93 | **3,2 s** | 1,1 s | 70 ms | 0,001 | 1,1 s | 531 KiB |
| `#state-LK-20` | 0,92 | **3,3 s** | 1,1 s | 110 ms | 0,001 | 1,1 s | 794 KiB |

- Le budget LCP de 2,5 s est tenu sur l'accueil seulement.
- Le « 0,9 s » du premier tour pour l'article mesurait le titre statique de l'accueil, affiché puis
  remplacé. Ce titre est maintenant masqué hors de l'accueil : l'élément LCP est l'alinéa réel de
  l'article (3,2 s) et, sur la fiche, le drapeau (3,3 s, contre 4,3 à 4,7 s).
- Fiche d'État : nom, code, peuple, chef-lieu et chiffres viennent de `core.json` et sont rendus au
  premier passage ; le drapeau est préchargé dès le HTML ; articles, voisins, carte et communes
  attendent le drapeau. Le drapeau reste l'élément LCP parce qu'il est le plus grand.
- Ce qui pèse avant le LCP : les deux polices (199 ko, non compressées, non préchargées). Un
  sous-ensemble ne gagnait que 34 ko et modifiait des polices sous OFL : abandonné.

Bascule glyphe par glyphe, intervalles entre images mesurés par `requestAnimationFrame` (1440 × 900,
rendu logiciel sans GPU), une, deux puis trois colonnes : médiane 16,7 ms, 95e centile 16,8 à
22,5 ms (31 ms dans un cas), 4 à 12 images au-delà de 20 ms sur une centaine (maximum 39 à 88 ms, à la
mise en place et au relâchement). Ce n'est donc pas 60 images/s sans exception. Non mesuré sur un téléphone réel.

## Signature de mouvement et mouvement réduit

- Mouvement normal : 1) lecture des coupures de ligne du texte source ; 2) mots et glyphes mis en
  `span`, `<br>` aux coupures mesurées et `white-space: nowrap`, donc aucune ligne ne se recompose
  pendant que les glyphes changent de largeur ; 3) une vague diagonale remplace chaque tronçon par
  son correspondant (`lj`→`љ`, `x`→`дж`, `ļa`→`ля`, `št`→`щ` : un tronçon latin, un tronçon
  cyrillique, de longueurs libres), par changement de texte et de couleur seulement, sans calque par
  glyphe ; 4) les coupures sont relâchées : un alinéa dont les lignes changent fait un fondu de
  200 ms depuis son image figée, ce qui se déplace en dessous glisse (FLIP). Seul l'écran est animé ;
  le reste est converti ensuite par tranches de 7 ms, la position de lecture tenue à la main.
- `toCyr`, `cyrText`, `cyrWord`, `cyrPlain`, `cyr2lat` sont portés tels quels dans `cyr.js`.
  L'alignement par tronçons (`pairsWord`) est une présentation : il est vérifié contre `cyrWord`, et
  retombe sur le mot entier s'il ne le reconstruit pas (0 cas sur 5 663 mots središñi et 6 488 mots
  istočni du titre III). Le texte d'une cellule est converti d'un bloc, pour que les règles de
  contexte (« Article 109 a », « Glava III ») voient à travers les liens.
- `prefers-reduced-motion: reduce` : pas de vague ; fondu enchaîné de 200 ms de l'alinéa entier,
  l'ancienne image restant dans la cellule même.
  S'y ajoute la vue « double ligne » (bouton `A/Ћ`), fixe, disponible pour tous : chaque mot porte
  sa forme cyrillique dessous, à la manière d'une glose interlinéaire. Transitions de vue et
  défilements doux sont coupés ; l'arrivée sur un article est un surlignage fixe de 2,6 s.
- Restent en latin : `translate="no"` (codes d'États, lettres de liste, numéros), chiffres romains,
  mots à lettre étrangère, noms des communautés non slaves, chaînes nouvelles non traduites.
  Le cyrillique central prend les formes `ss01` de Sofia Sans, comme le portail.

## Hypothèses de calcul (ce que le texte ne tranche pas)

1. **Registres nationaux (art. 110, 111, 115 bis).** Aucun relevé annuel n'existe dans les données.
   Chaque registre reçoit la population de recensement des États territoriaux rattachés à son peuple
   (méthode de `docs/canon/equilibre.md`) : Slovènes 10,3 %, Croates 15,8 %, Serbes 31,3 %,
   Bosniaques 6,6 %, Monténégrins 2,4 %, Macédoniens 8,9 %, Bulgares 24,7 %. « Majorité » = plus
   de 50 % du total des sept registres.
2. **Art. 110.** L'instrument applique les alinéas 4 (cinq délégations sur sept), 5 (double clé) et
   6 (six sur sept, ou sept). La majorité en assemblée plénière dépend de soixante-dix votes
   individuels : elle n'est pas modélisée, et l'instrument le dit.
3. **Art. 111.** Sept conseillers en fonction : consensus, sinon quatre voix représentant la
   majorité des inscrits ou cinq voix, et suspension de trente jours si trois conseillers au moins
   sont contre. Siège vacant et voix prépondérante du président ne sont pas modélisés ; les
   exceptions de l'alinéa 7 non plus.
4. **Art. 132 (péréquation).** La formule relève de la loi confédérale. Hypothèses : capacité
   fiscale = PIB par habitant (`stats.json`, Eurostat 2023, SPA) ; moyenne pondérée par la
   population sur les 52 États (Brčko et Mostar exclus, n'étant pas des États) ; un taux uniforme
   prélevé sur l'excédent, le plus bas qui finance le plancher ; les bénéficiaires relevés
   exactement au plancher ; si le plafond ne suffit pas, la somme disponible relève les plus pauvres
   à un niveau commun.
   **Constat sur les données réelles :** moyenne 22 391 SPA, 33 États sous 85 %, 15 au-dessus de
   la moyenne. Porter tous les États à 85 % demanderait 53,3 % de l'excédent ; au plafond de 30 %
   (lettre c), le niveau atteint est 74,8 % (lettre b non tenue). Le texte ne dit pas qui couvre
   l'écart ; l'instrument l'affiche. Ce constat ne vaut que sous l'hypothèse PIB = capacité fiscale.
5. **Art. 103 (Sainte-Laguë).** Le texte ne dit pas comment les bornes se combinent à la méthode.
   Même calcul que le portail (`kongresSeats`) : un diviseur commun, arrondi au plus proche, puis
   2 à 20 par État et au moins 1 pour Brčko et Mostar ; les 250 sièges incluent ces deux
   circonscriptions. Résultat : diviseur ≈ 106 200, 9 États relevés au plancher de 2, aucun au
   plafond de 20 (Beograd 16), Brčko 1, Mostar 1. Le curseur de population est un « et si »
   (art. 103, dernier alinéa), non une donnée.
6. **Art. 109 b et 110 ter (droit d'alarme).** Deux tiers arrondis à l'entier supérieur : 7 des
   10 membres d'une délégation, 167 des 250 délégués ; majorité des quatorze membres de la
   commission = 8. Le vote des deux chambres sur le compromis (art. 110 ter, al. 4) n'est pas
   modélisé : un compromis adopté en commission est supposé voté.
7. **Art. 1 ter.** Seules les quatre capitales, qui sont des entités, sont sur la carte ; Ļubļana,
   Ohrid et Cetiñe (al. 6) n'ont pas de coordonnées dans les données et ne sont pas placées.
8. **Articles d'un État.** « Le nomme » = le texte anglais contient son code ou son nom en mot
   entier. « Vise sa catégorie » = il contient « territorial State(s) », « confederal
   territory/ies » ou « confederal autonomous municipality/ies ». Dérivation textuelle, pas un
   jugement juridique. « À portée » = limite commune dans `geo.json` (tampon de 0,004°, contact de
   plus de 0,03°), puis les autres États du même peuple.

## Alignement et renvois (sortie de `build.py`, `build-report.json`)

- Français (`docs/constitution/v4.md`) : 202 articles sur 202 alignés unité par unité, préambule
  compris ; aucun échec. Le chemin d'échec existe (article montré d'un bloc avec la mention
  « Alignment failed for this article. ») mais n'a donc jamais été vu en fonctionnement.
- Renvois : 184 renvois inverses, 90 articles cités ; ensembles identiques dans les cinq textes,
  unité par unité (0 divergence). Une plage (« 131 à 136 ») cite tous les articles compris. Les
  renvois aux chapitres et aux sections ne sont pas liés.

## Chaînes nouvelles

10, dans `strings-new.json` (clé `new`), en anglais partout, `data-untranslated`, soulignées en
pointillé avec infobulle, jamais converties en cyrillique : « Assumption », six phrases d'hypothèse,
« Skip to content », « Alignment failed for this article. », « To be translated ». La clé
`replaced_by_existing` liste les 19 libellés du premier tour remplacés, avec leur source
(`textes.json`, `i18n.json`) ou le signe qui les remplace. Rien n'a été trouvé de réutilisable dans
`docs/alfabet/glossaire-trois-standards.md` pour ces dix chaînes.

## Limites connues

- LCP hors budget sur l'article (3,2 s) et sur la fiche d'État (3,3 s).
- Dix chaînes en anglais, marquées, dans les trois standards.
- Carte : pas de zoom continu, pas de communes placées ; entités petites au toucher.
- Mode à colonnes de 340 px : la marge n'est plus collante verticalement, `content-visibility` y est
  désactivé (titre III plus lourd à monter).
- `content-visibility` estime la hauteur des articles hors écran : l'arrivée sur un article est
  corrigée sur quelques images, puis une fois les polices chargées ; un geste dans ce délai annule
  la correction.
- Pendant la vague, une ligne cyrillique plus longue déborde dans la gouttière (lignes figées).
- Double ligne : blancs irréguliers entre les mots.
- La palette cherche dans la langue d'interface, pas dans les cinq textes.
- Institutions et symboles ne s'ouvrent pas depuis leur article ; Transbalkanska et carte de citoyen
  ne sont que du texte.
- Pas de test sur appareil réel, Safari ni Firefox (View Transitions à éléments partagés,
  `animation-timeline`, `content-visibility`, `:has()`, `color-mix()` y diffèrent ou manquent ; sans
  eux la page reste lisible, sans ces effets, ce qui n'a pas été vérifié). Lecteur d'écran non testé.
- La vidéo ouvre la fiche de Bosanska Krajina et non de Lika : le clic au centre du contour de Lika
  tombe chez sa voisine.

## Vérifications faites (second tour)

Playwright, 1440 × 900 et 375 × 760, en / zap / sre latin / sre cyrillique / ist cyrillique / ist
latin, neuf routes chacune (dont `#art-109`, quatre textes, fiche avec commune) : zéro erreur
console, zéro requête hors dossier, zéro débordement horizontal, images dans leur proportion, cibles
tactiles ≥ 44 px, chaînes non traduites toutes marquées, arrivée sous l'en-tête. Vus passer :
aperçu, fil (empilement, retour, pas de doublon), État depuis l'art. 1 bis, palette (numéro, mot,
extrait marqué en graphie d'origine, commune, cyrillique), trois textes alignés avec instrument en
marge, double clé, art. 111 au clavier, `j` / `k`, bascule animée égale à `cyrText`, double ligne,
mouvement réduit, balayage mobile, hash tolérants et introuvables, instrument de l'accueil,
54 entités. `demo.mp4` : 30,0 s, H.264, 1280 × 720, 4,6 Mo, images extraites et regardées.

## Coût pour généraliser aux 25 types de page

Estimation : 5 à 7 semaines pour un développeur.
- Lecture, renvois, vue parallèle, palette, cyrillique : acquis, à durcir (Safari, lecteur d'écran,
  appareil réel) : 1 semaine.
- Le parti pris ne tient que si chaque page s'ouvre depuis un article. C'est naturel pour les
  institutions, la sécurité, les symboles, l'alphabet, les entités autonomes, les routes, la
  démocratie directe, les finances : une « annexe » par objet, sur le modèle de la fiche État,
  3 à 4 jours pour le gabarit puis un demi-jour à un jour par type : 2 à 3 semaines.
- C'est forcé pour le parcours citoyen (inscription en cinq étapes, carte, vérification, mineurs,
  tableau de bord), le Journal officiel et la carte : ces pages sont des outils, pas des lectures.
  Elles resteraient des vues propres, reliées aux art. 37 à 40 et 102 : 1,5 à 2 semaines, sans gain
  par rapport au portail actuel.
- Traduction des 29 chaînes nouvelles et de celles des annexes, par `scripts/textes.py` : 2 jours.
- Intégration à `build_portail.py` (version inline, base64) : 2 à 3 jours ; le découpage par titre
  et par langue est à repenser si tout doit tenir dans un seul fichier.
