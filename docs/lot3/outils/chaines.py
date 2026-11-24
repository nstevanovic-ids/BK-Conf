"""Usage : python docs/lot3/outils/chaines.py docs/lot3/mesures/0-prototype/chaines.json

Propositions de chaînes du lot 3 : istočni rédigé en bulgare cyrillique, converti par scripts/textes.py
(bg2lat), aller-retour (to_cyr) comparé ; zapadni et središñi passés par check_one."""
import sys, json
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'scripts'))
import textes as T

KEEP = ('Brčko', 'Mostar', 'Sarajevo', 'Kongres')
# clé : (en, zap, sre, ist en bulgare cyrillique — Sarajevo et Brčko en latin, noms officiels)
S = [
 ('2', 'Open in the instrument', 'Odpri v instrumentu', 'Otvorite u instrumentu', 'Отворете в инструмента'),
 ('3', 'Fiscal capacity per inhabitant is taken as proportional to GDP per capita, the only indicator of Article 132 a published for every State.',
  'Fiskalna zmogļivost na prebivalca je vzeta kot sorazmerna z BDP na prebivalca, edinim kazalnikom iz člena 132 a, ki je objavļen za vsako državo.',
  'Fiskalni kapacitet po stanovniku uzima se kao proporcionalan BDP-u po stanovniku, jedinom pokazateļu iz člana 132 a koji je objavļen za svaku državu.',
  'Фискалният капацитет на жител се приема за пропорционален на БВП на жител – единственият показател от член 132 а, публикуван за всяка държава.'),
 ('4', 'Confederal average = 100', 'Konfederalno povprečje = 100', 'Konfederalni prosěk = 100', 'Средно конфедерално равнище = 100'),
 ('5', 'Assumptions of the calculation', 'Predpostavke izračuna', 'Pretpostavke izračunavaña', 'Допускания при изчисляването'),
 ('6', 'The confederal average is that of the 52 States, weighted by population, before equalisation. Brčko and Mostar are not States.',
  'Konfederalno povprečje je povprečje 52 držav, tehtano s prebivalstvom, pred izravnavo. Brčko in Mostar nista državi.',
  'Konfederalni prosěk računa se za 52 države, prema broju stanovnika, prě izravnaña. Brčko i Mostar nisu države.',
  'Средното конфедерално равнище е това на 52-те държави, претеглено с населението, преди изравняването. Brčko и Mostar не са държави.'),
 ('7', 'Every contributor gives the same fraction of its surplus, never more than the ceiling. What the ceiling leaves uncovered falls to the Confederation, since the floor is guaranteed without reservation.',
  'Vsaka država plačnica prispeva enak delež svojega presežka, nikoli več od zgorñe meje. Kar zgorña meja ne pokrije, gre v breme Konfederacije, saj je spodña meja zajamčena brez pridržka.',
  'Svaka država koja doprinosi daje isti děo svog viška, nikad više od gorñe granice. Ono što gorña granica ne pokrije pada na teret Konfederacije, jer je doña granica zajamčena bez zadrške.',
  'Всяка държава вносител дава еднаква част от превишението си, никога повече от горната граница. Това, което горната граница не покрива, остава за сметка на Конфедерацията, тъй като долната граница е гарантирана безусловно.'),
 ('8', 'Result of the model: with a ceiling of {0}, the contributors fund {1} of what a floor of {2} requires.',
  'Izid modela: pri zgorñi meji {0} države plačnice pokrijejo {1} tega, kar zahteva spodña meja {2}.',
  'Rezultat modela: uz gorñu granicu od {0} države koje doprinose pokrivaju {1} onoga što zahtěva doña granica od {2}.',
  'Резултат от модела: при горна граница {0} държавите вносители покриват {1} от това, което изисква долна граница {2}.'),
 ('9', 'Receives', 'Prejema', 'Prima', 'Получава'),
 ('10', 'Contributes', 'Prispeva', 'Doprinosi', 'Внася'),
 ('11', 'of the surplus', 'presežka', 'viška', 'от превишението'),
 ('12', 'For', 'Za', 'Za', 'За'),
 ('13', 'Abstention', 'Vzdržani', 'Uzdržani', 'Въздържали се'),
 ('14', 'Against', 'Proti', 'Protiv', 'Против'),
 ('15', 'Passes', 'Uspe', 'Uspěva', 'Успява'),
 ('16', 'Fails', 'Ne uspe', 'Ne uspěva', 'Не успява'),
 ('17', 'Suspended', 'Zadržano', 'Obustavļeno', 'Спряно'),
 ('18', 'Link copied', 'Povezava je kopirana', 'Link je kopiran', 'Връзката е копирана'),
 ('19', 'Copy link', 'Kopiraj povezavo', 'Kopirajte link', 'Копирайте връзката'),
 ('20', 'The delegates of a State vote together, as their State is placed.',
  'Delegati posamezne države glasujejo skupaj, tako kot je postavļena ñihova država.',
  'Delegati jedne države glasaju zajedno, onako kako je postavļena ñihova država.',
  'Делегатите на една държава гласуват заедно, както е поставена държавата им.'),
 ('21', 'Every member is present. Simple majority: more votes for than against; abstentions do not count.',
  'Vsi člani so navzoči. Navadna večina: več glasov za kot proti; vzdržani glasovi se ne štejejo.',
  'Svi članovi su prisutni. Prosta većina: više glasova za nego protiv; uzdržani glasovi se ne računaju.',
  'Всички членове присъстват. Обикновено мнозинство: повече гласове „за“, отколкото „против“; въздържалите се не се броят.'),
 ('21b', 'Every member is present; an abstention is not a vote cast.',
  'Vsi člani so navzoči; vzdržani glas ni oddan glas.',
  'Svi članovi su prisutni; uzdržani glas nije dat glas.',
  'Всички членове присъстват; въздържането не е подаден глас.'),
 ('22', 'Registers: population of the territorial States attached to each people, as no register count exists yet.',
  'Registri: prebivalstvo teritorialnih držav, ki pripadajo posameznemu narodu, ker letnega štetja še ni.',
  'Registri: stanovništvo teritorijalnih država koje pripadaju svakom narodu, jer godišñe prebrojavañe još ne postoji.',
  'Регистри: населението на териториалните държави, които принадлежат на всеки народ, тъй като все още няма годишен отчет.'),
 ('23', 'The voters of a State all vote as their State is placed; the weight is the resident population.',
  'Vsi volivci posamezne države glasujejo tako, kot je postavļena ñihova država; utež je ñeno prebivalstvo.',
  'Svi birači jedne države glasaju onako kako je postavļena ñihova država; težina je broj ñenih stanovnika.',
  'Всички избиратели на една държава гласуват, както е поставена държавата им; тежестта е нейното население.'),
 ('24', 'Brčko and Mostar vote with Sarajevo, the nearest confederal territory (Art. 124).',
  'Brčko in Mostar glasujeta s Sarajevom, najbližjim konfederalnim ozemļem (čl. 124).',
  'Brčko i Mostar glasaju zajedno sa Sarajevom, najbližom konfederalnom teritorijom (čl. 124).',
  'Brčko и Mostar гласуват заедно със Sarajevo, най-близката конфедерална територия (чл. 124).'),
 ('25', 'A member placed against votes the alarm motion.',
  'Član, postavļen med glasove proti, glasuje za alarmni predlog.',
  'Član postavļen među glasove protiv glasa za zahtěv za uzbunu.',
  'Член, поставен сред гласовете „против“, гласува алармено искане.'),
 ('26', 'The coalition is the set of States placed in favour; a confederal territory belongs to no people.',
  'Koalicijo sestavļajo države, postavļene med glasove za; konfederalno ozemļe ne pripada nobenemu narodu.',
  'Koaliciju čine države postavļene među glasove za; konfederalna teritorija ne pripada nijednom narodu.',
  'Коалицията се състои от държавите, поставени сред гласовете „за“; конфедералната територия не принадлежи на нито един народ.'),
 ('27', 'Consensus: no councillor against.', 'Soglasje: noben svetnik ni proti.', 'Konsenzus: nijedan većnik nije protiv.', 'Консенсус: нито един съветник не е против.'),
 ('28', 'Share of the possible votes of the Kongres in which its delegates decide the outcome.',
  'Delež možnih glasovañ v Kongresu, v katerih ñeni delegati odločijo izid.',
  'Uděo mogućih glasaña u Kongresu u kojima ñeni delegati odlučuju o ishodu.',
  'Дял от възможните гласувания в Конгреса, в които нейните делегати решават изхода.'),
 ('29', 'Exact count over every alignment of the other 53 constituencies. It also belongs to {0} of the minimal majorities of 126 seats ({1} of {2}).',
  'Natančno štetje vseh razporeditev drugih 53 volilnih enot. Država je tudi v {0} minimalnih večin s 126 sedeži ({1} od {2}).',
  'Precizno prebrojavañe svih rasporeda ostalih 53 izborne jedinice. Država je i u {0} minimalnih većina od 126 mandata ({1} od {2}).',
  'Точно преброяване на всички разположения на останалите 53 избирателни района. Държавата участва и в {0} от минималните мнозинства от 126 места ({1} от {2}).'),
 # ---- chaînes nouvelles hors des 29
 ('N1', 'Votes and majorities', 'Glasovaña in večine', 'Glasaña i većine', 'Гласувания и мнозинства'),
 ('N2', 'Place the States, the national delegations and the councillors, and see which majority the Constitution requires: each threshold cites its article, and every assumption is stated.',
  'Razporedite države, narodne delegacije in svetnike ter poglejte, kakšno večino zahteva Ustava: pri vsakem pragu je naveden ñegov člen, vsaka predpostavka je izrecno navedena.',
  'Rasporedite države, narodne delegacije i većnike i pogledajte kakvu većinu zahtěva Ustav: uz svaki prag naveden je ñegov član, a svaka pretpostavka je izričito navedena.',
  'Разпределете държавите, народните делегации и съветниците и вижте какво мнозинство изисква Конституцията: към всеки праг е посочен членът му, а всяко допускане е изрично посочено.'),
 ('C1', 'Consent given by five delegations', 'Soglasje petih delegacij', 'Pristanak pet delegacija', 'Съгласие на пет делегации'),
 ('C2', 'Two peoples alone', 'Samo dva naroda', 'Samo dva naroda', 'Само два народа'),
 ('C3', 'Five delegations without the two largest', 'Pet delegacij brez dveh največjih', 'Pet delegacija bez dvě najveće', 'Пет делегации без двете най-големи'),
 ('C4', 'One delegation raises the alarm', 'Ena delegacija izglasuje alarmni predlog', 'Jedna delegacija izglasa zahtěv za uzbunu', 'Една делегация гласува алармено искане'),
 ('C5', 'Six delegations of seven on an entrenched guarantee', 'Šest od sedmih delegacij pri utrjenem jamstvu', 'Šest od sedam delegacija za ojačanu garanciju', 'Шест от седемте делегации при засилена гаранция'),
 ('C6', 'Twelve States, nine of one people', 'Dvanajst držav, devet istega naroda', 'Dvanaest država, devet iz istog naroda', 'Дванадесет държави, девет от един и същ народ'),
 ('C7', 'Four councillors for, three against', 'Štirje svetniki za, trije proti', 'Četiri većnika za, tri protiv', 'Четирима съветници „за“, трима „против“'),
 ('H6', 'The double key also applies to six delegations of seven: six are "at least five of the seven" (Art. 110).',
  'Dvojni kļuč veļa tudi za šest delegacij od sedmih: šest je »najmañ pet od sedmih« (čl. 110).',
  'Dvostruki kļuč priměñuje se i na šest od sedam delegacija: šest je „najmañe pet od sedam“ (čl. 110).',
  'Двойният ключ се прилага и за шест от седемте делегации: шест са „поне пет от седемте“ (чл. 110).'),
 ('A1', 'Met', 'Izpolñeno', 'Ispuñeno', 'Изпълнено'),
 ('A2', 'Not met', 'Ni izpolñeno', 'Nije ispuñeno', 'Не е изпълнено'),
 ('A3', 'With reduced motion, the discs are not dragged: select one, then place it by clicking or with the arrow keys.',
  'Pri zmañšanem gibañu krogov ni mogoče vleči: izberite krog in ga postavite s klikom ali s puščicami.',
  'Uz smañeno kretañe krugovi se ne prevlače: izaberite krug, a zatim ga postavite klikom ili strelicama.',
  'При намалено движение кръговете не се влачат: изберете кръг и го поставете с щракване или със стрелките.'),
 ('V1', 'Admissible', 'Dopustno', 'Dopustivo', 'Допустимо'),
 ('V2', 'Not admissible', 'Ni dopustno', 'Nije dopustivo', 'Недопустимо'),
]
out = []
for k, en, zap, sre, bg in S:
    ist = T.bg2lat(bg)
    rt = T.to_cyr(ist, 'ist', keep=KEEP)
    rt_ok = T.bg2lat(rt) == ist
    res = {'k': k, 'en': en, 'zap': zap, 'sre': sre, 'ist': ist, 'bg': bg, 'rt': rt_ok}
    for lg, tr in (('zap', zap), ('sre', sre), ('ist', ist)):
        e, w = T.check_one(en, lg, tr)
        if e or w:
            res['chk_' + lg] = e + w
    out.append(res)
for r in out:
    flag = '' if r['rt'] else '  ALLER-RETOUR ≠'
    print(r['k'], '|', r['ist'], flag, {k: v for k, v in r.items() if k.startswith('chk')} or '')
json.dump(out, open(sys.argv[1], 'w'), ensure_ascii=False, indent=1)
