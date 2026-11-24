# Moteur unique : vérification contre le texte

`portail/js/regles.js` remplace les trois moteurs des prototypes (marges de Codex, couches d'Atlas,
Sabor) : c'est `proto/sabor/js/rules.js` porté sans ses libellés ni la péréquation, plus les sièges
(art. 103), le délai de l'alarme (art. 109 b), la commission de conciliation (art. 110 ter), la double
clé et le Konfederalno Veće pour les instruments du lecteur. Les instruments de Codex n'en gardent que
l'affichage (commit 6), et la page Institutions y prend ses sièges. Test : `node scripts/test_regles.js`
(307 vérifications depuis le lot 3), lancé au déploiement.

## Article par article (Constitution v4.16, texte anglais publié)

| Article | Règle du texte | Fonction | Vérifié |
|---|---|---|---|
| 103 al. 2 à 4 | 250 délégués ; un État, une circonscription, 2 à 20 sièges, Sainte-Laguë selon la population ; Brčko et Mostar, une circonscription chacune, au moins un délégué | `sieges`, `contexte` | somme 250, 54 circonscriptions, bornes, sièges = population ÷ diviseur arrondie hors bornes ; répartition identique à l'ancien `kongresSeats` du portail et à Sabor ; depuis le commit 6, la page Institutions passe elle aussi par `REGLES.sieges` |
| 109 b | deux tiers des membres d'une délégation, dans les trente jours de l'adoption par le Kongres : loi suspendue, renvoyée en conciliation ; si celle-ci échoue, deux tiers du Kongres | `alarme`, `kongresDeuxTiers` | 7/10 au 30e jour levée ; 6/10 non ; 31e jour non ; 167/250 oui, 166 non |
| 110 al. 4 | consentement : majorité simple en plénière et dans au moins cinq des sept délégations | `cleDouble`, `evaluate` (consent) | cinq, quatre, six, sept délégations |
| 110 al. 5 | les délégations de cette majorité représentent ensemble la majorité des inscrits (relevé de l'art. 115 bis) | `cleDouble`, `evaluate` (jauge `key`) | cinq délégations sans Serbes ni Bulgares : 44 % des inscrits, refusé ; avec eux : adopté |
| 110 al. 6 | révision : deux tiers en plénière, six délégations sur sept, ou les sept pour les garanties renforcées (art. 150) ; double clé appliquée aux six (hypothèse `six`) | `cleDouble`, `evaluate` (revision, entrenched) | six, sept ; toute coalition de six passe la double clé (68,7 % des inscrits au moins) ; révision avec cinq délégations refusée |
| 110 ter al. 3 | compromis adopté à la majorité des membres (8 sur 14), dans les soixante jours ; en cas d'alarme, avec le vote du membre désigné par la délégation qui l'a levée | `conciliation` | 8 avec le membre oui ; sans lui non ; 7 non ; refus de consentement sans le membre oui ; 61e jour non |
| 110 ter al. 5 b | conciliation échouée sur une alarme : deux tiers du Kongres | `conciliation.deuxTiers` | 167 |
| 111 al. 3 à 5 | consensus ; à défaut, quatre conseillers dont les peuples font la majorité des inscrits, ou cinq ; suspension de trente jours contre trois conseillers au moins | `conseil`, `evaluate` (council) | consensus ; quatre majoritaires (82 %) adoptée et suspendue ; quatre minoritaires (28 %) rejetée ; cinq contre deux exécutoire ; trois rejetée |
| 115 bis al. 7 | relevé annuel des inscrits de chaque registre au 1er janvier, base de la double clé | `contexte` (`reg`) | population des États territoriaux de chaque peuple (hypothèse `reg`) |

Fidélité du portage : sur 5 000 votes tirés au hasard, `evaluate` rend le même verdict et les mêmes
jauges que `rules.js` d'origine ; sièges et rattachement de Brčko et Mostar identiques à Sabor.

## Ce que le texte ne tranche pas (hypothèses affichées)

| Clé | Hypothèse | Chaîne (PLAN.md) |
|---|---|---|
| `reg` | aucun relevé annuel n'existe encore : chaque registre reçoit la population des États territoriaux de son peuple | 5 |
| `sl` | les limites se combinent avec la méthode par un diviseur commun, arrondi au plus proche, puis les limites | 9 |
| `al` | deux tiers arrondis vers le haut et comptés sur les membres : 7 sur 10, 167 sur 250 (l'art. 109 b ne dit pas membres ou votants) ; majorité de la commission : 8 sur 14 | 10 |
| `exc` | non calculés à l'art. 111 : siège vacant, voix prépondérante du président, exceptions de l'al. 7 | 12 (validée le 2026-11-24, livrée) |
| `present` | « majorité simple des membres présents » (art. 110 al. 3, 106) : tous présents, plus de pour que de contre, l'abstention ne compte pas (lecture retenue par l'auteur le 2026-11-24 ; l'autre, plus de la moitié des présents, est écartée). Sans effet au lot 1 : la plénière n'y est pas modélisée (chaîne 6) | lot 3 |
| `six` | la double clé (art. 110 al. 5) vise « au moins cinq des sept » ; six délégations en sont une, elle s'applique donc aussi à la révision (lecture retenue par l'auteur le 2026-11-24). Aujourd'hui sans effet : six peuples font toujours au moins 68,7 % des inscrits ; elle n'en aurait que si un peuple dépassait la moitié. Les sept de l'art. 150 font tous les inscrits | lot 3 |
| `cons` | consensus : aucun conseiller contre | lot 3 |
| `mun` | Brčko et Mostar votent avec Sarajevo, territoire confédéral le plus proche (art. 124) | lot 3 |
| `bloc`, `pop`, `alarm`, `coal` | hypothèses de Sabor pour ses votations, inchangées | lot 3 |

Les deux lectures signalées (`present`, `six`) ont été tranchées par l'auteur le 2026-11-24, selon les
recommandations : majorité simple = plus de pour que de contre, abstentions non comptées (formule à
préciser, « des suffrages exprimés », à la prochaine révision de la Constitution) ; double clé appliquée
à la règle des six. Le moteur les applique (`evaluate`, type `revision` : jauge `key`, hypothèse `six`) ;
au lot 1, aucun instrument n'en dépend, Sabor les affichera (lot 3).

## Lot 3 : page des votes (`#/votes`, docs/lot3/PLAN.md)

Plan validé par l'auteur le 2026-11-24 (« go », recommandations du plan). Aucune règle réécrite ; le moteur
reçoit les sept cas de Sabor (`SCENARIOS`), l'adresse de chaque type (`slug`), les alinéas qui le décrivent
(`desc`, ancrages de `core.json`) et les libellés (`LIB` : clés anglaises de `textes.json`, plus les alinéas
cités `{ q }`). `marges.js` lit ses hypothèses dans `LIB.hyp`.

| Règle | Vérifié (recalculé dans le test, sans `evaluate`) |
|---|---|
| Cas `consent-given` (art. 110 al. 4 et 5) | cinq délégations dont les Serbes, majorité des inscrits, plénière et Kongres : adoptée |
| Cas `two-peoples` (art. 110 al. 6) | 2 / 7 : révision refusée, ligne « Consent refused » |
| Cas `five-delegations` (art. 110 al. 5) | 5 / 7, 44 % des inscrits : refusée par la double clé seule |
| Cas `alarm` (art. 106, 109 b) | majorité simple au Kongres, puis 8 membres monténégrins sur 10 : suspendue |
| Cas `six-of-seven` (art. 110 al. 6, 150) | 6 / 7 ne suffisent pas pour une garantie renforcée |
| Cas `nine-of-twelve` (art. 122) | 12 États, 9 serbes : plus de la moitié d'un même peuple, irrecevable |
| Cas `four-councillors` (art. 111 al. 4 et 5) | quatre conseillers majoritaires en inscrits, trois contre : adoptée et suspendue |
| Art. 123 bis | 126 sur 250 et 36 sur 70 ; 35 membres ne suffisent pas, 36 oui |
| Art. 121, 123, 124 | 27 États sur 52 ; les villes-États comptent chacune comme un État |
| Art. 124 al. 3 | Brčko et Mostar votent avec Sarajevo, territoire confédéral le plus proche d'après `geo.json` (117 et 75 km) ; leur population s'ajoute à celle de Sarajevo |
| Art. 106 bis d | huit États, moitié au plus d'un même peuple ; Brčko et Mostar hors coalition ; une ville-État compte sans peuple |
| Art. 106 (`present`) | 2 sièges pour et 248 abstentions : adoptée |
| Libellés | chaque type, organe, ligne de verdict et hypothèse rendus par le moteur a sa clé |

Hypothèses de Sabor validées par l'auteur le 2026-11-24 (gardées telles quelles, affichées avec le
résultat) : `bloc` (vote en bloc au Kongres), `pop` (vote populaire comme l'État est placé, poids = population),
`mun`, `alarm` (un membre « contre » vote la motion), `coal` (coalition = États « pour »), `cons` (consensus :
aucun conseiller contre ; six pour et une abstention font un consensus) ; deux tiers de la plénière comptés sur
les membres, 47 sur 70, comme `al`. Libellé de `present` retouché : « Every member is present. Simple
majority: more votes for than against; abstentions do not count. » ; `six` a son libellé (chaîne H6).
