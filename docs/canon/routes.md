# Routes — classification et désignation

Canon en vigueur. Base constitutionnelle : art. 91 bis (v4.2). Décisions de l'utilisateur
du 18 septembre 2026 (conversation « Système de nommage des routes et autoroutes »),
intégrées le 17 octobre 2026 (ADR `docs/decisions/2026-10-17-classification-routes.md`).

## Deux catégories

| Catégorie | Critère | Désignation | Nom |
|---|---|---|---|
| Route confédérale | touche au moins **2 États** ; toute route classée de Brčko (BK-95) et de Mostar (MO-96) | `Bk-N` | « Route de [terminus A]–[terminus B] » |
| Route étatique | reste dans **un seul État** | `Xx-N` : deux lettres du code de l'État, la seconde en minuscule | « Route de [ville] » |

- **Pas de zéro initial** : `Bk-1`, `Bk-27`, `Da-1`, `Su-14` (modèle de Minorque, Me-1).
  À l'affichage, on trie sur la valeur numérique qui suit le tiret, jamais par ordre
  lexicographique.
- **La casse distingue les espaces de noms** :
  - `DA-09` est l'État de Dalmacija, `Da-1` est une route étatique ;
  - `BK-95` est Brčko, `Bk-7` est une route confédérale (Bk = **B**alkanska
    **K**onfederacija).
- **Brčko et Mostar** ne sont pas des États et n'émettent pas de routes étatiques : `Bk-`
  et `Mo-` ne sont jamais produits par un État.

## Numérotation
- **Routes confédérales**, numérotation hiérarchique :
  - `Bk-1` à `Bk-9` : grands axes reliant les capitales (Sarajevo, Beograd, Zagreb,
    Sofija) et grandes diagonales ;
  - `Bk-10` et au-delà : réseau secondaire.
- **Routes étatiques** : chaque État a son propre compteur, et chacun commence à `Xx-1`.

## Adoption
- Réseau confédéral : arrêté confédéral du Kongres (art. 91 bis).
- Routes étatiques : liste arrêtée par chaque État.

## Pas encore arrêté
Le réseau de départ proposé le 18 septembre 2026 (`Bk-1` à `Bk-13`, calé sur les corridors
paneuropéens X, Vc, VIII et danubien) n'a pas été validé. Il emploie en outre des codes
d'avant la renumérotation (BS, HB, GO, TO) : il faut le reprendre avant de l'adopter.
