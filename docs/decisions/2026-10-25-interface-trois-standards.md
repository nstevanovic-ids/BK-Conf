# ADR 2026-10-25 — Interface du portail dans les trois standards (phase 1)

## Statut
Accepté le 2026-10-25. L'utilisateur a validé le point « portail » de la liste de ce qui
restait à faire (« le point portail d'accord pour tout ») ; ce point comprenait
l'interface multilingue.

## Décision
- **Les boutons de langue fonctionnent.** Jusqu'ici, ZAP, SRE et IST affichaient une alerte.
- **Ce qui est traduit** : l'en-tête, la navigation, la recherche, le pied de page et le fil
  d'Ariane. Le contenu des pages reste en anglais, signalé par une note sous l'en-tête.
- **Sous-titre de la marque** : la devise *Naš dom* remplace « Balkan Confederation »,
  puisque la marque est déjà en sud-slave.
- **Données** : `portail/data/i18n.json` est la source de vérité. `build_portail.py`
  l'injecte (I18N), et le mode lié le charge.
- **Choix mémorisé** dans le navigateur (`bk-lang`).
- **Attribut `lang` de la page** : `sl`, `sh` ou `bg-Latn`, selon le standard.
- **Règles de choix des mots** : `docs/alfabet/interface-trois-standards.md`, avec le tableau
  complet.

## Corrections faites au passage
- « a federation of 49 states » devient « a confederation » (pied de page et accueil).
- Le libellé d'emplacement d'image « palais fédéral » devient « palais confédéral ».

## Suite
Phase 2 : titres et contenus des pages, puis le lecteur de la Constitution dans les trois
versions officielles (art. 151).
