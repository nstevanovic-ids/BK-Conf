# ADR 2026-11-06 — Drapeaux de Severen Vardar, Zapaden Vardar et Bregalnica

## Statut
Gelé. Choix de l'utilisateur du 2026-11-06 : « Pour Severen Vardar je mettrais celui-ci, et
pour Zapaden celui-là. Enfin, pour Bregalnica le dernier », sur quatre images fournies (le
drapeau à l'aigle et la couverture du *Macedonian Herald* qui le publie, le tricolore à l'écu,
le disque au soleil). Les pistes dessinées par Claude (Kokino, Kameni most, Pismo, Oriz) sont
écartées.

## Contexte
Severen Vardar (VS-45) et Bregalnica (BE-03), créés par la passe de fondation
(ADR 2026-11-05-passe-de-fondation.md), n'avaient pas de drapeau. Zapaden Vardar (VZ-46)
avait le rouge-noir-rouge à l'aigle byzantin.

## Décision
**Severen Vardar (VS-45)** : coupé de gueules et de sable ; brochant, l'aigle bicéphale d'or
éployé, accompagné de trois étoiles d'or à six rais autour des têtes. C'est le drapeau proposé
pour la Macédoine par le Flag Institute de Londres en 1995 (*Flagmaster* no 80), reproduit en
couverture du *Macedonian Herald* no 16 (juin 2021, J. Jonovski, « Macedonian flag on the
pages of Flagmaster »).

**Zapaden Vardar (VZ-46)** : tricolore horizontal de gueules, de sable et d'argent ; au centre,
sous une couronne murale d'or, un écu coupé : au chef, parti du lion macédonien d'or et de
l'aigle bicéphale de sable, chacun sur gueules ; en pointe, le soleil rayonnant d'or sur
gueules. Le lion et le soleil macédoniens avec l'aigle albanais, pour un État où vit la
communauté albanaise du Vardar occidental (entité BKSVP). Remplace le rouge-noir-rouge à
l'aigle byzantin.

**Bregalnica (BE-03)** : de gueules ; au centre, un disque de sable cerclé d'or, chargé du
soleil d'or à seize rais de Vergina.

## Points de vigilance (signalés à l'utilisateur, sans changer la décision)
- Le coupé rouge et noir est aussi le drapeau historique de l'ORIM (VMRO), revendiqué en
  Macédoine et en Bulgarie, et porté en 1944 par l'État fantoche de Macédoine.
- Le soleil de Vergina a été retiré de l'usage public en Macédoine du Nord en application de
  l'accord de Prespa (2018, art. 8). Il figure déjà sur le drapeau de Pirin (PR-27), État
  bulgare voisin de Bregalnica.

## Conséquences
- Sources : `images-sources/drapeaux/Severen-Vardar-Flag.png` (642 × 436, découpé dans la
  couverture du *Macedonian Herald*), `Zapaden-Vardar-Flag-v2-ondule.jpg` (image fournie,
  ondulée) et `Zapaden-Vardar-Flag-v2.png` (mise à plat : bandes en aplat, écu et couronne
  ramenés aux couleurs pleines), `Bregalnica-Flag.jpg` (1280 × 657).
  `Flag_of_Zapaden-Vardar.webp` est gardé, non utilisé.
- `scripts/encode_drapeaux.py` : MAPPING `BE-03`, `VS-45`, `VZ-46` ; `--verify` : 53/53.
- `portail/data/flagnotes.json` : notes BE, VS, VZ, traduites dans les trois standards.
- Tunxa (TU-42) reçoit le sien le même jour (ADR 2026-11-06-drapeau-tunxa.md).
