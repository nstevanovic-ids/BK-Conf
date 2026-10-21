# Films d'États

Chaque fiche État (`#/state/<code>`) peut s'ouvrir sur un film en boucle, muet et sans
commandes, plein écran sous l'en-tête, avec le titre de l'État, son drapeau et son code
en surimpression. Les États sans film gardent la fiche classique. Dans l'annuaire
(`#/states`), la carte d'un État filmé porte un badge **Film** et laisse apparaître le
poster au survol.

| Fichier | Rôle |
|---------|------|
| `<code>.mp4` | H.264 1280×720 (CRF 28, plafond 2,6 Mbit/s), sans son — écrans larges |
| `<code>-480.mp4` | H.264 854×480 (CRF 29, plafond 1,2 Mbit/s), sans son — téléphones (≤ 680 px) |
| `<code>.jpg` | poster (première image) : affiché avant lecture et en mouvement réduit |

Le manifeste `portail/data/videos.json` liste les États filmés ; le portail ne
cherche aucun fichier qui n'y figure pas.

## Ajouter un film

```bash
python scripts/encode_video.py BA-01 chemin/vers/video_brute.mp4
python scripts/build_portail.py --inline
```

Le script :
- fond les 15 premières images dans la fin de la vidéo : la boucle ne montre plus de
  coupe, la dernière image enchaîne sur la première ;
- supprime la piste son, produit les deux tailles et le poster, retire les métadonnées
  de la source (signature du générateur, vignette jointe) ;
- plafonne le débit : une source très détaillée (grain, accentuation) garde le même
  poids que les autres (≈ 5 Mo en 720p, ≈ 2 Mo en 480p) au lieu de le doubler ;
- inscrit l'État dans `videos.json`.

La vidéo brute n'est pas versionnée (≈ 20 Mo pour 15 s) : la conserver hors du dépôt.

## Comportement

- Lecture automatique en boucle, uniquement tant que le bandeau est visible (pause
  hors écran et onglet masqué). Aucun bouton, aucun son.
- `prefers-reduced-motion` ou économiseur de données : poster seul, la vidéo n'est
  pas chargée.

| État | Film | Durée | Contenu |
|------|------|-------|---------|
| BA-01 Bosanska Krajina | 2026-10-18 (v2), Grok Imagine | 14,4 s | Una (rapides, vue zénithale), village et minaret, rivière, rétroviseur au couchant, fleurs, guitariste en ville, drapeau de Bosanska Krajina au vent sur la vallée |
| BC-02 Bačka | 2026-10-19, Grok Imagine | 14,4 s | Petrovaradin sur le Danube, salaš dans les vergers, champs de tournesols, place de l'hôtel de ville de Subotica, plaine et canal au couchant, drapeau de Bačka au vent |
| BN-03 Banat | 2026-10-20, Grok Imagine | 14,4 s | Hôtel de ville à beffroi, lac et plage, rue piétonne fleurie, maison banatienne, collines sableuses, vignobles, drapeau du Banat au vent |
| BR-04 Baraña | 2026-10-20, Grok Imagine | 14,4 s | Monument de Batina sur le Danube, rues de village, ville au bord du Danube, vignobles à vélo, Kopački rit, drapeau de Baraña au vent |
| BZ-05 Zapadna Bosna | 2026-10-21, Grok Imagine | 14,4 s | Cathédrale du Christ-Sauveur (vue zénithale), mosquée Ferhadija, forteresse Kastel sur le Vrbas, rafting dans le canyon du Vrbas, monastère orthodoxe, moulins et cascades de Krupa na Vrbasu, drapeau de Zapadna Bosna au vent |
