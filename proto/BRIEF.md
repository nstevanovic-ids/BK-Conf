# Cadre commun des prototypes (tour 2)

Tu construis UN prototype fonctionnel d'interface pour le portail de la Balkanska Konfederacija,
dans TON dossier `proto/<nom>/` uniquement. Lis d'abord `CLAUDE.md` (racine) et `docs/canon/`.

## Niveau attendu
Une interface qui a l'air conçue en 2026 par un studio de pointe (Linear, Stripe Press, The
Pudding, Bloomberg Graphics). Si elle pourrait sortir d'un thème Tailwind ou d'un générateur de
landing page, c'est raté. Le sujet est l'interface : navigation, architecture de l'information,
composants, interactions, mouvement, rapport aux données. Pas de maquette statique : tout ce qui
s'affiche doit fonctionner sur les vraies données.

## Règles non négociables
- Tu n'écris QUE dans `proto/<nom>/`. Tu ne touches ni `portail/`, ni `docs/`, ni `scripts/`,
  ni les autres dossiers de `proto/`. Aucune commande git (ni add, ni commit, ni checkout).
- `portail/data/*.json` est la source de vérité. Un script `proto/<nom>/build.py` lit ces
  fichiers (et `portail/fonts/`, `portail/images/` si besoin) et produit dans `proto/<nom>/`
  tout ce que le prototype charge. Le dossier `proto/<nom>/` doit être AUTONOME : servi seul
  par `python -m http.server`, il fonctionne ; aucune requête hors du dossier, aucun CDN,
  aucune tuile tierce. Bibliothèques installées par npm puis copiées dans `proto/<nom>/vendor/`,
  chargées à la demande (import dynamique) quand la vue en a besoin.
- Aucun contenu canonique modifié ou inventé : noms, codes, textes constitutionnels, chiffres.
  Si une règle de calcul vient de la Constitution, cite l'article et applique-le à la lettre ;
  toute hypothèse que le texte ne tranche pas est listée dans NOTES.md, pas glissée en silence.
- Aucun emblème, blason, logo ou pictogramme figuratif dessiné par toi en SVG. L'emblème de
  l'en-tête du portail est rendu par le portail lui-même (voir `portail/index.html`,
  `#hdEmblem`) : réutilise cet asset tel quel, ou n'en mets pas.
- Drapeaux (`portail/data/state_flags.json`, PNG base64) : un contenu parmi d'autres, jamais le
  concept. Jamais verticaux, jamais recadrés, toujours dans leur proportion réelle
  (`object-fit: contain` ou hauteur automatique ; jamais `cover`).
- AUCUN code couleur par peuple constitutif, nulle part (ni teinte, ni motif, ni dégradé qui
  distingue les sept peuples). Les peuples se distinguent par la position, le libellé, le
  regroupement.
- Palette : rouge #99402F, bleu #374078, blanc #FFFFFF, or #DFCC68. Échelles tonales dérivées
  de ces quatre couleurs et mode sombre permis. Contrastes WCAG AA (l'or sur blanc fait 1,62:1 :
  jamais de texte or sur clair ; rouge sur bleu fait 1,44:1 : jamais l'un sur l'autre).
- Typographie : Arimo (texte), Sofia Sans Extra Condensed (titres), fichiers dans
  `portail/fonts/`. Un ajout (mono, variable) seulement s'il est justifié dans NOTES.md et
  installable par npm (@fontsource), avec la couverture č ć đ ě ļ ñ ã š ž et du cyrillique.
- Pas d'étoile à cinq branches. Pas d'écriture inclusive. Les routes utilisent un hash simple
  en lettres ASCII, chiffres et tirets (`#state-LK-20`, `#art-102`), jamais `#/chemin`.

## Langues et écritures
Le portail existe en anglais (en) et dans trois standards : zapadni (zap), središñi (sre),
istočni (ist) ; SRE et IST se lisent aussi en cyrillique, dérivé à l'affichage. Sources :
`portail/data/i18n.json` (interface), `portail/data/textes.json` (l'anglais sert de clé),
`portail/data/constitution.json` + `constitution.zap|sre|ist.json`, et les fonctions
`toCyr`, `cyrText`, `cyrWord` de `portail/index.html` (à porter telles quelles).
- Le prototype a un sélecteur EN / ZAP / SRE / IST et la bascule Lat / Ћир pour SRE et IST.
- Toute chaîne d'interface reprend une chaîne déjà traduite quand elle existe.
- Une chaîne NOUVELLE n'est pas traduite par toi : elle reste en anglais dans toutes les
  langues, porte l'attribut `data-untranslated`, et figure dans `proto/<nom>/strings-new.json`
  (liste des chaînes anglaises nouvelles). Réduis leur nombre au strict nécessaire.

## Budget technique
- Site statique. LCP < 2,5 s sur mobile 4G simulé (Lighthouse mobile), 60 images/s en
  interaction. Le premier écran ne charge que ce qu'il affiche ; le reste à la demande.
- `prefers-reduced-motion: reduce` a une VRAIE alternative (un autre rendu de la même
  information : pas à pas, états fixes, fondus courts), pas une simple suppression.
- Clavier complet, focus visible, cibles tactiles de 44 px, `lang` correct, titres d'onglet par vue.
- Mobile d'abord : 375 px doit être aussi abouti que 1440 px. Aucun débordement horizontal.
- Une palette de commande (⌘K / Ctrl+K, et un bouton visible) cherche dans les États, les
  articles de la Constitution et les communes (`portail/data/opstine.json`), sans tenir compte
  des diacritiques ni de l'écriture.

## Vues obligatoires (navigables entre elles, liens profonds par hash)
1. Accueil. 2. Un État (n'importe lequel des 54 par son code). 3. La Constitution (lecture
d'articles réels, renvois entre articles cliquables).

## Vérification avant de rendre
- Outils présents : Chrome à `/usr/bin/google-chrome`, Playwright pour Python, ffmpeg, node 22,
  npm, Lighthouse dans `/tmp/tools` (`cd /tmp/tools && CHROME_PATH=/usr/bin/google-chrome npx
  lighthouse <url> --chrome-flags="--headless=new --no-sandbox" --only-categories=performance`
  ; s'il manque, `npm i lighthouse`). Sers ton dossier sur un port à toi.
- Teste avec Playwright à 375 et 1440 px, dans les quatre langues et en cyrillique : zéro
  erreur console, zéro débordement, aucun drapeau recadré ou plus haut que large, navigation au
  clavier. REGARDE tes captures (outil Read sur les PNG) et corrige ce qui est laid ou cassé :
  itère au moins trois fois sur le rendu.
- Enregistre une vidéo de démonstration de 30 s (Playwright `record_video`, 1280 × 720, puis
  ffmpeg) : `proto/<nom>/demo.mp4` (H.264, < 8 Mo) qui montre l'accueil, un État, la
  Constitution et la signature de mouvement.
- Écris `proto/<nom>/NOTES.md` en français (masculin générique) : ce qui est nouveau (un
  paragraphe), bibliothèques et poids par vue, mesures Lighthouse mobile réelles, alternative
  « mouvement réduit », hypothèses de calcul, chaînes nouvelles, limites connues, estimation
  honnête du coût pour généraliser aux 25 types de page du portail.

Ton rapport final : chemin du prototype, port de test, ce qui marche, ce qui ne marche pas
encore, mesures. Sois factuel : ne dis pas qu'une chose marche si tu ne l'as pas vue marcher.
