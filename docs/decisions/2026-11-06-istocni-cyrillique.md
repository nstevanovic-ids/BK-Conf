# ADR 2026-11-06 — L'istočni s'ouvre en cyrillique sur le portail

## Statut
Accepté le 2026-11-06 : « affiche d'abord en cyrillique oui ». Le point est venu de la
remarque de l'utilisateur sur l'écusson istočni : « il n'y a pas d'écritures latines en
bulgare ni en macédonien ».

Modifie l'ADR 2026-10-25-portail-cyrillique.md (bascule et mémorisation).

## Contexte
- Le portail rédige les trois standards en alphabet v3 latin, l'alphabet commun du canon, et
  en dérive le cyrillique à l'affichage.
- La bascule **Lat / Кир** de l'istočni s'ouvrait en latin, et un seul choix d'alphabet
  valait pour le središñi et l'istočni (`bk-script`).
- Or le bulgare et le macédonien ne s'écrivent qu'en cyrillique.

## Décision
1. **L'istočni s'ouvre en cyrillique** (conventions bulgares) ; le latin v3 reste
   disponible par la bascule.
2. **Le središñi s'ouvre toujours en latin**, avec le cyrillique confédéral en option.
3. **Chaque standard garde son propre choix**, mémorisé dans le navigateur (`bk-script-sre`,
   `bk-script-ist`). L'ancien réglage `bk-script` = cyrillique est repris pour le
   središñi.
4. Les sources restent en latin v3 : `textes.json`, les textes de la Constitution,
   `i18n.json`. Seul l'affichage change.
5. Les images à texte de l'istočni sont toujours en cyrillique, quel que soit l'alphabet
   choisi (ADR 2026-11-06-noms-officiels-traduits.md, `SLOT_VAR`).

## Propagation
- `portail/index.html` : `SCRIPTS` par standard, `scriptOf`, `cyrOn`, bascule `#scriptsel` ;
  Journal officiel.
- `docs/alfabet/cyrillique-confederal.md` (section Portail), ADR
  2026-10-25-portail-cyrillique.md (renvoi), `CLAUDE.md`.

## Vérifications
Dans Chromium :
- l'istočni s'ouvre en cyrillique, le središñi en latin ;
- chaque choix est gardé séparément et survit au rechargement ;
- l'ancien réglage `bk-script` est repris ;
- l'écusson istočni reste cyrillique quand l'istočni est affiché en latin ;
- aucune erreur JavaScript.
