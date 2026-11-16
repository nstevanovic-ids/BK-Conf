# Tour 2 : synthèse (16 novembre 2026)

Trois prototypes fonctionnels sur les vraies données, chacun autonome dans son dossier
(`cd proto/<nom> && python -m http.server`), reconstruit par son `build.py` depuis
`portail/data/`. Rien n'est modifié dans `portail/`. Aucune PR.

| | Atlas | Codex | Sabor |
|---|---|---|---|
| Entrée | l'espace : une carte continue jusqu'à la commune | le texte : la Constitution est le site | le mécanisme : composer un vote |
| Bibliothèque | MapLibre GL (1,1 Mo, chargé à la demande) | aucune | d3-force (15 ko) |
| Critique indépendante, avant corrections (originalité / exécution / utilité) | 5 / 6 / 6 | 6 / 6 / 7 | 6 / 5 / 5 |
| LCP mobile mesuré | 0,9 à 1,1 s (avant corrections ; non remesuré après) | 1,1 s accueil, 3,2 s article, 3,3 s État | 2,4 à 2,6 s |
| Chaînes nouvelles restées en anglais | à recompter après corrections | 10 | 29 |
| Coût estimé pour les 25 types de page | 4 à 5 semaines | 5 à 7 semaines | 6 à 8 semaines |
| État | corrections appliquées, vérification finale faite par moi (le sous-agent a été interrompu) | corrigé et revérifié par son auteur | corrigé et revérifié par son auteur |

Détail par prototype : `proto/<nom>/NOTES.md`. Critiques : `proto/critique-<nom>.md`.
Concepts et tri : `proto/CONCEPTS.md`.

## Non fait
- Aucune seconde critique indépendante après corrections.
- Aucun essai sur appareil réel, Safari, Firefox ou lecteur d'écran ; la fluidité à 60 images/s
  n'est pas démontrée (machine de test sans processeur graphique).
- Transbalkanska et carte de citoyen : texte d'articles seulement, dans les trois.
- NOTES.md d'Atlas décrit l'état d'avant corrections.

## Points de fond relevés en appliquant le texte à la lettre
- Le plancher de 85 % et le plafond de 30 % de la péréquation sont à l'article 132.
- Sur les PIB réels et sous l'hypothèse « capacité fiscale = PIB par habitant », les deux seuils
  ne tiennent pas ensemble : au plafond de 30 %, les contributeurs financent 56 % de ce
  qu'exige le plancher de 85 % (Sabor) ; financer le plancher demanderait 53,3 % de l'excédent
  (Codex, Atlas).
- Incohérences de données vues par Atlas : Sloveñ Gradec, chef-lieu de KJ-15, est rangé dans
  ST-35 ; Priština n'est dans aucune commune de KM-16 ; VS-45 n'a pas de commune « Skopje ».
