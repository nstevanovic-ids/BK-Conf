# ADR 2026-10-26 — Le portail entier dans les trois standards et les deux écritures

## Statut
Accepté le 2026-10-26 (« Il faut traduire tout le site maintenant, dans toutes les langues du
site et les alphabets » ; livraison en deux PR, pages puis Constitution). Cette ADR couvre la
première : le texte des pages. La Constitution suit (ADR 2026-10-26-constitution-trois-standards.md).

## Décision
- **Tout le texte des pages** est traduit en zapadni, središñi et istočni : accueil, États et
  fiches d'États (notes de drapeaux, sources des chiffres), carte, institutions, Konfederalno
  Veće, sécurité, Journal officiel, identité, alphabet, symboles, communautés autonomes,
  participation, tableau de bord, parcours citoyen (cinq étapes, consentements, erreurs),
  confirmation, accès, vérification, mineurs, recherche, panneaux du globe. La note « le texte
  des pages est pour l'instant en anglais » disparaît.
- **Mécanisme** :
  - l'anglais reste dans le gabarit et sert de clé : `L` en littéral étiqueté pour le texte du
    gabarit, `L(x)` pour une chaîne des données, `N('…')` pour marquer l'anglais des tables de
    code (`portail/index.html`) ;
  - les traductions sont dans `portail/data/textes.json` : une entrée par phrase ou libellé
    complet, variables `{0}`, `{1}`… ; pluriels slaves par `{0#one:…;few:…;other:…}` ;
  - `scripts/textes.py` extrait le catalogue des clés, intègre les traductions et contrôle
    tout (clés manquantes, variables, balises, alphabet v3, yat hors du središñi) ;
  - les titres gardent leurs clés `data-i18n` de `i18n.json`.
- **Changer de langue ou d'écriture redessine la page** là où elle est, sans rechargement.
- **Nombres** selon la langue : 1,234 (anglais), 1.234 (zapadni, središñi), 1 234 (istočni).
  **Dates longues** : 25. oktober 2026 ; 25. 10. 2026. au središñi, dont les noms de mois
  divisent le serbe et le croate ; 25 oktomvri 2026 g.
- **Cyrillique sur tout le texte** du središñi et de l'istočni, dérivé à l'affichage comme
  pour les titres (ADR 2026-10-25-portail-cyrillique.md). Restent en latin :
  - ce qui porte `translate="no"` : lettres de l'alphabet latin et API sur la page de
    l'alphabet, carte de citoyen et MRZ, boutons de langue ;
  - e-mails, liens, codes avec chiffres, chiffres romains (*Glava III*) ;
  - les mots dont une lettre n'existe pas dans l'alphabet unifié (*Sainte-Laguë*) et les noms
    des communautés écrits dans leur langue non slave (*Bashkimi i Komunave Shqiptare të
    Vardarit Perëndimor*, *Magyar Közösség*, *… Türk Belediyeler Birliği*) ;
  - quelques noms et sigles étrangers (Eurostat, Google Wallet, ICAO, MRZ…).
- **Glossaire** des trois standards : `docs/alfabet/glossaire-trois-standards.md`, qui fixe
  les termes institutionnels, juridiques et civiques ; les règles de choix des mots restent
  celles de `interface-trois-standards.md`.
- **Istočni** : rédigé en bulgare cyrillique puis converti en latin v3 par `scripts/textes.py`
  (ъ ã, щ št, дж x, я ja, ю ju, ня ña, ню ñu, ля ļa, лю ļu, ьо jo) ; chaque chaîne est
  vérifiée par aller-retour : le cyrillique du portail redonne le bulgare d'origine.
- **Carte de citoyen** : non traduite. C'est un document dont la langue est celle choisie
  par le titulaire (attribut du document, pas du porteur).

## Corrections faites au passage
- Les noms des standards de la fiche d'État étaient en français (« Standard central
  (središñi) ») : ils sont en anglais dans le gabarit (« Central standard (središñi) ») et
  traduits.
- Le message d'erreur de chargement, en français, est en anglais et traduit.

## Propagation
- `portail/index.html`, `portail/data/textes.json` (nouveau), `portail/data/i18n.json`
  (note supprimée, pied de page), `scripts/build_portail.py`, `scripts/textes.py` (nouveau).
- `docs/alfabet/glossaire-trois-standards.md` (nouveau), `interface-trois-standards.md`,
  `CLAUDE.md`, Journal officiel.
