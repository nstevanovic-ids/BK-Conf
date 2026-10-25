# ADR 2026-10-25 — Alphabet v3 dans les mots courants (carte, Constitution, formes genrées)

## Statut
Accepté le 2026-10-25 (« Ok pour tout »). Proposition faite avec la phase 2 de l'interface,
qui avait laissé le point ouvert (ADR 2026-10-25-interface-phase-2-titres.md). Constitution
portée en version 4.11 (annexe R).

## Contexte
L'alphabet v3 note /ɲ/ par ñ et /ʎ/ par ļ (`docs/alfabet/v3.md`, art. 129). La règle
toponymique les appliquait aux noms de lieux, et l'interface à toutes ses chaînes (règle 5).
Il restait des écarts :
- libellés validés de la carte : *Državljanska karta*, *Datum rođenja*, *Datum izdavanja*,
  *Velja do*, *Izdajatelj* ;
- autorité de délivrance : *Konfederalni registar državljana* ;
- formes genrées : *Srpkinja*, *Bošñakinja* ;
- Constitution : *središnji standard* ;
- notes de drapeaux et canon : *ljiljan*, *Miljacka*, *Turopolje*.

## Décision
- **ñ et ļ s'appliquent à tout mot sud-slave écrit par la Confédération**, et non plus aux
  seuls noms de lieux. On les déduit de la référence cyrillique (њ, љ ; en bulgare нь, ня,
  ню, ль, ля, лю), comme pour les noms.
- **Exceptions** :
  - les noms de personnes ne sont jamais réécrits (*Nemanjić*, *Njegoš*, *Džeko*) ;
  - les colonnes « avant » des annexes et les ADR antérieurs gardent les graphies d'alors.

| Avant | v3 | Où |
|---|---|---|
| Državljanska izkaznica / karta | **Državļanska izkaznica / karta** | carte, pass Google Wallet, interface |
| Datum rođenja · Datum izdavanja | **Datum rođeña · Datum izdavaña** | carte (srediñi) |
| Velja do · Izdajatelj | **Veļa do · Izdajateļ** | carte (zapadni) |
| Konfederalni registar državljana | **Konfederalni registar državļana** | carte, e-mails, expéditeur du registre |
| Srpkinja · Bošñakinja | **Srpkiña · Bošñakiña** | carte (narodnost), `peuples.json`, canon |
| središnji standard | **srediñi standard** | Constitution art. 128, portail, interface |
| ljiljan(i) · Miljacka · Turopolje | **ļiļan(i) · Miļacka · Turopoļe** | notes de drapeaux, canon des États |
| V tozi brauzãr njama karta | **… ñama karta** | interface (bulgare ня → ña) |

## Propagation
- Constitution v4.11 (`v4.md`, `v4.en.md`, annexe R) ; `constitution.json` régénéré.
- Portail : `CARD_L`, `CARD_AUTH`, `STD_NAME`, `STD` (`build_portail.py`), Journal ;
  `peuples.json`, `flagnotes.json`, `i18n.json`.
- Registre : `mail.js`, `index.js`, `wallet.js`, `wrangler.toml`.
- Canon : `citoyennete.md`, `peuples.md`, `etats.md` ; `docs/alfabet/v3.md`,
  `interface-trois-standards.md`, `docs/plateforme/decidim.md` ; `CLAUDE.md`.
