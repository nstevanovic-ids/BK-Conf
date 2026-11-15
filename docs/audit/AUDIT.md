# Audit du portail de la Balkanska Konfederacija

Date : 15 novembre 2026. Base : `main` @ `7d96e3c` (Constitution v4.16).
Build : `python scripts/build_portail.py` (lié) et `--inline` (2 801 ko), servis en local.
Outils : Chromium (Playwright), Lighthouse 13.6 mobile, fontTools, scripts de `docs/audit/`.

## Écarts entre la mission et le dépôt

Trois points du brief ne correspondent pas à l'état du dépôt. `CLAUDE.md` prime, je l'ai suivi.

| Brief | Dépôt | Suite donnée |
|---|---|---|
| « `main` n'est pas la branche à jour » | `main` est la seule branche publiée (`CLAUDE.md`, « Branche de référence » ; `.github/workflows/pages.yml` ne déploie que `main` ; `claude/jolly-fermi-wkwak0` n'est plus publiée depuis le 15 octobre) | Travail parti de `main`. Aucune PR ouverte. |
| « 47 États » | 52 États (48 territoriaux, 4 villes-États) et 2 municipalités confédérales, soit 54 entités (`docs/canon/etats.md`, passe de fondation du 5 novembre) | Matrice de couverture sur 54 entités. |
| Animations : « apparition progressive » | L'ADR `2026-10-23-glissement-sections.md` fixe un seul glissement de 620 ms et « rien d'autre ne s'anime à l'arrivée » | Chaque animation proposée est classée « conforme à l'ADR » ou « demande un amendement » (voir `PROPOSITIONS.md`). |

## Synthèse

Le fond est complet et cohérent : 54 fiches, 54 drapeaux, 54 notes de drapeau traduites dans les
trois standards, 959 chaînes de page sur 959 traduites, aucun débordement horizontal sur
115 captures. Les faiblesses sont ailleurs :

1. **Le partage est inopérant.** Aucune balise Open Graph, un seul titre pour toutes les pages,
   routes en `#` : un lien vers Lika posté sur X affiche le même aperçu vide que l'accueil.
   C'est bloquant pour un portail dont l'audience vient des réseaux.
2. **Le premier affichage mobile prend 7,3 s** et l'accueil pèse 14,6 Mo. Score Lighthouse
   performance : 22 à 45 selon la page.
3. **La palette canonique n'est pas celle de l'interface.** `#374078` n'apparaît pas une seule
   fois dans le CSS ; le rouge, l'or et le bleu du chrome sont d'autres teintes.
4. **L'échelle visuelle n'est pas un système** : 67 tailles de police, 99 couleurs, 36 pas
   d'espacement. Le rendu reste propre parce que les écarts sont petits, mais la hiérarchie
   est plate sous le titre.
5. **Les drapeaux sont muets pour un lecteur d'écran** (54 sur 54 sans texte alternatif).

47 constats : 3 bloquants, 22 majeurs, 22 mineurs.

Sévérité : **B** bloquant, **M** majeur, **m** mineur. Effort : S (moins d'une demi-journée),
M (un à deux jours), L (plus).

---

## 1. Couverture

Calculée depuis `portail/data/*.json` et `portail/images/` (script en annexe).

| Élément | Couvert | Manquant |
|---|---|---|
| Fiche (`#/state/<code>`) | 54 / 54 | |
| Drapeau (`state_flags.json`) | 54 / 54 | |
| Note de drapeau, anglais | 54 / 54 | |
| Note de drapeau, zapadni / središñi / istočni | 54 / 54 chacune | |
| Cyrillique (dérivé à l'affichage, SRE et IST) | 54 / 54 | |
| Carte de localisation (`geo.json`) | 54 / 54 | |
| Population, superficie, PIB (`stats.json`) | 54 / 54 | |
| **Blason** (`images/coa-<code>.webp`) | **10 / 54** | 44 |
| **Film d'en-tête** (`videos.json`) | **6 / 54** | 48 |
| Chaînes de page (`textes.json`) | 959 / 959 dans les trois standards | 6 avertissements v3 de `textes.py check` |

Blasons présents : BG-91, LK-20, SA-92, SF-93, SO-33, TL-40, US-43, VB-44, ZG-94, ZL-48.
Films présents : BA-01, BC-02, BN-04, BZ-05, CG-06, CM-07.

| Id | Constat | Sév. | Effort |
|---|---|---|---|
| C-1 | 44 fiches sur 54 n'ont pas de blason. La fiche demande quand même `images/coa-<code>.webp` et reçoit une erreur 404 (vérifié : `404 images/coa-DA-08.webp`), visible en console et comptée par Lighthouse (`errors-in-console`). Un manifeste des blasons dans les JSON, comme `videos.json`, supprime la requête. | m | S |
| C-2 | Trois gabarits de fiche coexistent : avec film (6), avec blason sans film (10), sans l'un ni l'autre (38). L'écart de qualité perçue est fort entre BA-01 (bandeau vidéo plein écran) et DA-08 (drapeau de 250 px et tableau). Captures `state-film-1440.webp`, `state-simple-1440.webp`. La refonte doit donner à la fiche sans film une ouverture aussi tenue. | M | M |
| C-3 | Les drapeaux sont encodés à 400 px de large (un à 600 px), palette de 64 couleurs tramée. À 768 px la fiche les affiche sur 460 px CSS, soit un agrandissement de 1,15 × avant même la densité d'écran (2,3 × sur un écran 2x). Flou et trame visibles sur les drapeaux à détail fin (TL-40 : 57 ko, TK-39, ZA-47). Capture `state-blason-768.webp`. | M | M |
| C-4 | Les proportions des drapeaux vont de 1,48 à 2,00 (14 valeurs distinctes) ; la grille les affiche toutes dans un cadre 3:2. À vérifier drapeau par drapeau qu'aucun n'est rogné ou bordé ; c'est un point de fond vexillologique, je ne tranche pas. | m | S |

## 2. Visuel

Mesures sur le CSS du gabarit (84,5 ko, 5 535 lignes au total avec le JS).

| Mesure | Valeur |
|---|---|
| Tailles de police distinctes | 67 (221 déclarations), dont 15 entre 0,62 et 0,88 rem |
| Couleurs hexadécimales distinctes | 99 dans le CSS, 76 dans le JS |
| Pas d'espacement distincts (padding, margin, gap) | 36, dont 7, 9, 11, 13, 15, 17, 19 px |
| Rayons de bordure distincts | 14 |
| Points de rupture distincts | 12 (430, 560, 680, 760, 820, 860, 900, 960, 980, 1100, 1180 px, plus hauteur) |
| Durées de transition distinctes | 20 (de 0,12 s à 7 s) |

Palette canonique dans le CSS de l'interface :

| Couleur canonique | Occurrences CSS | Ce que l'interface utilise à la place |
|---|---|---|
| Rouge `#99402F` | 2 | filet supérieur `#c90505`, `--red: #9a2f23` |
| Bleu `#374078` | **0** | chrome `--indigo: #1f2742`, `--navy: #0e347f` |
| Or `#DFCC68` | 1 (carte) | `--gold: #b88a14`, `--gold-2: #d6a829`, `--gold-bright: #f8c300` |
| Blanc `#FFFFFF` | 43 | |

| Id | Constat | Sév. | Effort |
|---|---|---|---|
| V-1 | La palette canonique est absente de l'interface (tableau ci-dessus). `docs/canon/couleurs-symboles.md` documente l'indigo `#1f2742` comme « indigo de chrome » distinct du bleu héraldique ; le rouge `#c90505` et les ors `#b88a14` / `#f8c300` ne sont documentés nulle part. Le brief pose la palette canonique comme contrainte non négociable : soit l'interface y revient, soit le canon documente les dérivés. **Décision attendue**, voir « Points de fond ». | M | M |
| V-2 | Sept variables de couleur par peuple restent déclarées dans `:root` (`--slo`, `--hrv`, `--srb`, `--bos`, `--cng`, `--mkd`, `--bul`, ligne 49). Aucune n'est utilisée dans une règle : ce sont des restes d'avant l'ADR `2026-10-14-pas-de-code-couleur-peuples`. À retirer pour qu'elles ne reviennent pas. | m | S |
| V-3 | Pas d'échelle typographique. Accueil à 1440 px : h1 73,6 px, puis h2 à 32, 30,4 et 23,2 px, h3 à 17,9 px. Entre le titre et le corps (15 px), 15 tailles se tiennent dans un intervalle de 4 px. Une échelle de 7 à 8 pas suffit. | M | M |
| V-4 | Le texte de service est petit : surtitres à 11,2 px, libellés de tableau à 11,8 px, fil d'Ariane à 12,2 px, sources à 11 px. Sous 12 px sur mobile, la lecture est difficile, surtout en cyrillique. | M | S |
| V-5 | Sous le titre, la fiche d'État est un tableau de dix lignes de même poids (`state-simple-1440.webp`). Population, superficie et PIB ne ressortent pas alors que l'accueil et la carte les traitent en grands chiffres. Les trois prototypes corrigent ce point. | M | M |
| V-6 | Pas de grille d'espacement : 36 pas dont une série impaire (7, 9, 11, 13, 15 px). Une base de 4 px ramène la liste à une dizaine de valeurs. | m | M |
| V-7 | Sur l'accueil, le Journal officiel déroule 27 entrées et occupe 44 % de la hauteur de la page (4 055 px sur 9 227 à 1440 px). Les quatre ou cinq dernières avec un lien vers `#/journal` suffisent. | M | S |
| V-8 | Le mode sombre de la carte (`--sr-*`, 76 couleurs dans le JS) et le reste du portail sont deux systèmes visuels sans lien : passer de `#/states` à `#/map` change de fond, d'or et de typographie des chiffres. Capture `map-1440.webp`. | m | L |
| V-9 | En istočni, les titres (Sofia Sans) affichent les formes bulgares du cyrillique (т, и en formes cursives droites) et le texte courant (Arimo) les formes standard : le fichier Arimo ne porte qu'une localisation serbe (`cyrl/SRB`). Deux dessins de la même lettre sur un même écran, capture `institutions-ist-cyr-375.webp`. Point de fond (convention bulgare), je ne tranche pas. | m | M |

## 3. UX

| Id | Constat | Sév. | Effort |
|---|---|---|---|
| U-1 | `document.title` n'est jamais modifié : les 25 types de page s'appellent « Balkan Confederation · Official Portal ». Onglets, historique et favoris sont indistincts. | M | S |
| U-2 | Une route inconnue (`#/nimporte`) affiche l'accueil sans message, l'adresse restant fausse. L'ancienne route `#/etat/LK-21`, encore présente dans d'anciens partages, fait de même. Il manque une page « introuvable » et une redirection `#/etat/…` → `#/state/…`. | M | S |
| U-3 | `#/state/lk-20` (minuscules) donne « State not found. » Les codes devraient être lus sans tenir compte de la casse. La page d'erreur n'a ni titre de niveau 1 ni lien de retour autre que le fil d'Ariane (`err-state-375.webp`). | m | S |
| U-4 | La recherche ne trouve pas l'exonyme courant : « ljubljana » ne donne rien, il faut taper « Ļubļana ». `opstine.json` porte pourtant le nom officiel en alias. « Лика » fonctionne. | M | S |
| U-5 | La recherche ne lit pas un numéro d'article : « art 102 » renvoie les articles 37 et 39, pas l'article 102. | m | S |
| U-6 | Pas de passage d'une fiche à la suivante : aucun lien d'État à État sur une fiche (0 lien `#/state/` mesuré). Le lecteur doit revenir à la grille 53 fois pour tout voir. | M | S |
| U-7 | Sur mobile, le champ de recherche de `#/states` fait 69 px de large : son libellé est coupé (« Searcl », « Тра: »), capture `states-375.webp`. | M | S |
| U-8 | Sur mobile, `#/states` mesure 20 241 px, soit 25 écrans, une carte par ligne. Deux colonnes ou une vue liste divisent le défilement par deux. | M | S |
| U-9 | 24 cibles tactiles sur 80 font moins de 44 px sur `#/states` à 375 px, dont 2 sous 24 px (seuil WCAG 2.2 AA). | m | S |
| U-10 | Les liens profonds vers un article fonctionnent (`#/constitution/title-4/art-102` s'ouvre sur l'article). Rien dans l'interface ne permet de copier ce lien depuis l'article. | m | S |

Vérifié sans défaut : retour arrière vers la grille (position et filtre conservés), fermeture de
la recherche par Échap, glissement unique entre routes, absence de débordement horizontal.

## 4. Multilingue

| Mesure | zapadni | središñi | istočni |
|---|---|---|---|
| Longueur par rapport à l'anglais, médiane | 1,00 | 1,00 | 1,07 |
| 9ᵉ décile | 1,29 | 1,32 | 1,46 |
| Pire cas court | | | « Seat » → « Administrativen centãr » (5,5 ×) |

Polices : Arimo couvre les 163 caractères non ASCII du portail sauf sept symboles d'interface
(⅔ ↵ ⌘ ▾ ◇ ✓ ✕, police système, documenté). Sofia Sans Extra Condensed couvre č ć đ ě ļ ñ ã et
le cyrillique courant, mais pas ѣ ni l'API : conforme à l'ADR typographie, et sans effet
aujourd'hui puisque le cyrillique central est lu en ekavien.

| Id | Constat | Sév. | Effort |
|---|---|---|---|
| L-1 | Aucun bloc ne porte d'attribut `lang` (0 dans `#app` sur 25 pages). En anglais, les noms sud-slaves (« Zapadno Podriñe », « Naš dom », « Narodni Sabor ») sont prononcés à l'anglaise par un lecteur d'écran, et la césure automatique est fausse. | M | M |
| L-2 | `<html lang>` vaut `sl` en zapadni, `sh` en središñi, `bg` en istočni. Ces codes désignent le slovène, le serbo-croate et le bulgare, pas les trois standards du južnoslovenski. Défendable pour la synthèse vocale, discutable sur le fond. **Décision attendue.** | m | S |
| L-3 | L'istočni est le standard le plus long (9ᵉ décile à 1,46). Les libellés de tableau en capitales espacées y tiennent mal sur mobile ; à tester sur chaque composant de la refonte. | m | S |
| L-4 | `textes.py check` signale 6 avertissements v3. Hors périmètre visuel ; je les liste sans y toucher. | m | S |
| L-5 | Le sélecteur EN / ZAP / SRE / IST n'a que des sigles. Un visiteur venu d'un réseau ne sait pas ce que « SRE » désigne ; le nom complet existe dans `i18n.json` et peut servir d'infobulle et de libellé accessible. | m | S |

## 5. Accessibilité

Contrastes de la palette canonique (WCAG : 4,5 pour le texte, 3 pour le grand texte et les
éléments graphiques) :

| Paire | Rapport | Usage possible |
|---|---|---|
| Bleu `#374078` sur blanc | 9,69 | tout texte |
| Rouge `#99402F` sur blanc | 6,71 | tout texte |
| Or `#DFCC68` sur bleu `#374078` | 5,99 | tout texte |
| Blanc sur rouge | 6,71 | tout texte |
| Or sur rouge | 4,15 | grand texte seulement |
| **Or sur blanc** | **1,62** | aucun texte, aucun pictogramme porteur de sens |
| **Rouge sur bleu** | **1,44** | aucun : jamais de texte rouge sur bleu, ni l'inverse |

Règles qui en découlent pour la refonte : l'or ne porte jamais de texte sur fond clair (filets
et aplats seulement) ; le rouge et le bleu ne se touchent pas sans un filet blanc ou or.

Contrastes de l'interface actuelle, thème clair :

| Jeton | Rapport | Verdict |
|---|---|---|
| `--ink-3` `#878d9b` sur fond (fil d'Ariane, codes, sources, légendes) | 3,21 à 3,33 | échec AA |
| `--gold` `#b88a14` sur fond (tous les surtitres, liens « Read → ») | 3,03 à 3,14 | échec AA |
| Pied de page `#7a7f90` sur indigo | 3,68 | échec AA |
| Bordure des champs `#d0d2d8` sur blanc | 1,51 | échec (3 requis) |
| `--ink-2` `#545b6c` sur fond | 6,56 | conforme |

En thème sombre, tout le texte passe (4,66 au minimum) ; la bordure des champs échoue aussi (1,53).

| Id | Constat | Sév. | Effort |
|---|---|---|---|
| A-1 | Les 54 drapeaux sont des `<svg><image>` sans `role`, sans `aria-label`, sans `<title>` : grille, fiche et page Symbols. Un lecteur d'écran ne les annonce pas. Un `<img alt="Flag of Lika">` règle la question et permet `loading="lazy"`. | M | S |
| A-2 | Contraste insuffisant sur le texte secondaire et sur tous les surtitres or (tableau ci-dessus) : 28 éléments en échec sur une fiche d'État, 9 sur l'accueil (Lighthouse `color-contrast`). | M | S |
| A-3 | Après un changement de route, le focus retombe sur `<body>`, aucune zone `aria-live` n'annonce la page et le titre ne change pas (U-1) : un utilisateur de lecteur d'écran ne sait pas que la page a changé. | M | S |
| A-4 | Pas de lien d'évitement : 15 tabulations (langues, Register, thème, recherche, 8 entrées de navigation) précèdent le contenu sur chaque page. | M | S |
| A-5 | À la fermeture de la recherche, le focus ne revient pas au bouton qui l'a ouverte. | m | S |
| A-6 | Ordre des titres invalide : le pied de page utilise des `h5` sans `h2` à `h4` au-dessus (Lighthouse `heading-order`). | m | S |
| A-7 | `#/map` : attribut ARIA interdit sur un élément (Lighthouse `aria-prohibited-attr`), et la carte n'est pas navigable au clavier. | m | M |
| A-8 | 52 images de l'accueil ont un `alt` vide. C'est correct pour les diaporamas décoratifs, à confirmer image par image pour les portraits des peuples. | m | S |

Conforme : `prefers-reduced-motion` est traité (6 blocs), le focus est visible (contour sur
tous les éléments parcourus), la recherche est une boîte de dialogue modale correctement
déclarée, le thème sombre existe.

## 6. Performance

Lighthouse 13.6, mobile simulé, build inline servi avec gzip comme sur GitHub Pages.
Détail dans `lighthouse-avant.json`.

| Page | Perf. | Access. | FCP | LCP | TBT | CLS | Poids | Requêtes |
|---|---|---|---|---|---|---|---|---|
| `#/home` | 22 | 92 | 7,3 s | 54,5 s | 466 ms | 0,843 | 14 649 ko | 57 |
| `#/states` | 25 | 93 | 7,3 s | 7,5 s | 420 ms | 0,843 | 2 192 ko | 64 |
| `#/state/LK-20` | 45 | 94 | 7,3 s | 7,6 s | 540 ms | 0,014 | 1 344 ko | 6 |
| `#/state/BA-01` | 39 | 94 | 7,2 s | 7,6 s | 816 ms | 0 | 3 316 ko | 8 |
| `#/constitution` | 27 | 92 | 7,3 s | 7,5 s | 358 ms | 0,857 | 1 303 ko | 4 |
| `#/map` | 29 | 91 | 7,3 s | 7,3 s | 3 756 ms | 0 | 1 303 ko | 4 |

Composition du fichier unique (2 897 ko, 1 334 ko en gzip) :

| Part | Poids brut |
|---|---|
| Quatre textes de la Constitution (en, zap, sre, ist) | 666 ko |
| Drapeaux en base64 (60 images) | 792 ko |
| Polices en base64 | 265 ko |
| `textes.json` | 351 ko |
| Gabarit (CSS 85 ko, JS 296 ko) | 387 ko |
| `geo.json` | 214 ko |

| Id | Constat | Sév. | Effort |
|---|---|---|---|
| P-1 | Premier affichage à 7,3 s sur toutes les pages : rien ne s'affiche avant que les 1 334 ko du fichier unique soient arrivés et exécutés. Un visiteur venu d'un post pour voir un drapeau télécharge les quatre Constitutions et les 54 drapeaux. Le build lié existe déjà : le déployer (HTML léger, JSON à la demande, polices en fichiers) ramène le premier affichage sous 2 s sans changer le gabarit. **Décision attendue** : le fichier unique reste-t-il le format déployé ? | **B** | M |
| P-2 | L'accueil charge 46 photos, dont les 22 images du diaporama d'ouverture, dès l'arrivée : 14,6 Mo, LCP à 54,5 s. Charger la première, puis les suivantes une par une avant leur passage. | M | S |
| P-3 | Décalage de mise en page de 0,843 (seuil : 0,1) sur l'accueil, les États et la Constitution : le pied de page s'affiche avant le contenu de `#app`, puis est repoussé. Réserver la hauteur de `main` (`min-height: 100vh`) suffit. | M | S |
| P-4 | `#/map` bloque le fil principal 3,8 s sur mobile (TBT 3 756 ms) : projection du globe et des 1 428 lumières. | M | L |
| P-5 | Les images n'ont ni `srcset`, ni `decoding`, et 6 seulement ont `loading="lazy"`. Les photos sont servies en 1280 px à un écran de 375 px. | m | M |
| P-6 | Les polices sont en base64 dans le HTML (265 ko non mis en cache séparément, non préchargeables). | m | S |

Précision de méthode : sans compression (serveur `http.server` simple), les mêmes mesures
donnent un premier affichage à 14,9 s et des scores de 12 à 25. Les chiffres du tableau sont
ceux du cas favorable.

## 7. Partage

| Id | Constat | Sév. | Effort |
|---|---|---|---|
| S-1 | Aucune balise `og:*`, `twitter:*` ni `meta description` dans le gabarit. Un lien posté sur X ou en story Instagram n'a ni image ni titre propre. | **B** | S |
| S-2 | Les routes en `#` ne sont pas vues par les robots de X, Meta, WhatsApp ou Telegram : même avec des balises, `…/BK-Conf/#/state/LK-20` donnerait l'aperçu de l'accueil. Il faut une adresse réelle par État. Solution proposée : `build_portail.py` génère `s/<code>/index.html` pour les 54 entités (titre, description tirée de la note de drapeau, image, puis redirection vers `#/state/<code>`), entièrement depuis les JSON. | **B** (avec S-1) | M |
| S-3 | Pas d'image de partage. Format attendu : 1200 × 630. Elle peut être composée par script à partir du drapeau source (`images-sources/drapeaux/`), du nom et du code, sans rien dessiner. La composition est un choix visuel : à valider avec la direction retenue. | M | M |
| S-4 | Pas de bouton de partage ni de copie du lien sur la fiche. | m | S |
| S-5 | Pas de `sitemap.xml`, pas d'adresse canonique. | m | S |

## Points de fond en attente de décision

Je propose une option, je n'applique rien.

1. **Palette (V-1).** Recommandé : l'interface revient aux quatre couleurs canoniques, avec
   trois neutres dérivés du bleu (encre, gris de texte, filet) inscrits dans
   `docs/canon/couleurs-symboles.md`. L'indigo `#1f2742` et les ors `#b88a14` / `#f8c300`
   sortent du chrome. Autre voie : garder l'indigo et documenter les dérivés actuels.
2. **Format déployé (P-1).** Recommandé : déployer le build lié sur Pages et garder le fichier
   unique comme export téléchargeable.
3. **Adresses de partage (S-2).** Recommandé : `s/<code>/` générées au build.
4. **Codes de langue (L-2).** Recommandé : garder `sl`, `sh`, `bg` pour la synthèse vocale et
   l'écrire dans le glossaire ; je n'ai pas d'argument de fond pour un autre choix.
5. **Animations (ADR du 23 octobre).** Voir `PROPOSITIONS.md` : une seule des animations
   proposées demande un amendement.

## Annexe : reproduire

```
python scripts/build_portail.py && (cd portail && python -m http.server 8000) &
python docs/audit/capture.py            # 115 captures et metrics.json
python docs/audit/build_protos.py       # prototypes
```

Captures : `docs/audit/captures/<page>-<largeur>.webp` (25 types de page × 375, 768, 1440 px ;
5 pages × 4 langues et écritures × 375 et 1440 px), réduites à 1 000 px de large.
