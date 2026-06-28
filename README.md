# Balkanska Konfederacija

Projet de conception d'une confédération balkanique fictive : droit constitutionnel,
design territorial, héraldique, linguistique, portail numérique.

## Démarrage rapide

```bash
git init
claude            # lit CLAUDE.md automatiquement
```

## Structure

```
CLAUDE.md                  Bible du projet (lue à chaque session)
docs/
  canon/                   Décisions gelées (source de vérité)
    etats.md               47 États : codes, peuples, chefs-lieux
    peuples.md             7 peuples constitutifs
    entites-autonomes.md   25 entités autonomes
    couleurs-symboles.md   Palette et héraldique confédérale
    nominations.md         Règle Balkan vs Sud-slave vs Južnoslovenski
  constitution/            v2 (intégrée), v3 (en cours)
  alfabet/                 Spec alphabet sud-slave latin
  decisions/               Journal ADR (Architecture Decision Records)
portail/
  index.html               Template SPA (HTML + CSS + JS de rendu)
  data/*.json              Source de vérité des données du portail
  assets/                  Drapeaux et symboles (build)
scripts/
  encode_drapeaux.py       Pipeline d'encodage des drapeaux
  build_portail.py         Assemblage du portail final
  gen_map.py               Générateur de cartes SVG (GADM) — à venir
images-sources/            Uploads bruts, jamais modifiés
```

## Workflow portail

Les données vivent dans `portail/data/*.json`, **pas** dans le HTML.
Pour modifier un État, une entité, un drapeau : éditer le JSON, puis rebuild.

```bash
# Build lié (dev, nécessite un serveur)
python scripts/build_portail.py
cd portail && python -m http.server 8000   # → http://localhost:8000

# Build inline (fichier unique self-contained, ouvrable par double-clic)
python scripts/build_portail.py --inline   # → balkanska_konfederacija.html
```

## Workflow drapeaux

```bash
# 1. Déposer les images sources dans images-sources/drapeaux/
#    nommées par code : LK.png, MI.png, MZ.svg, etc.
# 2. Vérifier le MAPPING dans scripts/encode_drapeaux.py
# 3. Encoder
python scripts/encode_drapeaux.py          # → portail/data/state_flags.json
# 4. Rebuild le portail
python scripts/build_portail.py --inline
```

## Décisions gelées

Toute décision territoriale ou constitutionnelle confirmée est journalisée dans
`docs/decisions/` (un fichier par décision, daté). Une décision gelée ne se révise
que par un nouvel ADR explicite.

## État actuel

- 47 États définis, 42/43 drapeaux dédiés intégrés (reste ZA-43 Zagorje)
- Constitution v2 intégrée ; v3 à venir (Articles 129, 130 + Titre 6)
- Alphabet v3 spécifié (32 lettres)
- Workstreams en attente : symboles confédéraux (lynx, lettre-emblème),
  cartes GADM, amendement Article 1 bis (45 → 47 États)
