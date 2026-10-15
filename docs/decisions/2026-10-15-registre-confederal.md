# ADR 2026-10-15 — Registre confédéral : e-mail, envoi de la carte, décompte, nouvelle carte

## Statut
Accepté. Demande de l'utilisateur du 2026-10-15 : le citoyen doit donner une adresse
e-mail et y recevoir sa carte, les inscriptions doivent être comptabilisées, et la carte
doit adopter un dessin plus raffiné, dans l'esprit de la CNI française ou de la carte
d'identité suisse.

## Constat
Le portail est un site statique (GitHub Pages). Recevoir une adresse, envoyer un e-mail
et compter les inscriptions exigent un serveur : le prototype gardait la carte dans le
navigateur, avec un numéro provisoire.

## Décisions

### 1. Architecture
- **Cloudflare Workers + D1** (`registre/`) : API sans serveur à administrer, base SQLite
  créée avec la **juridiction EU**, offre gratuite largement suffisante, déploiement par
  GitHub Actions (compatible avec un travail 100 % navigateur).
- **Brevo** pour les e-mails : société française, données dans l'UE, offre gratuite de
  300 e-mails par jour, pièces jointes acceptées.
- **Turnstile** contre les robots : gratuit, sans traçage publicitaire.
- Écartés : Google Apps Script + Sheets (sortie de Google Workspace en cours), Supabase
  (pas de gain pour ce besoin, une plateforme de plus), Decidim immédiatement (serveur
  Rails à héberger ; il viendra se brancher sur ce registre, cf. 6).

### 2. Parcours
1. Le formulaire envoie l'inscription ; le registre répond toujours « vérifiez votre
   boîte » et envoie un lien de confirmation valable 48 heures.
2. Le lien ouvre le portail (`#/confirm/<jeton>`), qui confirme par un appel POST : un
   lien ouvert par l'antivirus d'une messagerie ne confirme donc rien tout seul.
3. À la confirmation, le registre attribue le **numéro définitif**, séquentiel par État
   (`BK-SU-000001`), jamais réattribué, et renvoie la carte avec un jeton d'accès.
4. Le navigateur dessine le recto et le verso et les fait envoyer par e-mail au titulaire.
   L'e-mail contient aussi le lien `#/card/<jeton>`, qui rouvre la carte sur tout appareil.
5. Le titulaire amende ou supprime son inscription depuis la carte ; il peut redemander un
   lien (`#/access`).

### 3. Sécurité

| Menace | Parade |
|---|---|
| Inscription au nom d'un tiers | double opt-in : aucune carte sans clic dans la boîte de l'adresse |
| Énumération des adresses inscrites | réponse identique, inscrit ou non, sur `/registrations` et `/access` |
| Robots, inondation de mails | Turnstile ; quotas par IP (20/h) et par adresse (3 mails/h) ; carte renvoyée 5 fois par jour au plus |
| Vol de la base | jetons de 256 bits, seule leur empreinte SHA-256 poivrée est stockée ; aucun mot de passe |
| Fuite des liens | jetons dans le fragment d'URL, jamais transmis à l'hébergeur du portail, effacés de la barre d'adresse et de l'historique dès lecture |
| Rattachement truqué | l'État est recalculé côté serveur depuis la commune (`opstine.json`), toute la validation est refaite |
| Appels depuis un autre site | CORS limité à l'origine du portail, refus explicite des autres origines |
| Configuration incomplète | échec fermé : sans secret, le registre refuse au lieu de dégrader |
| Injection dans les e-mails | toute donnée saisie est échappée ; pièces jointes limitées à JPEG/PNG vérifiés |

L'image de la carte jointe à l'e-mail est produite par le navigateur du titulaire : sans
risque, puisque seul le titulaire peut l'envoyer, à sa propre adresse, et que la carte fait
foi par son numéro dans le registre, non par l'image.

### 4. Données personnelles (RGPD)
- **Catégorie particulière** : l'inscription à un registre national (serbe, croate…)
  peut révéler l'origine nationale (art. 9). Elle exige un **consentement explicite**,
  case distincte, retirable en choisissant « aucun registre » ; elle est stockée dans une
  table séparée du registre des citoyens.
- Consentement au traitement, notice d'information dans le formulaire, finalités
  limitées (délivrer, envoyer, compter), statistiques publiées en totaux uniquement.
- Conservation : inscriptions non confirmées supprimées après 7 jours ; suppression par
  le titulaire immédiate et définitive.
- Responsable du traitement : l'éditeur du portail ; adresse de contact dans
  `portail/data/registre.json` (`contact`). Les adhérents étant de vraies personnes, le
  registre des activités de traitement et la notice doivent rester à jour.

### 5. Carte : nouveau dessin
Registre CNI 2021 / carte d'identité suisse 2023 : fond de sécurité pâle (ivoire rosé
vers azur clair), guilloches fines azur et or, rosace et lion en filigrane, en-tête
typographique sans bandeau (lion or vieilli, *BALKANSKA KONFEDERACIJA* espacé), filet
or à losange, libellés en romain avec l'anglais en italique, valeurs en graisse moyenne.
La couleur se limite au filet, au numéro (gueules) et au sceau irisé. La police Zurich est
embarquée dans l'export PNG.

### 6. Google Wallet et vérification publique
- **Pass générique Google Wallet** (le « pass générique privé », prévu pour les pièces
  d'identité, exige l'approbation de Google et un justificatif d'entité valable : hors de
  portée). Le registre est l'émetteur (compte de service, clé en secret) ; le lien d'ajout
  est un JWT signé qui ne porte que l'identifiant de l'objet.
- **Contenu minimal** : nom, numéro, État, validité, QR de vérification. Ni date de
  naissance ni narodnost, un pass générique n'ayant pas les protections d'un pass privé.
- Amendement : pass remis à jour. Suppression : pass invalidé et vidé de toute donnée
  personnelle (l'API ne permet pas à l'émetteur de supprimer l'objet).
- **Vérification publique** `GET /v1/verify/BK-XX-NNNNNN?issue=n` et page `#/verify` :
  valide, remplacée (émission plus récente), expirée, annulée, inconnue. Aucune donnée
  personnelle. Un numéro absent mais inférieur au compteur de son État est « annulé » :
  pas de registre des annulations à tenir.
- **QR au verso** des cartes du registre et dans le pass : lien vers `#/verify/<numéro>.<émission>`.
- Apple Wallet : même principe (pass `.pkpass` générique signé), différé faute de compte
  Apple Developer (99 $ par an).

### 7. Suite
- Decidim : le registre devient la source de son autorisation `bk_citizenship`
  (`docs/canon/citoyennete.md`).
- Domaine propre pour le portail et l'API (facultatif, l'API fonctionne sur `workers.dev`).

## Propagation
- `registre/` (Worker, migrations 0001-0002, `wallet.js`, tests avec Google simulé, README),
  `.github/workflows/registre.yml`, `scripts/gen_wallet_images.py`, `portail/images/wallet-*.png`,
  `portail/vendor/qrcode.min.js`.
- Portail : champ e-mail, consentements, notice, Turnstile, routes `#/confirm`, `#/card`,
  `#/access`, `#/verify`, envoi de la carte, bouton Google Wallet, QR de vérification,
  tableau de bord et compteur d'accueil en direct, nouvelle carte ;
  `portail/data/registre.json` (vide = mode prototype).
- `docs/canon/citoyennete.md`, `CLAUDE.md`.
