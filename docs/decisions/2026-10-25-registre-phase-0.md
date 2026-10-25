# ADR 2026-10-25 — Registre confédéral : reprise comme première étape (phase 0)

## Statut
Accepté le 2026-10-25 (« Ok pour tous les points A », point A1 : reprendre la PR #16 comme
première étape du registre). Le registre n'est pas déployé : le portail reste en mode
prototype tant que `portail/data/registre.json` n'a pas d'`api`.

## Contexte
La PR #16 (15 octobre) apportait un registre réel : Cloudflare Worker + D1 en juridiction UE,
e-mails Brevo, Turnstile, numéros définitifs, carte envoyée par e-mail, Google Wallet,
vérification publique et nouveau dessin de la carte (ADR 2026-10-15-registre-confederal.md).
Elle n'avait jamais été fusionnée. Depuis, le canon a évolué :
- verrou des registres nationaux (art. 102, v4.3) ;
- toponymie v3 et `opstine.json` v 2 ;
- typographie Arimo et Sofia Sans (ADR 2026-10-23-typographie.md) ;
- devise *Naš dom* ;
- libellés de la carte validés (*Izdadena ot*) ;
- interface dans les trois standards ;
- dossier Decidim du 24 octobre, qui prévoyait un registre intégré à la plateforme.

## Décision

### 1. Le registre précède la plateforme et reste un service distinct
- Phase 0 : le registre (`registre/`) ouvre seul. Il délivre les numéros définitifs et les
  cartes, et compte les inscriptions. Il sert donc dès le lancement sur X et Instagram.
- À l'ouverture de Decidim, l'autorisation `bk_citizenship` le consulte : numéro de carte et
  date de naissance. Le module `decidim-bk_registry` envisagé le 24 octobre est abandonné
  (`docs/plateforme/decidim.md`, § 3).

### 2. Mise au niveau du canon
- **Art. 102 appliqué par le serveur**, à l'identique du prototype (`citReg`, `regRule`) :
  - première inscription probatoire trois ans, rectification unique ;
  - sinon autre registre quinze ans après l'inscription (refus 422 sur `people`) ;
  - retrait libre, qui n'abrège pas le verrou et laisse la rectification ouverte ;
  - retour au registre quitté à tout moment, sans relancer le verrou ;
  - date d'effet pour le Narodni Sabor : un an après la demande.

  La carte renvoyée par l'API porte `reg = {p, since, prob, eff}`, comme celle du prototype.
- **Table du registre national** : registre en cours, date d'inscription, fin de la
  probation, date d'effet. Après un retrait :
  - le registre en clair et le consentement sont effacés ;
  - le dernier registre n'est gardé que sous forme d'empreinte poivrée (SHA-256 du poivre, de
    l'identifiant et du registre), pour appliquer le verrou ;
  - une copie volée de la base ne révèle donc pas le registre quitté ; seul le service, qui
    détient le poivre, peut le retrouver, pour l'afficher à son titulaire.
- **Suppression du compte** : tout est effacé, verrou compris. Une personne qui renonce à
  la citoyenneté puis se réinscrit repart de zéro. C'est la limite acceptée en phase 0 :
  l'inscription reste déclarative, et retenir une trace après une renonciation exigerait une
  base légale réelle. La vérification par SMS de la plateforme réduira ce risque.
- **Communes** : `opstine.json` v 2. Le nom officiel et le nom GADM restent acceptés, et la
  commune est enregistrée sous sa forme v3 (*Trebinje* → *Trebiñe*).
- **Carte** : le dessin CNI / carte suisse de la PR #16 est conservé, mais composé en Arimo
  (au lieu de Zurich), embarqué dans l'export PNG. La devise *Naš dom · Our home* figure en
  micro-impression et *Naš dom* au verso. Les libellés validés et le bloc des droits
  civiques (date d'inscription, probation, verrou) sont repris de `main`.
- **Pass Google Wallet** : images régénérées en Arimo, avec *Naš dom · Our home*.

### 3. Ce qui ne change pas
Architecture, sécurité, RGPD, quotas, vérification publique et Google Wallet restent ceux de
l'ADR du 2026-10-15.

## Mise en service (par l'utilisateur)
`registre/README.md` décrit les étapes :
- un domaine pour l'expéditeur ;
- les comptes Brevo et Cloudflare ;
- les secrets GitHub ;
- puis `registre.json`.

Le nom de domaine en cours d'acquisition servira à la fois au portail et à l'expéditeur.

## Vérifications
- 52 tests de bout en bout contre `wrangler dev --local`, dont les règles de l'art. 102 et
  les alias de communes.
- Parcours complet dans Chromium contre l'API locale : inscription, confirmation, carte,
  rectification, verrou refusé par le portail puis par le serveur, droits civiques,
  vérification.
- Mode prototype inchangé.

## Propagation
- `registre/src/index.js`, `registre/migrations/0001_init.sql`, `registre/test/e2e.mjs`.
- Portail : fusion du parcours de `main` et de celui de la PR #16 (carte, routes `#/confirm`,
  `#/card`, `#/access`, `#/verify`, tableau de bord).
- `scripts/gen_wallet_images.py`, `portail/images/wallet-*.png`.
- `docs/canon/citoyennete.md`, `docs/plateforme/decidim.md`,
  ADR 2026-10-15-registre-confederal.md, `CLAUDE.md`.
