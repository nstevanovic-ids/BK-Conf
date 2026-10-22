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
- 7 peuples constitutifs : Slovenci, Hrvati, Srbi, Bošñaci, Crnogorci, Makedonci, Bãlgari
- 4 capitales : Sarajevo (politique), Beograd (économique), Zagreb (judiciaire),
  Sofija (défense + sciences)
- 4 institutions confédérales : Kongres, Narodni Sabor, Konfederalno Veće, Ustavni Sud
  (*Savezno Veće* abandonné : *savezni* = échelon fédéral yougoslave ;
  cf. ADR docs/decisions/2026-10-13-constitution-v4.md)
- Autres organes (v4.4) : Chancellerie confédérale (Sarajevo), Cour confédérale de justice et
  Parquet confédéral (Zagreb), Banque centrale (Beograd), Cour des comptes (Ljubljana),
  Institut confédéral de la langue (Ohrid), Bibliothèque et Archives (Cetinje), Conseil des
  communautés (albanaise, hongroise, slovaque, turque), Konfederalna Obavěštajna Agencija
  (renseignement, Sarajevo, sans pouvoir de police) ; coalitions d'États (initiative,
  référendum) : la moitié au plus d'un même peuple ; cf. ADR
  docs/decisions/2026-10-22-constitution-v4-4-institutions.md
- 24 entités autonomes (docs/canon/entites-autonomes.md)

## Symboles (docs/canon/couleurs-symboles.md)
- Emblème confédéral unique : **lion ailé d'or** (héraldiquement neutre entre les 7 peuples)
- Drapeau confédéral : tricolore pur, sans canton
- Soleil à 7 rais réservé au sceau
- Devise confédérale : **Naš dom** (Notre maison / Our home), identique dans les trois
  standards ; cf. ADR docs/decisions/2026-10-15-devise-nas-dom.md
- Couleurs : #99402F gueules · #374078 azur · #FFFFFF argent · #DFCC68 or
- INTERDIT : étoile/mullet à 5 branches (associations SFRJ petokraka proscrites)

## Routes (docs/canon/routes.md, constitution art. 91 bis)
- Route confédérale `Bk-N` (touche ≥ 2 États ; toutes les routes de Brčko et Mostar),
  nom « Route de [A]–[B] » ; Bk-1 à 9 = grands axes entre capitales, Bk-10+ = secondaire
- Route étatique `Xx-N` (2e lettre en minuscule : `Da-1` ≠ État `DA-09`), nom « Route de
  [ville] », compteur par État ; jamais de zéro initial (tri numérique à l'affichage)

## Alphabet sud-slave v3 (docs/alfabet/v3.md)
- **32 lettres** (7 voyelles + 25 consonnes), base gajica + traits aréaux balkaniques
- ě restauré (jat' illyrien), ñ pour /ɲ/, ļ pour /ʎ/, ã schwa bulgare
- ç éliminé (réservé aux noms propres albanais/turcs)
- Règle toponymique v3 : њ→ñ, љ→ļ, sinon latin inchangé. Beograd = exception déclarée.

## Workstreams (jamais mélanger dans une même session)
- Constitution → docs/constitution/ (texte de travail en vigueur : **v4.md**, français ;
  texte publié : **v4.en.md**, anglais ; v1 et v2 archivées). Toute modification de
  fond se fait dans les deux fichiers, puis `python scripts/build_constitution.py`
  régénère `portail/data/constitution.json` (lecteur #/constitution du portail).
  Version 4.5 : texte intégral, 170 articles. Titres 1 à 3 (texte de base, art. 1 à 99,
  dont le chapitre « Compétences » 55 à 99, avec sections `#### Section N / Nom`), titres
  1 bis et 4 à 7 (art. 1 bis à 146, articles « bis » insérés sans renumérotation) ; cf. ADR
  2026-10-17-constitution-titres-1-3.md, 2026-10-17-constitution-competences.md et
  2026-10-22-constitution-v4-4-institutions.md ; sécurité et défense (titre 7, art. 61 bis),
  cf. ADR 2026-10-22-securite-defense-v4-5.md ; registres nationaux : période probatoire de
  trois ans, verrou de quinze ans (art. 102), cf. ADR 2026-10-22-verrou-registre-national.md
- Alphabet → docs/alfabet/
- Portail SPA → portail/
- Symboles confédéraux (lynx, lettre-emblème glagolitique/bosančica) → en attente
- Cartes GADM → scripts/raccord_contours.py (raccorde les contours sources : doublons,
  recouvrements, trous ; villes-États = trou laissé par leurs voisins) puis
  scripts/gen_geo.py (couverture unique coverage_clean + coverage_simplify → geo.json v2
  en lon/lat pour d3-geo, échoue s'il reste un trou ou un recouvrement) ;
  cf. ADR 2026-10-14-raccord-carte.md et 2026-10-14-carte-globe.md

## Branche de référence
- **`main`** est la seule branche publiée (GitHub Pages, `.github/workflows/pages.yml`).
  Tout travail part de `main` dans une branche `claude/…`, puis revient par PR sur `main`.
- `claude/jolly-fermi-wkwak0` (ancienne branche de déploiement) est alignée sur `main`
  le 2026-10-15 et n'est plus publiée.

## Architecture du portail
- `portail/index.html` = template (HTML + CSS + JS de rendu)
- `portail/data/*.json` = source de vérité des données (etats, peuples,
  entites-autonomes, alfabet, flagnotes, state_flags) ; `constitution.json` est
  généré depuis docs/constitution/v4.en.md, ne pas l'éditer à la main
- `stats.json` (communes, population, superficie, PIB par habitant) est généré par
  `scripts/build_stats.py` depuis les GeoJSON d'États, les recensements de
  `docs/data/population/` et le PIB régional de `docs/data/pib/` (Eurostat 2023, SPA)
  (cf. ADR 2026-10-13-chiffres-cles-etats.md et 2026-10-14-pib-par-habitant.md)
- `lights.json` (une lumière par commune, intensité selon la population) est généré
  par `scripts/build_stats.py` ; la carte (#/map) est un globe orthographique d3-geo
  (`portail/vendor/`, d3-array + d3-geo, ISC) au style « salle de situation » sombre
- `opstine.json` (index commune → État du parcours citoyen) est généré par
  `scripts/build_stats.py` avec `stats.json` et `lights.json`
- Parcours citoyen : `#/register` (5 étapes) et `#/citizen` (carte TD1) ; règles dans
  docs/canon/citoyennete.md (ADR 2026-10-15-parcours-citoyennete.md). Rattachement par la
  commune, jamais par libre choix ; narodnost hors zone de lecture automatique ; registre
  national : rectification unique dans les trois ans d'une première inscription, sinon autre
  registre quinze ans après l'inscription ; retrait libre ; effet différé d'un an pour le
  Narodni Sabor (ADR 2026-10-22-verrou-registre-national.md)
- Films d'États : `portail/videos/<code>.mp4` (+ `-480.mp4`, poster `.jpg`), listés dans
  `portail/data/videos.json` ; produits par `scripts/encode_video.py <code> <source>`
  (boucle sans couture, deux tailles, sans son). La fiche d'un État filmé s'ouvre sur un
  bandeau vidéo plein écran, juste la vidéo : ni son, ni bouton (titre en surimpression) ; cf. ADR 2026-10-18-films-etats.md et
  portail/videos/README.md. Vidéos brutes hors dépôt
- `scripts/build_portail.py` = injecte data + drapeaux + scripts vendor dans le template → build final
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
- Ne pas attribuer de code couleur aux peuples (seule exception : l'option « Peoples »
  de la carte) ; cf. ADR 2026-10-14-pas-de-code-couleur-peuples.md
- Ne pas poser de question de clarification une fois les principes validés :
  proposer une solution et rédiger entièrement

## Style d'interaction
- Décisions rapides et définitives de l'utilisateur ; proposer puis rédiger,
  ne pas multiplier les questions
- Une fois une décision confirmée, la traiter comme verrouillée
