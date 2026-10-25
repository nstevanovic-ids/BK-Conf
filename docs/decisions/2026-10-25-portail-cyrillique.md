# ADR 2026-10-25 — Portail en cyrillique : central et oriental

## Statut
Accepté le 2026-10-25 : « B pour le ist aussi, mais pour le confédéral strict, quand c'est
en ekavien, pas de yat ».

## Décision
Le portail s'affiche en cyrillique pour le središñi standard (SRE) et l'istočni standard
(IST). Le zapadni s'écrit seulement en latin.

- **Source unique** : les chaînes latines v3 de `portail/data/i18n.json`. Le cyrillique en
  est dérivé à l'affichage, sans traduction ni fichier supplémentaires.
- **Cyrillique central** : le cyrillique confédéral (ñ → њ, ļ → љ, x → џ, ć → ћ, đ → ђ,
  j → ј), **lu en ekavien** : ě → е, jamais ѣ (*Děca* → Деца, *Predsědništvo* →
  Председништво). Les glyphes sont les formes droites usuelles (jeu ss01 de Sofia Sans), et
  non les formes bulgares, qui sont celles de la police par défaut.
- **Cyrillique oriental** : les conventions bulgares, soit la variante B :
  - ja → я, ju → ю ;
  - št → щ ;
  - x → дж ;
  - ña, ñu → ня, ню ; ļa, ļu → ля, лю ;
  - j devant une consonne ou en fin de mot → й ; jo après une consonne → ьо.

  La conversion est exacte, puisque les libellés IST viennent eux-mêmes du cyrillique
  bulgare.
- **Ce qui passe en cyrillique** :
  - l'en-tête, la navigation, la recherche, le pied de page, le fil d'Ariane et les titres ;
  - la marque : Балканска Конфедерација en central, Балканска Конфедерация en oriental ;
  - la devise : Наш дом.

  Les mots qui contiennent un chiffre (*v3*, *TD1*) restent tels quels, et le texte courant
  reste en anglais.
- **Interface** :
  - une bascule **Lat / Ћир** (en oriental, **Lat / Кир**) apparaît à côté des langues quand
    SRE ou IST est choisi, dans le menu mobile compris ;
  - le choix est mémorisé dans le navigateur (`bk-script`) ;
  - `lang` vaut `sh-Cyrl` ou `bg`.
- **Recherche** : une saisie en cyrillique est cherchée en latin v3 (*Шумадија* trouve
  Šumadija).

## Effet sur le cyrillique confédéral
Un texte cyrillique lu en ekavien n'a pas de yat : ě s'y écrit е. La lettre ѣ reste celle
des textes confédéraux unifiés, comme les insignes ou une édition cyrillique du Journal
officiel (`docs/alfabet/cyrillique-confederal.md`).

## Propagation
- `portail/index.html` : `toCyr`, `T`, bascule `#scriptsel`, `ss01`, recherche, Journal.
- `portail/data/i18n.json` : clé `brand`.
- `docs/alfabet/cyrillique-confederal.md`, `docs/alfabet/interface-trois-standards.md`,
  `CLAUDE.md`.
