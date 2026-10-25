# Liste canonique des États — Balkanska Konfederacija

**45 États territoriaux + 4 territoires confédéraux (villes-États) + 2 municipalités confédérales autonomes.**
Numérotation strictement alphabétique par code. Source de vérité du projet.
Trois États ajoutés le 2026-06-28 (Lašva, Soli, Vrhbosna) en codes provisoires
LV/SO/VB ; cf. ADR docs/decisions/2026-06-28-trois-etats-lv-so-vb.md.

## États territoriaux (45)

| Code | Nom | Peuple | Chef-lieu |
|------|-----|--------|-----------|
| BA-01 | Bosanska Krajina | Bosniaks | Bihać |
| BC-02 | Bačka | Serbs | Novi Sad |
| BN-03 | Banat | Serbs | Zreñanin |
| BR-04 | Baraña | Croats | Běli Manastir |
| BZ-05 | Zapadna Bosna | Serbs | Baña Luka |
| CG-06 | Crna Gora | Montenegrins | Podgorica |
| CM-07 | Černomorska | Bulgarians | Varna |
| DA-08 | Dalmacija | Croats | Split |
| DJ-09 | Južna Dobruxa | Bulgarians | Dobrič |
| DR-10 | Dubrovačka Republika | Croats | Dubrovnik |
| GV-11 | Vzhodna Goriška | Slovenes | Nova Gorica |
| HI-12 | Istočna Hercegovina | Serbs | Trebiñe |
| HZ-13 | Zapadna Hercegovina | Croats | Široki Brěg |
| IS-14 | Istra | Croats | Pula |
| KJ-15 | Južna Koroška | Slovenes | Sloveñ Gradec |
| KM-16 | Kosovo i Metohija | Serbs | Priština |
| KR-17 | Krañska | Slovenes | Ļubļana |
| KV-18 | Kvarner | Croats | Rěka |
| LG-19 | Ludogorje | Bulgarians | Razgrad |
| LK-20 | Lika | Croats | Gospić |
| LV-21 | Lašva | Bosniaks | Travnik |
| MI-22 | Istočna Mizija | Bulgarians | Ruse |
| MZ-23 | Zapadna Mizija | Bulgarians | Pleven |
| PI-24 | Istočno Podriñe | Serbs | Višegrad |
| PM-25 | Prekmurje | Slovenes | Murska Sobota |
| PO-26 | Podunavļe | Serbs | Smederevo |
| PR-27 | Pirin | Bulgarians | Blagoevgrad |
| PZ-28 | Zapadno Podriñe | Serbs | Běļina |
| RO-29 | Rodopi | Bulgarians | Plovdiv |
| RS-30 | Raška Sanxak | Serbs | Novi Pazar |
| SI-31 | Istočni Srěm | Serbs | Srěmska Mitrovica |
| SL-32 | Slavonija | Croats | Osěk |
| SO-33 | Soli | Bosniaks | Tuzla |
| SP-34 | Šopluk | Bulgarians | Pernik |
| ST-35 | Štajerska | Slovenes | Maribor |
| SU-36 | Šumadija | Serbs | Kragujevac |
| SX-37 | Stranxa | Bulgarians | Sliven |
| SZ-38 | Zapadni Srěm | Croats | Vukovar |
| TK-39 | Timok | Serbs | Zaječar |
| TL-40 | Torlak | Serbs | Pirot |
| TR-41 | Sěverna Trakija | Bulgarians | Stara Zagora |
| VB-42 | Vrhbosna | Bosniaks | Zenica |
| VI-43 | Istočen Vardar | Macedonians | Štip |
| VZ-44 | Zapaden Vardar | Macedonians | Tetovo |
| ZA-45 | Zagorje | Croats | Krapina |

## Territoires confédéraux, villes-États (4)

| Code | Nom | Fonction |
|------|-----|----------|
| BG-91 | Beograd | Economic capital |
| SA-92 | Sarajevo | Political capital — canton de Sarajevo (9 communes) ; Sarajevo-Est (RS) dans PZ-28 (ADR 2026-10-13-sarajevo-est) |
| SF-93 | Sofija | Defence &amp; sciences capital |
| ZG-94 | Zagreb | Judicial capital — Grad Zagreb + Turopolje (Velika Gorica, Kravarsko, Orle, Pokupsko) + Stupnik (ADR 2026-10-13-zagreb-turopolje) |

## Municipalités confédérales autonomes (2)

| Code | Nom | Statut |
|------|-----|--------|
| BK-95 | Brčko | Direct confederal jurisdiction |
| MO-96 | Mostar | Direct confederal jurisdiction |

## Renames de codes appliqués (vs constitution v2)

- `GO-12` → `GV-12` Vzhodna Goriška
- `HB-13` → `HZ-13` Zapadna Hercegovina (Herceg Bosna **supprimé**)
- `KO-17` → `KJ-16` Južna Koroška
- `KM-16` → `KM-17` Kosovo i Metohija
- `SO-31` → `SP-33` Šopluk (SO- réservé à Samostalna Opština)
- `TO-35` → `TL-39` Torlak
- Mizija scindée : `MI-22` Istočna Mizija + `MZ-23` Zapadna Mizija
- Nouveau : `SX-36` Stranxa

- Renumérotation alphabétique stricte appliquée le 2026-06-28 : insertion de
  LV-22 Lašva, SO-34 Soli, VB-43 Vrhbosna ; HI/HZ remis dans l'ordre
  (HI-13 avant HZ-14) ; cascade des codes ≥ L. Cf. ADR
  docs/decisions/2026-06-28-renumerotation-alphabetique.md.

- 2026-06-28 : suppression de l'État Sredña Bosna (BS-05) ; renumérotation
  contiguë (cascade -1 à partir de BZ). Cf. ADR
  docs/decisions/2026-06-28-suppression-srednja-bosna.md.

> 2026-10-15 : chefs-lieux de BA-01 (Bihać) et BZ-05 (Baña Luka) remis dans le bon
> ordre ; chef-lieu de VB-42 Vrhbosna confirmé : Zenica ; cf. ADR docs/decisions/2026-10-15-chefs-lieux-ba-bz.md.

> L'Article 1 bis de la Constitution v4 (docs/constitution/v4.md) est aligné
> sur cette liste : 49 États (45 territoriaux + 4 villes-États), plus les
> 2 municipalités confédérales autonomes.