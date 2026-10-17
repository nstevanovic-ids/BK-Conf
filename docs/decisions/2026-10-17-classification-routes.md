# ADR 2026-10-17 — Classification et désignation des routes (art. 91 bis)

## Statut
Accepté. Les décisions de l'utilisateur datent du 18 septembre 2026, dans la conversation
« Système de nommage des routes et autoroutes ». Leur intégration à la constitution a été
demandée le 17 octobre 2026 : « Ça doit rentrer dans la constitution ».

## Décisions reprises (utilisateur, 2026-09-18)
1. **Deux niveaux** :
   - les routes étatiques `Xx-N` (seconde lettre en minuscule), nommées « Route de [ville] » ;
   - les routes confédérales `Bk-N`, nommées « Route de [A]–[B] ».
2. **Seuil** : une route qui touche **2 États ou plus** est confédérale. Le seuil initial de
   3 États a été abaissé par l'utilisateur.
3. **Brčko et Mostar** n'ont que des routes confédérales.
4. **Pas de zéro initial** (`Da-1`, pas `Da-01`).
5. **Numérotation** :
   - confédérale hiérarchique : `Bk-1` à `Bk-9` pour les grands axes entre capitales,
     `Bk-10` et au-delà pour le réseau secondaire ;
   - étatique : un compteur indépendant par État.

## Intégration
- **Nouvel art. 91 bis** « Classification et désignation des routes », en section 5
  (Travaux publics et transports), après l'art. 91 (Infrastructure routière). L'article
  reprend les décisions 1 à 5. Le réseau confédéral est fixé par **arrêté confédéral du
  Kongres**, sur le modèle de l'arrêté de l'art. 54 ; chaque État arrête ses routes étatiques.
- **Terminologie des art. 91, 93 et 94** : « routes nationales » devient **« routes
  confédérales »** et « routes principales » devient **« routes étatiques »**. Les catégories
  de l'art. 91 bis remplacent les termes du modèle suisse.
- **Inchangé** : l'art. 90 garde « routes d'importance nationale », qui vise la haute
  surveillance et pas une catégorie de classement.
- **Hors de la constitution** : le réseau de départ proposé le 18 septembre (`Bk-1` à
  `Bk-13`). Il n'a pas été validé et emploie des codes d'avant la renumérotation.
- **Spécification** : `docs/canon/routes.md`.

## Propagation
- `docs/constitution/v4.md` et `v4.en.md` : art. 91 bis, art. 91, 93 et 94, annexe I.
- `docs/canon/routes.md` (nouveau).
- `CLAUDE.md` : section Routes.
- `portail/data/constitution.json` régénéré (153 articles).
