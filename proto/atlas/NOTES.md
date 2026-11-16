# Atlas — notes du prototype

Servir : `python -m http.server 8101 -d proto/atlas` · reconstruire : `python proto/atlas/build.py`
(shapely ≥ 2.1, pyproj, numpy ; npm pour `maplibre-gl`, installé dans `$ATLAS_TOOLS`, défaut `/tmp/atlas-tools`).

## Ce qui est nouveau

Le portail n'a plus de menu : une seule carte continue porte la navigation, de la Confédération
(54 entités, quatre capitales) à l'État (ses communes, leurs noms, leur population) puis à la
commune isolée et décrite. Le niveau de détail dépend du zoom et de lui seul : limites, libellés
et légende se relaient sans changement de page ; le contenu (accueil, fiche d'État, fiche de
commune, Constitution) se pose en feuillet sur la carte, à gauche sur grand écran, en feuillet bas
à trois crans sur mobile. La Constitution est « située » : l'article en cours de lecture fait
voler la carte sur les lieux qu'il nomme (art. 1 ter : Sarajevo, Beograd, Zagreb, Sofija, Ļubļana,
Ohrid, Cetiñe), lieux détectés par les données et non par une liste. Les 1 384 contours communaux
portent une population qui vient de `lights.json` et dont la somme par État est identique à
`stats.json` pour les 54 entités (le build échoue sinon).

## Routes

`#home` · `#state-LK-20` · `#mun-LK-20-gospic` · `#constitution` · `#title-1bis` · `#art-102`.

## Bibliothèques et poids (octets gzip ; le serveur de test ne compresse pas)

| Vue | Chargé | gzip |
|---|---|---|
| Premier rendu (texte + silhouette SVG) | `index.html` (CSS et silhouette en ligne) | 15,7 ko |
| | polices Arimo + Sofia Sans Extra Condensed (woff2) | 198,6 ko |
| | `app.js`, `core.json`, `ui.json`, `flags.json`, `emblem.png` | 17,4 + 9,7 + 20,9 + 0,3 + 8 ko |
| Hydratation de la carte (après le premier rendu) | `map.js`, `maplibre-gl.mjs`, worker, CSS | 9,2 + 296,6 + 147,5 + 10,2 ko |
| | `geo.json` (copie du portail, aucune commune) | 77,5 ko |
| Un État | `data/mun/<CODE>.json` (à la demande) + drapeau PNG | 1 à 79 ko (DA-08 : 78,9 ; LK-20 : 25,8) |
| Constitution | `constitution[.std].json`, `places.json` | 43,5 + 1,2 ko |
| Palette | `communes.json` (1 461 entrées) + la Constitution | 17,4 ko |

Seule bibliothèque : MapLibre GL JS 6.18.0 (npm, BSD-3), copiée dans `vendor/`, importée
dynamiquement. Aucun fond de carte, aucune tuile, aucun glyphe PBF : les libellés sont des éléments
HTML positionnés par `map.project`, dans les polices du portail. Aucune police ajoutée.
Communes : 54 fichiers, 689 ko gzip au total, budget de 250 ko par fichier tenu (maximum 79 ko).

## Mesures Lighthouse (mobile, 4G simulée, Chrome headless, WebGL logiciel SwiftShader)

Quatre passes sur `#home`, après la dernière correction : LCP 0,9 s et 1,1 s (deux dernières
passes ; élément LCP : le paragraphe d'introduction, peint avant tout script), FCP 0,9 à 1,1 s,
CLS 0, score 0,69 à 0,70. Avant correction, le LCP mesuré était de 3,2 à 3,4 s : le premier rendu
redessinait le texte statique ; il le conserve désormais.
**Point faible mesuré : TBT 2 740 à 5 500 ms** selon la passe. Il vient de MapLibre (analyse du
module de 1,1 Mo, premier rendu WebGL), ici exécuté en WebGL logiciel sous ralentissement
processeur ×4 ; je n'ai pas de machine avec processeur graphique pour mesurer la part réelle.
Les 60 images/s en interaction n'ont PAS été mesurées : l'environnement de test n'a qu'un rendu
logiciel, où la carte est visiblement saccadée.

## Mouvement réduit

Sous `prefers-reduced-motion: reduce` : aucun vol de caméra (cadrage instantané, vérifié : la carte
n'est plus en mouvement 120 ms après le clic), fondu court de 0,2 s sur la carte, communes révélées
d'un bloc, et le fil d'Ariane devient un indicateur de niveau numéroté (1 La Confédération ›
2 État › 3 Commune), agrandi, bordé, niveau courant en plein.

## Hypothèses et règles de calcul (rien ne vient de la Constitution)

- Correspondance fichier → État : lettres du nom de fichier, `EXTRA` et `ASSIGN` importés de
  `scripts/build_stats.py` (non recopiés), puis contrôle par le contenu : au moins 97 % de la
  surface de chaque fichier doit tomber dans le contour de son État dans `geo.json`.
- Population d'un contour = somme des lumières de `lights.json` qu'il contient.
- Superficie et densité communales : calculées par le build sur l'ellipsoïde WGS84 (même méthode
  que `build_stats.py` pour les États) à partir des contours GADM non simplifiés. Ce sont des
  chiffres dérivés, absents du portail.
- Classes des choroplèthes : cinq classes de quantiles, seuils arrondis à deux chiffres
  significatifs ; une seule teinte (bleu #374078). Le PIB n'existe qu'à l'échelle de l'État : en
  mode PIB les communes prennent la classe de leur État.
- 76 communes du recensement n'ont pas de contour GADM propre : elles sont rattachées à un contour
  hôte (alias de `build_stats.py`, ou lumière de même population que dans
  `docs/data/population/*.csv`, lu seulement pour cette jointure). La palette les envoie sur leur
  hôte, dont la fiche les cite. Un contour qui couvre deux communes porte les deux noms
  (« Tešañ · Usora »). 14 fragments sans nom (îlots, lac d'Ohrid, « Unknown ») sont dessinés mais
  non cliquables, en classe la plus basse.
- Lieux de la Constitution : noms d'États, chefs-lieux et communes cherchés dans le texte anglais ;
  un nom identique à celui d'un peuple (Bošñaci) ou pris dans un terme défini en gras
  (« Granična Straža ») est écarté. Dans les trois standards, la liste « lieu » de l'article est
  complète mais le surlignage dans le texte ne prend que les formes non déclinées.
- Seuils du zoom sémantique : relatifs au cadrage d'ensemble (communes à +0,55/+1,15 niveau de
  zoom, commune détaillée à +3,1), pour valoir à 375 px comme à 1440 px.

## Incohérences relevées dans les données (non corrigées)

- KJ-15 Južna Koroška : chef-lieu canonique Sloveñ Gradec, mais la commune est dans ST-35 dans
  `opstine.json` et les GeoJSON.
- KM-16 : Priština n'est dans aucune commune de l'État (territoire occupé) ; VS-45 : pas de commune
  « Skopje ». Ces trois chefs-lieux ne sont donc pas marqués sur la carte.
- BG-91 : `stats.json` n'a pas de nombre de communes ; un seul contour pour 17 communes urbaines.

## Chaînes nouvelles (1, `strings-new.json`)

L'aide clavier de la carte (attribut `aria-description`, `data-untranslated` sur `#map`). Toutes
les autres chaînes reprennent `i18n.json` (16 clés) ou `textes.json` (164 clés) ; le build relève
les littéraux `L('…')` et `T('…')` du code et liste ceux qui n'ont pas de traduction.

## Limites connues

- `lights.json` n'est pas dessiné en couche (il sert de source des populations communales).
- Pas de fondu entre deux indicateurs : les couleurs basculent d'un coup.
- Sur 375 px le cran « mi-hauteur » laisse environ 220 px de carte ; les noms d'États passent
  alors souvent au code à deux lettres.
- Le brand de l'en-tête reste en latin en cyrillique ; le titre d'onglet, lui, est converti.
- Le focus envoyé dans le feuillet à chaque changement de vue n'a pas de contour visible.
- Non testé : lecteur d'écran réel, Safari, Firefox, appareil tactile réel (glisser du feuillet
  testé à la souris émulée seulement).
- `demo.mp4` est une capture en rendu logiciel accélérée ×2,1 (63 s réelles ramenées à 30 s).

## Coût pour généraliser aux 25 types de page

Le cadre (carte, feuillet, palette, langues, routes) est fait ; chaque page de contenu simple
devient un feuillet : environ une demi-journée chacune, soit 8 à 10 jours pour la quinzaine de
pages de texte et de listes. Les pages sans lien au territoire (alphabet, symboles, journal,
tableau de bord) y perdent : la carte n'y apporte rien et le feuillet de 416 à 520 px est étroit.
Les pages à formulaire (inscription en cinq étapes, carte de citoyen, vérification, mineurs)
demandent une vraie pleine page : 5 à 8 jours et une entorse au principe. Institutions et sécurité
gagneraient à être situées (sièges) : 3 à 4 jours. Reste à faire avant toute mise en service :
mesure sur appareils réels, réduction du coût de MapLibre au démarrage, essais avec lecteur
d'écran : 4 à 5 jours. Total honnête : 4 à 5 semaines, avec le risque que le concept ne convienne
qu'à la moitié territoriale du portail.
