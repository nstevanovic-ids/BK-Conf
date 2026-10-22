# ADR 2026-10-22 — Registres nationaux : période probatoire et verrou

## Statut
Accepté. Décisions de l'utilisateur du 2026-10-22, constitution portée en version 4.3
(annexe J) :
1. « On choisit son peuple une seule fois, ça doit être irrévocable ou en tout cas, à la
   rigueur, changeable tous les 15 ou 20 ans », puis « verrou de 20 ans avec effet différé
   pour les élections ».
2. Durée ramenée à quinze ans : « une Macédonienne qui part rejoindre son mari à Belgrade,
   vit à Belgrade, parle le serbe de Belgrade, peut-être qu'au bout de 15 ans elle aura
   envie de changer ».
3. Période probatoire de trois ans, « un peu comme un permis probatoire ».

## Constat
- **Texte en vigueur contraire à l'intention** : l'art. 102 déclarait le choix du registre
  « personnel, volontaire et modifiable », formule inchangée depuis la v1. Le canon
  `citoyennete.md`, le parcours `#/register` (« revocable », « may be amended at any time »)
  et la spécification Decidim (`workflow.renewable = true`) la reprenaient.
- **Capture des petites délégations** : chaque peuple élit dix membres du Narodni Sabor dans
  une circonscription unique, quelle que soit sa taille. Avec un registre modifiable à tout
  moment, un transfert d'électeurs depuis un registre nombreux suffit à prendre une petite
  délégation. Le registre monténégrin compterait 250 000 à 300 000 inscrits. Il suffirait
  d'environ 100 000 électeurs du registre serbe, moins de 2 % de ses inscrits, pour en faire
  basculer la délégation. La délégation emporte :
  - un siège au Konfederalno Veće (art. 112) ;
  - deux juges du Ustavni Sud (art. 117) ;
  - le droit de consentement obligatoire (art. 109 a).
- **Les identités déclarées bougent** : au Monténégro, la part des Monténégrins est passée
  de 61,9 % (1991) à 43,2 % (2003), celle des Serbes de 9,3 % à 32,0 %. Le risque de capture
  est réel. Mais une irrévocabilité totale enfermerait aussi des citoyens dans un registre
  qui n'est plus le leur : familles mixtes, mariage et installation dans un autre État.
- **Le choix fait à 18 ans** : une exemption de l'effet différé pour les nouveaux majeurs
  pousserait à choisir vite, pour quinze ans, au moment où l'identité est la moins fixée.
  Elle est écartée. Sans elle, un jeune sur quatre environ (majorité dans les douze mois qui
  précèdent un scrutin) ne vote pas à sa première élection du Narodni Sabor. Il vote
  néanmoins pour le Kongres et aux référendums.

## Décision
1. **Inscription à 18 ans révolus**, âge du vote (art. 104).
2. **Période probatoire de trois ans** pour une première inscription : une rectification au
   profit d'un autre registre est possible une fois. Le verrou court alors à compter de la
   rectification. Cette faculté n'ouvre aucun levier de capture : un non-inscrit choisit
   déjà librement son premier registre, et la rectification reste soumise à l'effet
   différé.
3. **Verrou de quinze ans** : hors rectification, nul ne s'inscrit à un autre registre avant
   quinze ans à compter de sa précédente inscription. La durée n'a qu'un effet marginal sur
   la capture. Le verrou rend le changement tactique coûteux, puisqu'il fait perdre la voix
   dans la délégation de son peuple pendant presque quatre législatures. Une migration
   massive et durable n'est arrêtée par aucune durée : elle relèverait d'un contrôle des
   flux entre registres, à traiter séparément.
4. **Retrait libre**, car nul n'est contraint de déclarer son appartenance. Le retrait
   n'abrège pas le verrou. Un retrait pendant la période probatoire n'éteint pas la
   rectification. Le retour au registre quitté est possible à tout moment : il ne relance
   pas le verrou, mais l'effet différé s'y applique.
5. **Effet différé** : une inscription ou un changement de registre ne vaut, pour
   l'élection du Narodni Sabor et l'éligibilité, qu'à compter de la première élection tenue
   plus d'un an après la demande.
6. **Éligibilité au Narodni Sabor** réservée aux inscrits au registre du peuple (art. 108).
7. **Ancienneté de huit ans**, soit deux législatures, au registre du peuple pour les
   candidats au Konfederalno Veće (art. 112) et au Ustavni Sud (art. 117).

## Option laissée hors de cette décision
**Registre héréditaire déclaré à la naissance par les parents.** L'utilisateur l'a évoqué
comme « un autre débat ». Objections relevées :
- **Inutile** : la période probatoire, le verrou et l'effet différé règlent déjà la
  capture, et le registre ne sert qu'au vote, ouvert à 18 ans.
- **Contraire au texte** : il heurte les art. 14 (consentement) et 102 (nul n'est contraint
  de déclarer son appartenance).
- **Familles mixtes** : les parents devraient trancher dès l'acte de naissance.
- **Précédents** : la « cinquième ligne » du passeport soviétique et les cartes d'identité
  ethniques héritées du Rwanda.

## Propagation
- `docs/constitution/v4.md` et `v4.en.md` : art. 102, 108, 112 et 117 ; version 4.3 ;
  annexe J. `portail/data/constitution.json` régénéré.
- `docs/canon/citoyennete.md` : étape 3, section « Registre national », Decidim, données du
  prototype.
- Portail :
  - Institutions : nœuds Citizens, Narodni Sabor, Konfederalno Veće et Ustavni Sud ;
  - Participation : étape 3 et texte de la carte ;
  - parcours `#/register` : période probatoire et verrou appliqués ;
  - carte `#/citizen` : date d'inscription, effet, fin de la période probatoire ou du
    verrou ;
  - Journal officiel : entrée v4.3.
- Prototype : la carte enregistre `reg = {p, since, prob, eff}`. Une carte antérieure sans
  `reg` est réputée inscrite pour la première fois à sa date d'émission.
