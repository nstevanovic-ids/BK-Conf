# Registre confédéral des citoyens

API du parcours `#/register` : inscription avec confirmation par e-mail, délivrance de la
carte avec son numéro définitif, envoi de la carte, accès par lien, amendement, suppression
et statistiques publiques du tableau de bord.

- **Cloudflare Workers** (code `src/`) et **D1** (base SQLite, données dans l'Union européenne)
- **Brevo** pour les e-mails transactionnels (société française, données dans l'UE)
- **Cloudflare Turnstile** contre les robots

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

## Développement local

```bash
cd registre
npm install
printf 'DEV=1\n' > .dev.vars        # mode dev : sans clés, les e-mails sont journalisés
npm run migrate:local
npm run dev                          # http://127.0.0.1:8787
npm test                             # 30 vérifications de bout en bout
```

En mode dev sans `BREVO_API_KEY`, l'API renvoie les jetons dans ses réponses
(`devToken`, `devAccess`) et journalise les liens : rien de cela n'existe en production.

## API

| Méthode | Chemin | Rôle |
|---|---|---|
| GET | `/v1/health` | santé |
| GET | `/v1/stats` | totaux publics (par État, par registre, série quotidienne) |
| POST | `/v1/registrations` | inscription ; envoie le lien de confirmation (réponse 202 identique dans tous les cas) |
| POST | `/v1/confirm` | confirme l'adresse, attribue le numéro, renvoie la carte et le jeton d'accès |
| POST | `/v1/access` | renvoie un lien d'accès à un citoyen (réponse identique dans tous les cas) |
| GET | `/v1/card` | carte du titulaire (`Authorization: Bearer <jeton>`) |
| PATCH | `/v1/card` | amendement ; nouvel État = nouveau numéro |
| DELETE | `/v1/card` | suppression immédiate et définitive |
| POST | `/v1/card/mail` | envoie la carte par e-mail (recto et verso joints), 5 fois par jour au plus |

Une tâche planifiée quotidienne supprime les inscriptions non confirmées de plus de sept
jours et les jetons expirés.
