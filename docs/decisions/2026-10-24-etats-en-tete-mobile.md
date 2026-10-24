# ADR 2026-10-24 — Glissement horizontal dans une section, en-tête mobile compact

## Statut
Accepté sous réserve de validation du rendu. Demande de l'utilisateur du 2026-10-24 :
« le passage est très bizarre entre les États, le one page n'est pas conventionnel dans
ces cas-là » ; « sur mobile, le header est trop gros, il prend trop de place ».
Complète l'ADR 2026-10-23-glissement-sections.md.

## 1. Deux axes de glissement

### Constat
Toutes les pages glissaient verticalement, y compris de la grille des États vers une
fiche, d'une fiche à l'autre et au retour vers la grille : une fiche « passait sous » la
grille comme une section de plus, et le retour ramenait en haut de la grille, filtre
affiché sur « All » alors que le filtre précédent restait appliqué.

### Décision
- Convention des sites one page (sections verticales, diapositives horizontales dans
  une section, cf. fullPage.js) :
  - **vertical** entre les sections de la navigation principale (inchangé) ;
  - **horizontal** entre les pages d'une même section : grille des États ↔ fiches,
    fiche ↔ fiche, titres de la constitution, Identity ↔ Alphabet ↔ Symbols,
    Participation ↔ sous-pages. Vers une page située après, la page part à gauche ;
    vers une page située avant, elle part à droite.
- Un seul glissement, 620 ms, même courbe, sans fondu ; en-tête immobile.
- `data-vt` porte l'axe et le sens : `y-next`, `y-prev`, `x-next`, `x-prev`.
- **Retour à la grille** depuis une fiche : la grille revient à la position quittée ;
  filtre par peuple et recherche sont conservés pendant la visite (puces à jour).
- `history.scrollRestoration = 'manual'` : le portail place lui-même la page ; la
  restauration du navigateur au retour arrière décalait la page sortante avant sa
  capture.

## 2. En-tête mobile compact

### Constat
En-tête fixe sur téléphone (mesure Chromium) : 238 px sur 844 (28 %) à 390 px de large,
284 px sur 740 (38 %) à 360 px, 158 px sur 390 (41 %) en paysage. Trois étages : barre
utilitaire, bandeau (emblème, nom, recherche pleine largeur), navigation sur deux ou
trois lignes.

### Décision
- Sous 760 px de large, ou sous 520 px de haut (téléphone en paysage) : **une seule
  barre de 56 px** (emblème, nom, loupe, bouton menu). 7 % de l'écran à 390 × 844.
- Le **menu** (bouton burger) recouvre l'écran sous la barre : les huit sections en
  grands caractères (titres), la section courante marquée d'un filet or ; en bas, les
  langues, Register / My card, le thème clair-sombre et la mention « Official portal of
  the Balkan Confederation ». En paysage, la navigation passe sur deux colonnes.
- Ouverture et fermeture instantanées (aucune animation ajoutée). Fermeture : un lien,
  le bouton, Échap, l'ouverture de la recherche, un changement de page ou le passage
  au format large. La page dessous ne défile pas et garde sa position.
- Accessibilité : `aria-expanded`, `aria-controls="nav"`, libellé Open / Close menu,
  focus sur la section courante à l'ouverture, retour sur le bouton après Échap.
- Au-delà de 760 px : en-tête inchangé.
- **Barre fixe à 56 px**, menu ouvert ou fermé (`flex: none`) : sur un écran peu haut
  (357 × 666, signalé le 2026-10-24), le menu ouvert dépassait de 66 px et la barre,
  élément flexible de l'en-tête, était comprimée à 45 px, son contenu remontant de 6 px.
  Le filet sous la barre est une ombre portée, sans incidence sur sa hauteur. Le menu est
  resserré (sections en 1,5 rem, interligne 1,2) et tient sans défiler jusqu'à 360 × 640 ;
  au-dessous, il défile sous la barre. Langues, Register et thème sur une seule ligne.

## Vérification
Chromium 153 (Playwright) : 360 × 740, 390 × 844, 680 × 900, 760 et 761 × 1000,
844 × 390, 1366 × 820, thèmes clair et sombre, mouvement réduit. Axe et sens corrects
sur 14 parcours par format, une seule paire d'animations par transition, aucune erreur
console, aucun défilement horizontal.
