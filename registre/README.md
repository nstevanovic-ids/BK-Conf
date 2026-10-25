# Registre confédéral des citoyens

API du parcours `#/register` : inscription avec confirmation par e-mail, délivrance de la
carte avec son numéro définitif, envoi de la carte, accès par lien, amendement, suppression
et statistiques publiques du tableau de bord.

- **Cloudflare Workers** (code `src/`) et **D1** (base SQLite, données dans l'Union européenne)
- **Brevo** pour les e-mails transactionnels (société française, données dans l'UE)
- **Cloudflare Turnstile** contre les robots
- **Google Wallet** (facultatif) : pass « carte citoyenne » ajouté depuis `#/citizen`

Règles et sécurité : `docs/canon/citoyennete.md` et ADR `docs/decisions/2026-10-15-registre-confederal.md`.

Tant que `portail/data/registre.json` a un champ `api` vide, le portail reste en mode
prototype : la carte est délivrée dans le navigateur, sans e-mail ni décompte.

## Mise en service (une fois, depuis le navigateur)

### 1. Un domaine pour l'expéditeur
Les messageries refusent ou classent en spam un expéditeur `@gmail.com` envoyé par un
service tiers. Il faut un domaine (10 € par an environ, par exemple via Cloudflare
Registrar, dont les DNS sont alors déjà chez Cloudflare). L'adresse d'expédition sera
`registar@<domaine>`.

### 2. Brevo
1. Créer un compte (offre gratuite : 300 e-mails par jour).
2. *Senders, Domains & Dedicated IPs* > *Domains* : ajouter le domaine et créer les
   enregistrements DNS proposés (code Brevo, DKIM, DMARC). Attendre la validation.
3. *Senders* : ajouter `registar@<domaine>`.
4. *SMTP & API* > *API keys* : créer une clé. Elle devient le secret `BREVO_API_KEY`.

### 3. Cloudflare
1. **D1** : *Workers & Pages* > *D1 SQL Database* > *Create*, nom `bk-registre`,
   juridiction **EU**. Copier l'identifiant de la base (Database ID).
2. **Turnstile** : *Turnstile* > *Add widget*, domaine `nstevanovic-ids.github.io`, mode
   *Managed*. Noter la clé de site (publique) et la clé secrète.
3. **Jeton d'API** : *My Profile* > *API Tokens* > *Create Token*, modèle
   « Edit Cloudflare Workers », puis ajouter la permission *Account > D1 > Edit*.
   Noter aussi l'**Account ID** (colonne de droite du tableau de bord).

### 4. GitHub (*Settings* > *Secrets and variables* > *Actions*)

| Type | Nom | Valeur |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | jeton d'API Cloudflare |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Account ID |
| Secret | `BREVO_API_KEY` | clé API Brevo |
| Secret | `TURNSTILE_SECRET` | clé secrète Turnstile |
| Secret | `TOKEN_PEPPER` | 32 caractères aléatoires ou plus (générateur de mots de passe) |
| Variable | `D1_DATABASE_ID` | identifiant de la base D1 |
| Variable | `MAIL_FROM` | `registar@<domaine>` |
| Variable | `REGISTRE_ENABLED` | `true` |

Puis *Actions* > *Deploy confederal register* > *Run workflow*. Le journal affiche
l'adresse du Worker, du type `https://bk-registre.<sous-domaine>.workers.dev`.

### 5. Brancher le portail
Éditer `portail/data/registre.json` :

```json
{
 "api": "https://bk-registre.<sous-domaine>.workers.dev",
 "turnstileSiteKey": "<clé de site Turnstile>",
 "contact": "registar@<domaine>"
}
```

Le déploiement Pages part tout seul. L'inscription envoie alors un e-mail de
confirmation, la carte est délivrée avec un numéro définitif `BK-XX-000001`, puis envoyée
par e-mail avec son recto et son verso.

### 6. Google Wallet (facultatif)
1. [Google Pay & Wallet Console](https://pay.google.com/business/console) > *Google Wallet API* :
   créer le compte émetteur (gratuit) et noter l'**Issuer ID**. Renseigner le profil d'entreprise.
2. [Google Cloud Console](https://console.cloud.google.com) : nouveau projet, activer
   *Google Wallet API*, créer un **compte de service** puis une **clé JSON** (*Keys* > *Add key*).
3. Retour dans la Wallet Console > *Users* : inviter l'adresse du compte de service
   (`…@….iam.gserviceaccount.com`) avec le rôle *Developer*.
4. GitHub : secret `GOOGLE_WALLET_KEY` = contenu complet du fichier JSON ; variable
   `GOOGLE_WALLET_ISSUER_ID` = Issuer ID. Relancer le workflow.
5. Le bouton « Add to Google Wallet » apparaît sur la carte. Au départ, le compte est en
   **mode démo** : seuls les comptes de test déclarés dans la console peuvent ajouter le
   pass (préfixe « [TEST ONLY] »). Pour l'ouvrir à tous : *Request publishing access*.
6. Avant la demande de publication, remplacer le bouton du portail (`.btn-wallet`) par le
   badge officiel « Add to Google Wallet » des consignes de marque Google.

Le pass ne porte que le nom, le numéro, l'État, la validité et le QR de vérification :
ni date de naissance ni narodnost. Il est remis à jour quand le titulaire amende son
inscription, invalidé et vidé de ses données quand il la supprime. Logo et bandeau :
`portail/images/wallet-*.png` (`scripts/gen_wallet_images.py`).

## Développement local

```bash
cd registre
npm install
npm run setup:dev                    # .dev.vars (DEV=1) + clé de test du Google Wallet simulé
npm run migrate:local
npm run dev                          # http://127.0.0.1:8787
npm test                             # 42 vérifications ; Google Wallet simulé sur le port 8788
```

En mode dev sans `BREVO_API_KEY`, l'API renvoie les jetons dans ses réponses
(`devToken`, `devAccess`) et journalise les liens : rien de cela n'existe en production.

## API

| Méthode | Chemin | Rôle |
|---|---|---|
| GET | `/v1/health` | santé |
| GET | `/v1/stats` | totaux publics (par État, par registre, série quotidienne) |
| GET | `/v1/verify/BK-XX-NNNNNN?issue=n` | statut public d'une carte : valid, superseded, expired, revoked, unknown (aucune donnée personnelle) |
| POST | `/v1/registrations` | inscription ; envoie le lien de confirmation (réponse 202 identique dans tous les cas) |
| POST | `/v1/confirm` | confirme l'adresse, attribue le numéro, renvoie la carte et le jeton d'accès ; confirme aussi la passation d'une carte de mineur à 18 ans |
| POST | `/v1/access` | renvoie un lien d'accès à un citoyen (réponse identique dans tous les cas) |
| GET | `/v1/card` | carte du titulaire (`Authorization: Bearer <jeton>`), avec les cartes des mineurs qu'il a déclarés (`minors`) |
| PATCH | `/v1/card` | amendement ; nouvel État = nouveau numéro ; art. 102 appliqué (422 `people` si le verrou s'y oppose) |
| DELETE | `/v1/card` | suppression immédiate et définitive, cartes des mineurs déclarés comprises |
| POST | `/v1/card/minors` | déclare un enfant de moins de 18 ans (art. 38 a) : rattachement du parent, sans registre, carte de cinq ans |
| PATCH | `/v1/card/minors/BK-XX-NNNNNN` | amende la carte d'un mineur ; le rattachement suit celui du parent |
| DELETE | `/v1/card/minors/BK-XX-NNNNNN` | supprime la carte d'un mineur |
| POST | `/v1/card/minors/BK-XX-NNNNNN/handover` | à 18 ans, envoie au jeune majeur le lien qui lui transmet sa carte (même numéro) |
| POST | `/v1/card/mail` | envoie la carte par e-mail (recto et verso joints), 5 fois par jour au plus |
| POST | `/v1/card/wallet/google` | crée ou met à jour le pass Google Wallet, renvoie le lien d'ajout |

Une tâche planifiée quotidienne supprime les inscriptions non confirmées de plus de sept
jours et les jetons expirés.
