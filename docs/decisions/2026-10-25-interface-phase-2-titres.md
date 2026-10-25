# ADR 2026-10-25 — Interface dans les trois standards, phase 2, étape 1 : titres et intertitres

## Statut
Accepté le 2026-10-25 (« C Ok pour 10 », interface phase 2). Première étape : les titres et
intertitres des pages. Le texte courant suivra.

## Décision
- **Portée** : les titres (h1 à h4) et les sur-titres de toutes les pages du portail, soit
  78 libellés nouveaux, plus neuf clés de la phase 1 réemployées (États, Journal officiel,
  carte…). Sont compris le parcours citoyen, la vérification, l'accès et les cartes des
  mineurs.
- **Mécanisme** :
  - l'anglais reste dans le gabarit, et `data-i18n` (ou `data-i18n-html` pour un titre à
    balise) nomme la clé ;
  - `i18nApply` traduit, et un `MutationObserver` sur `#app` traduit aussi ce qui s'affiche
    après le rendu (étapes, tableau de bord, formulaires) ;
  - le changement de langue retraduit la page sans la recharger.
- **Note sous l'en-tête** : « le texte des pages est pour l'instant en anglais ; les titres
  sont traduits », dans chaque standard.
- **Règles de choix** : celles de la phase 1 (`docs/alfabet/interface-trois-standards.md`).
  Les choix notables sont consignés dans ce document.
- **Alphabet v3 dans toute l'interface** (règle 5) : ñ, ļ et x partout, y compris dans les
  chaînes de la phase 1 qui l'avaient manqué (*Sodelovañe*, *Iskañe*, *Ukļučite se*,
  *Državļanska karta*, *Otvori meñuto*).

## Point ouvert
Les libellés validés de la carte citoyenne et certains mots courants de la Constitution
gardent *lj* et *nj* :
- *Državljanska karta*, *Datum izdavanja*, *Konfederalni registar državljana* ;
- *središnji standard*.

Faut-il les aligner sur la règle 5 ? **Réglé le même jour** : oui (ADR
2026-10-25-alphabet-v3-mots-courants.md).

## Propagation
- `portail/data/i18n.json` (clés `h_*`, phase 1 corrigée, `note_en`).
- `portail/index.html` : attributs `data-i18n`, `i18nApply` et `i18nWatch`.
- `docs/alfabet/interface-trois-standards.md`, `CLAUDE.md`.
