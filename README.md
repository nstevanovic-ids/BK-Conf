# Balkanska Konfederacija

Projet de conception d'une confédération balkanique fictive, qui couvre le droit
constitutionnel, le design territorial, l'héraldique, la linguistique et un portail
numérique.

- **Portail publié** : <https://nstevanovic-ids.github.io/BK-Conf/>, déployé
  automatiquement par GitHub Pages à chaque merge sur `main`.
- **Bible du projet** : `CLAUDE.md`, lue à chaque session.

## Structure

```
CLAUDE.md                  Bible du projet
docs/
  canon/                   Décisions gelées (source de vérité)
    etats.md               49 États (45 territoriaux + 4 territoires confédéraux)
                           et 2 municipalités confédérales autonomes
    peuples.md             7 peuples constitutifs
    entites-autonomes.md   24 entités autonomes
    couleurs-symboles.md   Palette, lion ailé, drapeaux, sceau, devise, emblèmes des services
    nominations.md         Règle Balkan / sud-slave / južnoslovenski
    citoyennete.md         Parcours d'inscription, carte citoyenne TD1, registres nationaux
    routes.md              Classification des routes (Bk-N, Xx-N)
  constitution/            v4.md (texte de travail, FR) et v4.en.md (texte publié, EN) ;
                           v1 et v2 archivées
  alfabet/                 Alphabet v3, transition toponymique, cyrillique confédéral,
                           tables de toponymes (formes v3, cyrillique bulgare)
  plateforme/              Déploiement de la plateforme participative (Decidim)
  communication/           Lancement sur X puis Instagram
  data/                    Recensements et PIB régional (sources de stats.json)
  decisions/               Journal des décisions (ADR), un fichier daté par décision
portail/
  index.html               Template SPA (HTML + CSS + JS de rendu)
  data/*.json              Source de vérité des données du portail
  fonts/                   Arimo et Sofia Sans Extra Condensed (OFL), auto-hébergées
  images/                  Photos des emplacements d'image (voir images/README.md)
  videos/                  Films d'États (voir videos/README.md)
  vendor/                  d3-array et d3-geo (globe de la carte)
scripts/
  build_portail.py         Assemblage du portail (--inline : fichier unique)
  build_constitution.py    v4.en.md → portail/data/constitution.json
  build_stats.py           stats.json, lights.json, opstine.json
  raccord_contours.py      Raccord des contours GADM (doublons, trous)
  gen_geo.py               geo.json (couverture unique pour d3-geo)
  encode_drapeaux.py       Drapeaux → state_flags.json (MAPPING à reconstruire)
  encode_video.py          Films d'États : boucle sans couture, 720p + 480p, poster
  gen_favicon.py           Favicon et apple-touch-icon depuis le lion ailé
  toponymie_v3.py          Forme v3 des noms de communes (appelé par build_stats.py)
images-sources/            Uploads bruts, jamais modifiés
```

## Workflow

Tout travail part de `main`, dans une branche `claude/…`, et revient par une PR sur `main`.
`main` est la seule branche publiée.

Les données vivent dans `portail/data/*.json`, **pas** dans le HTML. Pour modifier un
État, une entité ou un drapeau, on édite le JSON, puis on reconstruit.

```bash
# Constitution : modifier v4.md ET v4.en.md, puis
python scripts/build_constitution.py

# Portail, fichier unique (celui que publie GitHub Pages)
python scripts/build_portail.py --inline   # → balkanska_konfederacija.html

# Portail lié (développement, nécessite un serveur)
python scripts/build_portail.py
cd portail && python -m http.server 8000
```

## Décisions gelées

Toute décision territoriale, constitutionnelle ou symbolique confirmée est journalisée
dans `docs/decisions/`. Une décision gelée ne se révise que par une nouvelle décision
explicite, et elle se propage partout : canon, constitution, données, portail.

## État actuel (octobre 2026)

- **Territoire** :
  - 49 États et 2 municipalités confédérales autonomes, tous avec leur drapeau ;
  - 24 entités autonomes ;
  - carte en globe d3-geo, avec des chiffres clés par État (population, superficie, PIB
    par habitant).
- **Constitution v4.8** : 192 articles en dix titres, en français et en anglais. Elle
  comprend :
  - les institutions (Kongres de 250 délégués, Narodni Sabor, Konfederalno Veće, Ustavni
    Sud) et leurs organes, avec leurs noms sud-slaves ;
  - le régime des finances sur le modèle suisse, la famille et la natalité, l'immigration
    et le contrôle des frontières ;
  - la sécurité et la défense (titre 7) ;
  - les registres nationaux (période probatoire de trois ans, verrou de quinze ans) ;
  - la révision avec garanties renforcées (titre 8) et les dispositions finales (titre 9).
- **Alphabet** : v3 (32 lettres) ; règle toponymique appliquée aux 1 461 communes ;
  cyrillique confédéral adopté.
- **Portail** :
  - fiches d'États, dont 7 avec un film ;
  - page Institutions (qui élit qui, 250 sièges du Kongres, simulateur de loi, révision,
    autres organes), page Security and Defence ;
  - lecteur de la Constitution et Journal officiel ;
  - parcours citoyen et carte TD1.
- **En cours ou en attente** :
  - alphabet : yat des noms ekaviens (`docs/alfabet/yat-racines.md`, à valider) ;
  - symboles : hymne, animal totem, lettre-emblème, logos des services ;
  - portail : interface dans les trois standards (ZAP, SRE, IST), pages des départements et
    de la présidence, script des drapeaux ;
  - équilibre États / peuples ;
  - plateforme Decidim et lancement sur les réseaux ;
  - films, armoiries et photos des États et des services.
