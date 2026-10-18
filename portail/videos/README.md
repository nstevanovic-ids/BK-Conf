# Films d'États

Chaque fiche État (`#/state/<code>`) peut s'ouvrir sur un film en boucle, muet par
défaut, plein écran sous l'en-tête : titre de l'État, drapeau et code en surimpression,
boutons lecture/pause et son, barre de progression or. Les États sans film gardent la
fiche classique. Dans l'annuaire (`#/states`), la carte d'un État filmé porte un badge
**Film** et laisse apparaître le poster au survol.

| Fichier | Rôle |
|---------|------|
| `<code>.mp4` | H.264 1280×720 (CRF 28) + AAC 96 kbit/s — écrans larges |
| `<code>-480.mp4` | H.264 854×480 (CRF 29) + AAC 64 kbit/s — téléphones (≤ 680 px) |
| `<code>.jpg` | poster (première image) : affiché avant lecture et en mouvement réduit |

Le manifeste `portail/data/videos.json` liste les États filmés ; le portail ne
cherche aucun fichier qui n'y figure pas.

## Ajouter un film

```bash
python scripts/encode_video.py BA-01 chemin/vers/video_brute.mp4
python scripts/build_portail.py --inline
```

Le script :
- fond les 15 premières images dans la fin de la vidéo (vidéo et son) : la boucle ne
  montre plus de coupe, la dernière image enchaîne sur la première ;
- produit les deux tailles et le poster, retire les métadonnées de la source
  (signature du générateur, vignette jointe) ;
- inscrit l'État dans `videos.json`.

La vidéo brute n'est pas versionnée (≈ 20 Mo pour 15 s) : la conserver hors du dépôt.

## Comportement

- Lecture automatique muette, uniquement tant que le bandeau est visible (pause hors
  écran et onglet masqué).
- Pause manuelle respectée : le film ne repart pas seul au retour dans la page.
- `prefers-reduced-motion` ou économiseur de données : poster seul, lecture à la demande.
- Le bouton son n'apparaît que si la vidéo a une piste audio.

| État | Film | Durée | Contenu |
|------|------|-------|---------|
| BA-01 Bosanska Krajina | 2026-10-18, Grok Imagine | 14,4 s | Una (rapides, vue zénithale), village et minaret, rivière et balançoire, fleurs, rétroviseur au couchant, guitariste en ville |
