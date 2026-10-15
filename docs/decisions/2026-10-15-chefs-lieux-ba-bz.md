# ADR 2026-10-15 — Chefs-lieux de Bosanska Krajina et de Zapadna Bosna

## Statut
Accepté. Signalement de l'utilisateur du 2026-10-15 : « la capitale de BA-01 n'est
pas Baña Luka ».

## Constat
Les chefs-lieux de deux États étaient intervertis dans `docs/canon/etats.md` et
`portail/data/etats.json` :

| État | Peuple | Chef-lieu inscrit | Contenu du contour |
|---|---|---|---|
| BA-01 Bosanska Krajina | Bošnjaci | Baña Luka | Bihać, Cazin, Velika Kladuša, Bužim, Bosanska Krupa, Bosanski Petrovac, Ključ, Sanski Most |
| BZ-05 Zapadna Bosna | Srbi | Bihać | Banja Luka, Prijedor, Doboj, Gradiška, Laktaši… |

Une décision antérieure place déjà Banja Luka dans Zapadna Bosna, État serbe, et non
dans Bosanska Krajina.

## Décision
- **BA-01 Bosanska Krajina** : chef-lieu **Bihać**.
- **BZ-05 Zapadna Bosna** : chef-lieu **Baña Luka**. Graphie v3 : Бања → Baña.

## Vrhbosna
**VB-42 Vrhbosna : chef-lieu Zenica**, confirmé par l'utilisateur le 2026-10-15. Une
note antérieure du projet indiquait Visoko ; Zenica fait foi. Le canon et les données
portaient déjà Zenica.

## Propagation
- `docs/canon/etats.md` et `portail/data/etats.json` sont corrigés.
- Le portail est régénéré : fiches d'État, annuaire et recherche.
