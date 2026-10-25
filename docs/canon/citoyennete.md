# Citoyenneté confédérale — parcours d'inscription et carte citoyenne

Canon en vigueur du parcours `#/register` et de la carte `#/citizen` du portail.
Décisions : ADR `docs/decisions/2026-10-15-parcours-citoyennete.md` (parcours, carte),
`docs/decisions/2026-10-15-registre-confederal.md` (registre, e-mail, décompte, dessin),
`docs/decisions/2026-10-22-verrou-registre-national.md` (verrou des registres) et
`docs/decisions/2026-10-25-registre-phase-0.md` (reprise du registre, première étape).
Base constitutionnelle : art. 37 à 40 de la Constitution v4.1 (citoyenneté, rattachement,
droits politiques, citoyens établis à l'étranger), qui reprennent le projet d'article 102 bis.

## Principe

- La citoyenneté confédérale est **déclarative** : on la demande en ligne, elle prend effet
  à la délivrance de la carte citoyenne (Préambule : « une maison où l'on entre par choix »).
- La carte est délivrée après **confirmation de l'adresse e-mail** (double opt-in) et
  envoyée à cette adresse ; une adresse = un citoyen.
- Inscription en ligne ouverte à partir de **18 ans**, âge du vote (art. 104). Un mineur est
  déclaré par un parent titulaire d'une carte (section « Mineurs »).
- Trois choix **indépendants** : l'État de rattachement, le registre national, le standard
  linguistique du document.

## Parcours en cinq étapes

| Étape | Contenu | Règle |
|---|---|---|
| 1. Identité | Nom, prénoms, adresse e-mail, sexe (F/M), date de naissance | Nom saisi en cyrillique : translittéré en latin v3 ; nom saisi en latin : conservé tel quel |
| 2. État de rattachement | Base, commune, résidence | Déterminé par la commune ; aucun libre choix |
| 3. Registre national | Sept peuples ou aucun ; impression de la narodnost | Art. 102 : personnel, volontaire ; rectification unique pendant 3 ans ; sinon autre registre après 15 ans ; retrait libre ; effet différé |
| 4. Langue du document | Standard occidental, central ou oriental | Attribut du document, pas du titulaire |
| 5. Déclaration | Récapitulatif, déclaration d'adhésion libre, consentements, envoi | Déclaration et consentement au traitement obligatoires ; consentement explicite au registre national s'il y en a un |

## État de rattachement

Trois bases, dans cet ordre :

1. **Commune d'origine propre** : commune de naissance ou commune d'origine enregistrée de
   la famille (sur le modèle du lieu d'origine suisse).
2. **Commune d'origine d'un parent ou d'un grand-parent** : diaspora, jusqu'à la deuxième
   génération.
3. **Commune de résidence** dans la Confédération : résidents sans origine sur le territoire.
   Cette base exige de résider dans la Confédération.

- L'État n'est **jamais choisi librement** : cela empêche le rattachement stratégique aux
  petits États (plancher de deux délégués au Kongres, une voix par État dans la double
  majorité).
- Résidence déclarée : dans la Confédération ou à l'étranger. Le citoyen établi à
  l'étranger vote dans son État de rattachement.
- L'index des communes est `portail/data/opstine.json`, généré par
  `scripts/build_stats.py` : 1 461 entrées `[nom v3, ISO, code d'État, nom du recensement ou
  "" s'il est identique, nom GADM si différent]`. Le nom affiché et imprimé sur la carte est
  la forme v3 (`scripts/toponymie_v3.py`, ADR 2026-10-25-toponymie-v3-option-1.md) ; les noms
  officiels restent cherchables. Il couvre les communes des 45 États territoriaux, les
  gradske opštine de Beograd, Stolična (Sofija), les neuf communes de Sarajevo, Zagreb et le
  Turopoļe, Brčko et Mostar.
- **Brčko (BK-95) et Mostar (MO-96)** ne sont pas des États : on peut s'y rattacher, et
  chacune forme sa propre circonscription pour le Kongres, avec au moins un délégué
  (art. 39 et 103, v4.4).

## Mineurs

Décision : ADR `docs/decisions/2026-10-25-mineurs.md` (art. 38 a, rattachement des mineurs par
filiation et par adoption).

- **Déclaration** : un parent ou un représentant légal (filiation ou adoption) **titulaire
  d'une carte** déclare son enfant de moins de 18 ans, depuis sa propre carte (`#/citizen`,
  « Declare a child » ; route `#/minor`). La déclaration du parent tient lieu de celle de
  l'enfant (art. 37).
- **Rattachement par filiation** : l'enfant prend la commune d'origine et l'État du parent
  déclarant ; c'est le parent qui déclare qui fixe le rattachement, jamais un libre choix.
  Base `filiation`. Quand le parent change d'État, l'amendement suivant de la carte de
  l'enfant le suit, avec un nouveau numéro.
- **Pas de registre national avant 18 ans** (art. 102) : narodnost « — » ; pas de droits
  politiques (art. 104).
- **Carte** : même dessin et même zone de lecture automatique ; numéro dans la séquence de
  l'État ; validité **cinq ans** ; langue choisie par le parent (par défaut, celle de sa
  carte).
- **Gestion** : le parent amende ou supprime la carte ; au plus douze enfants par carte. La
  suppression de la carte du parent emporte celles des enfants qu'il a déclarés.
- **Passation à 18 ans** : le parent indique l'adresse e-mail du jeune majeur, qui la
  confirme. La carte garde son numéro ; le jeune citoyen la gère seul, le parent n'y a plus
  accès. La base `filiation` devient `ancestry` (commune d'un parent), ou `residence` si le
  parent était rattaché par sa résidence. Il peut alors s'inscrire à un registre national :
  c'est une première inscription, probatoire.
- **Prototype** : les cartes des enfants sont gardées dans l'enregistrement du parent
  (`minors`) ; à 18 ans, le jeune s'inscrit lui-même dans son navigateur, en attendant
  l'ouverture du registre.

## Registre national

- Sept registres (art. 102) ou aucun. Inscrit : vote au Kongres dans son État et au
  Narodni Sabor dans la circonscription unique de son peuple (art. 108). Non inscrit : tous
  les droits civiques, Kongres et référendums, pas de vote au Narodni Sabor.
- Le registre est **indépendant de l'État** de rattachement.
- **Période probatoire et verrou** (art. 102) :
  - inscription ouverte à 18 ans révolus ;
  - une **première** inscription est probatoire pendant **trois ans** : elle peut être
    rectifiée une fois au profit d'un autre registre ; le verrou court alors à compter de la
    rectification ;
  - hors de ce cas, inscription à un **autre** registre seulement **quinze ans** après la
    précédente inscription ;
  - **retrait libre**, mais il n'abrège pas le verrou ; un retrait pendant la période
    probatoire n'éteint pas la rectification ;
  - le retour au registre quitté est possible à tout moment ; il ne relance pas le verrou,
    mais l'effet différé s'y applique.
- **Effet différé** : une inscription ou un changement de registre ne vaut, pour le vote et
  l'éligibilité au Narodni Sabor, qu'à la première élection tenue plus d'un an après la
  demande.
- **Éligibilité** : seuls les inscrits sont éligibles à la délégation de leur peuple
  (art. 108) ; candidats au Konfederalno Veće et au Ustavni Sud : huit ans d'inscription au
  registre du peuple (art. 112 et 117).
- La **narodnost** n'est imprimée sur la carte que si le titulaire le souhaite (case cochée
  par défaut, décochable : la carte affiche alors un tiret). Elle n'est **jamais** écrite
  dans la zone de lecture automatique.
- Le registre national est tenu **séparément** du registre des citoyens et ne sert qu'à
  l'élection du Narodni Sabor (cohérent avec l'art. 145 a).
- Formes genrées : `docs/canon/peuples.md` (Srbin / Srpkiña, Bošñak / Bošñakiña,
  Bãlgarin / Bãlgarka…).

## Langue du document

- La langue est un **attribut du document**, jamais du titulaire : il n'y a pas de champ
  langue sur la carte, et le standard n'est pas enregistré comme caractéristique personnelle.
- Valeur par défaut : standard du peuple choisi, sinon standard du peuple de l'État.
- Chaque libellé est imprimé dans le standard choisi, suivi de l'anglais.

| Champ | Occidental | Central | Oriental | Anglais |
|---|---|---|---|---|
| Titre | Državļanska izkaznica | Državļanska karta | Graždanska karta | Citizen card |
| Nom | Priimek | Prezime | Familija | Surname |
| Prénoms | Ime | Ime | Ime | Given names |
| Sexe | Spol | Pol | Pol | Sex |
| Date de naissance | Datum rojstva | Datum rođeña | Data na raždane | Date of birth |
| Narodnost | Narodnost | Narodnost | Narodnost | Nation |
| État | Država | Država | Dãržava | State |
| Numéro | Številka | Broj | Nomer | Card no. |
| Expiration | Veļa do | Važi do | Validna do | Date of expiry |
| Délivrance | Datum izdaje | Datum izdavaña | Data na izdavane | Date of issue |
| Commune d'origine | Domovinska občina | Opština porěkla | Obština na proizhod | Municipality of origin |
| Autorité | Izdajateļ | Izdavač | Izdadena ot | Authority |

Libellés **validés** le 2026-10-24 (workstream Alphabet, ADR
2026-10-24-alphabet-transition-libelles.md). L'oriental *Izdadena ot* remplace *Izdatel* :
c'est la formule des cartes d'identité bulgares (*издадена от*) et macédoniennes (*издадена
од*), accordée au nom de la carte. Le central exploite le yat (*porěklo* unifie *poreklo /
porijeklo*) et la forme *opština* des noms officiels (Samostalna Opština).

Graphie v3 (2026-10-25, ADR 2026-10-25-alphabet-v3-mots-courants.md) : ñ et ļ s'appliquent aux
libellés comme aux noms (*Državļanska*, *rođeña*, *izdavaña*, *Veļa do*, *Izdajateļ*).

## Carte citoyenne

- Format **ID-1** (85,6 × 54 mm), zone de lecture automatique **ICAO 9303 TD1**.
- Numéro **BK-XX-NNNNNN** : XX = lettres de l'État de rattachement (LK, SU, BK…), NNNNNN =
  séquence par État attribuée par le registre à la confirmation (`BK-SU-000001`), jamais
  réattribuée.
- Changement d'État de rattachement : nouveau numéro, l'ancien est retiré. Autre
  amendement : même numéro, nouvelle émission de carte.
- Validité : **10 ans** (29 février → 28 février).
- **Dessin** (registre CNI 2021 / carte suisse 2023) : fond de sécurité pâle, ivoire rosé
  vers azur clair ; guilloches fines azur et or ; rosace et lion en filigrane ; aucun
  bandeau de couleur. Couleur réservée au filet or, au numéro (gueules) et au sceau irisé.
- **Recto** : lion or vieilli, *BALKANSKA KONFEDERACIJA* / *BALKAN CONFEDERATION* en
  capitales espacées, titre du document dans le standard choisi et « Citizen card » en
  italique ; filet or à losange ; panneau du lion avec le code BKC ; nom, prénoms, sexe
  (Ž / F, M / M), date de naissance, narodnost ou tiret ; numéro, expiration, État et code ;
  sceau optiquement variable (lion ailé sur soleil à sept rais, usage de sceau) ;
  micro-impression de la devise *Naš dom · Our home* ; autorité et date de délivrance en pied.
- **Verso** : en-tête réduit et numéro ; commune d'origine, date de délivrance, autorité ;
  drapeau de l'État, drapeau confédéral et devise *Naš dom* ; pour les cartes du registre, **QR de
  vérification** (`#/verify/<numéro>.<émission>`) ; zone de lecture automatique sur fond
  éclairci.
- Libellés en romain, l'anglais en italique ; valeurs en graisse moyenne. La carte est
  composée en Arimo (ADR 2026-10-23-typographie.md), embarquée dans l'export PNG.
- **Autorité** : *Konfederalni registar državļana · Zagreb*, tenu par le département de la
  Justice et des droits fondamentaux (art. 114 d, siège Zagreb).

### Zone de lecture automatique (TD1, 3 × 30 caractères)

| Ligne | Positions | Contenu |
|---|---|---|
| 1 | 1-2 | `ID` |
| 1 | 3-5 | État émetteur `BKC` |
| 1 | 6-14 | Numéro de document : lettres d'État + six chiffres + `<` (ex. `SU004217<`) |
| 1 | 15 | Clé du numéro |
| 1 | 16-30 | Données facultatives : vides |
| 2 | 1-7 | Date de naissance AAMMJJ + clé |
| 2 | 8 | Sexe `F` / `M` |
| 2 | 9-15 | Date d'expiration AAMMJJ + clé |
| 2 | 16-18 | Nationalité `BKC` |
| 2 | 19-29 | Données facultatives : vides |
| 2 | 30 | Clé composite |
| 3 | 1-30 | `NOM<<PRENOMS` |

- **BKC** : code de pays hors ISO 3166-1 (BK de la plaque minéralogique, C de confédération).
- Clés de contrôle ICAO (pondérations 7-3-1), vérifiées sur le spécimen ICAO 9303.

### Translittération

- **Cyrillique saisi → latin v3** : њ → ñ, љ → ļ, џ et дж → x, ъ → ã, ѓ → đ, ќ → ć, ѕ → dz,
  щ → št, ю → ju, я → ja, й et ј → j, ь → j ; autres lettres selon la gajica.
- **Latin saisi** : conservé tel quel (un nom ne se réécrit pas : *Džeko* reste *Džeko*).
- **Zone de lecture automatique** (ICAO 9303, partie 3) : diacritiques supprimés (č ć → C,
  š → S, ž → Z, đ → D, ñ → N, ļ → L, ã → A, ě → E) ; Ä Ö Ü → AE OE UE ; espaces et traits
  d'union → `<` ; apostrophes supprimées ; troncature à 30 caractères.

## Données

- **Registre confédéral, phase 0** (`registre/`, Cloudflare Workers + D1 en juridiction UE,
  e-mails Brevo, Turnstile ; ADR 2026-10-25-registre-phase-0.md) : registre des citoyens
  (identité, adresse, commune, État, carte) et registre national tenus dans des tables
  distinctes ; le standard est une propriété de la carte. Il précède la plateforme Decidim,
  qui le consultera (section « Plateforme participative »).
- Le registre national révèle potentiellement l'origine nationale (RGPD art. 9) :
  consentement explicite distinct, retirable en choisissant « aucun registre ».
- **Art. 102 appliqué par le serveur**, comme dans le prototype : la table du registre
  national porte le registre en cours (vide après un retrait), la date d'inscription
  (départ du verrou), la fin de la période probatoire et la date d'effet. Après un retrait,
  le dernier registre n'est conservé que sous forme d'empreinte poivrée, pour appliquer le
  verrou ; tout est effacé avec le compte.
- Inscriptions non confirmées supprimées après 7 jours ; suppression par le titulaire
  immédiate et définitive ; statistiques publiques en totaux uniquement (par État, par
  registre, série quotidienne).
- Jetons de 256 bits dans le fragment d'URL, stockés sous forme d'empreinte poivrée ;
  aucun mot de passe. Sécurité détaillée : ADR 2026-10-15-registre-confederal.md.
- **Mode prototype** : tant que `portail/data/registre.json` n'a pas d'`api`, la carte
  reste dans le navigateur (`localStorage`, clé `bk-citizen`) avec un numéro provisoire
  (hachage FNV-1a).
- **Registre dans la carte** : `reg = {p, since, prob, eff}`, conservé après un retrait :
  - `p` : dernier registre ;
  - `since` : date d'inscription, point de départ du verrou ;
  - `prob` : fin de la période probatoire, `null` après une rectification ou pour une
    inscription ultérieure ;
  - `eff` : date après laquelle l'inscription compte pour le Narodni Sabor.

  Le parcours accepte un autre registre avant `prob`, puis le refuse jusqu'à `since` +
  15 ans. Une carte antérieure sans `reg` est réputée inscrite pour la première fois à sa
  date d'émission.
- **Tenue** : registre des citoyens tenu par le département de la Justice à Zagreb, et
  registres nationaux tenus séparément par la Chancellerie confédérale à Sarajevo (art. 115
  bis, v4.4), qui en publie chaque année les flux (inscriptions, rectifications,
  changements, retraits) et le total au 1er janvier (double clé, v4.9).

## Wallet et vérification

- **Google Wallet** : pass générique depuis `#/citizen` (nom, numéro, État, validité, QR) ;
  jamais la date de naissance ni la narodnost. Mis à jour à l'amendement, invalidé et vidé
  à la suppression. Apple Wallet différé (compte Apple Developer requis).
- **Vérification publique** (`#/verify`, `GET /v1/verify/…`) : valide, remplacée,
  expirée, annulée, inconnue ; aucune donnée personnelle.

## Plateforme participative (Decidim)

- Le portail statique (GitHub Pages) reste la porte d'entrée ; Decidim porte les comptes,
  consultations, propositions et votes.
- **Vérification** : workflow direct `bk_citizenship` (`Decidim::Verifications.register_workflow`),
  formulaire `BkCitizenshipAuthorizationHandler` (sous-classe de `Decidim::AuthorizationHandler`)
  qui contrôle numéro de carte et date de naissance auprès du registre.
  `unique_id` = empreinte du numéro (une carte, un compte) ; `metadata` = État de
  rattachement, registre national, résidence.
- **Périmètres** : types « État » (49) et « Municipalité confédérale » (2) ; chaque espace
  d'État est rattaché à son périmètre.
- **Permissions** : options du workflow (`state`, `register`) comparées aux `metadata` par un
  `ActionAuthorizer` dérivé de `Decidim::Verifications::DefaultActionAuthorizer` ; une
  assemblée par délégation nationale du Narodni Sabor, ouverte au vote des seuls inscrits
  au registre correspondant ; référendums d'État ouverts aux seuls rattachés.
- `workflow.renewable = true` : un amendement de la carte met à jour l'autorisation. Le
  registre national n'y change que dans les conditions de l'art. 102 : rectification unique
  pendant les trois ans d'une première inscription, sinon autre registre quinze ans après la
  précédente inscription ; retrait libre. `metadata` porte la date
  d'inscription et la date d'effet ; l'accès à l'assemblée d'une délégation ne vaut qu'à
  partir de la date d'effet.
- À l'ouverture, le registre attribue les numéros définitifs et ré-émet les cartes
  provisoires.
