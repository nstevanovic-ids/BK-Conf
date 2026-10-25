# ADR 2026-10-25 — Mesure d'audience du portail (GoatCounter, sans cookie)

## Statut
Accepté le 2026-10-25 (« Ok pour tous les points A », point A3). L'outil est intégré, mais
reste inactif tant que son code n'est pas inscrit dans `portail/data/site.json`.

## Contexte
Le kit de lancement (`docs/communication/lancement-x-instagram.md`, § 8) prévoit de mesurer
les clics vers `#/register` depuis X et Instagram. Jusqu'ici, le portail n'avait aucune mesure
d'audience. Il fallait choisir entre GoatCounter, Plausible ou aucun outil.

## Décision
**GoatCounter**, pour trois raisons :
- il est gratuit pour un site non commercial (Plausible est payant, sauf auto-hébergé) ;
- il fonctionne sans cookie : il n'y a pas de bandeau à afficher ;
- son code est libre, et il peut être auto-hébergé plus tard sans changer le portail.

### Fonctionnement
- **Activation** : un seul réglage, `{"goatcounter": "<code>"}` dans `portail/data/site.json`.
  Le compteur est alors `https://<code>.goatcounter.com`. Un code vide laisse le compteur
  inactif.
- **Pas de comptage hors du site publié** : rien ne part d'un fichier ouvert en local
  (`file://`) ni d'un serveur de développement. Le script n'est chargé qu'en HTTPS.
- **Ce qui est compté** : la route seulement. Par exemple, `#/state/TR-41` est compté
  `/state/TR-41`, et `#/constitution/t4/a110` est compté `/constitution`. Aucune saisie, aucun
  paramètre, aucune donnée du parcours citoyen n'est transmis.
- **Une vue par changement de page** : un renvoi interne dans la même page n'est pas recompté.
- **Provenance** : au premier affichage, elle est lue dans `?ref=` ou `?utm_source=`, sinon
  dans le Referer. C'est pourquoi les liens du kit placent `?utm_source=x` avant le `#`.
  Les vues suivantes ne portent aucune provenance.
- **Mention publique** : dès que le compteur est actif, le pied de page affiche, dans les
  quatre langues de l'interface : « Visits are counted anonymously, without cookies
  (GoatCounter). »

### Mise en service
1. Créer un compte sur goatcounter.com et choisir un code (par exemple `balkanska`).
2. Inscrire ce code dans `portail/data/site.json`, puis fusionner sur `main`.
3. Si le portail passe sur un nom de domaine propre, aucun changement n'est nécessaire :
   GoatCounter compte tout domaine qui charge le script.

## Propagation
- `portail/index.html` : `gcInit`, `gcPath`, `gcCount`, mention `#gcNote` du pied de page.
- `scripts/build_portail.py` : injection de `site.json`.
- `portail/data/site.json` (nouveau), `portail/data/i18n.json` (clé `f_stats`).
- `docs/communication/lancement-x-instagram.md` (§ 8), `CLAUDE.md`.
