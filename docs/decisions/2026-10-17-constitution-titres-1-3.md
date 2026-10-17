# ADR 2026-10-17 — Constitution v4.1 : intégration des titres 1 à 3

## Statut
Accepté (demande utilisateur du 2026-10-17 : « Pourquoi tu n'as pas intégré les titres 2 et 3
dans la constitution ? », avec le texte de la Constitution du 1er mai 2020 en pièce jointe).

## Constat
La constitution du dépôt n'a jamais été qu'un complément :

- v1 et v2 s'intitulaient « Nouveaux titres de la Constitution… — Articles complémentaires » ;
- v4 a gardé le sous-titre « Projet de rédaction — Titres complémentaires ».

Ces titres (1 bis, 4, 5, 6, 7) étaient rédigés pour s'ajouter au texte de base de 2020. Leur
numérotation le montre : le titre 1 bis suit l'article 1, et le titre 4 commence à l'article 100.

Le texte de base (titres 1 à 3) ne figurait ni dans le dépôt ni dans le projet Claude.
La consolidation v4 du 2026-10-13 a donc fusionné les seuls titres complémentaires et publié
53 articles comme s'ils formaient la constitution entière. Ce manque aurait dû être signalé.

Le titre 1 manquait aussi. Seul son article 1, la liste des États, était remplacé par
l'article 1 bis.

## Décision
La version 4.1 intègre le texte de base, adapté au canon, dans `v4.md` et `v4.en.md` :

| Titre | Articles | Contenu |
|---|---|---|
| 1 / Dispositions générales | 1 à 7 | Confédération balkanique, but, États, langues, État de droit, subsidiarité, responsabilité |
| 2 / Droits fondamentaux, citoyenneté et buts sociaux | 8 à 41 | 29 droits fondamentaux ; citoyenneté et droits politiques (37 à 40) ; buts sociaux (41) |
| 3 / De la Confédération, des États confédérés et des municipalités | 42 à 53 | tâches, collaboration, conventions interbalkaniques, primauté du droit confédéral, municipalités, constitutions des États, ordre constitutionnel, territoire |

Aucun article existant n'est renuméroté. La constitution compte 106 articles en huit titres.

### Principales adaptations
Le détail est dans la section H de l'annexe de `v4.md`.

- **Supprimé** :
  - le cadre « gouvernement en exil » ;
  - le préambule de 2020 (celui du 14 septembre 2026 est conservé) ;
  - la liste de 32 États de l'article 1, remplacée par un renvoi à l'article 1 bis.
- **Langue « yougoslave »** (art. 4) : remplacée par le južnoslovenski jezik et ses trois
  standards, avec renvoi aux articles 127 et 128.
- **Citoyenneté** (art. 37 à 40) : alignée sur `docs/canon/citoyennete.md` :
  - citoyenneté déclarative ;
  - rattachement par la municipalité d'origine (la sienne, celle d'un parent ou d'un
    grand-parent), sinon par la municipalité de résidence, jamais par libre choix ;
  - aucune déchéance ;
  - droits politiques confédéraux et étatiques exercés dans l'État de rattachement.

  Le projet d'article 102 bis (ADR 2026-10-15) y est intégré. Il n'y aura pas d'article
  102 bis.
- **Rédaction** :
  - générique masculin (« citoyens » au lieu de « citoyens et citoyennes », « un juge ») ;
  - « Tribunal confédéral » remplacé par Cour confédérale de justice (art. 1 ter c) ;
  - coquille « Kalkaniques » corrigée.
- **« Municipalités »** (titre 3) : terme du texte de 2020 **conservé** pour l'échelon
  local (décision de l'utilisateur du 2026-10-17, qui annule le remplacement par « communes »
  fait dans la première rédaction). « Municipalité confédérale autonome » continue de
  désigner Brčko et Mostar (art. 1 septies). La municipalité d'origine de l'art. 38 est la
  « commune d'origine » de `docs/canon/citoyennete.md`.
- **Article 48 inachevé** (« Les États peuvent, par ») : complété sur le modèle de la
  Constitution fédérale suisse, dont le texte de 2020 est issu.
- **Articles 49 à 53 rédigés** pour clore le chapitre :
  - primauté du droit confédéral ;
  - municipalités ;
  - garantie des constitutions des États ;
  - ordre constitutionnel : intervention sur demande de l'État, cohérente avec l'art. 139 ;
  - territoire : consentement du Narodni Sabor, cohérent avec l'art. 109.
- **Conséquence sur le titre 4** : nouvel art. 105 i, par lequel le Kongres accorde la
  garantie aux constitutions des États.

## Reste ouvert
Les numéros 54 à 99 restent libres. Dans le modèle suisse, ils portent :

- le catalogue des compétences de la Confédération (relations extérieures, sécurité,
  formation, environnement, transports, économie…) ;
- le régime des finances.

Le titre 6 couvre la péréquation, mais le catalogue des compétences n'existe dans aucune
version du texte.

## Propagation
- `docs/constitution/v4.md` et `v4.en.md` : titres 1 à 3, art. 105 i, en-tête « version 4.1 »,
  annexe H.
- `portail/data/constitution.json` régénéré par `scripts/build_constitution.py`.
- `portail/index.html` :
  - entrée du Journal officiel du 2026-10-17 ;
  - renvois art. 37 et 38 dans le parcours citoyen ;
  - les renvois « Article 1 ter » à « 1 septies » pointent vers le bon article, et non
    plus vers l'article 1, qui existe désormais ;
  - constante inutilisée `C_ROMAN` retirée.
- `docs/canon/citoyennete.md`, ADR 2026-10-15-parcours-citoyennete.md : renvoi aux art. 37 à 40.
- `CLAUDE.md` : section Constitution.
