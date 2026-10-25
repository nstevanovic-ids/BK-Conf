# Interface du portail dans les trois standards

**Phase 1, adoptée le 2026-10-25** (ADR 2026-10-25-interface-trois-standards.md). **Phase 2, étape 1** (titres) : voir plus bas.

Les boutons EN, ZAP, SRE et IST de l'en-tête traduisent désormais :
- l'en-tête et la navigation ;
- la recherche ;
- le pied de page ;
- le fil d'Ariane.

Le contenu des pages reste en anglais, et une note sous l'en-tête le signale. Le choix est
mémorisé dans le navigateur. La source de vérité est `portail/data/i18n.json`.

## Règles de choix des mots

1. **Forme commune d'abord.** Quand un même mot sert aux trois standards, on le prend :
   Registracija, Sigurnost, Karta, Konfederacija. C'est la règle des noms d'organes.
2. **Sinon, la forme propre à chaque standard** :
   - zapadni : base slovène ;
   - središnji : base štokavienne ;
   - istočni : base bulgare, dans la ligne des libellés de la carte citoyenne (Graždanska
     karta, Obština na proizhod).
3. **Au središnji, on évite les mots qui séparent le serbe et le croate.** On choisit alors
   un internationalisme ou une tournure commune : *Participacija* plutôt que *učešće* ou
   *sudjelovanje*, *Uključite se* plutôt que *učestvujte* ou *sudjelujte*. Quand aucune
   solution neutre n'existe, on suit la ligne de la carte citoyenne (*Izdavač*, *Važi do*,
   *opština*) : *odbrana*, *Službeni glasnik*.
4. **Pas de mot à yat sans nécessité.** Au zapadni et à l'istočni, qui sont ekaviens, le
   réflexe s'écrit *e* (*vestnik*), comme pour les noms de lieux (ADR
   2026-10-25-ekavien-sans-yat.md).
5. **Alphabet v3** : ñ, ļ, ã, x (*Zemļevid*, *Dãržavi*, *Tãrsene*). La marque Balkanska
   Konfederacija et la devise Naš dom ne se traduisent pas ; la devise remplace le
   sous-titre anglais.

## Libellés

| EN | ZAP | SRE | IST |
|---|---|---|---|
| Official portal of the Balkan Confederation | Uradni portal Balkanske konfederacije | Službeni portal Balkanske konfederacije | Oficialen portal na Balkanskata konfederacija |
| Balkan Confederation | Naš dom | Naš dom | Naš dom |
| Home | Domov | Početna | Načalo |
| States | Države | Države | Dãržavi |
| Map | Zemļevid | Karta | Karta |
| Institutions | Institucije | Institucije | Institucii |
| Security | Varnost | Sigurnost | Sigurnost |
| Constitution | Ustava | Ustav | Konstitucija |
| Identity | Identiteta | Identitet | Identičnost |
| Participation | Sodelovañe | Participacija | Učastie |
| Register | Registracija | Registracija | Registracija |
| My card | Moja izkaznica | Moja karta | Mojata karta |
| Search the portal | Iskañe po portalu | Pretraga portala | Tãrsene v portala |
| Search states, communities, peoples, letters, pages… | Iščite države, skupnosti, narode, črke, strani… | Tražite države, zajednice, narode, slova, stranice… | Tãrsete dãržavi, obštnosti, narodi, bukvi, stranici… |
| navigate | premik | kretañe | dviženie |
| open | odpri | otvori | otvori |
| close | zapri | zatvori | zatvori |
| Open menu | Odpri meni | Otvori meni | Otvori meñuto |
| Toggle light / dark theme | Tema | Tema | Tema |
| The Confederation | Konfederacija | Konfederacija | Konfederacijata |
| Law & identity | Pravo in identiteta | Pravo i identitet | Pravo i identičnost |
| Participate | Sodelujte | Ukļučite se | Učastvajte |
| States & territories | Države in ozemļa | Države i teritorije | Dãržavi i teritorii |
| Interactive map | Interaktivni zemļevid | Interaktivna karta | Interaktivna karta |
| Security and Defence | Varnost in obramba | Sigurnost i odbrana | Sigurnost i otbrana |
| Autonomous communities | Avtonomne skupnosti | Autonomne zajednice | Avtonomni obštnosti |
| Official Journal | Uradni list | Službeni glasnik | Dãržaven vestnik |
| Unified alphabet | Enotna abeceda | Jedinstvena abeceda | Edinna azbuka |
| Symbols & heraldry | Simboli in heraldika | Simboli i heraldika | Simvoli i heraldika |
| Become a citizen | Postanite državļan | Postanite državļanin | Stanete graždanin |
| Citizen card | Državļanska izkaznica | Državļanska karta | Graždanska karta |
| Membership dashboard | Pregled članstva | Pregled članstva | Pregled na členstvoto |
| digital portal | digitalni portal | digitalni portal | digitalen portal |

La note « contenu en anglais » et la phrase du pied de page sont dans `i18n.json`.

## Phase 2, étape 1 : titres et intertitres (2026-10-25)

ADR 2026-10-25-interface-phase-2-titres.md.

**Ce qui est traduit** :
- les titres (h1 à h4) et les sur-titres de toutes les pages, y compris le parcours citoyen
  et les cartes des mineurs ;
- l'anglais reste dans le gabarit, et l'attribut `data-i18n` nomme la clé de `i18n.json` ;
- un observateur traduit aussi ce qui s'affiche après coup : étapes du parcours, tableau de
  bord, formulaires.

Le texte courant reste en anglais ; la note sous l'en-tête le dit désormais (« titres
traduits »).

**Choix notables** :
- **Au središnji, des tournures communes** quand le serbe et le croate divergent :
  - *Izbori i imenovanja* pour « Who elects whom » (*ko / tko*) ;
  - *250 delegata Kongresa* (*mesta / mjesta*) ;
  - *Način rada* ;
  - *Kontrola državļanske karte* (*provera / provjera*) ;
  - *Na ovom uređaju nema karte* (*pregledač / preglednik*) ;
  - *Jezik i identitet* (*jezički / jezični*) ;
  - *Građanska inicijativa*, qui évite *narodna*, réservé aux peuples.
- **Repli sur la ligne de la carte** quand aucun neutre n'existe : *Neposredna demokratija*,
  *U vanrednom stañu* (comme la Konfederalna Agencija za Vanredne Situacije).
- **Yat au središnji, là où aucun mot sans yat n'existe** : *Děca*, *Prijava děteta*,
  *Predsědništvo*, *Punolětnost*, *Izměnite prijavu*. Au zapadni et à l'istočni, le réflexe
  s'écrit *e* (règle 4).
- **Alphabet v3 appliqué à toutes les chaînes de l'interface** (règle 5) : *Državļanstvo*,
  *Spremiñañe ustave*, *U vanrednom stañu*, *Temeļni zakon*. Corrections de la phase 1 :
  *Sodelovañe*, *Iskañe*, *kretañe*, *Ukļučite se*, *državļan(in)*, *Državļanska
  izkaznica / karta*, *Otvori meñuto* (bulgare ню → ñu). Les noms des standards (*središnji
  standard*) gardent la graphie de la Constitution (art. 128).
- **Istočni** : bulgare retranscrit (*Sãjuzãt*, *Izpãlnitelna vlast*, *Pãlnoletie*), sans
  *j* parasite dans les mots savants (*Graždanska iniciativa*, *institucii*).

**Point ouvert** : les libellés validés de la carte (*Državljanska karta*, *Datum
izdavanja*, *Konfederalni registar državljana*) et des mots courants de la Constitution
(*središnji*) gardent *lj* et *nj*. Les aligner sur la règle 5 demande une décision.

### Titres

| EN | ZAP | SRE | IST |
|---|---|---|---|
| Official portal | Uradni portal | Službeni portal | Oficialen portal |
| The Balkan Confederation | Balkanska konfederacija | Balkanska konfederacija | Balkanskata konfederacija |
| The union | Zveza | Savez | Sãjuzãt |
| A confederation of states, a home for peoples. | Konfederacija držav, dom za narode. | Konfederacija država, dom za narode. | Konfederacija ot dãržavi, dom za narodite. |
| The land | Dežela | Zemļa | Zemjata |
| The peoples | Narodi | Narodi | Narodite |
| Seven peoples, one home | Sedem narodov, en dom | Sedam naroda, jedan dom | Sedem naroda, edin dom |
| The institutions | Institucije | Institucije | Instituciite |
| Four confederal institutions | Štiri konfederalne institucije | Četiri konfederalne institucije | Četiri konfederalni institucii |
| Citizenship | Državļanstvo | Državļanstvo | Graždanstvo |
| Explore the portal | Raziščite portal | Istražite portal | Razgledajte portala |
| Membership | Članstvo | Članstvo | Členstvo |
| Confederal digital citizenship | Konfederalno digitalno državļanstvo | Konfederalno digitalno državļanstvo | Konfederalno digitalno graždanstvo |
| Directory | Imenik | Imenik | Ukazatel |
| Map of the Confederation | Zemļevid Konfederacije | Karta Konfederacije | Karta na Konfederacijata |
| Confederal architecture | Konfederalna ureditev | Konfederalno uređeñe | Konfederalno ustrojstvo |
| Institutions of the Confederation | Institucije Konfederacije | Institucije Konfederacije | Instituciite na Konfederacijata |
| Who elects whom | Kdo koga voli | Izbori i imenovaña | Koj kogo izbira |
| The 250 seats of the Kongres | 250 sedežev Kongresa | 250 delegata Kongresa | 250-te mesta v Kongresa |
| How a confederal law is made | Kako nastane konfederalni zakon | Kako nastaje konfederalni zakon | Kak se priema konfederalen zakon |
| Direct democracy | Neposredna demokracija | Neposredna demokratija | Prjaka demokracija |
| Popular initiative | Državļanska pobuda | Građanska inicijativa | Graždanska iniciativa |
| Optional referendum | Fakultativni referendum | Fakultativni referendum | Fakultativen referendum |
| Revising the Constitution | Spremiñañe ustave | Revizija Ustava | Izmenenie na Konstitucijata |
| Other confederal bodies | Drugi konfederalni organi | Ostali konfederalni organi | Drugi konfederalni organi |
| Confederal Council · Sarajevo | Izvršna oblast · Sarajevo | Izvršna vlast · Sarajevo | Izpãlnitelna vlast · Sarajevo |
| The presidency | Predsedstvo | Predsědništvo | Predsedatelstvoto |
| Seven departments | Sedem oddelkov | Sedam resora | Sedem resora |
| How the council works | Način dela | Način rada | Kak raboti Sãvetãt |
| Confederal security | Konfederalna varnost | Konfederalna sigurnost | Konfederalna sigurnost |
| Four services | Štiri službe | Četiri službe | Četiri službi |
| Safeguards | Varovalke | Garancije | Garancii |
| In a state of emergency | V izrednem stañu | U vanrednom stañu | Pri izvãnredno položenie |
| Fundamental law | Temeļni zakon | Temeļni zakon | Osnoven zakon |
| Constitution of the Balkan Confederation | Ustava Balkanske konfederacije | Ustav Balkanske konfederacije | Konstitucija na Balkanskata konfederacija |
| Titles | Poglavja | Glave | Glavi |
| Preamble | Preambula | Preambula | Preambjul |
| Records | Uradne objave | Službene objave | Oficialni publikacii |
| Identity of the union | Identiteta zveze | Identitet saveza | Identičnost na sãjuza |
| Language, alphabet & symbols | Jezik, abeceda in simboli | Jezik, abeceda i simboli | Ezik, azbuka i simvoli |
| Seven constituent peoples | Sedem konstitutivnih narodov | Sedam konstitutivnih naroda | Sedem konstitutivni naroda |
| Linguistic identity | Jezikovna identiteta | Jezik i identitet | Ezikova identičnost |
| South Slavic Latin alphabet, v3 | Južnoslovanska latinica, v3 | Južnoslovenska latinica, v3 | Južnoslavjanska latinica, v3 |
| Three regional standards, one language | Trije regionalni standardi, en jezik | Tri regionalna standarda, jedan jezik | Tri regionalni standarta, edin ezik |
| Heraldry | Heraldika | Heraldika | Heraldika |
| Symbols & heraldry of the Confederation | Simboli in heraldika Konfederacije | Simboli i heraldika Konfederacije | Simvoli i heraldika na Konfederacijata |
| The confederal palette | Konfederalna paleta | Konfederalna paleta | Konfederalnata paleta |
| State flags | Zastave držav | Zastave država | Znamena na dãržavite |
| Communities | Skupnosti | Zajednice | Obštnosti |
| Civic life | Državļansko živļeñe | Građanski život | Graždanski život |
| Registration in five steps | Prijava v petih korakih | Prijava u pet koraka | Zajavka v pet stãpki |
| Identity | Identiteta | Identitet | Samoličnost |
| State of attachment | Država pripadnosti | Država pripadnosti | Dãržava na prinadležnost |
| National register | Narodni register | Narodni registar | Naroden registãr |
| Document language | Jezik dokumenta | Jezik dokumenta | Ezik na dokumenta |
| Declaration | Izjava | Izjava | Deklaracija |
| Confirmed registrations, last 90 days | Potrjene prijave v zadñih 90 dneh | Potvrđene prijave u zadñih 90 dana | Potvãrdeni zajavki za poslednite 90 dni |
| By national register | Po narodnem registru | Po narodnom registru | Po naroden registãr |
| By state of attachment | Po državi pripadnosti | Po državi pripadnosti | Po dãržava na prinadležnost |
| Transparency | Preglednost | Transparentnost | Prozračnost |
| Your state of attachment | Vaša država pripadnosti | Vaša država pripadnosti | Vašata dãržava na prinadležnost |
| Check your inbox | Preverite e-pošto | Pogledajte svoju e-poštu | Proverete poštata si |
| Confirming your registration | Potrjevañe prijave | Potvrda prijave | Potvãrždavane na zajavkata |
| Issuing your citizen card… | Izdajañe državļanske izkaznice… | Izdavañe državļanske karte… | Izdavane na graždanskata karta… |
| Opening your citizen card | Odpirañe državļanske izkaznice | Otvarañe državļanske karte | Otvarjane na graždanskata karta |
| Retrieving your card from the confederal register… | Pridobivañe izkaznice iz konfederalnega registra… | Preuzimañe karte iz konfederalnog registra… | Izvličane na kartata ot konfederalnija registãr… |
| Verify a citizen card | Preverjañe državļanske izkaznice | Kontrola državļanske karte | Proverka na graždanska karta |
| Access to your card | Dostop do izkaznice | Pristup karti | Dostãp do kartata |
| Children under 18 | Otroci, mlajši od 18 let | Děca mlađa od 18 godina | Deca pod 18 godini |
| Declare a child | Prijava otroka | Prijava děteta | Deklarirane na dete |
| A card is needed first | Najprej potrebujete izkaznico | Prvo je potrebna karta | Pãrvo e nužna karta |
| Card not found | Izkaznice ni mogoče najti | Karta nije pronađena | Kartata ne e namerena |
| Now of age | Polnoletnost | Punolětnost | Pãlnoletie |
| No card in this browser | V tem brskalniku ni izkaznice | Na ovom uređaju nema karte | V tozi brauzãr njama karta |
| Your civic rights | Vaše državļanske pravice | Vaša građanska prava | Vašite graždanski prava |
| Your record | Vaš vpis | Vaš upis | Vašijat zapis |
| Amend your registration | Spremenite prijavo | Izměnite prijavu | Promenete zajavkata si |
| Child's card | Izkaznica otroka | Karta děteta | Karta na deteto |

## Suite (phase 2, étapes suivantes)

- Traduire le texte des pages, standard par standard.
- Le lecteur de la Constitution attend la version officielle dans les trois standards : selon
  l'art. 151, elles font également foi.
