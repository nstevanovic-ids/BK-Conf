# ADR 2026-10-14 — Pas de code couleur pour les peuples

## Statut
Accepté et gelé. Décision de l'utilisateur, rappelée le 2026-10-14 : « je ne pense pas
qu'il faille donner un code couleur aux peuples, je l'ai déjà dit ; on peut mettre une
option sur la carte à la rigueur, mais c'est tout ».

## Décision
Les sept peuples constitutifs n'ont **aucune couleur attitrée** dans le projet.

- `portail/data/peuples.json` n'a plus de champ `hex`.
- Le portail n'affiche plus de couleur par peuple :
  - barres de la page Identity ;
  - barres du tableau de participation ;
  - pastilles de la recherche ;
  - mini-cartes des fiches État, où l'État est en azur confédéral `#374078` ;
  - fond du drapeau provisoire de repli (azur confédéral).
- Le cartogramme schématique, remplacé depuis par la carte et qui n'était plus
  appelé, est supprimé.
- **Carte (#/map)** : par défaut, les États partagent un ton azur profond avec des
  frontières lumineuses, et les villes-États et municipalités fédérales sont en or.
  La coloration par peuple n'existe que comme **option**, en dernier choix du
  sélecteur (« Peoples »). Le panneau « Population by constituent people » reste
  neutre, sauf quand cette option est active.

## Hors périmètre
Les drapeaux d'États et leurs couleurs héraldiques ne sont pas un code couleur des
peuples ; ils ne changent pas.

## Propagation
- `CLAUDE.md` : la règle est ajoutée à « Ne pas faire ».
- ADR 2026-10-14-carte-globe : mode par défaut et nuancier mis à jour.
