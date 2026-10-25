# ADR 2026-10-25 — Drapeau de Timok (TK-39) : armes de la Serbie insurgée

## Statut
Gelé. Décision de l'utilisateur du 2026-10-25 : « Change le drapeau du Timok avec celui-ci ».

## Contexte
Le drapeau précédent de TK-39 était un tiercé en fasce gueules, azur et or, chargé d'une
grande étoile d'or à douze rais sur la bande d'azur (« étoile montante du confluent du
Timok »), sans référence historique propre à l'État.

## Décision
Nouveau drapeau : **champ de gueules chargé, au centre, des armes de la Serbie insurgée
(Premier soulèvement serbe, 1804-1813)** :
- deux cartouches baroques : la croix serbe aux quatre briquets (*ocila*) et, sur azur,
  la hure de sanglier tribalienne percée d'une flèche ;
- une couronne entre deux heaumes couronnés, deux bras brandissant le sabre ;
- un trophée de bannières, fusils, tambour et canons.

Le Timok rattache ainsi son drapeau au soulèvement de 1804, dont il fut un théâtre
majeur (défense de Negotin par Hajduk Veljko, 1813).

## Conséquences
- Source brute ajoutée : `images-sources/drapeaux/Timok-Flag-v2.jpg` (1728 × 1152).
  `Timok-Flag.png` (ancien drapeau) est conservé, les sources n'étant jamais modifiées.
- `portail/data/state_flags.json[TK-39]` réencodé par `encode_flag()` (400 px, 64 couleurs,
  Floyd-Steinberg) : 48 ko au lieu de 7 ko, le motif étant détaillé.
- `FLAGNOTE.TK` réécrit (anglais, portail public).
