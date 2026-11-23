# Plan du lot 1 : Codex → `#/constitution`

Rédigé le 17 novembre 2026, versé dans le dépôt le 23 novembre 2026 (copie de `claude/plan-lot1-codex.md`
du Projet claude.ai, que les sessions cloud ne voient pas). À lire après `proto/REPRISE.md` (branche
`claude/proto-tour-2`), puis `CLAUDE.md` et `docs/canon/`, qui priment.

Rien n'est codé. `main` à 7d96e3c (seule branche publiée) ; prototypes sur `claude/proto-tour-2` (dc71255).

## Règles de la session

- Branche `claude/lot1-constitution`, partie de `main`. Commits atomiques. **Pousser après chaque commit** :
  l'environnement cloud est jetable, tout ce qui n'est pas poussé est perdu.
- Mesures, captures et rapports Lighthouse : versés dans la branche ou joints à la PR, jamais laissés dans le conteneur.
- Aucune PR vers `main`, aucune fusion sans accord explicite de l'auteur. Pas de sous-agents. Français de travail,
  masculin générique.

## Réponses de l'auteur (17 novembre) aux huit décisions de `proto/REPRISE.md`

1. Déploiement : build lié déployé sur Pages, fichier unique gardé comme export : **oui**.
2. Globe d3 remplacé par MapLibre : **oui** (lot 2 ; d3 reste, la petite carte des fiches d'États s'en sert).
3. ADR d'amendement des transitions, limité aux trois pages : **oui**.
4. Traductions : traitées dans ce plan (section « Chaînes »).
5. Texte français (v4.md) sur le portail public : **oui**.
6. Péréquation : **réviser l'art. 132 d'abord** (conversation Constitution, cinq textes).
7. Nom, route et place de la page Sabor : **non tranché** (lot 3). Recommandation : pas « Sabor » en public ;
   « Votes and majorities », `#/votes`, sous Institutions comme `#/council`, sans 9e entrée de navigation.
8. Incohérences de chefs-lieux (KJ-15, KM-16, VS-45) : **ne pas corriger**.

## Points encore à valider par l'auteur (recommandation en premier)

1. Build lié et chargement par page **dans ce lot**, en commits séparés et mesurés à part ; ou PR distincte avant le lot.
2. Moteur de Sabor (`proto/sabor/js/rules.js`) porté **dès ce lot** comme moteur unique ; ou moteur de Codex gardé jusqu'au lot 3.
3. Chaînes : livrer 1, 3, 5, 6, 9, 10 et 11 ; abandonner 2 et 4 ; 7 et 8 attendent la révision de l'art. 132 ;
   anglais retouché pour la 9, « conciliation committee » pour la 10.
4. Lien d'évitement sur tout le portail (constat A-4 de l'audit) : oui / non.
5. Phrase sur ce que la marge de l'art. 111 ne calcule pas (siège vacant, voix prépondérante, exceptions de
   l'alinéa 7) : oui / non. Si oui, c'est une 12e chaîne : ses trois traductions sont soumises à l'auteur avant livraison.

## Effet des décisions sur le lot 1

- **Build lié** : nécessaire mais insuffisant. En mode lié, le gabarit attend 18 JSON avant tout rendu :
  2,12 Mo bruts, 970 ko gzip, dont `state_flags.json` 567 ko (58 %), les quatre Constitutions 178 ko, `textes.json` 111 ko,
  `geo.json` 76 ko ; gabarit 131 ko gzip ; polices 199 ko. Audit : `#/constitution` LCP 7,5 s, perf. 27, CLS 0,857.
  D'où le **chargement par page** : `#/constitution` n'attend plus que le gabarit, les petits JSON, `textes.json` hors
  anglais et ses propres données, soit environ 0,4 Mo en anglais et 0,5 Mo dans un standard, polices comprises.
- **Transitions** : ADR d'amendement écrit dans ce lot, règle complète pour `#/constitution`, place réservée carte et Sabor.
- **Français public** : colonne FR (v4.md) proposée ; l'art. 151 ne donne force officielle qu'aux trois standards,
  d'où une ligne d'avertissement (chaîne 11).
- **Art. 132** : instrument non livré, l'article reste du texte. Codex (plancher non tenu, 74,8 %) et Sabor (la
  Confédération paie l'écart) l'ont modélisé de façons contraires. La révision devra fixer la mesure de la capacité
  fiscale, qui l'emporte du plancher ou du plafond, et qui finance l'écart.

## Architecture

- **Code** chargé à la demande : `portail/js/constitution.js`, `portail/js/marges.js`, `portail/js/regles.js`,
  `portail/css/constitution.css`. Scripts classiques sur les globales du portail (`L`, `T`, `LANG`, `SCRIPTS`, `esc`,
  `fmtN`, `cyrText`, `toCyr`, `cyrWord`, `cyr2lat`, `STATES`, `PEUPLES`), pas de modules ES : l'export en fichier unique
  doit marcher en `file://`.
- **Données générées** dans `portail/data/constitution/` : `core.json` (sommaire, préambule des cinq textes, renvois
  inverses, ancrages des instruments), `t/<titre>.<lg>.json` (55 fichiers), `idx.<lg>.json` (aperçus), `full.<lg>.json`
  (recherche), `map.json` (carte de marge). Les quatre `constitution*.json` restent produits mais ne sont plus chargés
  au démarrage ; `artLink` et le routeur lisent `core.json`.
- **Routes** : `#/constitution` (ouverture : préambule, art. 110 manipulable, onze titres avec un trait par article,
  lien vers le Journal officiel) ; `#/constitution/preamble` ; `#/constitution/title-4` ; `#/constitution/title-4/art-110`
  (inchangée) ; `#/constitution/title-4/art-110/en-sre-fr` (colonnes). `#/constitution/art-110` et `art-1-bis` acceptées
  et réécrites. Introuvable : vue « Not found » qui garde l'adresse et ouvre la recherche. États : `#/state/<code>`.
- **Barre du lecteur** : sur ces pages, le fil d'Ariane est remplacé par la barre collante de Codex (titre et article,
  textes, règle graduée), sous l'en-tête du portail.
- **Une seule recherche**, celle du portail (Ctrl+K, /), enrichie de Codex : accès par numéro (« 110 », « art 1 bis »,
  « čl. 110 », « § 110 »), recherche sans diacritiques, extrait en graphie d'origine avec occurrence surlignée ; texte
  des articles chargé à la première frappe.
- **Moteur unique** : `rules.js` de Sabor porté dans `regles.js` sans ses libellés (ils arrivent au lot 3 avec leurs
  traductions, sinon `textes.py check` échoue) et sans la péréquation. Ajouts : sièges (art. 103), commission de
  conciliation (art. 110 ter : 8 sur 14 avec le membre de la délégation), délai de 30 jours (art. 109 b). Les
  instruments de Codex ne gardent que l'affichage.
- **Mouvement** : entrée et sortie de `#/constitution` par le glissement vertical existant ; renvoi suivi = transition
  à élément partagé (numéro d'article) ; pager entre titres = glissement horizontal ; traits animés au défilement ;
  bascule d'écriture glyphe par glyphe ; mouvement réduit : fondu de 200 ms dans l'alinéa.

## Fichiers touchés

| Fichier | État | Contenu |
|---|---|---|
| `scripts/build_lecteur.py` | nouveau | générateur repris de `proto/codex/build.py`, appelé à la fin de `build_constitution.py` |
| `scripts/build_carte_marge.py` | nouveau | `geo.json` → `constitution/map.json` (shapely), à relancer après `gen_geo.py` |
| `portail/data/constitution/…` | généré | voir Architecture |
| `portail/js/constitution.js` | nouveau | ouverture, lecteur 1 à 5 textes, renvois et aperçus, fil de lecture, règle graduée, bascule d'écriture |
| `portail/js/marges.js` | nouveau | instruments 1 bis, 1 ter, 103, 109/110 ter, 110, 111, 115 bis ; carte de marge |
| `portail/js/regles.js` | nouveau | moteur unique |
| `portail/css/constitution.css` | nouveau | CSS de Codex limitée à la page |
| `portail/index.html` | modifié | chargement par page ; `vConstitution` réduit à un point d'accroche ; routeur, langue et écriture confiés au lecteur sur sa page ; recherche ; lien d'évitement ; ancien lecteur supprimé (`cBlock`, `cInline`, CSS `.creader`…) |
| `scripts/build_portail.py` | modifié | lié : assemble `_site/` d'après une liste blanche, sans les GeoJSON sources ; `--inline` : embarque le lecteur |
| `scripts/build_constitution.py` | modifié | appelle le générateur |
| `scripts/textes.py` | modifié | `extract` lit aussi `portail/js/*.js` (aujourd'hui il ne lit que le gabarit) |
| `portail/data/textes.json` | modifié | chaînes validées |
| `.github/workflows/pages.yml` | modifié | publie le build lié ; fichier unique en export (`/export/`) ; échoue si les fichiers générés du lecteur ne sont pas à jour |
| `docs/decisions/` | 3 ADR | déploiement lié et chargement par page ; lecteur ; amendement du mouvement |
| `CLAUDE.md` | modifié | architecture, fichiers « générés, ne pas éditer », mouvement, recherche |

`proto/` n'est pas touché (lots 2 et 3).

## Étapes de build ajoutées

1. `python scripts/build_constitution.py` : sorties actuelles puis `portail/data/constitution/`. Échoue si le français
   ne s'aligne pas alinéa par alinéa, si les renvois diffèrent d'un texte à l'autre, si un alinéa annoté par un
   instrument est introuvable.
2. `python scripts/build_carte_marge.py` : seulement quand `geo.json` change.
3. `python scripts/build_portail.py` : assemble `_site/` ; `--inline` produit l'export (environ 4,2 Mo bruts estimés,
   contre 2,9 Mo).
4. Inchangés avant chaque déploiement : `equilibre.py --check`, `textes.py check`.

## Repris tel quel, réécrit, abandonné

**Tel quel** (raccordé au portail) : cœur de `build.py` (lecture de v4.md, découpage en alinéas, renvois avec plages et
lettres, renvois inverses, contrôles ; seuls changent sorties et liens) ; `cyr.js` lignes 83 à 379 (les lignes 1 à 82
doublent les fonctions du portail : supprimées) ; `map.js` ; `rules.js` de Sabor ; de `reader.js` : alignement, mise en
page par colonnes, retour au bon alinéa, onglets et balayage mobile, j / k, instruments chargés à l'approche.

**Réécrit** : `app.js` (routage, en-tête, langues, thème, menu, démarrage → ceux du portail ; restent fil de lecture,
aperçus, règle graduée, ouverture) ; chaînes via `L` (textes.json) et `T` (i18n.json) ; `instr.js` (affichage gardé,
calculs au moteur, ordre des peuples depuis `peuples.json`, les 20 numéros d'alinéas écrits en dur calculés par le
générateur) ; `codex.css` (préfixe `.cx`, règles globales retirées, palette canonique, thème sombre du portail) ;
sélecteur Lat / Ћир du portail seul, double ligne A/Ћ dans la barre du lecteur.

**Abandonné** : `palette.js`, `state.js`, vue `#states`, `index.html` de Codex, copies de polices, drapeaux, blasons,
emblème et données (`opstine`, `instr`, `states`) ; recherche des communes (à reprendre au lot 2, vers la carte) ;
drapeau dans l'aperçu d'un État sauf si les drapeaux sont déjà chargés.

## Commits

1. Build lié sur Pages, export du fichier unique, ADR de déploiement.
2. Chargement par page (table route → données), toutes pages vérifiées.
3. Générateur, données générées, carte de marge.
4. Moteur unique, vérifié contre le texte des art. 103, 109 b, 110, 110 ter, 111, 115 bis.
5. Lecteur, ouverture, routes, mouvement ; ancien lecteur retiré.
6. Instruments de marge, sans l'art. 132.
7. Recherche unifiée.
8. Chaînes et lien d'évitement.
9. ADR du lecteur, amendement du mouvement, `CLAUDE.md`.

Mesures à trois moments : `main` (inline), après le commit 2, fin du lot.

## Risques

- **Chargement par page** : le portail construit chaque page d'un bloc à partir de données en mémoire ; une donnée
  oubliée = page vide. Table route → données explicite, Playwright sur toutes les routes × 4 langues.
- **Double conversion cyrillique** : l'observateur du portail (`cyrApply`) convertirait les colonnes anglaise ou
  zapadni ; les cellules du lecteur doivent lui échapper et suivre chacune son standard.
- **Conflits CSS** : classes génériques de Codex (`.btn`, `.wrap`, `.grid`, `.k`, `.big`, `.seats`) proches de celles du
  portail (`.seat`, `.kpi`, `.eyebrow`) : préfixe partout.
- **Transitions simultanées** : routeur et lecteur appellent `startViewTransition` ; un seul propriétaire par navigation.
- **Moteur** : la correction de l'art. 109 b dans Sabor n'a pas été revérifiée ; vérifier contre le texte, tout point
  douteux devient une hypothèse affichée.
- **LCP** < 2,5 s sur l'ouverture et sur un article ; les polices font la moitié du poids. Si dépassé : préchargement
  des polices et du titre demandé dès le `<head>`.
- **Marge collante en colonnes de 340 px** : sortir la marge de la zone qui défile, hauteurs alignées par ResizeObserver.
- **Double ligne** : essayer `<ruby>` ; sinon limite assumée et dite.
- **Navigateurs** : WebKit et Firefox via Playwright si leur téléchargement passe ; ne remplace ni Safari ni un téléphone.
- **Texte français public** : vérifier qu'aucun article de v4.md ne contient de note de travail.

## Vérification

Chrome Playwright 375, 768, 1440 px ; EN, ZAP, SRE latin et cyrillique, IST cyrillique et latin ; zéro erreur console,
zéro débordement, drapeaux à leur proportion, focus visible, clavier complet, mouvement réduit, Lighthouse mobile ;
captures regardées. En plus : non-régression sur toutes les routes, export ouvert en `file://`, liste de ce qui n'a pas
été vu fonctionner.

## Chaînes

Istočni rédigé en bulgare, converti par `scripts/textes.py`, aller-retour vérifié ; `check_one` sans erreur dans les
trois standards.

1. **Assumption** — livrer. ZAP Predpostavka · SRE Pretpostavka · IST Dopuskane. (*Hipoteza* écartée : sens de théorie du droit.)
2. **Alignment failed for this article.** — ne pas livrer (le générateur échoue à la place).
   ZAP Poravnava tega člena ni uspela. · SRE Poravnañe ovog člana nije uspělo. · IST Podravñavaneto na tozi člen ne uspja.
3. **Skip to content** — livrer si lien d'évitement. ZAP Preskoči na vsebino · SRE Preskoči na sadržaj · IST Kãm sãdãržanieto.
4. **To be translated** — ne pas livrer. ZAP Še ni prevedeno · SRE Još nije prevedeno · IST Ošte ne e prevedeno.
5. **No annual count exists yet (Art. 115 bis): each register is given the census population of the territorial States
   attached to its people.** — livrer ; même hypothèse que Sabor, garder cette formulation pour les deux pages.
   - ZAP Letnega štetja še ni (čl. 115 bis): vsakemu registru je pripisano prebivalstvo po popisu teritorialnih držav, ki pripadajo ñegovemu narodu.
   - SRE Godišñe prebrojavañe još ne postoji (čl. 115 bis): svakom registru pripisano je stanovništvo prema popisu teritorijalnih država koje pripadaju ñegovom narodu.
   - IST Vse ošte ñama godišen otčet (čl. 115 bis): na vseki registãr e pripisano naselenieto spored prebrojavaneto na teritorialnite dãržavi, koito prinadležat na negovija narod.
6. **The plenary majority depends on seventy individual votes and is not modelled here.** — livrer.
   - ZAP Večina v plenarni sestavi je odvisna od sedemdesetih posameznih glasov in tu ni modelirana.
   - SRE Većina na plenarnoj sědnici proizlazi iz sedamdeset pojedinačnih glasova i u ovom prikazu se ne izračunava.
   - IST Mnozinstvoto v plenarno zasedanie zavisi ot sedemdeset otdelni glasa i tuk ne se modelira.
7. **The formula is left to confederal law. Here: fiscal capacity is GDP per inhabitant (Eurostat 2023, PPS); the
   average is weighted by population over the 52 States; one uniform rate is levied on the surplus, the lowest that
   pays the floor.** (art. 132) — en attente de la révision.
   - ZAP Formulo določa konfederalni zakon. Tu: fiskalna zmogļivost je BDP na prebivalca (Eurostat 2023, SKM); povprečje 52 držav je tehtano s prebivalstvom; od presežka se odvzame enotna stopña, najnižja, ki pokrije spodño mejo.
   - SRE Formulu utvrđuje konfederalni zakon. U ovom slučaju: fiskalni kapacitet jednak je BDP-u po stanovniku (Eurostat 2023, SKM); prosěk 52 države računa se prema broju stanovnika; na višak se priměñuje jedinstvena stopa, najniža koja pokriva doñu granicu.
   - IST Formulata se opredeļa ot konfederalnija zakon. Tuk: fiskalnijat kapacitet e BVP na žitel (Eurostat 2023, SPS); srednoto ravnište na 52-te dãržavi e pretegleno s naselenieto; ot previšenieto se udãrža edinna stavka, naj-niskata, kojato pokriva dolnata granica.
8. **At this setting the ceiling does not pay for the floor. The text does not say who covers the gap.** — en attente.
   - ZAP Pri teh vrednostih zgorña meja ne pokrije spodñe meje. Besedilo ne določa, kdo pokrije razliko.
   - SRE Pri ovim vrědnostima gorña granica ne pokriva doñu. Tekst ne određuje na čiji teret pada razlika.
   - IST Pri tezi stojnosti gornata granica ne pokriva dolnata. Tekstãt ne posočva koj pokriva razlikata.
9. **The text does not say how the limits combine with the method. Here: one common divisor, rounded to the nearest
   whole number, then the limits.** — livrer, anglais retouché (original : « standard rounding, then the limits, as on
   the portal »).
   - ZAP Besedilo ne določa, kako se omejitve združujejo z metodo. Tu: en skupni deliteļ, zaokrožitev na najbližje celo število, nato omejitve.
   - SRE Tekst ne određuje kako se granice priměñuju zajedno s metodom. U ovom slučaju: jedan zajednički dělilac, zaokruživañe na najbliži cěli broj, zatim granice.
   - IST Tekstãt ne posočva kak granicite se sãčetavat s metoda. Tuk: edin obšt delitel, zakrãgļavane do naj-blizkoto cjalo čislo, sled tova granicite.
10. **Two thirds is rounded up: seven of the ten members of a delegation, 167 of the 250 delegates. A majority of the
    fourteen members of the conciliation committee is eight.** — livrer (« conciliation committee » au lieu de
    « committee »). « 167 sur 250 » suppose les deux tiers des membres (l'art. 109 b ne précise pas membres ou
    votants) : hypothèse à garder affichée.
    - ZAP Dve tretjini se zaokrožita navzgor: sedem od desetih članov delegacije, 167 od 250 delegatov. Večina štirinajstih članov usklajevalnega odbora je osem.
    - SRE Dvě trećine zaokružuju se na veći cěli broj: sedam od deset članova delegacije, 167 od 250 delegata. Većina od četrnaest članova odbora za usaglašavañe je osam.
    - IST Dvete treti se zakrãgļat nagore: sedem ot desette členove na delegacijata, 167 ot 250-te delegati. Mnozinstvoto ot četirinadesette členove na sãglasitelnata komisija e osem.
11. **French working text. The versions in the three regional standards are equally authentic (Art. 151).** —
    livrer ; termes de l'art. 151 de chaque standard.
    - ZAP Francosko delovno besedilo. Različice v treh regionalnih standardih so enako verodostojne (čl. 151).
    - SRE Francuski radni tekst. Verzije u tri regionalna standarda jednako su autentične (čl. 151).
    - IST Raboten tekst na frenski. Versiite na trite regionalni standarta sa ednakvo avtentični (čl. 151).

Au središñi, doublets serbe / croate évités : zavisi/ovisi, modelovana/modelirana, ponderisan/ponderiran, ko/tko,
kombinuju/kombiniraju, naviše/nagore.
