# Deuxième tour : divergence et tri

Base : `main` @ 7d96e3c (seule branche publiée, cf. `CLAUDE.md`). Le canon compte 52 États et
2 municipalités confédérales, soit 54 entités ; le brief dit 47.

## Dix concepts, dix paradigmes d'interaction

| # | Concept | Idée | Navigation | Signature de mouvement | Ce qui n'existe nulle part ailleurs |
|---|---|---|---|---|---|
| 1 | **Atlas** | Le territoire est l'interface : une seule carte continue, de la Confédération à la municipalité. | Le zoom et le clic sur la carte ; pas de menu. Le contenu se pose en feuillets sur la carte. | Zoom sémantique continu : les limites, les noms et les chiffres changent de niveau sans rupture. | Un État fictif cartographié jusqu'à ses 1 400 communes réelles, avec ses institutions situées. |
| 2 | **Upit** (requête) | Tout le portail derrière une seule ligne de commande. | Taper : États, articles, communes, mécanismes. La réponse se compose à l'écran. | La réponse se construit bloc par bloc sous la frappe. | Rien : c'est Linear ou Raycast appliqués à un contenu. |
| 3 | **Codex** | La Constitution est le site : on entre par le texte, et tout le reste (États, institutions, mécanismes) s'ouvre depuis un article. | La lecture : renvois cliquables, marges actives, sommaire des 202 articles. | Bascule latin ↔ cyrillique glyphe par glyphe ; vue parallèle des cinq textes qui se réalignent. | Une constitution dont les chiffres sont manipulables dans la marge et dont cinq versions font foi côte à côte. |
| 4 | **Sabor** (l'assemblée) | L'interface est l'instrument de vote : on compose une majorité et on voit si elle passe. | Par manipulation directe : sélectionner des États, des délégations, une règle de vote. | Les États se regroupent physiquement en « pour » et « contre » ; les jauges de double majorité et de double clé répondent en direct. | La mécanique constitutionnelle d'un pays rendue jouable, sans aucun code couleur par peuple. |
| 5 | **Transbalkanska** | Le portail comme un trajet Koper–Varna : on traverse la Confédération en défilant. | Linéaire, par le défilement. | Coupe du territoire pilotée par le défilement. | Un récit ferroviaire d'un pays qui n'existe pas. |
| 6 | **Dvopis** (deux écritures) | L'alphabet est l'index : 32 lettres, deux écritures, tout se range dessous. | Par lettre ; une loupe translittère tout ce qu'elle survole. | Translittération glyphe par glyphe sous la loupe. | La loupe, oui ; le reste est un abécédaire. |
| 7 | **Karta** (la carte de citoyen) | La carte TD1 est l'interface : le portail se personnalise depuis votre commune. | En retournant et en dépliant la carte. | Retournement 3D de la carte. | Un portail d'État vu depuis sa pièce d'identité. |
| 8 | **Registar** (le registre) | Un terminal de données : 52 États × indicateurs, tout est une vue de la matrice. | Tri, filtre, brossage. | Lignes qui se réordonnent. | Peu : c'est un tableau bien fait. |
| 9 | **Hronika** | Le Journal officiel comme axe : on remonte le temps des décisions. | Par une frise. | Frise pilotée par le défilement. | Peu : la matière temporelle est mince (cinq mois). |
| 10 | **Vaga** (la balance) | La péréquation comme entrée : qui verse, qui reçoit. | Par les flux. | Flux animés entre États. | Un simulateur, pas une interface. |

## Tri

Écartés parce que leur nouveauté est un habillage, une fonction isolée ou un récit unique :

- **2 Upit** : une palette de commande est un outil, pas une architecture. Elle est reprise
  dans les trois finalistes (⌘K sur les États, les articles et les communes).
- **6 Dvopis** : la translittération animée est une signature, pas une navigation. Reprise
  dans Codex.
- **5 Transbalkanska** : un récit linéaire sert une histoire, pas un portail de 25 types de
  page ; le tracé n'existe pas en données.
- **7 Karta** : ne vaut que pour un visiteur déjà inscrit.
- **8 Registar**, **9 Hronika**, **10 Vaga** : un tableau, une frise, un simulateur. Les deux
  mécanismes chiffrés (double majorité, péréquation) entrent dans Sabor et dans Codex.

## Trois finalistes qui n'ont rien en commun

| | Entrée | Geste principal | Bibliothèque |
|---|---|---|---|
| **Atlas** | l'espace | zoomer | MapLibre GL, sans fond de carte tiers |
| **Codex** | le texte | lire et suivre un renvoi | aucune, ou presque |
| **Sabor** | le mécanisme | composer un vote | D3 (forces, échelles) |

Chacun est prototypé sur les vraies données, avec au moins trois vues navigables : accueil,
État, Constitution.
