/* Textes du film explicatif, en anglais. Une autre langue = un autre fichier de même forme
   (zap.js, sre.js, ist.js), chargé par ?lang=… ; les scènes ne contiennent aucun texte. */
window.TXT = window.TXT || {};
TXT.en = {
  title: 'The Balkan Confederation in five minutes',
  intro: {
    chapter: 'Opening',
    eyebrow: 'BALKANSKA KONFEDERACIJA',
    title: 'The Balkan Confederation',
    sub: 'in five minutes',
    motto: 'Naš dom',
    mottoEn: 'Our home'
  },
  states: {
    chapter: 'The States',
    l1: ['From the Julian Alps', 'to the shores of the Black Sea'],
    l2: ['one language', 'of a thousand faces'],
    l3: ['Founded neither on blood', 'nor on the rule of the most numerous,', 'but on the *will to live together*.'],
    count: 'States',
    terr: [['*48* territorial States'], ['each attached to one of', 'the seven constituent peoples']],
    city: [['*4* confederal territories'], ['the four capitals, which share', 'the institutions of the Confederation']],
    caps: {
      'ZG-94': ['Zagreb', 'judicial capital'],
      'BG-91': ['Beograd', 'economic capital'],
      'SA-92': ['Sarajevo', 'political capital'],
      'SF-93': ['Sofija', 'defence and sciences']
    },
    mun: [['+ *2* autonomous municipalities'], ['Brčko and Mostar, under confederal', 'jurisdiction; they are not States']],
    sov: [['Every State is sovereign'], ['except where the Constitution limits it']],
    frozen: 'Borders fixed at the founding.'
  },
  peoples: {
    chapter: 'The peoples',
    head: 'Seven constituent peoples',
    choice: [['Belonging is a *personal choice*'], ['From the age of eighteen, every citizen may join', 'the national register of the people of his choice.']],
    none: 'No register',
    free: [['No one is *compelled* to declare'], ['A citizen in no register keeps every civic right:', 'he votes for the Kongres and in referendums.']],
    commune: [['Your State is the State of *your commune*'], ['Attachment follows residence, never a free choice.', 'The register decides only the vote for the Narodni Sabor.']],
    comm: [['And all the communities', 'who share this land'], ['*24* autonomous entities protect those who are', 'a minority where they live. The Albanian, Hungarian,', 'Slovak and Turkish communities sit together', 'in the Council of Communities.']],
    host: 'States with an autonomous entity',
    mottos: ['Náš domov', 'Otthonunk', 'Yuvamız', 'Shtëpia jonë'],
    mottoCap: '“Naš dom” in the languages of the communities'
  },
  institutions: {
    chapter: 'The institutions',
    org: [
      ['Kongres', '250 delegates'],
      ['Narodni Sabor', '7 × 10 members'],
      ['Konfederalno Veće', '7 councillors'],
      ['Ustavni Sud', 'Constitutional Court']
    ],
    say: [
      [['The Kongres, *the citizens*'], ['250 delegates elected in every State in proportion', 'to its population, from 2 to 20 seats per State.']],
      [['The Narodni Sabor, *the peoples*'], ['Seven delegations of ten. Each people elects its own,', 'wherever its members live.']],
      [['The Konfederalno Veće, *the executive*'], ['Seven councillors, one per people. They decide by', 'consensus, or failing that by a qualified majority.']],
      [['The Ustavni Sud, *the guardian*'], ['The Constitutional Court, in Zagreb, ensures that', 'confederal law respects the Constitution.']],
      [['Three of them sit in *Sarajevo*'], ['The Kongres, the Narodni Sabor and the Konfederalno Veće', 'in the political capital; the Ustavni Sud in Zagreb.']]
    ]
  },
  law: {
    chapter: 'How a law is made',
    k: [['A law starts in the *Kongres*'], ['A simple majority of the delegates present adopts it.']],
    kfor: 'for', kag: 'against', kab: 'abstentions',
    kok: 'Adopted by the Kongres',
    id: [['Laws on identity need *the peoples*'], ['Languages and the alphabet, schools, culture, symbols,', 'borders, memory: the Narodni Sabor must consent, by a', 'majority in plenary and in five of its seven delegations.']],
    deleg: 'delegations',
    share: 'Registered citizens represented',
    five: [['Five of seven is *not enough*'], ['The five must also represent a majority of the citizens', 'enrolled in the national registers: the double key.']],
    six: [['Six of seven, *75 %* of registered citizens'], ['Neither the smaller peoples alone nor the larger', 'ones alone can impose a law on all the others.']],
    no: 'Not adopted', yes: 'Adopted',
    note: 'Registers estimated from the population of each people’s States (vote engine of the portal).',
    alarm: [['For every other law, *the alarm bell*'], ['Two thirds of a single delegation can suspend a law', 'and send it to conciliation.']],
    flow: ['Law adopted', 'Alarm: two thirds of one delegation', 'Suspended', 'Conciliation', 'If it fails: two thirds of the Kongres'],
    more: 'Votes and majorities: every case, step by step, on the portal.'
  },
  democracy: {
    chapter: 'Direct democracy',
    citizens: 'citizens',
    or: 'or',
    states12: ['12 States, no more than', 'half of them from one people'],
    ref: [['The people have *the last word*'], ['150,000 citizens or twelve States can put any law', 'passed by the Kongres to a referendum.']],
    ini: [['Citizens can *change the Constitution*'], ['300,000 signatures within eighteen months', 'put a revision to the vote.']],
    dbl: [['A *double majority*'], ['A revision passes only with a majority of voters', 'and a majority of the States: 27 of 52.']],
    voters: 'Voters in favour',
    statesYes: 'States in favour',
    example: 'Example',
    sun: [['Four *voting Sundays* a year'], ['The same day everywhere in the Confederation.']],
    months: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
  },
  language: {
    chapter: 'One language',
    std: [['Zapadni', 'western'], ['Središñi', 'central'], ['Istočni', 'eastern']],
    sabor: ['Skupščina narodov', 'Narodni Sabor', 'Sãbranie na narodite'],
    same: 'The same assembly, in each standard',
    three: [['One language, *three standards*'], ['The južnoslovenski jezik is written in three regional', 'standards, equal in dignity and in law.']],
    abc: [['One alphabet of *32 letters*'], ['Ã for the Bulgarian schwa, Ě for the old jat’,', 'Ñ and Ļ for the soft n and l, X for dž.']],
    cyr: [['Latin and Cyrillic, *letter for letter*'], ['Each letter has its Cyrillic twin: a text passes', 'from one script to the other without loss.']]
  },
  together: {
    chapter: 'Living together',
    items: [
      ['A semester of high school', 'in a State of another people'],
      ['Military or civilian service, with six', 'months of training outside one’s own State'],
      ['One football team per people,', 'and a single Konfederalna Liga'],
      ['A common history that hides', 'no crime and blames no people'],
      ['No confederal holiday', 'commemorates a battle']
    ],
    end: ['Founded on the freely renewed', '*will to live together*']
  },
  symbols: {
    chapter: 'The symbols',
    civil: [['The *civil flag*'], ['A red band at the hoist, then blue, white', 'and blue: the flag of every citizen.']],
    state: [['The *state flag*'], ['A golden sun of 36 rays bearing the winged lion', 'in red, and Balkan textile friezes: for the', 'institutions, the armed forces and embassies.']],
    lion: [['The *golden winged lion*'], ['Emblem of the Confederation: the wings of', 'the Balkan eagle on the Bulgarian lion.']],
    motto: 'Naš dom',
    mottoEn: 'Our home',
    cta: 'Read the Constitution  ·  Become a citizen'
  }
};
