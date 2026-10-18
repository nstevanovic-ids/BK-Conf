# ADR 2026-10-18 — Films d'États en en-tête de fiche

## Statut
Accepté. Demande de l'utilisateur du 2026-10-18 : animer les fiches États, première
vidéo intégrée à Bosanska Krajina (BA-01) « en mode header ».

## Décision
- Une fiche État peut s'ouvrir sur un **film en boucle** plein écran (bandeau
  `.shero`) : titre, drapeau, code, peuple et chef-lieu en surimpression ; le bloc titre
  de la colonne de droite disparaît alors (pas de doublon du `<h1>`).
- Lecture **muette** par défaut (seul mode autorisé en lecture automatique par les
  navigateurs) ; bouton son, bouton lecture/pause, barre de progression or `#DFCC68`.
- Lecture seulement à l'écran ; `prefers-reduced-motion` ou économiseur de données →
  poster seul, lecture à la demande.
- Fichiers dans `portail/videos/` (`<code>.mp4`, `<code>-480.mp4`, `<code>.jpg`),
  manifeste `portail/data/videos.json`, produits par `scripts/encode_video.py`.
  Le déploiement Pages copie `portail/videos/` comme `portail/images/`.
- Annuaire : badge **Film** et poster au survol sur la carte d'un État filmé.

## Choix techniques
- **Boucle sans couture** : les 15 premières images sont fondues dans la fin (xfade +
  acrossfade, en images entières). La dernière image produite est exactement l'image 14
  de la source, la première l'image 15 : la boucle `<video loop>` ne montre pas de coupe.
- **H.264 / AAC en MP4** : seul couple lu partout (Safari iOS compris). Deux tailles via
  `<source media="(max-width:680px)">` : 2,1 Mo sur téléphone au lieu de 4,9 Mo.
- **Manifeste explicite** plutôt que détection par erreur 404 (comme les armoiries) :
  la mise en page de la fiche dépend de la présence du film, elle doit être connue
  avant le rendu.
- Vidéos brutes **hors dépôt** (≈ 20 Mo / 15 s chacune).

## Points de vigilance
- Le texte en surimpression repose sur le dégradé bas du bandeau : vérifier la
  lisibilité sur les plans les plus clairs de chaque nouveau film.
- Chromium de Playwright ne lit pas le H.264 : tester la lecture dans Chrome, Safari
  ou Firefox, ou avec une copie WebM locale.
