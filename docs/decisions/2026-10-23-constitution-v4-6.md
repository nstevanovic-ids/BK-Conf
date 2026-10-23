# ADR 2026-10-23 — Constitution v4.6 : fin du titre 4

## Statut
Accepté le 2026-10-23. L'utilisateur a demandé, pour quatre points, comment procède la
Suisse, puis a donné ses réponses :
- « 3. ok, 4. ok » (traités, exécution confédérale) ;
- pour la conciliation, « pourquoi on ne prend pas ça pour la Confédération ? » ;
- enfin « ok pour ce qu'on vient de discuter » (immunités, conciliation étendue au refus de
  consentement, symboles).

Constitution portée en version 4.6 (annexe M) : quatre articles nouveaux, soit 174 articles
au total.

## Décisions
1. **Immunités** (art. 101 bis), sur le modèle suisse à trois niveaux (Cst. art. 162 ;
   LParl art. 16, 17 et 20) :
   - **Immunité absolue** pour les votes et les propos tenus devant les chambres. Elle
     couvre les membres du Kongres, du Narodni Sabor, du Konfederalno Veće et le chancelier.
   - **Immunité relative** pour les infractions liées aux fonctions : une poursuite exige
     l'autorisation de la chambre spéciale du Ustavni Sud. En Suisse, ce sont deux
     commissions parlementaires qui l'accordent ; ici, aucune majorité politique ne peut
     viser les délégués d'un peuple.
   - **Garantie de session** : pendant les sessions, aucune poursuite ni privation de
     liberté pour une infraction sans lien avec les fonctions, sauf consentement ou
     autorisation, le flagrant délit étant réservé. Elle empêche d'arrêter quelques
     délégués d'un peuple à la veille d'un vote de consentement. La majorité de consentement
     est de six membres sur dix par délégation, et l'alarme exige sept membres : quatre
     arrestations suffiraient à la rendre impossible.
   - La chambre spéciale refuse l'autorisation lorsque la poursuite paraît destinée à
     empêcher un vote.
2. **Conciliation** (art. 110 ter) : la mécanique suisse (LParl art. 89 à 93), avec une
   composition par peuple et non par parti.
   - Quatorze membres, un par peuple et par chambre.
   - La commission ne délibère que sur les points litigieux et rédige un compromis unique,
     que chaque chambre vote en bloc.
   - En cas d'alarme, le compromis exige la voix du membre de la délégation qui l'a
     déclenchée.
   - **La conciliation s'applique aussi au refus de consentement.** Si elle échoue, la loi
     ou le traité est abandonné, comme en Suisse.
   - En cas d'alarme, l'échec laisse au Kongres la faculté d'adopter la loi aux deux tiers.
   - **Le budget n'est jamais abandonné** : sur chaque poste litigieux, le montant le plus
     bas l'emporte.

   Le modèle suisse intégral a été écarté : il ferait du Narodni Sabor un colégislateur de
   toutes les lois, avec un veto absolu de chaque délégation. C'est le précédent de la
   Chambre des peuples de Bosnie-Herzégovine.
3. **Traités** :
   - les traités qui portent sur une matière de l'art. 109 a exigent le consentement du
     Narodni Sabor ;
   - les traités importants sont soumis au référendum facultatif (art. 122), sur le modèle de
     la Constitution suisse (art. 141 al. 1 let. d).
4. **Exécution confédérale** (art. 50 bis), d'après les art. 173 et 186 de la Constitution
   suisse :
   - mise en demeure et délai ;
   - constat du manquement par le Ustavni Sud ;
   - substitution aux frais de l'État ou suspension des contributions, la péréquation au
     plancher de 85 % restant toujours due ;
   - approbation de cinq délégations pour toute contrainte ;
   - force seulement sous l'état d'exception.

   Précédents : en Suisse, l'intervention fédérale (art. 52) a été employée dix fois depuis
   1848, la dernière en 1932 à Genève. L'Allemagne n'a jamais employé son art. 37. L'Espagne
   a appliqué son art. 155 en 2017-2018.
5. **Symboles** (art. 7 bis) :
   - le drapeau : bande verticale rouge au guindant, champ bleu, blanc et bleu, comme sur le
     portail ;
   - le drapeau d'État est fixé par la loi ;
   - l'emblème est le lion ailé d'or ;
   - le sceau porte le lion ailé sur un soleil à sept rais ;
   - la devise est *Naš dom* ;
   - l'hymne est fixé par la loi ;
   - les lois sur les symboles exigent le consentement du Narodni Sabor.

## Incohérences relevées, hors de cette décision (chantier des symboles)
- **Soleil sur le drapeau d'État.** La page Symbols décrit un drapeau d'État portant
  « the radiant sun charged with the lion » au guindant. Le canon réserve le soleil à sept
  rais au sceau et l'interdit sur les drapeaux. L'art. 7 bis renvoie le drapeau d'État à la
  loi pour ne pas trancher ici.
- **Lion vénitien : résolu.** La page Symbols présentait le lion comme « heir to the
  Venetian and Adriatic heraldic tradition ». L'utilisateur l'a corrigé le 23 octobre 2026 :
  « il n'est pas hérité de la tradition vénitienne, c'est un syncrétisme entre l'aigle
  largement présent dans la symbolique balkanique et celle du lion bulgare ». Le canon des
  symboles et la page Symbols ont été corrigés dans cette même PR.

## Propagation
- `docs/constitution/v4.md` et `v4.en.md` : version 4.6 et annexe M.
- `portail/data/constitution.json` régénéré.
- Portail :
  - simulateur de la page Institutions : alarme renvoyée à la commission de l'art. 110 ter
    et nouveau cas « Consent refused » ;
  - Journal officiel : entrée v4.6.
- `CLAUDE.md`.
