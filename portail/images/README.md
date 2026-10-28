# Emplacements d'images du portail

Dépose ici les photos, **avec exactement le nom de fichier indiqué** (extension
`.jpg`). Chaque emplacement affiche un cadre indicatif tant que le fichier est
absent ; dès que tu déposes l'image et pousses, elle apparaît sur le site (le
workflow Pages copie ce dossier). Vise des JPEG optimisés (< ~400 Ko chacun).

| Fichier | Catégorie | Sujet | Dimensions conseillées | Où |
|---------|-----------|-------|------------------------|----|
| `home-hero.jpg` | Paysage | Panorama balkanique / côte adriatique | 2400×1400 | Accueil — hero plein écran |
| `home-adriatic.jpg` | Paysage | Mer et montagnes | 2400×1100 | Accueil — bande parallax « The land » |
| `home-peoples.jpg` | Humain | Visages des sept peuples | 1800×1200 | Accueil — section « Seven peoples » |
| `home-assembly.jpg` | Politique | Assemblée / institution / cérémonie | 1800×1200 | Accueil — section « Institutions » |
| `home-citizen.jpg` | Humain | Citoyen · vie quotidienne | 2400×1100 | Accueil — bande « Citizenship » |
| `home-closing.jpg` | Paysage | Ville historique au crépuscule | 2400×1100 | Accueil — bande finale (devise) |
| `identity-people.jpg` | Humain | La langue vivante · portraits | 1800×1000 | Page Identity — bande |
| `institutions-hall.jpg` | Politique | Hémicycle / palais fédéral | 1800×1000 | Page Institutions — bande |
| `participation-crowd.jpg` | Humain | Citoyens · place publique | 2400×1000 | Page Participation — bande |
| `security-zandarmerija.jpg` | Sécurité | Konfederalna Žandarmerija · Granična Straža | 1500×1000 | Page Security and Defence — encart Žandarmerija |
| `security-istrazni-ured.jpg` | Sécurité | Konfederalni Istražni Ured · enquêteurs | 1500×1000 | Page Security and Defence — encart Istražni Ured |
| `security-obavestajna-agencija.jpg` | Sécurité | Konfederalna Obavěštajna Agencija · renseignement | 1500×1000 | Page Security and Defence — encart Obavěštajna Agencija |
| `security-armed-forces.jpg` | Sécurité | Forces armées confédérales | 1500×1000 | Page Security and Defence — encart forces armées |

Images générées (ne pas remplacer à la main) : `wallet-logo.png` (660×660) et
`wallet-hero.png` (1032×336), logo et bandeau du pass Google Wallet de la carte citoyenne,
produits par `scripts/gen_wallet_images.py` et référencés par leur URL publique par le
registre (`registre/src/wallet.js`).

Cadrage : les images sont affichées en `object-fit: cover` (recadrées au
besoin) ; garde le sujet vers le centre. Les emplacements sont définis dans
`portail/index.html` (objet `SLOTS`) — pour en ajouter/retirer, éditer cet objet.
