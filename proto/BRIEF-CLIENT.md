# Refonte du portail BK-Conf : deuxième tour

Le premier tour a produit des directions basiques et centrées sur les
drapeaux : c'est un échec. Je veux une interface qui ait l'air conçue
en 2026 par un studio de pointe, pas un template amélioré. Niveau visé :
Linear, Stripe Press, The Pudding, Bloomberg Graphics. Si un concept
pourrait sortir d'un thème Tailwind ou d'un générateur de landing page,
il est rejeté.

## Contexte
Dépôt `nstevanovic-ids/BK-Conf`, GitHub Pages, SPA à routes `#/state/<code>`.
Lis `CLAUDE.md` et `docs/canon/` : ils priment. `main` n'est pas à jour.
Pars de la branche réellement déployée et travaille sur une branche dédiée.
Matière disponible : 47 États en JSON, GeoJSON GADM jusqu'à la
municipalité, la Constitution en 5 textes, trois standards linguistiques,
l'alphabet latin unifié et le cyrillique, des mécanismes chiffrés (double
majorité, droit d'alarme, péréquation 85 % / 30 %), la Transbalkanska,
la carte de citoyen.

## Le sujet est l'interface, pas les drapeaux
Navigation, architecture de l'information, système de composants,
interactions, mouvement, rapport aux données et à la carte. Les drapeaux
sont un contenu parmi d'autres : jamais le concept, jamais verticaux,
jamais recadrés, toujours dans leur proportion réelle.

## Méthode
1. Divergence : au moins 8 concepts, chacun fondé sur un paradigme
   d'interaction différent et décrit en 4 lignes (idée, navigation,
   signature de mouvement, ce qui n'existe nulle part ailleurs).
2. Tri sans complaisance : élimine tout concept dont la nouveauté tient
   à une couleur, une police ou un fondu au scroll. Garde 3 finalistes
   qui n'ont rien en commun.
3. Prototypes fonctionnels : développe les 3 en parallèle (sous-agents)
   sur les vraies données JSON, avec au moins 3 vues navigables chacun
   (accueil, État, Constitution). Pas de maquettes statiques.
4. Critique indépendante : un sous-agent qui n'a pas vu la conception
   note chaque prototype face à ce brief (originalité, exécution,
   utilité réelle). Corrige ce qu'il relève avant de me montrer
   quoi que ce soit.

## Calibrage : exemples de niveau, pas une liste à exécuter. Dépasse-les.
- La carte comme colonne vertébrale : zoom sémantique continu
  Confédération → État → municipalité (MapLibre, deck.gl). La carte
  remplace le menu.
- Palette de commande (⌘K) sur les États, les articles et les municipalités.
- Bascule latin ↔ cyrillique animée glyphe par glyphe.
- Constitution explorable : renvois cliquables, vue parallèle des
  5 textes, simulateurs manipulables (vote à double majorité, péréquation).
- View Transitions à éléments partagés, animations pilotées par le
  scroll, typographie variable en mouvement.

## Cadre technique
- Toute bibliothèque est permise si elle se justifie (MapLibre, deck.gl,
  Three.js, GSAP, D3…), chargée à la demande.
- Budget : LCP < 2,5 s sur mobile 4G, 60 fps en interaction.
  `prefers-reduced-motion` doit avoir une vraie alternative, pas une
  simple suppression. Site statique, sans backend.
- La palette canonique sert de base (rouge #99402F, bleu #374078,
  blanc #FFFFFF, or #DFCC68). Échelles tonales dérivées et mode sombre
  permis. Arimo et Sofia Sans Extra Condensed restent la base ; un ajout
  (mono, variable) est possible s'il est justifié.

## Non négociable
- Aucun contenu canonique modifié. `portail/data/*.json` reste la
  source de vérité.
- Aucun emblème, blason ou logo dessiné en SVG : assets existants seulement.
- Aucun code couleur attribué aux sept peuples constitutifs.
- Toute chaîne d'interface existe dans toutes les langues et écritures
  présentes. Une traduction incertaine est listée, pas inventée.
- Français : masculin générique.

## Livrable, puis STOP
Pour chacun des 3 finalistes, donne-moi :
- un prototype cliquable que je peux ouvrir dans mon navigateur sans
  toucher au portail en ligne (propose la solution, ex. un dossier
  `/proto/` publié) ;
- un GIF ou une vidéo de 30 s ;
- un paragraphe « ce qui est nouveau » ;
- le coût d'implémentation complète et ta recommandation.
Rien n'est fusionné ni généralisé avant ma validation.