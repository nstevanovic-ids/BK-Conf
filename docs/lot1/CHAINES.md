# Chaînes du lot 1

Section « Chaînes » du plan (`docs/lot1/PLAN.md`), recommandation 3 acceptée le 2026-11-23 : livrer 1,
3, 5, 6, 9, 10 et 11 ; abandonner 2 et 4 ; 7 et 8 attendent la révision de l'art. 132. Recommandation 5
acceptée : une 12e chaîne, soumise à l'auteur avant livraison.

| N° | Anglais (clé) | Livrée | Commit |
|---|---|---|---|
| 1 | Assumption | oui | 6 (instruments) |
| 2 | Alignment failed for this article. | abandonnée : le générateur échoue à la place | – |
| 3 | Skip to content | oui, dans `i18n.json` (en-tête du portail, clé `skip`) | 8 |
| 4 | To be translated | abandonnée | – |
| 5 | No annual count exists yet (Art. 115 bis)… | oui | 6 |
| 6 | The plenary majority depends on seventy individual votes… | oui | 6 |
| 7, 8 | péréquation (art. 132) | en attente de la révision | – |
| 9 | The text does not say how the limits combine with the method… (anglais retouché) | oui | 6 |
| 10 | Two thirds is rounded up… conciliation committee is eight. | oui | 6 |
| 11 | French working text… (Art. 151). | oui | 5 (colonne FR) |
| 12 | Not calculated here: a vacant seat… does not apply. | oui, validée par l'auteur le 2026-11-24 | après le lot |

Les chaînes 1, 5, 6, 9, 10 et 11 sont versées avec leur fonction, pour que `textes.py check` reste sans
clé manquante à chaque commit ; leurs traductions sont celles du plan. L'istočni a été écrit en bulgare
cyrillique (dérivé du latin du plan), converti par `scripts/textes.py merge`, aller-retour sans écart ;
le latin obtenu est identique à celui du plan.

## Chaîne 12, validée par l'auteur le 2026-11-24

Ce que l'instrument de l'art. 111 ne calcule pas : le siège vacant et la voix prépondérante (al. 4), les
décisions que la suspension ne vise pas (al. 7). Les numéros d'alinéas ne sont pas cités : les textes
officiels ne le font presque jamais, et le središñi aurait dû choisir entre *stav* et *stavak*. Termes
repris de l'art. 111 de chaque standard.

| | Texte proposé |
|---|---|
| EN | Not calculated here: a vacant seat, when a majority of the members in office suffices; a tie, when the serving president has the casting vote; and the decisions to which the suspension does not apply. |
| ZAP | Tu ni izračunano: izprazñen sedež, ko zadošča večina članov v funkciji; enako število glasov, ko je odločilen glas predsednika v funkciji; in odločitve, za katere se odlog izvršitve ne uporabļa. |
| SRE | Ovdě se ne izračunava: upražñeno město, kad je dovoļna većina članova na dužnosti; jednak broj glasova, kad odlučujući glas ima predsědnik na dužnosti; i odluke na koje se obustava izvršeña ne priměñuje. |
| IST | Tuk ne se izčisļavat: ovakanteno mjasto, kogato e dostatãčno mnozinstvoto ot členovete na dlãžnost; ravenstvo na glasovete, kogato glasãt na dejstvaštija predsedatel e rešavašt; i rešenijata, za koito spiraneto na izpãlnenieto ne se prilaga. |

Livrée dans l'instrument de l'art. 111 (hypothèse `exc` de `portail/js/marges.js`, après celle du
relevé). Istočni versé en bulgare cyrillique (« Тук не се изчисляват… »), aller-retour sans écart ; la
conversion donne *izčisļavat* (ля → ļa, règle v3) là où la proposition écrivait *izčisljavat*.
