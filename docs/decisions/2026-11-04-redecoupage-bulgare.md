# ADR 2026-11-04 — Redécoupage des États bulgares : Thrace en deux États, Ruse en Mizija

## Statut
Accepté le 2026-11-04. L'utilisateur laisse Claude proposer (« je ne connais pas assez les
tenants et aboutissants des questions bulgares »), valide le découpage sur une carte avant/après
(« Ça me fait »), écarte le nom *Zagore*, trop proche de Zagorje, puis retient la Tundža
(« Go pour Tundža et pour les autres redécoupages bulgares »). Constitution portée en
version 4.12 (articles 1 bis et 1 quinquies, annexe S), sans article nouveau.

## Contexte
L'analyse du 2026-11-04 (note de projet `claude/analyse-decoupage-bulgare.md`) relève trois
erreurs dans le bloc bulgare tel qu'il figure dans le dépôt :

1. **Plovdiv dans Rodopi.** RO-29 avait Plovdiv pour chef-lieu et englobait la moitié sud de
   la plaine thrace (929 834 hab.). La limite coupait l'agglomération de Plovdiv : la commune de
   Rodopi (couronne sud) dans RO-29, Marica (couronne nord) dans la Thrace. La correction décidée
   en mai 2026 (Rodopi réduit au massif, Plovdiv en Thrace) n'avait jamais été reportée dans les
   données.
2. **Trois chefs-lieux hors de leur État.** MI-22 → Ruse (dans LG-19), MZ-23 → Pleven (dans
   MI-22), SX-37 → Sliven (dans TR-41).
3. **Ludogorje fourre-tout.** LG-19 réunissait quatre oblasts entiers, dont Ruse, port du
   Danube, qui relève de la Mésie et non du Deliorman.

Une fois la plaine rendue à la Thrace, l'État thrace aurait compté 1 452 000 habitants, le plus
gros État territorial. La plaine de Haute-Thrace n'est pas d'un seul tenant : le champ de
Pazarxik–Plovdiv en forme la moitié ouest ; la plaine de Stara Zagora est un bassin distinct,
séparé du premier notamment par les hauteurs de Čirpan. La coupure suit à peu près la limite
des oblasts de Plovdiv et de Stara Zagora.

## Décision

### Limites (communes, population NSI au 31 décembre 2025)

| État | Avant | Après | Changement |
|---|---|---|---|
| CM-07 Černomorska | 808 446 | 808 446 | — |
| DJ-09 Južna Dobruxa | 236 223 | 236 223 | — |
| LG-19 Ludogorje | 524 568 | 340 317 | − oblast de Ruse (8 communes) |
| MI-22 Istočna Mizija | 613 861 | 798 112 | + oblast de Ruse |
| MZ-23 Zapadna Mizija | 324 937 | 324 937 | — |
| PR-27 Pirin | 285 644 | 285 644 | — |
| RO-29 Rodopi | 929 834 | 412 773 | − plaine (Plovdiv, Rodopi, Kuklen, Pazarxik, Stambolijski, Pãrvomaj, Septemvri, Lesičovo) ; + Ivajlovgrad et Maxarovo (Rhodopes orientales, vallée de l'Arda) |
| SP-34 Šopluk | 434 705 | 434 705 | — |
| SX-37 Stranxa | 26 516 | 26 516 | — |
| TR-41 Severna Trakija → **Trakija** | 934 660 | 708 171 | Thrace occidentale : oblasts de Plovdiv et de Pazarxik (parties de plaine), Koprivštica |
| **TU-42 Tunxa** (nouveau) | — | 743 550 | Thrace orientale : oblasts de Stara Zagora, Haskovo (sauf Ivajlovgrad et Maxarovo), Sliven et Jambol (sauf Boļarovo, déjà dans Stranxa) |

Dix-huit communes changent d'État, dont Kuklen, détachée de Rodopi et absente de GADM, qui la
suit ; les 26 communes de Tunxa viennent de l'ancienne Severna Trakija.

### Noms
- **Trakija** (TR-41) : l'État ne couvre plus toute la Thrace bulgare ; *Severna* (« du Nord »)
  tombe. Plovdiv, l'ancienne Philippopolis, est la grande ville de la Thrace. Code inchangé.
- **Tunxa** (TU-42) : nom de la Tundža (*Тунджа*), principal affluent de la Marica, qui passe à
  Kazanlãk, Jambol et Elhovo. Sur le modèle de Timok (TK-39), État nommé d'après sa rivière.
  Graphie v3 : дж → x, comme Stranxa et Južna Dobruxa. Écartés : *Zagore* (seul nom historique,
  trop proche de Zagorje), *Odrisija* (nom savant, inusité en bulgare ; l'héritage odryse se
  partage entre les deux Thraces : résidence de Kozi Gramadi près de Starosel dans Trakija,
  vallée des rois thraces près de Kazanlãk dans Tunxa), *Beroe* (nom de ville). La commune
  rurale de Tunxa, autour de Jambol, porte le même nom ; Rodopi avait déjà ce cas.

### Chefs-lieux (tous désormais dans leur État)

| État | Avant | Après | Motif |
|---|---|---|---|
| MI-22 | Ruse | **Veliko Tãrnovo** | capitale du Second Empire, ville de la Constitution de 1879 |
| MZ-23 | Pleven (dans MI-22) | **Vraca** | plus grande ville de l'État, référence du drapeau (ADR 2026-06-28-mizija-v3-saltire.md) |
| RO-29 | Plovdiv | **Smoļan** | chef-lieu d'oblast au cœur du massif ; Kãrxali est le chef-lieu d'un oblast à majorité turque |
| SX-37 | Sliven (dans TR-41) | **Carevo** | l'ancienne Vasiliko, siège du gouvernement provisoire de la Commune de Strandža (1903) |
| TR-41 | Stara Zagora | **Plovdiv** | — |
| TU-42 | — | **Stara Zagora** | — |

### Codes
Renumérotation strictement alphabétique : TU-42 s'insère après TR-41 ; VB-42 → **VB-43**,
VI-43 → **VI-44**, VZ-44 → **VZ-45**, ZA-45 → **ZA-46**. La Confédération compte
**cinquante États** : quarante-six territoriaux et quatre villes-États, plus Brčko et Mostar.

## Règle d'or des frontières
La règle « frontières fixées à la fondation, jamais de redécoupage pour corriger un équilibre »
(ADR 2026-10-25-double-cle.md) reste entière. Ce redécoupage corrige des erreurs de géographie
et d'histoire avant la fondation : Plovdiv hors de la Thrace, chefs-lieux hors de leur État,
Ruse dans le Deliorman. Il ne vise pas l'équilibre entre peuples. Effet constaté, non recherché :
onze États bulgares sur quarante-six, rapport États/population de 0,90 à 0,97 ; aux votations,
Serbes et Bulgares (24 États) atteignent toujours la majorité (26 sur 50) avec Beograd et
Sofija, et les cinq autres peuples (22) ne l'atteignent toujours pas avec Zagreb et Sarajevo.

## Points ouverts
- **Drapeau de Tunxa** : à créer. Le portail affiche en attendant le drapeau provisoire au code
  du peuple bulgare. La note de drapeau de TR-41 (« Bulgarian Trakija ») reste valable.
- **Part turque de Ludogorje** : elle augmente avec le départ de l'oblast de Ruse (ordre de
  grandeur : d'un quart à un tiers, estimation par oblast) ; à recalculer commune par commune.
  L'État reste à majorité bulgare ; la Deliorman Türk Belediyeler Birliği (TBB-LG) n'est pas
  modifiée.
- **Drapeau de MI-22** : il porte la rosette IYI de Pliska, qui se trouve dans LG-19 (oblast de
  Šumen). Hérité, sans changement.
- **Fichiers sources** : les noms de fichiers GeoJSON gardent leurs anciens numéros
  (`TR-40.geojson`, `LG-20.geojson`) ; seul le préfixe compte pour les scripts. Le nouveau
  fichier est `TU-42.geojson`.

## Propagation
- Contours : `portail/data/RO-29.geojson`, `TR-40.geojson`, `TU-42.geojson` (nouveau),
  `LG-20.geojson`, `MI-22.geojson` ; `geo.json`, `stats.json`, `opstine.json` et `lights.json`
  régénérés (`scripts/gen_geo.py`, `scripts/build_stats.py`).
- `portail/data/etats.json` (noms, chefs-lieux, TU-42, codes), `state_flags.json` et
  `scripts/encode_drapeaux.py` (clés renumérotées), `entites-autonomes.json` (États hôtes),
  `portail/images/coa-VB-43.webp` (renommé).
- Constitution v4.12 dans les cinq textes (`v4.md`, `v4.en.md`, `v4.zap.md`, `v4.sre.md`,
  `v4.ist.md`) : article 1 bis (cinquante États, Trakija, Tunxa, numéros d'ordre),
  article 1 quinquies (codes des États hôtes) ; annexe S ; `constitution*.json` régénérés.
- Portail : compteurs (50 États, 46 territoriaux, majorité 26 sur 50), avis sur les drapeaux,
  Journal officiel ; `textes.json` et `i18n.json` dans les trois standards.
- `docs/canon/etats.md`, `docs/canon/entites-autonomes.md`, `docs/canon/citoyennete.md`,
  `docs/alfabet/transition-toponymique.md`, `docs/plateforme/decidim.md`,
  `docs/analyses/equilibre-etats-peuples.md` (note), `README.md`, `CLAUDE.md`.
