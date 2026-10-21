# ADR 2026-10-22 — Verrou des registres nationaux

## Statut
Accepté. Décision de l'utilisateur du 2026-10-22 : « On choisit son peuple une seule fois,
ça doit être irrévocable ou en tout cas, à la rigueur, changeable tous les 15 ou 20 ans »,
puis « Verrou de 20 ans avec effet différé pour les élections ». Constitution portée en
version 4.3 (annexe J).

## Constat
- **Texte en vigueur contraire à l'intention** : l'art. 102 déclarait le choix du registre
  « personnel, volontaire et modifiable », formule inchangée depuis la v1. Le canon
  `citoyennete.md`, le parcours `#/register` (« revocable », « may be amended at any time »)
  et la spécification Decidim (`workflow.renewable = true`) la reprenaient.
- **Capture des petites délégations** : chaque peuple élit dix membres du Narodni Sabor dans
  une circonscription unique, quelle que soit sa taille. Avec un registre modifiable à tout
  moment, un transfert d'électeurs depuis un registre nombreux suffit à prendre une petite
  délégation. Le registre monténégrin compterait 250 000 à 300 000 inscrits ; environ
  100 000 électeurs du registre serbe, moins de 2 % de ses inscrits, en feraient basculer
  la délégation. La délégation emporte un siège au Konfederalno Veće (art. 112), deux juges
  du Ustavni Sud (art. 117) et le droit de consentement obligatoire (art. 109 a).
- **Les identités déclarées bougent** : au Monténégro, la part des Monténégrins est passée
  de 61,9 % (1991) à 43,2 % (2003), celle des Serbes de 9,3 % à 32,0 %. Le risque de capture
  est réel ; une irrévocabilité totale enfermerait aussi des citoyens, notamment issus de
  familles mixtes, dans un registre qui n'est plus le leur.

## Décision
1. **Inscription à 18 ans révolus**, âge du vote (art. 104).
2. **Verrou de vingt ans** : nul ne s'inscrit à un autre registre avant vingt ans à compter
   de sa précédente inscription.
3. **Retrait libre** (nul n'est contraint de déclarer son appartenance), sans abréger le
   verrou : un retrait ne permet pas de s'inscrire à un autre registre avant son terme. Le
   retour au registre quitté reste possible ; c'est une nouvelle inscription.
4. **Effet différé** : une inscription ou un changement de registre ne vaut, pour
   l'élection du Narodni Sabor et l'éligibilité, qu'à compter de la première élection tenue
   plus d'un an après la demande. Nul ne s'inscrit ou ne change de registre en vue d'une
   élection donnée ; le réservoir des non-inscrits ne peut pas être mobilisé à la veille
   d'un scrutin.
5. **Éligibilité au Narodni Sabor** réservée aux inscrits au registre du peuple (art. 108).
6. **Ancienneté de huit ans**, soit deux législatures, au registre du peuple pour les
   candidats au Konfederalno Veće (art. 112) et au Ustavni Sud (art. 117).

## Propagation
- `docs/constitution/v4.md` et `v4.en.md` : art. 102, 108, 112 et 117 ; version 4.3 ;
  annexe J. `portail/data/constitution.json` régénéré.
- `docs/canon/citoyennete.md` : étape 3, section « Registre national », Decidim.
- Portail :
  - Institutions : nœuds Citizens, Narodni Sabor, Konfederalno Veće et Ustavni Sud ;
  - Participation : étape 3 et texte de la carte ;
  - parcours `#/register` : le verrou est appliqué ;
  - carte `#/citizen` : date d'inscription, effet et verrou ;
  - Journal officiel : entrée v4.3.
- Prototype : la carte enregistre `reg = {p, since}` (dernier registre et date
  d'inscription). Une carte antérieure sans `reg` est réputée inscrite à sa date
  d'émission.
