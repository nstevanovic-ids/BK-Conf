# ADR 2026-10-25 — Toponymie v3 (option 1) et cyrillique confédéral

## Statut
Accepté le 2026-10-25. Réponses de l'utilisateur à la transition toponymique
(`docs/alfabet/transition-toponymique.md`) et au cyrillique confédéral :
- « Oui pour l'option 1 [yat] » ;
- « Oui pour le cyrillique confédéral (j'hésite juste pour le son ja) ».

## Décisions

### 1. Toponymie, option 1
La règle s'applique à tout nom slave affiché par la Confédération.

**Substitutions graphiques, partout** :
- nj → ñ, lj → ļ, dž → x ;
- en macédonien, gj → đ et kj → ć ;
- les noms bulgares sont retranscrits depuis le cyrillique officiel, avec ъ → ã et ль, лю,
  ля → ļ, ļu, ļa (Смолян → Smoļan, Търговище → Tãrgovište).

**Yat**, là où la forme officielle montre le réflexe ijekavien, et pour la racine Srěm déjà
au canon :
- Rěka, Běļina, Bělo Poļe, Bělovar, Osěk, Široki Brěg, Han Pěsak, Němci, Sěnica, Prěpoļe,
  Plěvļa ;
- Srěmska Mitrovica, Srěmski Karlovci, Vukovarsko-srěmska ;
- Běli Manastir, chef-lieu validé.

Les noms ekaviens attendent la liste de racines `docs/alfabet/yat-racines.md`, qui est une
proposition.

**Exceptions et corrections** :
- Beograd reste l'exception déclarée ;
- les communes du nord de Kosovo i Metohija passent en forme serbe : Leposavić, Štrpce,
  Zvečan.

**Chefs-lieux** : Běli Manastir, Široki Brěg, Sloveñ Gradec, Rěka, Běļina, Osěk.

**Sièges et textes** : Cetiñe (art. 1 ter et 74) ; notes de drapeaux (Osěk, Ceļe).

### 2. Mise en œuvre
- `scripts/toponymie_v3.py` calcule la forme v3. `build_stats.py` l'appelle en écrivant
  `opstine.json`, qui passe au format v 2 : [nom v3, ISO, État, nom officiel ou "", nom
  GADM]. 345 des 1 461 communes changent : 211 hors de Bulgarie et 134 en Bulgarie.
- `docs/alfabet/toponymes-v3.csv` contient les formes validées qui ne découlent pas des
  substitutions.
- `docs/alfabet/toponymes-bg.csv` contient le cyrillique des 265 communes bulgares :
  - 182 viennent de GADM (NL_NAME_2) ;
  - 83 ont été saisies ou corrigées : 76 absentes de GADM, 7 rattachées à tort ;
  - toutes ont été contrôlées contre la translittération officielle.
- **Portail** :
  - la carte imprime la forme v3 de la commune d'origine ;
  - la recherche trouve aussi le nom officiel (« Trebinje » trouve « Trebiñe ») ;
  - la saisie cyrillique applique ль/лю/ля → ļ/ļu/ļa et accepte ѣ.

### 3. Cyrillique confédéral
- Adopté (`docs/alfabet/cyrillique-confederal.md`).
- **Le son ja** s'écrit **ја**, en deux lettres, comme en latin (j + a). C'est la seule
  écriture qui garde une lettre cyrillique pour chaque lettre latine, sans exception.
- Avec я, il faudrait aussi ю et є pour ju et je, et la conversion dépendrait du contexte.
- Le bulgare garde я dans son usage propre. À la saisie, я et ја donnent tous deux *ja*.

## Propagation
- **Données** : `opstine.json`, `etats.json`, `flagnotes.json`.
- **Canon** : `etats.md` et `citoyennete.md`.
- **Alphabet** : `v3.md`, `transition-toponymique.md`, `cyrillique-confederal.md`,
  `yat-racines.md`.
- **Constitution** : version 4.8 (Cetiñe).
- **Portail** : Journal officiel.
- `CLAUDE.md`.
