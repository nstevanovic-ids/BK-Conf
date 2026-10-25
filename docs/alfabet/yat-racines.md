# Yat dans les noms ekaviens : liste de racines (proposition)

**Statut : proposition, à valider.** Elle complète l'option 1 de la transition toponymique
(ADR 2026-10-25-toponymie-v3-cyrillique.md).

## Pourquoi une liste

Dans un nom ijekavien, le yat se voit dans la forme officielle (*Rijeka*, *Bijelo Polje*).
Dans un nom ekavien, il est confondu avec *e* :
- en serbe et en slovène : *Bela Palanka*, *Brežice* ;
- en macédonien : *e* ;
- en bulgare : *я* ou *е* selon la position (*Бяла*, *Белоградчик*).

Seule l'étymologie permet de le restaurer. Elle se décide racine par racine, pour éviter les
faux amis. Par exemple, *Sveti* (saint) vient de *svętъ*, sans yat, alors que *svět*
(monde) en a un.

## Racines proposées

| Racine | Sens | Avec yat | Faux amis à exclure |
|---|---|---|---|
| běl- | blanc | bel-, bijel-, бял-, бел- | Beltinci (du hongrois *Belatinc*), Belene (étymologie incertaine) |
| brěg- | rive, colline | breg-, brež-, бряг, брег- | breza (bouleau), sans yat |
| lěsk- | noisetier | lesk- | — |
| lět- | été | лет-, лят- | — |
| měst- | lieu, ville | mest-, mesto | — |
| medvěd- | ours | medved-, medveđ- | — |
| rěk- | rivière | rek-, reč- | — |
| větr- | vent | вятър, ветр- | — |
| zvězd- | étoile | zvezd- | — |

## Communes concernées

| Pays | Forme v3 actuelle | Proposition | Racine | Confiance |
|---|---|---|---|---|
| SRB | Bela Crkva | **Běla Crkva** | běl- | sûre |
| SRB | Bela Palanka | **Běla Palanka** | běl- | sûre |
| SRB | Leskovac | **Lěskovac** | lěsk- | sûre |
| SRB | Medveđa | **Medvěđa** | medvěd- | sûre |
| SRB | Rekovac | **Rěkovac** | rěk- | probable |
| SRB | Zvezdara (Beograd) | **Zvězdara** | zvězd- | sûre |
| SVN | Brežice | **Brěžice** | brěg- | sûre |
| SVN | Novo mesto | **Novo město** | měst- | sûre |
| SVN | Rečica ob Saviñi | **Rěčica ob Saviñi** | rěk- | sûre |
| BGR | Bjala (Ruse), Bjala (Varna) | **Běla (Ruse), Běla (Varna)** | běl- | sûre |
| BGR | Bjala Slatina | **Běla Slatina** | běl- | sûre |
| BGR | Belogradčik | **Bělogradčik** | běl- | sûre |
| BGR | Červen Brjag | **Červen Brěg** | brěg- | sûre |
| BGR | Bregovo | **Brěgovo** | brěg- | probable |
| BGR | Belica | **Bělica** | běl- | probable |
| BGR | Beloslav | **Běloslav** | běl- | probable |
| BGR | Belovo | **Bělovo** | běl- | probable |
| BGR | Letnica | **Lětnica** | lět- | probable |
| BGR | Vetrino | **Větrino** | větr- | probable |

**Écartés ou à vérifier** :
- Beltinci, Bled, Peštera et les *Sveti* n'ont pas de yat ;
- Belene, Lesičovo et Vetovo ont une étymologie incertaine.

**Macédoine du Nord** : aucune commune n'est concernée dans la liste actuelle.

Une fois validées, les lignes passent dans `docs/alfabet/toponymes-v3.csv` et
`scripts/toponymie_v3.py` les applique.
