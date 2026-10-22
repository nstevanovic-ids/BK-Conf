# Citoyenneté confédérale — parcours d'inscription et carte citoyenne

Canon en vigueur du parcours `#/register` et de la carte `#/citizen` du portail.
Décisions : ADR `docs/decisions/2026-10-15-parcours-citoyennete.md` et
`docs/decisions/2026-10-22-verrou-registre-national.md` (verrou des registres).
Base constitutionnelle : art. 37 à 40 de la Constitution v4.1 (citoyenneté, rattachement,
droits politiques, citoyens établis à l'étranger), qui reprennent le projet d'article 102 bis.

## Principe

- La citoyenneté confédérale est **déclarative** : on la demande en ligne, elle prend effet
  à la délivrance de la carte citoyenne (Préambule : « une maison où l'on entre par choix »).
- Inscription en ligne ouverte à partir de **18 ans**, âge du vote (art. 104). Les mineurs
  sont hors du parcours actuel.
- Trois choix **indépendants** : l'État de rattachement, le registre national, le standard
  linguistique du document.

## Parcours en cinq étapes

| Étape | Contenu | Règle |
|---|---|---|
| 1. Identité | Nom, prénoms, sexe (F/M), date de naissance | Nom saisi en cyrillique : translittéré en latin v3 ; nom saisi en latin : conservé tel quel |
| 2. État de rattachement | Base, commune, résidence | Déterminé par la commune ; aucun libre choix |
| 3. Registre national | Sept peuples ou aucun ; impression de la narodnost | Art. 102 : personnel, volontaire ; rectification unique pendant 3 ans ; sinon autre registre après 15 ans ; retrait libre ; effet différé |
| 4. Langue du document | Standard occidental, central ou oriental | Attribut du document, pas du titulaire |
| 5. Déclaration | Récapitulatif, déclaration d'adhésion libre, délivrance | Déclaration obligatoire |

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
- **Brčko (BK-95) et Mostar (MO-96)** ne sont pas des États : on peut s'y rattacher, et
  chacune forme sa propre circonscription pour le Kongres, avec au moins un délégué
  (art. 39 et 103, v4.4).

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
  séquence par État attribuée par le registre, jamais réattribuée.
- Changement d'État de rattachement : nouveau numéro, l'ancien est retiré. Autre
  amendement : même numéro, nouvelle émission de carte.
- Validité : **10 ans** (29 février → 28 février).
- **Recto** : en-tête Balkanska Konfederacija / Balkan Confederation, titre dans le
  standard choisi ; lion ailé et code BKC ; nom, prénoms, sexe (Ž / F, M / M), date de
  naissance, narodnost ou tiret ; numéro (rouge confédéral), expiration, État et code ;
  sceau optiquement variable (lion ailé sur soleil à sept rais, usage de sceau) ;
  micro-impression de la devise ; autorité.
- **Verso** : commune d'origine, date de délivrance, autorité, drapeau de l'État, drapeau
  confédéral et devise ; zone de lecture automatique.
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

- **Prototype** : l'enregistrement reste dans le navigateur (`localStorage`, clé
  `bk-citizen`), sans transmission ; le numéro est provisoire (hachage FNV-1a).
- **Registre dans le prototype** : la carte porte `reg = {p, since, prob, eff}`, conservé
  après un retrait :
  - `p` : dernier registre ;
  - `since` : date d'inscription, point de départ du verrou ;
  - `prob` : fin de la période probatoire, `null` après une rectification ou pour une
    inscription ultérieure ;
  - `eff` : date après laquelle l'inscription compte pour le Narodni Sabor.

  Le parcours accepte un autre registre avant `prob`, puis le refuse jusqu'à `since` +
  15 ans. Une carte antérieure sans `reg` est réputée inscrite pour la première fois à sa
  date d'émission.
- **Cible** : registre des citoyens (identité, commune, État), tenu par le département de la
  Justice à Zagreb, et registres nationaux tenus séparément par la Chancellerie confédérale à
  Sarajevo (art. 115 bis, v4.4), qui en publie chaque année les flux (inscriptions,
  rectifications, changements, retraits) ; le standard est une propriété de la carte.

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
