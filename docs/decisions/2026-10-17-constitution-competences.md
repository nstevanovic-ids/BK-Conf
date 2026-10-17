# ADR 2026-10-17 — Constitution v4.2 : chapitre « Compétences » (titre 3, art. 49 à 99)

## Statut
Accepté. L'utilisateur a versé le 2026-10-17 son projet des articles 54 à 95 (« Voilà ce
que j'avais rédigé jusqu'à l'article 95 »). Le catalogue des compétences était le manque
principal relevé après la v4.1 (ADR 2026-10-17-constitution-titres-1-3).

## Décision

### Structure
Le titre 3 reprend la structure du projet, sections comprises :

| Chapitre | Section | Articles |
|---|---|---|
| 1 / Rapports entre la Confédération et les États confédérés | 1 Tâches · 2 Collaboration · 3 Municipalités · 4 Garanties confédérales | 42–43 · 44–50 · 51 · 52–54 |
| 2 / Compétences | 1 Relations avec l'étranger | 55–57 |
| | 2 Sécurité, défense nationale, protection civile | 58–62 |
| | 3 Formation, recherche et culture | 63–77 |
| | 4 Environnement et aménagement du territoire | 78–87 |
| | 5 Travaux publics et transports | 88–95 |
| | 6 Énergie et communications | 96 |
| | 7 Économie et monnaie | 97 |
| | 8 Logement, travail, sécurité sociale et santé | 98 |
| | 9 Droit civil, droit pénal, métrologie et étrangers | 99 |

La constitution compte désormais **152 articles** en huit titres. Les numéros 1 à 145 sont
continus, à l'exception des articles « bis » à « septies ».

### Numérotation du chapitre 1
L'article 54 du projet est numéroté « 3.1.4.3 », c'est-à-dire le troisième article de la
section 4. Il fixe donc le reste du chapitre :

- la section 4 couvre les articles 52 à 54 ;
- la section 3 est l'article 51 ;
- la section 2 s'étend jusqu'à l'article 50.

Les articles 49 à 52 de la v4.1, rédigés par Claude, deviennent les articles 50 à 53.
L'article 53 de la v4.1 est remplacé par l'article 54 du projet. Le nouvel article 49
(déclaration de force obligatoire des conventions interbalkaniques) reprend l'article 48a
du modèle suisse.

### Fidélité au projet
Les articles 54 à 95 sont repris tels quels, sauf pour les corrections suivantes :

- **Canon** :
  - langue « yougoslave » remplacée par le južnoslovenski jezik (art. 75) ;
  - Congrès balkanique et Assemblée confédérale remplacés par le Kongres (art. 54, 90) ;
  - « gouvernement » remplacé par le Konfederalno Veće (art. 77) ;
  - Belgrade remplacé par Beograd (art. 73) ;
  - consentement du Narodni Sabor ajouté aux modifications de territoire (art. 54, cohérent
    avec l'art. 109 a).
- **Citoyenneté** : « nationalité balkanique » et « les Balkaniques » remplacés par
  « citoyens de la Confédération » (art. 60).
- **Coquilles et rédaction** :
  - AFGUB corrigé en ACGUB ;
  - une agence ne légifère pas (art. 62) ;
  - accord « un KPSI » ;
  - « etc. » retiré ;
  - eaux « partagées avec des pays tiers » (art. 83) ;
  - pieds de page du document source supprimés.
- **Forme** : les alinéas ne sont plus numérotés, comme dans le reste du texte. La
  disposition transitoire de l'art. 82 devient son dernier alinéa.
- **Conservé tel quel** : l'usage de « national » au sens du pays (intérêt national, routes
  nationales, identité nationale), les sigles ACGUB, KPU, KPSI et EBF, ainsi que les montants
  en dinars.

L'annexe I de `v4.md` détaille chaque correction.

### Articles 96 à 99 (rédaction de Claude)
Le projet s'arrête à l'article 95, et le titre 4 commence à l'article 100. Les sections 6 à 9
du modèle sont donc condensées en un article chacune :

- **96** : énergie, poste et télécommunications, radio et télévision. La radio et la
  télévision doivent faire place aux trois standards et aux langues minoritaires.
- **97** : économie, espace économique unique, monnaie, Banque centrale et douanes. La monnaie
  est le **dinar**, unité tirée de l'article 94 du projet. La Banque centrale confédérale,
  qui a son siège à Beograd (art. 1 ter), est indépendante. L'article donne une base aux
  impôts sur les carburants et sur les véhicules de l'art. 94.
- **98** : logement, droit du travail, assurances sociales (mise en œuvre de l'art. 41) et
  santé.
- **99** : droit civil et droit pénal, qui relèvent de la Confédération. L'organisation
  judiciaire relève des États. La poursuite des infractions de l'art. 141 relève de la
  Confédération. Les articles portent aussi sur la métrologie, les étrangers et l'asile, et
  sur l'accès des étrangers résidents à la citoyenneté (art. 38).

### Conséquences ailleurs dans le texte
- **Art. 40** : la mention du service militaire et du service de remplacement est rétablie.
  La v4.1 l'avait retirée faute de service militaire ; il existe désormais (art. 60).
- **Art. 105 i** : le renvoi pointe vers l'art. 52, et non plus vers l'art. 51.

## Reste ouvert
- **Régime fiscal général** : impôts directs et taxe sur la valeur ajoutée confédéraux.
  Seuls les droits de douane, l'impôt sur les carburants et la surtaxe sur les véhicules ont
  une base.
- **Révision de la Constitution et dispositions finales**, avec l'entrée en vigueur, à
  laquelle l'art. 82 renvoie.
- **Organisation de la Cour confédérale de justice.**
- **Symboles confédéraux.**
- **Nom sud-slave de l'ACGUB** : le sigle est conservé.

## Propagation
- `docs/constitution/v4.md` et `v4.en.md` : titre 3 réécrit, art. 40 et 105 i, version 4.2,
  annexes H et I.
- `scripts/build_constitution.py` : lit les intertitres `#### Section N / Nom` et ajoute
  un champ `sec` au premier article de chaque section.
- `portail/index.html` : le lecteur affiche les sections (sommaire et corps), et le Journal
  officiel reçoit une entrée v4.2.
- `CLAUDE.md` : section Constitution.
