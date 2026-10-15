# ADR 2026-10-15 — Devise confédérale : *Naš dom*

## Statut
Accepté. Décision de l'utilisateur du 2026-10-15 : « Naš dom c'est bien ».

## Constat
La devise du préambule v4, *Različiti narodi, jedan dom*, est une forme štokavienne :
elle ne se transpose pas telle quelle dans les standards occidental et oriental.

| Mot | Central | Occidental (sl) | Oriental (bg / mk) |
|---|---|---|---|
| jedan | jedan | en | edin / eden |
| različiti | različiti | različni | različni |

« Un » est le mot qui diverge le plus entre les trois standards : toute devise fondée
sur l'unité échoue par construction. *Jedinstvo* et *bratstvo* sont exclus d'office
(associations SFRJ).

## Critères
- Forme identique dans les trois standards régionaux.
- Pas de conjonction (*i* en central et oriental, *in* en slovène).
- Pas de verbe (pas d'infinitif en bulgare ni en macédonien).
- Court, simple.

## Décision
**Naš dom** — *Notre maison* (fr) / *Our home* (en).

| Occidental (sl) | Central | Oriental (bg / mk) | Alphabet unifié |
|---|---|---|---|
| naš dom | naš dom / наш дом | наш дом | **Naš dom** |

Traductions dans les langues des entités autonomes : *Náš domov* (slovaque),
*Otthonunk* (hongrois), *Yuvamız* (turc), *Shtëpia jonë* (albanais).

*Dom* assure la continuité avec l'ancienne devise et avec le préambule (« une maison
où l'on entre par choix »).

## Points de vigilance
- En bulgare et en macédonien, la forme naturelle en phrase porte l'article
  (*нашият дом*, *нашиот дом*) ; la forme nue relève du registre devise ou titre.
- Écho russe : *Наш дом — Россия*, parti de Tchernomyrdine dans les années 1990.
  Écho mineur, accepté.
- *Dom* n'est jamais précédé de *za* (écho de *Za dom spremni*).

## Alternatives écartées
- *Voļa · Mir · Dom* (Volonté · Paix · Foyer) : triade sans conjonction, identique
  dans les trois standards.
- *Mir · Pravo · Dom* : registre État de droit.
- *Mir i naš dom* : *i* n'existe pas en slovène.
- *Naš mir, naš dom* : pour un lecteur russophone, *naš mir* se lit « notre monde »
  (écho du *Russkiy mir*), cumulé à l'écho de *Naš dom*.

## Propagation
- Préambule : `docs/constitution/v4.md` (*Naš dom — Notre maison.*) et
  `docs/constitution/v4.en.md` (*Naš dom — Our home.*) ;
  `portail/data/constitution.json` régénéré par `scripts/build_constitution.py`.
- Portail : devise de l'accueil (hero et bande finale), micro-impression du recto de
  la carte citoyenne (*NAŠ DOM · OUR HOME*, deux lignes décalées) et ligne du verso.
- Canon : `docs/canon/couleurs-symboles.md`, section « Devise confédérale » ; `CLAUDE.md`.
- Le titre de section « Seven peoples, one home » du portail n'est pas une devise ;
  il est conservé.
