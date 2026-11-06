# ADR 2026-11-05 — Passe de fondation : cinquante-deux États, rattachement verrouillé, limites gelées

## Statut
Accepté le 2026-11-05, en une suite de décisions de l'utilisateur :
- « Pour Baraña c'est décidé, on fusionne » ;
- sur la part des États serbes : « Le rapport des Serbes est trop faible et ce n'est pas normal.
  C'est la même erreur que la Yougoslavie socialiste » ;
- sur la part des États bosniaques : « C'est toi qui m'a dit de redécouper les bosniaques pour
  qu'au final ils soient sur représenter, ce n'est pas normal » ;
- sur la robustesse : « Ok mais tu vas pas me dire dans 2 mois, ah je me suis trompé en fait il
  en faut 5 » ;
- « Allez go » sur l'ensemble, livré en une seule PR ;
- sur les États serbes, revus dans une discussion à part : « Pas fan d'ailleurs de Pomoravlje
  perso », puis « Oui c'est bien zlatibor » ; « Oui » pour Loznica, chef-lieu d'Istočno Podriñe.

Constitution portée en version 4.13 (articles 1 bis, 1 quinquies et 150, annexe T), sans article
nouveau. Cet ADR modifie la règle d'or des frontières (section « Règle d'or ») : il autorise une
seule passe, la présente, puis gèle les limites.

## Contexte
En version 4.12, les rapports entre la part des États territoriaux et la part de la population
(méthode : `docs/canon/equilibre.md`) étaient :

| Peuple | États | Rapport |
|---|---|---|
| Slovènes | 5 | 1,05 |
| Croates | 10 | **1,37** |
| Serbes | 13 | 0,90 |
| Bosniaques | 4 | **1,31** |
| Monténégrins | 1 | 0,92 |
| Macédoniens | 2 | **0,49** |
| Bulgares | 11 | 0,97 |

Trois causes :
- **Macédoniens** : deux États pour 2,4 millions d'habitants ; Istočen Vardar comptait à lui seul
  1 118 947 habitants, le plus gros État territorial.
- **Bosniaques** : le partage de Srednja Bosna en trois États (Lašva, Soli, Vrhbosna ; ADR
  2026-06-28-trois-etats-lv-so-vb.md) reposait sur une population bosniaque surestimée,
  proposée par Claude en juin. L'erreur est reconnue ; elle se corrige ici.
- **Serbes** : treize États pour 31 % de la population. Un grand peuple tenu sous sa part
  d'États reproduit, selon l'utilisateur, l'erreur de la Yougoslavie socialiste.
  Les Croates restent, eux, au-dessus de leur part à cause de leurs petits États.

Le 2026-10-25, les redécoupages avaient été écartés (« on ne va pas changer des limites
administratives tous les quatre matins ») au profit de la double clé. La double clé règle la
parité au Narodni Sabor et au Konfederalno Veće ; elle ne règle pas la voix de chaque État aux
votations, aux coalitions d'États et au plancher de deux sièges du Kongres.

## Décision

### Limites (communes, population de `stats.json`)

| État | Avant | Après | Changement |
|---|---|---|---|
| SL-32 Slavonija | 578 688 | 607 970 | + Baraña (BR-04) : Beli Manastir, Biļe, Čeminac, Darda, Draž, Kneževi Vinogradi, Petlovac, Popovac |
| VB-43 → **VB-44** Vrhbosna | 390 428 | 654 378 | + Lašva (LV-21) : Bugojno, Busovača, Dobretići, Doñi Vakuf, Fojnica, Gorñi Vakuf-Uskopļe, Jablanica, Jajce, Koñic, Novi Travnik, Travnik, Vitez ; chef-lieu Zenica |
| **VS-45 Severen Vardar** (nouveau) | — | 689 546 | Skopje (Aerodrom, Butel, Centar, Čair, Đorče Petrov, Gazi Baba, Karpoš, Kisela Voda, Šuto Orizari), Aračinovo, Čučer-Sandevo, Ilinden, Petrovec, Kumanovo, Lipkovo, Staro Nagoričane, Kratovo, Kriva Palanka, Rankovce ; chef-lieu Skopje |
| **PA-23 Pajonija** (nouveau) | — | 279 167 | Veles, Gradsko, Konče, Lozovo, Sveti Nikole, Negotino, Kavadarci, Rosoman, Demir Kapija, Gevgelija, Bogdanci, Dojran, Valandovo, Strumica, Bosilovo, Novo Selo, Vasilevo, Radoviš ; chef-lieu Veles |
| **BE-03 Bregalnica** (nouveau) | — | 150 234 | Štip, Karbinci, Probištip, Zrnovci, Češinovo-Obleševo, Kočani, Vinica, Makedonska Kamenica, Delčevo, Pehčevo, Berovo ; chef-lieu Štip |
| VI-44 Istočen Vardar | 1 118 947 | — | partagé entre VS-45, PA-23 et BE-03 |
| PI-24 Istočno Podriñe | 562 422 | 424 092 | − Zlatibor ; chef-lieu Loznica (Višegrad, l'ancien chef-lieu, est dans Zapadno Podriñe) |
| **ZL-48 Zlatibor** (nouveau) | — | 138 330 | Užice (avec Sevojno), Požega, Ariļe, Kosjerić, Čajetina ; chef-lieu Užice |
| BZ-05 Zapadna Bosna | 827 582 | 566 966 | − Usora ; chef-lieu Baña Luka |
| **US-43 Usora** (nouveau) | — | 260 616 | Doboj, Teslić, Derventa, Modriča, Brod, Šamac, Pelagićevo, Doñi Žabar, Vukosavļe, Petrovo, Orašje, Oxak, Domaļevac-Šamac ; chef-lieu Doboj |

Zapaden Vardar (VZ-46) et Šumadija (SU-36, 986 599 habitants) restent entiers. Les autres États
ne changent pas.

### Noms
- **Severen Vardar** : « Vardar du Nord », en macédonien, sur le modèle de Zapaden Vardar. Il
  réunit Skopje, Kumanovo et le nord-est montagneux (Kratovo, Kriva Palanka).
- **Pajonija** : la Péonie antique, royaume de la moyenne vallée du Vardar et de la Strumica.
  C'est le nom historique le plus juste pour Veles, Kavadarci, Gevgelija et Strumica.
- **Bregalnica** : la rivière de Štip, Kočani et Delčevo, sur le modèle de Timok et de Tunxa.
- **Zlatibor** : la montagne et l'okrug d'Užice. Ses cinq communes forment le haut bassin de
  la Zapadna Morava : la Đetinja naît sur le Zlatibor et forme la Zapadna Morava près de Požega
  avec la Golijska Moravica. Aucune n'est dans le bassin de la Drina, d'où le détachement
  d'Istočno Podriñe. Užice parle l'herzégovinien oriental, Šabac et Vaļevo le
  šumadijsko-vojvođanski. Bajina Bašta, sur la Drina, reste dans Istočno Podriñe. Aucune lettre
  v3 (*Златибор*).
- **Usora** : terre médiévale entre la Bosna et l'Usora, autour de Doboj ; les bans Kotromanić
  se titraient bans « de Bosnie, d'Usora et de Soli », et Soli est déjà un État (SO-33).
  *Bosanska Posavina* est écartée : Doboj et Teslić ne sont pas dans la Posavina.
- Aucun nom de ville : la règle d'or est respectée.

### Codes
Renumérotation strictement alphabétique : BE-03 s'insère après BC-02 ; BN-03 → **BN-04** ;
BR-04 et LV-21 disparaissent ; MI-22 → **MI-21**, MZ-23 → **MZ-22** ; PA-23 s'insère ;
US-43 s'insère après TU-42 ; VB-43 → **VB-44** ; VI-44 disparaît, VS-45 s'insère ;
VZ-45 → **VZ-46** ; ZA-46 → **ZA-47** ; ZL-48 ferme la liste. Les autres codes ne changent pas.
La Confédération compte **cinquante-deux États** : quarante-huit territoriaux et quatre
villes-États, plus Brčko et Mostar.

### Entités autonomes
Elles suivent leurs municipalités : **SHO-LV → SHO-VB** (Savez Hrvatskih Opština Vrhbosne) ;
**SHO-BZ → SHO-US** (Savez Hrvatskih Opština Usore : Orašje, Odžak, Domaljevac-Šamac) ;
**UKSVL → UKSVV** (*Unioni i Komunave Shqiptare të Vardarit Verior*), toutes ses communes étant
dans Severen Vardar. Les autres changent seulement de code d'hôte (ZA-47, VZ-46, BN-04).

### Rattachement verrouillé (art. 150 e)
Le rattachement de chaque État territorial à son peuple devient une **garantie renforcée** :
il ne se modifie qu'avec le Narodni Sabor (deux tiers en plénière et majorité de chacune des
sept délégations), le vote du peuple et des États, et en outre **l'approbation des électeurs de
l'État concerné**. Exemple : si le Pirin voulait devenir un État macédonien, il faudrait l'accord
des électeurs du Pirin, de la délégation bulgare et de la délégation macédonienne, entre autres.
Un État ne change donc plus de peuple par une révision ordinaire, ni contre ses électeurs.

### Équilibre et garde-fou
- Méthode et règle : `docs/canon/equilibre.md`. Population d'un peuple = population des États
  qui lui sont rattachés (recensements du dépôt) ; villes-États neutres ; nombre idéal au plus
  fort reste.
- Bande admise pour le rapport : **0,85 – 1,25**. `scripts/equilibre.py --check` l'applique
  avant chaque déploiement (`.github/workflows/pages.yml`) et fait échouer le build en cas
  d'écart. Seule exception : un peuple qui a exactement son nombre idéal d'États (cas des
  Monténégrins, un seul État) n'est pas en faute, aucun autre nombre entier ne ferait mieux.

| Peuple | États | Rapport | Nombre idéal |
|---|---|---|---|
| Slovènes | 5 | 1,01 | 5 |
| Croates | 9 | 1,18 | 8 |
| Serbes | 15 | 1,00 | 15 |
| Bosniaques | 3 | 0,94 | 3 |
| Monténégrins | 1 | 0,88 | 1 |
| Macédoniens | 4 | 0,94 | 4 |
| Bulgares | 11 | 0,93 | 12 |

- **Votations** : 52 États, majorité de 27. Serbes et Bulgares ont 26 États : il leur faut un
  État de plus, ville-État ou autre. Les cinq autres peuples ont 22 États, 24 avec Zagreb et
  Sarajevo. Aucun bloc n'atteint seul la majorité.
- Les Croates gardent neuf États (un de plus que l'idéal) et les Bulgares onze (un de moins) :
  avec un douzième État bulgare, Serbes et Bulgares atteindraient seuls la majorité.
- **Réponse à « il en faut 5 »** : le nombre de chaque peuple se déduit d'un calcul public, et
  non d'une appréciation. Les Macédoniens ont droit à 4 États (quota 4,26) ; un cinquième les
  porterait au-dessus de leur part. Un changement futur devra passer le contrôle et une ADR.

## Règle d'or des frontières
La règle « frontières fixées à la fondation, jamais de redécoupage pour corriger un équilibre »
(ADR 2026-10-25-double-cle.md) est complétée : la présente passe, faite avant la fondation, est
la **dernière**. Les limites des États sont **gelées** à compter du 2026-11-05. Si un recensement
fait sortir un rapport de la bande, le déploiement échoue et la question revient par ADR, pour
un mécanisme de vote, jamais pour un redécoupage. Toute modification de territoire reste soumise
à l'article 54 de la Constitution.

## Écartés
- **Zapadno Pomoravļe** (Čačak, Kraļevo et Kruševac détachés de Šumadija, chef-lieu Kruševac) :
  proposé, puis écarté par l'utilisateur. La Šumadija reste entière, comme il l'avait décidé en
  mai 2026.
- **Torlak en deux États** : entre Niš–Pirot et Leskovac–Vrañe, il n'y a pas de limite
  linguistique (Niš et Vrañe parlent tous deux le prizrensko-južnomoravski) ; entre l'est (Pirot,
  Svrljig : timočko-lužnički et svrljiško-zaplanjski) et l'ouest, la limite dialectale est
  réelle, mais elle donne ~95 000 habitants contre ~789 000.
- **Bačka du Nord-Ouest** (Subotica–Sombor, 317 000 habitants) : pas d'erreur de géographie à
  corriger, la Bačka est une région historique entière.
- **Pelagonija** (Bitola, Prilep et le sud-ouest détachés de Zapaden Vardar) : le reste de
  Zapaden Vardar serait devenu un État à 56 % albanais, rattaché au peuple macédonien.
- **Istočen Vardar en deux États seulement** : rapport macédonien de 0,72, hors bande.
- **Cinquième État macédonien** : au-delà du nombre idéal.
- **Croates ramenés à huit États** (fusion de Dubrovačka Republika ou de Zapadni Srěm) :
  Serbes et Bulgares, à 26 États sur 51, atteindraient seuls la majorité.
- **Pondération des voix d'États** (analyse du 2026-10-25, section 5) : toujours mise de côté.

## Conséquences et propagation
- Données : `etats.json`, GeoJSON d'États (SL-32, VB-VRHBOSNA, PI-24, BZ-06 complétés ou
  réduits ; VS-45, PA-23, BE-03, ZL-48, US-43 créés ; BR-04, LV-LASVA, VI-41 supprimés),
  `stats.json`, `lights.json`, `opstine.json`, `geo.json` (48 États, sans trou ni
  recouvrement), `entites-autonomes.json`, `state_flags.json`, `flagnotes.json`, `videos.json`.
- Drapeaux : Pajonija reprend le drapeau d'Istočen Vardar (vallée du Vardar) ; les drapeaux de
  Baraña et de Lašva sont retirés (sources gardées, non utilisées). Blason de Vrhbosna renommé
  `coa-VB-44.webp` ; blason de Lašva retiré. Film de Banat renommé `BN-04` ; film de Baraña
  retiré.
- Constitution v4.13 dans les cinq textes (art. 1 bis, 1 quinquies, 150 ; annexe T).
- Portail : décomptes (52 États, 48 territoriaux, 54 circonscriptions, 27 sur 52 aux
  votations), entrée du Journal officiel, traductions des trois standards.
- Canon : `etats.md`, `entites-autonomes.md`, `equilibre.md` (nouveau), `citoyennete.md` ;
  `docs/alfabet/transition-toponymique.md`, `docs/plateforme/decidim.md`,
  `docs/communication/lancement-x-instagram.md`, `docs/analyses/equilibre-etats-peuples.md`,
  README, CLAUDE.md.

## Points ouverts
- **Drapeaux** : Zlatibor et Usora ont le leur (ADR 2026-11-05-drapeau-blason-zlatibor.md et
  2026-11-05-usora-byzantin.md), Severen Vardar et Bregalnica aussi depuis le 2026-11-06
  (ADR 2026-11-06-drapeaux-vardar-bregalnica.md). Reste Tunxa ; le portail affiche en
  attendant le drapeau provisoire au code de l'État.
- **Marge croate** : si la population des États croates recule de 6 % de plus que celle des
  autres, le rapport croate dépasse 1,25 (`docs/canon/equilibre.md`, section 5).
- **Usora** : 62,8 % de Serbes au recensement de 2013 (chiffres qui incluent des citoyens
  établis à l'étranger) ; les communes croates de la Posavina (Orašje, Odžak,
  Domaljevac-Šamac) forment SHO-US.
