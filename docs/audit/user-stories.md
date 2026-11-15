# User stories du portail

Chaque story renvoie aux constats de `AUDIT.md`. Priorité MoSCoW : **M** indispensable,
**S** important, **C** souhaitable, **W** hors de cette refonte.
Les critères sont vérifiables par un test Playwright ou une mesure Lighthouse.

## Personas

| Persona | Contexte | Ce qu'il attend |
|---|---|---|
| **P1, le visiteur venu d'un post** | Arrive sur mobile depuis X ou Instagram, sur la fiche d'un État, sans connaître le projet. Dix secondes d'attention. | Voir tout de suite ce qu'on lui a promis, comprendre où il est, avoir envie de continuer. |
| **P2, le passionné de vexillologie et d'héraldique** | Ordinateur ou tablette. Compare, zoome, lit les notes. | Des drapeaux et des blasons nets, leur description, un parcours d'un État à l'autre. |
| **P3, le lecteur de la Constitution** | Lit longuement, cite des articles. | Un texte lisible, des liens stables vers un article, une recherche par numéro. |
| **P4, le « citoyen » qui cherche son État** | Connaît sa ville ou sa commune, souvent sous son nom courant. Lit en zapadni, središñi ou istočni, parfois en cyrillique. | Trouver son État par le nom d'une commune, dans sa langue. |
| **P5, l'éditeur (Nikola)** | Ajoute un État, un blason ou un film en modifiant les JSON, depuis le navigateur. | Que tout suive les données sans retoucher le gabarit, et que le build signale ce qui manque. |

## P1, le visiteur venu d'un post

| Id | Story | Critères d'acceptation | Prio. | Constats |
|---|---|---|---|---|
| US-1 | En tant que visiteur, je veux que le lien d'un État affiche son drapeau et son nom dans l'aperçu du réseau, afin de savoir ce que j'ouvre. | Chaque entité a une adresse sans `#` (`s/<code>/`). Sa page porte `og:title`, `og:description`, `og:image` (1200 × 630), `twitter:card`. Les 54 adresses répondent 200 et mènent à la fiche. Générées par le build, depuis les JSON. | M | S-1, S-2, S-3 |
| US-2 | En tant que visiteur sur mobile, je veux voir la fiche en moins de 2,5 s, afin de ne pas repartir. | Lighthouse mobile sur `#/state/<code>` : FCP ≤ 2,0 s, LCP ≤ 2,5 s, CLS ≤ 0,1, poids ≤ 500 ko hors film. | M | P-1, P-3, P-6 |
| US-3 | En tant que visiteur, je veux que le nom, le drapeau et trois chiffres de l'État tiennent sur le premier écran, afin de comprendre sans défiler. | À 375 × 812, le titre, le drapeau entier, le code et le peuple sont visibles sans défilement, quel que soit le gabarit (avec ou sans film, avec ou sans blason). | M | C-2, V-5 |
| US-4 | En tant que visiteur, je veux passer à l'État suivant ou précédent, afin de continuer sans revenir à la liste. | Chaque fiche a deux liens « précédent » et « suivant » dans l'ordre des codes ; cibles ≥ 44 px ; atteignables au clavier. | S | U-6, U-9 |
| US-5 | En tant que visiteur, je veux copier le lien de la fiche, afin de la partager à mon tour. | Un bouton copie l'adresse de partage (`s/<code>/`) ; un message confirme, annoncé par `aria-live`. | S | S-4 |
| US-6 | En tant que visiteur arrivé sur un lien mort, je veux un message clair et un chemin de retour, afin de ne pas croire que le site est cassé. | Route inconnue : page « introuvable » avec titre, lien vers les États et recherche. `#/etat/<code>` redirige vers `#/state/<code>`. Les codes sont lus sans tenir compte de la casse. | S | U-2, U-3 |
| US-7 | En tant que visiteur, je veux que l'accueil se charge vite, afin de voir le projet avant de me lasser. | `#/home` : poids initial ≤ 1,5 Mo, une seule image du diaporama chargée avant interaction, LCP ≤ 2,5 s. Le Journal officiel montre 5 entrées au plus et un lien vers `#/journal`. | S | P-2, V-7 |

## P2, le passionné de vexillologie et d'héraldique

| Id | Story | Critères d'acceptation | Prio. | Constats |
|---|---|---|---|---|
| US-8 | En tant que passionné, je veux des drapeaux nets à toutes les tailles, afin d'en lire le détail. | Aucun drapeau affiché au-delà de sa taille source × densité d'écran : source ≥ 800 px pour la fiche, vignette distincte pour la grille (`srcset`). Proportions d'origine respectées, sans rognage. | M | C-3, C-4, P-5 |
| US-9 | En tant que passionné utilisant un lecteur d'écran, je veux que chaque drapeau et chaque blason soit nommé, afin de savoir ce qui est montré. | 54 drapeaux et 10 blasons avec un texte alternatif (« Flag of … », « Coat of arms of … »), traduit dans les trois standards. Zéro image informative sans nom (axe ou Lighthouse). | M | A-1 |
| US-10 | En tant que passionné, je veux une fiche soignée même sans blason ni film, afin que tous les États soient traités avec le même sérieux. | La fiche sans blason n'affiche ni cadre vide ni erreur réseau ; sa composition reste équilibrée à 375, 768 et 1440 px. Zéro requête 404. | S | C-1, C-2 |
| US-11 | En tant que passionné, je veux voir le drapeau s'agrandir de la grille à la fiche, afin de garder le fil de ce que je regarde. | Le drapeau est l'élément partagé de la transition (View Transitions) ; durée 620 ms ; sans prise en charge ou en mouvement réduit, changement immédiat. | C | ADR 2026-10-23 |
| US-12 | En tant que passionné, je veux parcourir les 54 drapeaux sur mobile sans 25 écrans de défilement, afin de comparer. | À 375 px, `#/states` tient en 13 écrans au plus (deux colonnes) ; le champ de recherche fait toute la largeur. | S | U-7, U-8 |

## P3, le lecteur de la Constitution

| Id | Story | Critères d'acceptation | Prio. | Constats |
|---|---|---|---|---|
| US-13 | En tant que lecteur, je veux trouver un article par son numéro, afin d'y aller directement. | « art 102 », « article 102 » et « 102 » donnent l'article 102 en premier résultat ; idem « 130 ter ». | S | U-5 |
| US-14 | En tant que lecteur, je veux copier le lien d'un article, afin de le citer. | Chaque article a un lien d'ancre visible au survol et au focus ; l'adresse copiée rouvre l'article dans la langue courante. | C | U-10 |
| US-15 | En tant que lecteur, je veux un titre d'onglet par page, afin de m'y retrouver entre plusieurs onglets. | `document.title` = « <page> · Balkan Confederation » pour les 25 types de page, traduit ; annoncé après chaque changement de route. | M | U-1, A-3 |
| US-16 | En tant que lecteur, je veux un texte courant et des notes lisibles, afin de lire longtemps. | Aucun texte sous 12 px ; contraste ≥ 4,5 pour tout texte, ≥ 3 pour les bordures de champ, dans les deux thèmes ; zéro échec `color-contrast`. | M | V-4, A-2 |
| US-17 | En tant que lecteur au clavier, je veux aller droit au contenu, afin de ne pas traverser 15 liens à chaque page. | Un lien d'évitement est le premier élément focalisable ; après navigation, le focus va au titre de la page ; à la fermeture de la recherche, il revient au bouton. | M | A-3, A-4, A-5 |

## P4, le « citoyen » qui cherche son État

| Id | Story | Critères d'acceptation | Prio. | Constats |
|---|---|---|---|---|
| US-18 | En tant que citoyen, je veux trouver mon État en tapant le nom courant de ma ville, afin de ne pas devoir connaître l'alphabet v3. | « ljubljana », « Ljubljana », « Ļubļana » et « Љубљана » donnent Krañska ; la recherche lit les alias de `opstine.json` et ignore les diacritiques. | M | U-4 |
| US-19 | En tant que citoyen lisant en istočni cyrillique, je veux une interface qui tienne dans ma langue, afin de ne rien voir coupé. | Aucun texte tronqué ni débordement dans les quatre langues et les deux écritures à 375 px, sur tous les composants de la refonte (test de capture). | M | L-3, U-7 |
| US-20 | En tant que citoyen, je veux comprendre le sélecteur de langue, afin de choisir la mienne. | Chaque sigle porte le nom complet du standard en infobulle et en libellé accessible. | S | L-5 |
| US-21 | En tant que citoyen utilisant un lecteur d'écran, je veux que les noms sud-slaves soient prononcés correctement en page anglaise, afin de les reconnaître. | Les noms d'États, d'institutions et la devise portent un attribut `lang` dans l'interface anglaise. Le code retenu dépend de la décision L-2. | C | L-1, L-2 |

## P5, l'éditeur

| Id | Story | Critères d'acceptation | Prio. | Constats |
|---|---|---|---|---|
| US-22 | En tant qu'éditeur, je veux qu'un État ajouté dans les JSON ait sa fiche, sa carte de grille, son adresse de partage et son image d'aperçu sans toucher au gabarit, afin de publier depuis le navigateur. | Ajouter une entrée de test à `etats.json`, `stats.json`, `state_flags.json`, `flagnotes.json` puis lancer le build produit la fiche, `s/<code>/` et l'image. Aucune chaîne ni couleur en dur dans le gabarit pour un État. | M | S-2, C-1 |
| US-23 | En tant qu'éditeur, je veux que le build me dise ce qui manque, afin de ne rien oublier. | Le build affiche la matrice de couverture (drapeau, note × 4 langues, blason, film, statistiques) et échoue si un drapeau ou une note manque. | S | section 1 |
| US-24 | En tant qu'éditeur, je veux un seul jeu de jetons (couleurs, tailles, espacements), afin que tout nouveau composant soit cohérent d'office. | ≤ 12 couleurs, ≤ 8 tailles de police, ≤ 10 pas d'espacement déclarés en variables ; aucune valeur hors jeton dans les composants refondus ; variables de peuples retirées. | M | V-1, V-2, V-3, V-6 |
| US-25 | En tant qu'éditeur, je veux que toute nouvelle chaîne d'interface passe par `L` et ses trois traductions, afin que le portail reste entièrement traduit. | `python scripts/textes.py check` reste à 0 clé manquante après chaque lot. | M | contrainte du brief |
| US-26 | En tant qu'éditeur, je veux des captures et des mesures avant et après dans chaque PR, afin de valider d'un coup d'œil. | `docs/audit/capture.py` et Lighthouse relancés à chaque lot ; résultats joints à la PR. | S | section 6 |

## Hors périmètre de cette refonte (W)

| Id | Sujet | Pourquoi |
|---|---|---|
| US-27 | Fluidité de `#/map` sur mobile (P-4) et unification visuelle de la carte avec le reste (V-8) | Chantier à part, effort L ; à reprendre si la direction 3 est retenue. |
| US-28 | Formes bulgares du cyrillique dans le texte courant (V-9) | Point de fond typographique, décision de l'auteur. |
| US-29 | Les 44 blasons et 48 films manquants | Contenu, pas interface. |
| US-30 | Les 6 avertissements v3 de `textes.py` (L-4) | Workstream alphabet. |

## Récapitulatif

| Priorité | Stories |
|---|---|
| M (13) | US-1, 2, 3, 8, 9, 15, 16, 17, 18, 19, 22, 24, 25 |
| S (10) | US-4, 5, 6, 7, 10, 12, 13, 20, 23, 26 |
| C (3) | US-11, 14, 21 |
| W (4) | US-27 à 30 |
