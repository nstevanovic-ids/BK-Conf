# Plateforme participative : déploiement de Decidim (e-Konfederacija)

**Statut : dossier de déploiement, proposition du 2026-10-24.** Il complète la section
« Plateforme participative » de `docs/canon/citoyennete.md`, qui fixe déjà le workflow de
vérification `bk_citizenship`.

## 1. Rôle de chaque outil

| | Portail (GitHub Pages) | Plateforme (Decidim) |
|---|---|---|
| Fonction | Vitrine : États, Constitution, institutions, Journal | Comptes, registre, consultations, initiatives, votes |
| Comptes | Aucun | Oui |
| Données personnelles | Aucune ; le parcours appelle le registre confédéral (`registre/`) | Comptes, signatures, votes ; registre consulté, jamais recopié |
| Adresse proposée | `www.<domaine>` | `e.<domaine>` (e-Konfederacija) |

Le bouton « Register » du portail renverra vers la plateforme dès son ouverture.

Le registre confédéral (`registre/`, ADR 2026-10-25-registre-phase-0.md) ouvre avant la
plateforme. Dès sa mise en service, le parcours `#/register` délivre des numéros définitifs ;
d'ici là, il reste une démonstration dont les numéros, calculés dans le navigateur (FNV-1a),
sont provisoires, et la carte est réémise à l'ouverture du registre.

## 2. Version et modules

- **Decidim 0.32**, la branche stable la plus récente. La 0.32.2 est sortie le
  2026-10-22, sur Rails 8.1.
- **Socle** : Ubuntu 24.04 LTS, Ruby 3.3 ou 3.4, Node 22, PostgreSQL 17, libvips et
  ImageMagick, Redis et Sidekiq pour les tâches de fond.
- **Correspondance avec les institutions** :

| Besoin constitutionnel | Module Decidim | Réglage |
|---|---|---|
| Narodni Sabor et ses 7 délégations | Assemblées (`decidim-assemblies`) | une assemblée-mère et sept assemblées-filles, chacune ouverte aux seuls inscrits du registre (permission `register`) |
| Kongres, Konfederalno Veće | Assemblées | espaces d'information et de débat ; aucun vote n'y simule une décision officielle |
| Consultations (Constitution, alphabet, symboles) | Processus (`decidim-participatory_processes`), propositions et amendements | un processus par texte, amendements article par article |
| Initiative populaire (art. 121), référendum (art. 122) | Initiatives (`decidim-initiatives`) | deux types d'initiative ; seuils proportionnels aux inscrits (voir § 5) |
| Votations (e-Konfederacija) | Élections (`decidim-elections`) | un recensement par périmètre ; double majorité calculée hors de Decidim (§ 5) |

- **Secret du vote** : le composant Élections de base fonctionne sans couche
  cryptographique. Il suffit pour des votes consultatifs, mais l'administrateur peut, en
  principe, relier un vote à un compte.
- **Votes à enjeu** : ils demandent le module **Decidim Secure Elections** de Vocdoni
  (AGPL), qui scelle chaque bulletin dans le navigateur. Le recensement est tiré des
  vérifications Decidim, chaque votant reçoit un reçu, et chacun peut recompter. Le module
  vise Decidim 0.33, qui n'est pas encore publiée : il faut vérifier la compatibilité avant
  de s'y engager.

## 3. Registre et vérification

**Le registre reste un service distinct** (`registre/`, Cloudflare Worker + D1 UE ; décision
du 2026-10-25, ADR 2026-10-25-registre-phase-0.md). Il ouvre avant Decidim, et Decidim s'y
branche au lieu de le reproduire ; le module `decidim-bk_registry` envisagé le 2026-10-24
n'est plus nécessaire.
- Le registre émet la carte et le numéro **BK-XX-NNNNNN**, en séquence par État, sans jamais
  réattribuer un numéro.
- L'autorisation `bk_citizenship` est un formulaire (`BkCitizenshipAuthorizationHandler`)
  qui contrôle auprès du registre le numéro de carte et la date de naissance.
- `unique_id` est l'empreinte du numéro : une carte, un compte.
- `metadata` contient l'État de rattachement, la date d'inscription et la date d'effet.
- Le registre national est conservé à part (art. 115 bis c, « séparément du registre des
  citoyens ») ; seule sa référence figure dans l'autorisation.
- Les règles de l'art. 102 sont appliquées par le registre : période probatoire,
  rectification unique, verrou de quinze ans, retrait libre, effet différé.

**Assurance d'identité.** Une inscription en ligne reste déclarative.
- Au départ, il faut un compte confirmé par courriel et un **code SMS** (workflow `sms`
  fourni par `decidim-verifications`, avec une passerelle SMS). Cela limite les comptes
  multiples sans collecter de pièce d'identité.
- La **lettre postale** (workflow `postal_letter`) reste possible pour les votes
  importants.
- Une vérification forte (eID, vidéo) n'est pas prévue tant que les votes restent
  consultatifs.

**Si le volume l'exige**, le registre quitte Cloudflare pour l'hébergement de la plateforme
(§ 6) ; son API ne change pas.

## 4. Protection des données

**C'est le point qui conditionne l'ouverture.**
- **Données sensibles** :
  - l'inscription à un registre national révèle une appartenance nationale, c'est-à-dire
    une **origine ethnique** au sens de l'art. 9 RGPD et une donnée sensible au sens de la
    nLPD suisse (art. 5, let. c) ;
  - les votes et les signatures révèlent des **opinions politiques** ;
  - les lois de protection des données de Serbie, de Bosnie-Herzégovine, du Monténégro et
    de Macédoine du Nord suivent le RGPD.
- **Mesures** :
  - consentement **exprès et distinct** pour le registre national, retirable à tout moment
    (c'est le retrait libre de l'art. 102, qui entraîne l'effacement) ;
  - registre national dans une table séparée et chiffrée, accès nominatif journalisé,
    jamais exporté (narodnost hors zone de lecture automatique, déjà au canon) ;
  - analyse d'impact (AIPD) avant l'ouverture ;
  - hébergement en Suisse ou dans l'UE ;
  - durées de conservation fixées ;
  - politique de confidentialité et conditions d'utilisation publiées ;
  - aucun traceur publicitaire.
- **Responsable du traitement** : une **association de droit suisse** (art. 60 CC), avec
  siège à Genève. Elle exploite la plateforme et répond des données. C'est le véhicule le
  plus simple et le plus neutre entre les sept peuples.

## 5. Règles de vote à reproduire

- **Double majorité** (art. 123 et 124) : une votation se tient en **51 élections
  parallèles**, une par périmètre (49 États, Brčko, Mostar), avec les mêmes questions. Le
  recensement de chacune est formé des citoyens rattachés au périmètre. Un script agrège
  les résultats : majorité des votants, puis majorité des États, Brčko et Mostar votant
  avec le territoire confédéral le plus proche (art. 124).
- **Narodni Sabor** : 7 élections, une par registre, avec le recensement des inscrits dont
  la date d'effet est passée.
- **Seuils des initiatives** :
  - à la plateforme de lancement, 300 000 et 150 000 signatures n'ont pas de sens ;
  - les seuils sont donc proportionnels aux inscrits, dans le rapport de la Constitution à
    l'électorat réel : environ 1,5 % pour l'initiative, 0,75 % pour le référendum ;
  - un délai de dix-huit mois s'applique à l'initiative et de cent jours au référendum ;
  - pour un référendum demandé par des États, la règle de la moitié s'applique (art. 122).

## 6. Hébergement

| Option | Pays | Intérêt |
|---|---|---|
| Infomaniak (Public Cloud) | Suisse (Genève) | nLPD, proximité de l'association, neutralité |
| Exoscale | Suisse (Genève, Zurich) | nuage suisse, base PostgreSQL gérée |
| Hetzner | Allemagne, Finlande | coût bas, RGPD |

Recommandation : **Suisse**. La juridiction est neutre à l'égard des sept peuples et c'est
celle de l'association.

**Dimensionnement de départ** :
- une machine de 4 vCPU, 8 Go de mémoire et 80 Go de disque ;
- PostgreSQL géré, stockage objet compatible S3 pour les fichiers déposés ;
- fournisseur SMTP transactionnel et passerelle SMS ;
- sauvegardes quotidiennes hors site ;
- un second nœud derrière un répartiteur pour les jours de vote.

**Livraison** :
- un dépôt séparé pour l'application Decidim, le portail restant dans `BK-Conf` ;
- conteneurs Docker, déploiement par GitHub Actions ;
- une instance de recette et une instance de production.

## 7. Configuration de l'organisation

- **Langue** : anglais à l'ouverture. Les trois standards (zapadni, središñi, istočni)
  viendront comme locales personnalisées avec l'interface multilingue (B10, reportée).
- **Périmètres** : types « State » (49) et « Confederal municipality » (2), avec les codes
  d'État comme codes de périmètre (`BA-01` … `MO-96`).
- **Aucune catégorie ni couleur par peuple**, conformément à l'ADR
  2026-10-14-pas-de-code-couleur-peuples.
- **Modération** : charte publiée. Sont retirés les appels à la haine, la négation des
  crimes de guerre et des génocides jugés, et les attaques contre un peuple.

## 8. Étapes

1. Association, nom de domaine, AIPD, politique de confidentialité.
2. Instance de recette ; module `decidim-bk_registry` et workflow `bk_citizenship`.
3. Périmètres, espaces, processus de consultation sur la Constitution v4.7.
4. Bêta fermée (une centaine de personnes), revue de sécurité.
5. Ouverture coordonnée avec le lancement sur les réseaux
   (`docs/communication/lancement-x-instagram.md`), avec la première consultation en ligne.

## Sources

- [Decidim 0.32, notes de version](https://decidim.org/blog/2026-07-03-new-release-0-32/)
- [Versions du gem decidim](https://rubygems.org/gems/decidim/versions)
- [Decidim 0.31, composant Élections](https://decidim.org/blog/2025-11-20-new-version-0-31-0/)
- [Documentation d'installation](https://docs.decidim.org/en/v0.31/install/manual)
- [Recensements du composant Élections](https://docs.decidim.org/en/v0.31/develop/elections)
- [Vocdoni, Decidim Secure Elections](https://vocdoni.io/en/solutions/decidim)
