# ADR 2026-10-24 — Constitution v4.7 : finances, Kongres, révision et dispositions finales

## Statut
Accepté le 2026-10-24. Dans la liste de ce qui restait à faire, l'utilisateur a validé le
bloc A (« Ok pour le point A ») :
- A1, titre 8 sur la révision, avec des garanties révisables seulement par les sept
  délégations ;
- A2, titre 9 sur les dispositions finales et transitoires ;
- A3, régime fiscal sur le modèle suisse ;
- A4, Kongres de 250 délégués.

A5, le statut des mineurs, est reporté (priorité basse). Constitution portée en version 4.7
(annexe N) : seize articles nouveaux, soit 190 articles en dix titres.

## Constat
- **Finances** : seuls les droits de douane, l'impôt sur les carburants et la surtaxe sur
  les véhicules avaient une base constitutionnelle (art. 97). Le titre 6 dit comment
  redistribuer l'argent, pas comment la Confédération le lève. La lacune était relevée
  depuis la v4.2.
- **Kongres** : le nombre total de délégués était renvoyé à la loi, sans méthode de
  répartition.
- **Révision** : il n'existait aucune procédure propre, seulement les art. 109 a, 110, 121
  et 123 sur des points précis. Avec la règle ordinaire (six délégations sur sept), six
  peuples pouvaient retirer au septième la parité, le consentement ou la liberté
  d'inscription.
- **Dispositions finales** : rien ne réglait l'entrée en vigueur ni la mise en place des
  organes. Appliqué à la lettre, l'art. 102 (effet différé d'un an) empêchait toute
  inscription de compter pour la première élection du Narodni Sabor. Les art. 112 et 117
  (huit ans d'inscription) rendaient impossibles le premier Konfederalno Veće et le premier
  Ustavni Sud.

## Décisions

### 1. Régime des finances (titre 3, chapitre 3, art. 99 bis à 99 septies)
Le chapitre reprend la structure de la Constitution suisse, où le « Régime des finances »
suit les compétences (art. 126 à 134). Il est donc placé au titre 3. Le titre 6 garde la
péréquation, la proportionnalité et le contrôle.

| Article | Contenu | Modèle suisse |
|---|---|---|
| 99 bis | Frein à l'endettement : plafond des dépenses selon les recettes et la conjoncture, relèvement exceptionnel à la majorité absolue du Kongres, compensation des dépassements ; contrôle annuel de la Cour des comptes | art. 126 |
| 99 ter | La Confédération ne lève que les impôts que la Constitution lui attribue ; légalité, universalité, égalité, capacité économique ; **aucun impôt selon l'appartenance nationale ou le registre** ; double imposition interdite ; taux maximaux relevables seulement par révision | art. 3, 127 |
| 99 quater | Impôt direct confédéral : **10 % au plus** (personnes physiques), **8 % au plus** (personnes morales) ; taxé et perçu par les États ; **un quart au moins** leur revient | art. 128 (11,5 %, 8,5 %, 17 % au moins aux cantons) |
| 99 quinquies | Harmonisation des impôts directs, hors barèmes, taux et montants exonérés ; lutte contre les avantages fiscaux injustifiés | art. 129 |
| 99 sexies | TVA confédérale exclusive : **18 % au plus** (taux normal), **8 % au plus** (taux réduit : alimentation, médicaments, livres et presse) ; **30 %** du produit net aux États et aux municipalités confédérales autonomes, selon la population ; aucun impôt général sur la consommation dans les États | art. 130 et 134 |
| 99 septies | Impôts spéciaux (tabac, alcool), droits de timbre, impôt anticipé (10 % aux États) ; interdiction des impôts du même genre dans les États | art. 131, 132 et 134 |

Les taux sont des **propositions**. Ils restent dans le bas de la fourchette régionale (TVA
de 17 % en Bosnie-Herzégovine, 18 % en Macédoine du Nord, 20 % en Serbie et en Bulgarie,
22 % en Slovénie, 25 % en Croatie), parce que les États gardent leurs propres impôts
directs. Un taux se relève par une révision de la Constitution, donc
par un vote du peuple et des États. La part de 30 % de la TVA rend les États intéressés à
l'impôt confédéral, ce qui n'est pas le cas en Suisse, où la TVA est purement fédérale.

### 2. Kongres (art. 103)
- **250 délégués**, soit un pour environ 100 600 habitants.
- Répartition selon la **méthode de Sainte-Laguë** : diviseur commun et arrondi à l'entier
  le plus proche, avec 2 à 20 sièges par État et au moins un pour Brčko et pour Mostar.
  C'est la méthode du Bundestag ; elle ne favorise ni les grandes ni les petites
  circonscriptions, à la différence de la méthode D'Hondt.
- Le Konfederalno Veće constate la répartition après chaque recensement. Elle s'applique à
  l'élection générale suivante.

Répartition actuelle, calculée sur les chiffres de `stats.json` (diviseur ≈ 106 560) :
- Beograd 16, Sofija 12, Krañska 11, Istočen Vardar 11 ;
- plafond de 20 jamais atteint ;
- 16 États ont 2 sièges ; le plancher n'agit que pour les 8 dont le quotient tombe sous 1,5,
  de Zapadni Srěm (132 635 habitants) à Stranxa (26 516) ;
- Brčko et Mostar : 1 siège chacun.

Le portail calcule la répartition en direct à partir des recensements. Il n'y a donc pas de
second tableau à maintenir.

### 3. Révision (titre 8, art. 147 à 150)
- **Art. 147, principe** :
  - révision totale ou partielle, en tout temps ;
  - toujours soumise au peuple et aux États ;
  - le consentement exprès du Narodni Sabor est requis quand la révision émane des
    autorités ;
  - les règles impératives du droit international doivent être respectées.
- **Art. 148, révision totale** :
  - initiative du peuple, du Kongres ou du Narodni Sabor ;
  - vote préalable du peuple en cas d'initiative populaire ou de désaccord des chambres ;
  - si le peuple accepte, les deux chambres sont renouvelées ;
  - le projet doit conserver les garanties de l'art. 150, sinon la majorité de cet article
    s'applique.
- **Art. 149, révision partielle** :
  - unité de la matière ;
  - initiative sous forme de projet rédigé : la forme « conçue en termes généraux » est
    écartée, faute de procédure claire pour le texte d'application ;
  - nullité prononcée par le Ustavni Sud (art. 118 e), et non par le Parlement comme en
    Suisse ;
  - recommandation des chambres et contre-projet du Kongres.
- **Art. 149, dernier alinéa** : l'initiative populaire n'est pas soumise au consentement
  du Narodni Sabor, sauf garantie renforcée. Ce point clarifie l'art. 109 a, qui vise les
  lois du Kongres. Un veto sur toute initiative aurait vidé l'art. 121. Les garanties
  renforcées protègent l'essentiel.
- **Art. 150, garanties renforcées** : elles se révisent avec les deux tiers du Narodni
  Sabor et **la majorité de chacune des sept délégations**, en plus du peuple et des États.
  Elles portent sur :
  - (a) la parité des peuples au Narodni Sabor et au Konfederalno Veće ;
  - (b) le consentement, l'alarme et la conciliation ;
  - (c) les art. 8, 9 et 11 ;
  - (d) la liberté d'inscription aux registres et le droit de n'en rejoindre aucun ;
  - (e) l'article lui-même.

  Une initiative populaire qui touche une garantie passe d'abord devant le Narodni Sabor.
  Le président du Kongres indique si un projet touche une garantie. Toute délégation peut
  contester cette indication devant le Ustavni Sud (art. 110 bis, 118 j).

### 4. Dispositions finales et transitoires (titre 9, art. 151 à 156)
- **151** :
  - entrée en vigueur le premier jour du sixième mois qui suit l'acceptation par le peuple
    et les États ;
  - les trois standards régionaux font également foi.
- **152** :
  - premières élections des deux chambres le même jour, dans les six mois ;
  - une conférence des gouvernements des États, réunie à Sarajevo, les organise jusqu'à
    l'entrée en fonction de la Chancellerie ;
  - la première législature s'achève au premier dimanche d'octobre qui suit son troisième
    anniversaire, pour caler le calendrier de l'art. 104.
- **153** :
  - Assemblée confédérale dans les trente jours ;
  - présidences commencées par le peuple slovène ;
  - Ustavni Sud dans les six mois, avec le tirage au sort de l'art. 117 ;
  - premiers mandats échelonnés par la loi pour la Banque centrale, la Cour des comptes et
    les directions des services de sécurité ;
  - la conférence expédie les affaires courantes.
- **154** :
  - registres ouverts à l'entrée en vigueur ;
  - les inscriptions déposées soixante jours avant les premières élections comptent pour le
    premier Narodni Sabor ;
  - pendant huit ans, l'ancienneté des art. 112 et 117 est remplie par une inscription
    déposée dans les six premiers mois et maintenue au même registre. Une inscription
    opportuniste, faite après coup, ne la remplit pas.
- **155** :
  - le droit antérieur est maintenu tant qu'il n'est pas contraire ;
  - constitutions des États adaptées dans les deux ans ;
  - lois d'application dans les trois ans ;
  - les délais transitoires particuliers (art. 82) courent à compter de l'entrée en vigueur.
- **156** :
  - TVA introduite au plus tard dans les trois ans ;
  - harmonisation des impôts directs dans les six ans ;
  - première formule de péréquation dans les deux ans ;
  - les monnaies existantes ont cours jusqu'au dinar.

## Propagation
- `docs/constitution/v4.md` et `v4.en.md` : version 4.7 et annexe N. Articles 103, 110,
  118 j et 121 modifiés. *Ļubļana* à l'art. 1 ter, selon la règle toponymique v3 (ADR
  2026-10-24-alphabet-transition-libelles.md).
- `portail/data/constitution.json` régénéré : 10 titres, 190 articles.
- Portail, page Institutions :
  - nouvelle section « The 250 seats of the Kongres », dont la répartition est calculée en
    direct ;
  - nouvelle section « Revising the Constitution », avec les cinq garanties ;
  - nœud Kongres du schéma « qui élit qui » ;
  - cas « Constitutional amendment » du simulateur de loi ;
  - encadré de l'initiative populaire.
- Portail, autres pages :
  - Journal officiel : entrée v4.7 ;
  - recherche : deux entrées.
- `CLAUDE.md`.
