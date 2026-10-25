# ADR 2026-10-15 — Parcours d'inscription citoyenne et carte citoyenne

## Statut
Accepté. Chantier ouvert par l'utilisateur le 2026-10-15 : « devenir citoyen de la
Balkanska Konfederacija (parcours d'inscription sur le portail) ». Spécification en
vigueur : `docs/canon/citoyennete.md`.

## Constats
1. **La constitution v4 ne contient aucun article d'acquisition de la citoyenneté.** Les
   dispositions existantes supposent le citoyen sans le définir : art. 102 (registres
   nationaux), 104 (électeur à 18 ans), 108 (Narodni Sabor), 120 à 122 (démocratie directe).
2. Le portail annonçait une citoyenneté « déclarative, acquise en ligne », un identifiant
   `JK-000000` (au lieu de `BK-XX-NNNNNN`) et un rattachement « by free attachment ».
3. L'accueil affirmait « Every citizen is an elector of the Narodni Sabor », ce que
   contredit l'art. 102 al. 2 (les non-inscrits ne votent pas pour le Narodni Sabor).
4. Le bouton « Begin registration » ouvrait une alerte : aucun parcours n'existait.

## Décisions
1. **Citoyenneté déclarative**, effective à la délivrance de la carte ; inscription en
   ligne à partir de 18 ans.
2. **Rattachement par la commune, sans libre choix** : commune d'origine propre, sinon
   d'un parent ou grand-parent (diaspora, deux générations), sinon de résidence dans la
   Confédération. Motif : le libre choix permettrait de peser sur les petits États
   (plancher de deux délégués au Kongres, une voix par État dans la double majorité).
3. **Index des communes** `portail/data/opstine.json` (1 461 communes), produit par
   `scripts/build_stats.py` à partir des appariements déjà calculés pour `stats.json` :
   aucune liste parallèle à maintenir.
4. **Registre national facultatif et indépendant de l'État** (art. 102) ; narodnost
   imprimée seulement au choix du titulaire, jamais dans la zone de lecture automatique.
5. **Langue = attribut du document** : standard choisi pour les libellés, anglais en
   regard, aucun champ langue.
6. **Carte TD1** : numéro `BK-XX-NNNNNN`, code de pays `BKC`, validité 10 ans, autorité
   *Konfederalni registar državljana* (département Justice et droits fondamentaux, Zagreb).
   Changement d'État = nouveau numéro.
7. **Prototype local** : carte délivrée dans le navigateur avec un numéro provisoire ;
   numéros définitifs et comptes à l'ouverture de la plateforme Decidim (vérification
   `bk_citizenship`, `unique_id` = numéro, `metadata` = État et registre).

## Projet d'article — à intégrer par le workstream Constitution
> **2026-10-17 : intégré.** Ce projet est repris aux articles 37 (citoyenneté
> confédérale) et 38 (rattachement) de la Constitution v4.1, dans le titre 2 restauré,
> et non en article 102 bis ; cf. ADR 2026-10-17-constitution-titres-1-3.md.

Ce projet n'est pas inséré dans `v4.md` / `v4.en.md` (séparation des workstreams). Place
proposée : après l'article 102, sans renumérotation.

### Article 102 bis / Citoyenneté confédérale

Est citoyen de la Confédération toute personne qui en déclare la volonté et qui est
rattachée à un État confédéré ou à une municipalité confédérale autonome.

Le rattachement est déterminé par la commune d'origine de la personne, de l'un de ses
parents ou de l'un de ses grands-parents ; à défaut, par sa commune de résidence sur le
territoire de la Confédération. Il ne fait l'objet d'aucun libre choix.

Les citoyens établis à l'étranger exercent leurs droits politiques dans l'État auquel ils
sont rattachés.

La citoyenneté confédérale est indépendante de l'inscription à un registre national. Elle
ne peut être subordonnée à l'appartenance à un peuple, à une langue, à un standard
régional, à un alphabet ou à une religion.

Nul ne peut être privé de la citoyenneté confédérale contre sa volonté. Tout citoyen peut
y renoncer.

La loi confédérale règle la déclaration de citoyenneté, la tenue du registre des citoyens,
la délivrance de la carte citoyenne et la situation des mineurs. Le registre des citoyens
est tenu séparément des registres nationaux.

### Article 102 bis / Confederal citizenship

Any person who declares the will to be a citizen of the Confederation and is attached to a
confederated state or to an autonomous confederal municipality is a citizen of the
Confederation.

Attachment is determined by the municipality of origin of the person, of one of his
parents or of one of his grandparents; failing that, by his municipality of residence in
the territory of the Confederation. It is not a matter of free choice.

Citizens residing abroad exercise their political rights in the state to which they are
attached.

Confederal citizenship is independent of enrolment in a national register. It may not be
made conditional on belonging to a people, a language, a regional standard, an alphabet or
a religion.

No one may be deprived of confederal citizenship against his will. Every citizen may
renounce it.

Confederal law governs the declaration of citizenship, the keeping of the register of
citizens, the issue of the citizen card and the situation of minors. The register of
citizens is kept separately from the national registers.

## Points alors ouverts
- **Brčko et Mostar** : réglé. Chacune forme une circonscription du Kongres et élit au moins
  un délégué (art. 103, v4.7).
- **Communautés non constitutives** (albanaise, turque, hongroise, slovaque) : réglé par le
  Veće Zajednica (art. 1 octies, v4.4) ; pas de registre au Narodni Sabor.
- **Libellés** des standards occidental et oriental : validés le 2026-10-24 (ADR
  2026-10-24-alphabet-transition-libelles.md).
- **Mineurs** : traités à part (chantier ouvert le 2026-10-25).

## Propagation
- Portail : parcours `#/register` (5 étapes), carte `#/citizen` (recto, verso, export PNG),
  lien « Register » / « My card », page Participation, bandeau et encart d'accueil, pied de
  page, recherche.
- Données : `opstine.json` (nouveau), `peuples.json` (formes genrées `m` / `f`).
- Propagation de l'ADR 2026-10-13 faite au passage, ces noms étant affichés par le
  parcours : `SF-93` Sofia → **Sofija** (`etats.json`, `docs/canon/etats.md`, `CLAUDE.md`),
  Bošnjaci → **Bošñaci** (`peuples.json`, `docs/canon/peuples.md`, `CLAUDE.md`),
  Bošnjačkih → **Bošñačkih** (`entites-autonomes.json`, `docs/canon/entites-autonomes.md`).
  Reste de cette liste : libellés « federal » → « confederal » de `index.html`.
