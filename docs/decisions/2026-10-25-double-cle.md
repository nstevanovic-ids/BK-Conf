# ADR 2026-10-25 — Double clé au Narodni Sabor et au Konfederalno Veće ; frontières des États fixes

## Statut
Accepté le 2026-10-25 (« Oui pour la double clé »), à la suite de l'analyse de l'équilibre
entre États et peuples (`docs/analyses/equilibre-etats-peuples.md`). Constitution portée en
version 4.9 (annexe P), sans article nouveau : elle compte toujours cent quatre-vingt-douze
articles.

## Contexte
- La parité stricte du Narodni Sabor (sept délégations de dix membres) et du Konfederalno
  Veće (sept conseillers) protège chaque peuple, quelle que soit sa taille.
- Elle a un revers : cinq délégations sur sept suffisent au consentement, quelle que soit la
  population qu'elles représentent. D'après la population des États territoriaux, les cinq
  autres peuples (Slovènes, Croates, Bosniaques, Monténégrins, Macédoniens) en forment
  environ 44 %. Ils pouvaient donc décider contre les Serbes et les Bulgares, qui en forment
  environ 56 %.
- Au Konfederalno Veće, la majorité simple (quatre conseillers) produisait le même effet.
- L'utilisateur a demandé une solution où personne ne se sente lésé, sans toucher au
  territoire.

## Décision

### 1. Double clé (art. 110)
Chaque fois que la Constitution exige la majorité d'au moins cinq des sept délégations
nationales, les délégations qui forment cette majorité doivent en outre représenter ensemble
la majorité des citoyens inscrits aux registres nationaux.

Le calcul se fait sur le dernier relevé annuel de la Chancellerie confédérale (art. 115 bis),
au 1er janvier. La base est le registre national, choisi par chaque citoyen (art. 102), et non
la population des États ni un décompte ethnique.

La règle vaut partout où la Constitution exige cinq délégations :
- consentement obligatoire (art. 110) ;
- mesures de contrainte de l'exécution confédérale (art. 50 bis) ;
- lois urgentes (art. 123 bis) ;
- engagement de la Žandarmerija dans un État pendant l'état d'exception (art. 139) ;
- nominations et révocations : chef d'état-major général (art. 61 bis), procureur général
  (art. 119 ter), inspecteur général (art. 138 bis), commandement de la Žandarmerija
  (art. 140), directoire du Konfederalni Istražni Ured (art. 143), direction de la
  Konfederalna Obavěštajna Agencija (art. 145 ter).

Elle ne touche pas aux révisions constitutionnelles (six délégations, art. 110) : toute
coalition de six peuples représente déjà la majorité des inscrits.

### 2. Konfederalno Veće (art. 111)
- Le consensus reste la règle.
- À défaut, une décision réunit **quatre conseillers dont les peuples représentent la
  majorité des inscrits**, ou **cinq conseillers**.
- Le repli à cinq conseillers garantit que l'exécutif n'est jamais bloqué.
- Siège vacant : la majorité des membres en fonction suffit ; en cas d'égalité, la voix du
  président en exercice est prépondérante.
- La suspension de trente jours d'une décision prise contre trois conseillers ou plus est
  inchangée.

### 3. Relevé public (art. 115 bis)
La Chancellerie publie chaque année le nombre total d'inscrits à chaque registre au
1er janvier. Le calcul de la double clé est ainsi vérifiable par tous.

### 4. Les frontières des États sont fixées à la fondation
> « Découper des territoires, c'est non. On crée des États au début, on ne va pas changer
> des limites administratives tous les quatre matins. »

- L'équilibre entre États et peuples se règle par des **mécanismes de vote**, jamais par un
  redécoupage.
- Le scénario de l'analyse qui partageait la Macédoine en quatre États (S1), comme les
  fusions croates (S2), sont écartés.
- Les 49 États et leurs limites sont ceux de `docs/canon/etats.md`.

## Effets

| Coalition | Avant | Après |
|---|---|---|
| Cinq peuples sans les Serbes ni les Bulgares (≈ 44 %) | consentement acquis | consentement refusé |
| Cinq peuples comptant les Serbes ou les Bulgares | consentement acquis | consentement acquis |
| Quatre conseillers sans les Serbes ni les Bulgares (≤ 42 %) | décision prise | décision refusée, sauf cinquième conseiller |
| Quatre conseillers comptant les Serbes et les Bulgares | décision prise | décision prise |

- La seule nouvelle minorité de blocage est l'**alliance des deux plus grands peuples**.
  Aucun peuple seul, ni les Serbes, ni les Bulgares, ne peut bloquer.
- Les petits peuples gardent leur parité : sans eux, cinq délégations ne se réunissent pas.
- Les chiffres ci-dessus sont des estimations d'après la population des États territoriaux ;
  le calcul réel se fera sur les registres.

## Non décidé
- **Pondération des voix d'États** dans la double majorité des votations (art. 123 et 124),
  sur une formule mathématique (point 3 de la discussion) : mise de côté le 2026-10-25 ;
  variantes proportionnelle et Penrose documentées dans l'analyse.
- **Pondération des délégations du Narodni Sabor** (Penrose) : non retenue à ce stade.

## Propagation
- `docs/constitution/v4.md` et `v4.en.md` (v4.9, art. 110, 111, 115 bis ; annexe P).
- `portail/data/constitution.json` (régénéré).
- Portail : page Institutions (Narodni Sabor, Konfederalno Veće), parcours d'une loi
  (consentement), page du Konfederalno Veće (règles), Journal officiel.
- `docs/analyses/equilibre-etats-peuples.md` (PR #55, mise à jour séparée).
- `CLAUDE.md`.
