# Balkanska Konfederacija — Projet de fédération sud-slave

Projet créatif et intellectuel : conception complète d'une confédération balkanique
fictive (droit constitutionnel, design territorial, héraldique, linguistique,
infrastructure numérique). Haute exigence de cohérence interne.

## Langue de travail
- Discussions et documentation interne : **français**
- Livrables publics (portail, constitution publiée) : **anglais** (« le latin du XXIe siècle »)
- Rédaction : **générique masculin**, jamais d'écriture inclusive
- Termes de nationalité genrés en sud-slave (Crnogorka/Crnogorac, Srpkinja/Srbin)

## Distinction de nommage critique
- Entité fédérale = **Balkan** (géographique, inclut les communautés autonomes
  non-sud-slaves : albanaise, hongroise, turque, slovaque)
- **Sud-slave / južnoslovenski** décrit UNIQUEMENT : la langue (*južnoslovenski jezik*),
  l'alphabet unifié, et les 7 peuples constitutifs — JAMAIS la confédération
- Le projet est sud-slave **+ balkanique**, explicitement PAS pan-slave

## Composition (source : docs/canon/etats.md)
- **49 États** : 45 territoriaux + 4 villes-États + 2 municipalités fédérales
  (cf. ADR docs/decisions/2026-06-28-trois-etats-lv-so-vb.md ; codes renumérotés
  alphabétiquement le 2026-06-28, ADR …-renumerotation-alphabetique.md ;
  Sredña Bosna supprimé, ADR …-suppression-srednja-bosna.md)
- 7 peuples constitutifs : Slovenci, Hrvati, Srbi, Bošnjaci, Crnogorci, Makedonci, Bãlgari
- 4 capitales : Sarajevo (politique), Beograd (économique), Zagreb (judiciaire),
  Sofia (défense + sciences)
- 4 institutions fédérales : Kongres, Narodni Sabor, Savezno Veće, Ustavni Sud
- 25 entités autonomes (docs/canon/entites-autonomes.md)

## Symboles (docs/canon/couleurs-symboles.md)
- Emblème confédéral unique : **lion ailé d'or** (héraldiquement neutre entre les 7 peuples)
- Drapeau confédéral : tricolore pur, sans canton
- Soleil à 7 rais réservé au sceau
- Couleurs : #99402F gueules · #374078 azur · #FFFFFF argent · #DFCC68 or
- INTERDIT : étoile/mullet à 5 branches (associations SFRJ petokraka proscrites)

## Alphabet sud-slave v3 (docs/alfabet/v3.md)
- **32 lettres** (7 voyelles + 25 consonnes), base gajica + traits aréaux balkaniques
- ě restauré (jat' illyrien), ñ pour /ɲ/, ļ pour /ʎ/, ã schwa bulgare
- ç éliminé (réservé aux noms propres albanais/turcs)
- Règle toponymique v3 : њ→ñ, љ→ļ, sinon latin inchangé. Beograd = exception déclarée.

## Workstreams (jamais mélanger dans une même session)
- Constitution → docs/constitution/
- Alphabet → docs/alfabet/
- Portail SPA → portail/
- Symboles confédéraux (lynx, lettre-emblème glagolitique/bosančica) → en attente
- Cartes GADM → scripts/gen_geo.py (contours d'États + fond de carte → geo.json)

## Architecture du portail
- `portail/index.html` = template (HTML + CSS + JS de rendu)
- `portail/data/*.json` = source de vérité des données (etats, peuples,
  entites-autonomes, alfabet, flagnotes, state_flags)
- `scripts/build_portail.py` = injecte data + drapeaux dans le template → build final
- Ne JAMAIS éditer les données à la main dans le HTML : éditer le JSON, puis rebuild

## Pipeline drapeaux
- Sources brutes : `images-sources/drapeaux/` (jamais modifiées)
- `scripts/encode_drapeaux.py` → PNG palette base64 (max 400px, 64 couleurs,
  Floyd-Steinberg) → `portail/data/state_flags.json`
- SVG → cairosvg → PNG avant encodage. WebP s'ouvre directement avec PIL.
- **Le nom de fichier n'est PAS la source de vérité** : l'ordre d'upload suit
  l'ordre alphabétique des codes d'État. Toujours vérifier visuellement le contenu.

## Règles d'or (irrévocables sans ADR dans docs/decisions/)
- Aucun État ne porte le nom d'une ville (sauf les 4 villes-États)
- Renumérotation des codes strictement alphabétique
- Décisions gelées propagées partout, immédiatement et de façon cohérente
- Précision historique : revendications dynastiques exactes
  (ex. Tvrtko I Kotromanić = serbe, couronné à Mileševa)
- Proportionnalité démographique : ratio État/peuple surveillé (HHI ≈ 0.034)

## Ne pas faire
- Ne pas réintroduire « Herceg Bosna » (renommé Zapadna Hercegovina, code HZ-14)
- Ne pas confondre identité « Balkan » et identité linguistique « sud-slave »
- Ne pas proposer d'étoile rouge à 5 branches
- Ne pas appliquer l'écriture inclusive
- Ne pas poser de question de clarification une fois les principes validés :
  proposer une solution et rédiger entièrement

## Style d'interaction
- Décisions rapides et définitives de l'utilisateur ; proposer puis rédiger,
  ne pas multiplier les questions
- Une fois une décision confirmée, la traiter comme verrouillée
