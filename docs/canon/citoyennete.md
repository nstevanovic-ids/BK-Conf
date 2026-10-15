# Citoyenneté confédérale — parcours d'inscription et carte citoyenne

Canon en vigueur du parcours `#/register` et de la carte `#/citizen` du portail.
Décisions : ADR `docs/decisions/2026-10-15-parcours-citoyennete.md` (parcours, carte) et
`docs/decisions/2026-10-15-registre-confederal.md` (registre, e-mail, décompte, dessin).

## Principe

- La citoyenneté confédérale est **déclarative** : on la demande en ligne, elle prend effet
  à la délivrance de la carte citoyenne (Préambule : « une maison où l'on entre par choix »).
- La carte est délivrée après **confirmation de l'adresse e-mail** (double opt-in) et
  envoyée à cette adresse ; une adresse = un citoyen.
- Inscription en ligne ouverte à partir de **18 ans**, âge du vote (art. 104). Les mineurs
  sont hors du parcours actuel.
- Trois choix **indépendants** : l'État de rattachement, le registre national, le standard
  linguistique du document.

## Parcours en cinq étapes

| Étape | Contenu | Règle |
|---|---|---|
| 1. Identité | Nom, prénoms, adresse e-mail, sexe (F/M), date de naissance | Nom saisi en cyrillique : translittéré en latin v3 ; nom saisi en latin : conservé tel quel |
| 2. État de rattachement | Base, commune, résidence | Déterminé par la commune ; aucun libre choix |
| 3. Registre national | Sept peuples ou aucun ; impression de la narodnost | Art. 102 : personnel, volontaire, modifiable |
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
  `scripts/build_stats.py` : 1 461 entrées `[nom du recensement, ISO, code d'État, nom GADM
  si différent]`. Il couvre les communes des 45 États territoriaux, les gradske opštine de
  Beograd, Stolichna (Sofija), les neuf communes de Sarajevo, Zagreb et le Turopolje, Brčko
  et Mostar.
- **Brčko (BK-95) et Mostar (MO-96)** ne sont pas des États : on peut s'y rattacher, mais
  leur circonscription pour le Kongres reste à fixer par la loi confédérale.

## Registre national

- Sept registres (art. 102) ou aucun. Inscrit : vote au Kongres dans son État et au
  Narodni Sabor dans la circonscription unique de son peuple (art. 108). Non inscrit : tous
  les droits civiques, Kongres et référendums, pas de vote au Narodni Sabor.
- Le registre est **indépendant de l'État** de rattachement.
- La **narodnost** n'est imprimée sur la carte que si le titulaire le souhaite (case cochée
  par défaut, décochable : la carte affiche alors un tiret). Elle n'est **jamais** écrite
  dans la zone de lecture automatique.
- Le registre national est tenu **séparément** du registre des citoyens et ne sert qu'à
  l'élection du Narodni Sabor (cohérent avec l'art. 145 a).
- Formes genrées : `docs/canon/peuples.md` (Srbin / Srpkinja, Bošñak / Bošñakinja,
  Bãlgarin / Bãlgarka…).

## Langue du document

- La langue est un **attribut du document**, jamais du titulaire : il n'y a pas de champ
  langue sur la carte, et le standard n'est pas enregistré comme caractéristique personnelle.
- Valeur par défaut : standard du peuple choisi, sinon standard du peuple de l'État.
- Chaque libellé est imprimé dans le standard choisi, suivi de l'anglais.

| Champ | Occidental | Central | Oriental | Anglais |
|---|---|---|---|---|
| Titre | Državljanska izkaznica | Državljanska karta | Graždanska karta | Citizen card |
| Nom | Priimek | Prezime | Familija | Surname |
| Prénoms | Ime | Ime | Ime | Given names |
| Sexe | Spol | Pol | Pol | Sex |
| Date de naissance | Datum rojstva | Datum rođenja | Data na raždane | Date of birth |
| Narodnost | Narodnost | Narodnost | Narodnost | Nation |
| État | Država | Država | Dãržava | State |
| Numéro | Številka | Broj | Nomer | Card no. |
| Expiration | Velja do | Važi do | Validna do | Date of expiry |
| Délivrance | Datum izdaje | Datum izdavanja | Data na izdavane | Date of issue |
| Commune d'origine | Domovinska občina | Opština porěkla | Obština na proizhod | Municipality of origin |
| Autorité | Izdajatelj | Izdavač | Izdatel | Authority |

Libellés **provisoires**, à valider dans le workstream Alphabet. Le central exploite le
yat (*porěklo* unifie *poreklo / porijeklo*) et la forme *opština* des noms officiels
(Samostalna Opština).

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
  micro-impression de la devise ; autorité et date de délivrance en pied.
- **Verso** : en-tête réduit et numéro ; commune d'origine, date de délivrance, autorité ;
  drapeau de l'État, drapeau confédéral et devise ; zone de lecture automatique sur fond
  éclairci.
- Libellés en romain, l'anglais en italique ; valeurs en graisse moyenne. La police Zurich
  est embarquée dans l'export PNG.
- **Autorité** : *Konfederalni registar državljana · Zagreb*, tenu par le département de la
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

- **Registre confédéral** (`registre/`, Cloudflare Workers + D1 en juridiction UE, e-mails
  Brevo, Turnstile) : registre des citoyens (identité, adresse, commune, État, carte) et
  registre national tenus dans des tables distinctes ; le standard est une propriété de la
  carte.
- Le registre national révèle potentiellement l'origine nationale (RGPD art. 9) :
  consentement explicite distinct, retirable en choisissant « aucun registre ».
- Inscriptions non confirmées supprimées après 7 jours ; suppression par le titulaire
  immédiate et définitive ; statistiques publiques en totaux uniquement (par État, par
  registre, série quotidienne).
- Jetons de 256 bits dans le fragment d'URL, stockés sous forme d'empreinte poivrée ;
  aucun mot de passe. Sécurité détaillée : ADR 2026-10-15-registre-confederal.md.
- **Mode prototype** : tant que `portail/data/registre.json` n'a pas d'`api`, la carte
  reste dans le navigateur (`localStorage`, clé `bk-citizen`) avec un numéro provisoire.

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
- `workflow.renewable = true` : un changement de registre (art. 102) met à jour
  l'autorisation.
- À l'ouverture, le registre attribue les numéros définitifs et ré-émet les cartes
  provisoires.
