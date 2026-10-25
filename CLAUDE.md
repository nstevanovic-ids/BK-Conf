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
- Entité confédérale = **Balkan** (géographique, inclut les communautés autonomes
  non-sud-slaves : albanaise, hongroise, turque, slovaque)
- **Sud-slave / južnoslovenski** décrit UNIQUEMENT : la langue (*južnoslovenski jezik*),
  l'alphabet unifié, et les 7 peuples constitutifs — JAMAIS la confédération
- Le projet est sud-slave **+ balkanique**, explicitement PAS pan-slave

## Composition (source : docs/canon/etats.md)
- **49 États** : 45 territoriaux + 4 villes-États (territoires confédéraux) ; plus 2 municipalités
  confédérales autonomes (Brčko, Mostar), qui ne sont pas des États
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
  Parquet confédéral (Zagreb), Banque centrale (Beograd), Cour des comptes (Ļubļana),
  Institut confédéral de la langue (Ohrid), Bibliothèque et Archives (Cetiñe), Conseil des
  communautés (albanaise, hongroise, slovaque, turque), Konfederalna Obavěštajna Agencija
  (renseignement, Sarajevo, sans pouvoir de police) ; noms sud-slaves (Konfederalna
  Kancelarija, Konfederalni Sud, Konfederalno Tužilaštvo, Konfederalni Računski Sud,
  Konfederalna Centralna Banka, Konfederalni Institut za Jezik, Konfederalna Biblioteka i
  Arhiv, Veće Zajednica, Konfederalne Oružane Snage), ADR 2026-10-25-noms-sud-slaves-organes ;
  coalitions d'États (initiative,
  référendum) : la moitié au plus d'un même peuple ; cf. ADR
  docs/decisions/2026-10-22-constitution-v4-4-institutions.md
- 24 entités autonomes (docs/canon/entites-autonomes.md)

## Symboles (docs/canon/couleurs-symboles.md)
- Emblème confédéral unique : **lion ailé d'or** (héraldiquement neutre entre les 7 peuples) :
  syncrétisme de l'aigle balkanique et du lion bulgare, lion rampant aux ailes d'aigle ;
  **aucune filiation vénitienne** (ni livre, ni auréole du lion de saint Marc)
- Drapeau civil : bande rouge au guindant, champ bleu-blanc-bleu, sans symbole ; drapeau
  d'État : soleil d'or à 36 rais chargé du lion ailé de gueules sur la bande rouge, frises
  textiles bordant la bande blanche (constitution art. 7 bis)
- Soleil à 7 rais réservé au sceau (distinct du soleil à 36 rais du drapeau d'État)
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
- Règle toponymique v3 (option 1, ADR 2026-10-25-toponymie-v3-cyrillique.md) : њ→ñ, љ→ļ,
  џ/дж→x, ъ→ã, noms bulgares retranscrits du cyrillique ; yat restauré pour les seuls
  réflexes ijekaviens (Rěka, Běļina, Osěk) ; les noms ekaviens n'ont pas de yat et gardent e
  (Beli Manastir, Sremska Mitrovica ; ADR 2026-10-25-ekavien-sans-yat.md) ; noms d'États :
  Istočni et Zapadni Srěm gardent le yat (Srijem), Severna Trakija sans yat (ADR
  2026-10-25-noms-etats-yat.md) ; sinon latin
  inchangé. Beograd = exception déclarée.
  Communes : scripts/toponymie_v3.py (opstine.json v 2, nom officiel en alias)
- Cyrillique confédéral (docs/alfabet/cyrillique-confederal.md) : une lettre pour chacune des
  32 (ě→ѣ, ã→ъ, ñ→њ, ļ→љ, x→џ, ja = ја) ; bulgare лю/ля → ļu/ļa

## Workstreams (jamais mélanger dans une même session)
- Constitution → docs/constitution/ (texte de travail en vigueur : **v4.md**, français ;
  texte publié : **v4.en.md**, anglais ; v1 et v2 archivées). Toute modification de
  fond se fait dans les deux fichiers, puis `python scripts/build_constitution.py`
  régénère `portail/data/constitution.json` (lecteur #/constitution du portail).
  Version 4.10 : texte intégral, 192 articles en dix titres (4.8 : noms sud-slaves des organes ;
  4.9 : double clé, cf. plus bas ; 4.10 : Severna Trakija sans yat). Titres 1 à 3 (texte de base, art. 1
  à 99, dont le chapitre « Compétences » 55 à 99, avec sections `#### Section N / Nom`, et le
  chapitre « Régime des finances » 99 bis à 99 septies), titres 1 bis et 4 à 7 (art. 1 bis à
  146, articles « bis » insérés sans renumérotation), titre 8 révision (147 à 150, garanties
  renforcées révisables seulement par les sept délégations nationales), titre 9 dispositions
  finales et transitoires (151 à 156) ; Kongres de 250 délégués, Sainte-Laguë (art. 103) ;
  cf. ADR 2026-10-24-constitution-v4-7.md ; cf. ADR
  2026-10-17-constitution-titres-1-3.md, 2026-10-17-constitution-competences.md et
  2026-10-22-constitution-v4-4-institutions.md ; sécurité et défense (titre 7, art. 61 bis),
  cf. ADR 2026-10-22-securite-defense-v4-5.md ; immunités, conciliation, traités, exécution
  confédérale, symboles (art. 7 bis, 50 bis, 101 bis, 110 ter), cf. ADR
  2026-10-23-constitution-v4-6.md ; registres nationaux : période probatoire de
  trois ans, verrou de quinze ans (art. 102), cf. ADR 2026-10-22-verrou-registre-national.md
  ; double clé (v4.9) : partout où cinq des sept délégations sont requises, elles représentent
  aussi la majorité des inscrits aux registres nationaux (art. 110) ; Konfederalno Veće sans
  consensus : quatre conseillers représentant cette majorité, ou cinq (art. 111) ; relevé
  annuel au 1er janvier (art. 115 bis) ; cf. ADR 2026-10-25-double-cle.md
- Alphabet → docs/alfabet/
- Portail SPA → portail/
- Plateforme participative (Decidim, e-Konfederacija) → docs/plateforme/ ; lancement sur les
  réseaux (X d'abord, puis Instagram) → docs/communication/
- Symboles confédéraux (animal totem à choisir, lettre-emblème glagolitique/bosančica) → en
  attente ; le lynx est l'emblème de la Žandarmerija, plus un candidat au totem (ADR
  2026-10-22-emblemes-services-securite.md)
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
- Typographie : texte en Arimo, titres (h1–h4, marque, grands chiffres) en Sofia Sans
  Extra Condensed ; polices OFL auto-hébergées dans `portail/fonts/`, intégrées en base64
  par le build inline. Toute police doit couvrir č ć đ ě ļ ñ, le cyrillique (ѣ compris)
  et l'API (ADR 2026-10-23-typographie.md)
- Transitions : un seul glissement, 620 ms, sans fondu, en-tête immobile ; vertical entre
  les sections de la navigation, horizontal entre les pages d'une même section (fiches
  d'États, titres de la constitution, sous-pages) ; rien d'autre ne s'anime à l'arrivée ;
  retour d'une fiche : la grille des États revient à sa position, filtre conservé
  (ADR 2026-10-23-glissement-sections.md et 2026-10-24-etats-en-tete-mobile.md)
- En-tête mobile (≤ 760 px de large ou ≤ 520 px de haut) : une barre de 56 px (emblème,
  nom, loupe, burger) ; navigation, langues, Register et thème dans le menu plein écran
- Interface dans les trois standards (phase 1) : `portail/data/i18n.json` (en, zap, sre, ist) ;
  en-tête, navigation, recherche, pied de page, fil d'Ariane ; contenu des pages en anglais ;
  règles de choix des mots dans docs/alfabet/interface-trois-standards.md (forme commune
  d'abord ; au središnji, ni serbe ni croate quand un neutre existe)
- `scripts/build_portail.py` = injecte data + drapeaux + scripts vendor dans le template → build final
- Ne JAMAIS éditer les données à la main dans le HTML : éditer le JSON, puis rebuild

## Pipeline drapeaux
- Sources brutes : `images-sources/drapeaux/` (jamais modifiées)
- `scripts/encode_drapeaux.py` → PNG palette base64 (max 400px, 64 couleurs,
  Floyd-Steinberg) → `portail/data/state_flags.json`
- SVG → cairosvg → PNG avant encodage. WebP s'ouvre directement avec PIL.
- Blasons : sources `images-sources/symboles/<Nom>-CoA.*` →
  `scripts/encode_blason.py <code> <source>` → `portail/images/coa-<code>.webp` (fond clair
  détouré, recadré) ; la fiche État affiche la carte « Coat of arms » si le fichier existe
- **Le nom de fichier n'est PAS la source de vérité** : l'ordre d'upload suit
  l'ordre alphabétique des codes d'État. Toujours vérifier visuellement le contenu.

## Règles d'or (irrévocables sans ADR dans docs/decisions/)
- Frontières des États fixées à la fondation : jamais de redécoupage pour corriger un
  équilibre ; l'équilibre se règle par des mécanismes de vote (ADR 2026-10-25-double-cle.md)
- Aucun État ne porte le nom d'une ville (sauf les 4 villes-États)
- Renumérotation des codes strictement alphabétique
- Décisions gelées propagées partout, immédiatement et de façon cohérente
- Précision historique : revendications dynastiques exactes
  (ex. Tvrtko I Kotromanić = serbe, couronné à Mileševa)
- Proportionnalité démographique : ratio État/peuple surveillé (HHI ≈ 0.034)

## Ne pas faire
- Ne pas réintroduire « Herceg Bosna » (renommé Zapadna Hercegovina, code HZ-13)
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
