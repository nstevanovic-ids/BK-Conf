# Liste canonique des États — Balkanska Konfederacija

**48 États territoriaux + 4 territoires confédéraux (villes-États) + 2 municipalités confédérales autonomes.**
Numérotation strictement alphabétique par code. Source de vérité du projet.
**Limites gelées depuis la passe de fondation du 2026-11-05** : plus de redécoupage pour corriger un
équilibre (ADR docs/decisions/2026-11-05-passe-de-fondation.md ; contrôle : docs/canon/equilibre.md,
`scripts/equilibre.py --check`).
Trois États ajoutés le 2026-06-28 (Lašva, Soli, Vrhbosna) en codes provisoires
LV/SO/VB ; cf. ADR docs/decisions/2026-06-28-trois-etats-lv-so-vb.md.

## États territoriaux (48)

| Code | Nom | Peuple | Chef-lieu |
|------|-----|--------|-----------|
| BA-01 | Bosanska Krajina | Bosniaks | Bihać |
| BC-02 | Bačka | Serbs | Novi Sad |
| BE-03 | Bregalnica | Macedonians | Štip |
| BN-04 | Banat | Serbs | Zreñanin |
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
| MI-21 | Istočna Mizija | Bulgarians | Veliko Tãrnovo |
| MZ-22 | Zapadna Mizija | Bulgarians | Vraca |
| PA-23 | Pajonija | Macedonians | Veles |
| PI-24 | Istočno Podriñe | Serbs | Loznica |
| PM-25 | Prekmurje | Slovenes | Murska Sobota |
| PO-26 | Podunavļe | Serbs | Smederevo |
| PR-27 | Pirin | Bulgarians | Blagoevgrad |
| PZ-28 | Zapadno Podriñe | Serbs | Běļina |
| RO-29 | Rodopi | Bulgarians | Smoļan |
| RS-30 | Raška Sanxak | Serbs | Novi Pazar |
| SI-31 | Istočni Srěm | Serbs | Sremska Mitrovica |
| SL-32 | Slavonija | Croats | Osěk |
| SO-33 | Soli | Bosniaks | Tuzla |
| SP-34 | Šopluk | Bulgarians | Pernik |
| ST-35 | Štajerska | Slovenes | Maribor |
| SU-36 | Šumadija | Serbs | Kragujevac |
| SX-37 | Stranxa | Bulgarians | Carevo |
| SZ-38 | Zapadni Srěm | Croats | Vukovar |
| TK-39 | Timok | Serbs | Zaječar |
| TL-40 | Torlak | Serbs | Pirot |
| TR-41 | Trakija | Bulgarians | Plovdiv |
| TU-42 | Tunxa | Bulgarians | Stara Zagora |
| US-43 | Usora | Serbs | Doboj |
| VB-44 | Vrhbosna | Bosniaks | Zenica |
| VS-45 | Severen Vardar | Macedonians | Skopje |
| VZ-46 | Zapaden Vardar | Macedonians | Tetovo |
| ZA-47 | Zagorje | Croats | Krapina |
| ZL-48 | Zlatibor | Serbs | Užice |

## Territoires confédéraux, villes-États (4)

| Code | Nom | Fonction |
|------|-----|----------|
| BG-91 | Beograd | Economic capital |
| SA-92 | Sarajevo | Political capital — canton de Sarajevo (9 communes) ; Sarajevo-Est (RS) dans PZ-28 (ADR 2026-10-13-sarajevo-est) |
| SF-93 | Sofija | Defence &amp; sciences capital |
| ZG-94 | Zagreb | Judicial capital — Grad Zagreb + Turopoļe (Velika Gorica, Kravarsko, Orle, Pokupsko) + Stupnik (ADR 2026-10-13-zagreb-turopolje) |

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

- 2026-11-04 : redécoupage des États bulgares. La plaine de Plovdiv passe de RO-29 à TR-41,
  renommé Trakija (Thrace occidentale, chef-lieu Plovdiv) ; nouvel État TU-42 Tunxa (Thrace
  orientale : oblasts de Stara Zagora, Haskovo, Sliven et Jambol) ; oblast de Ruse de LG-19 à
  MI-22 ; Ivajlovgrad et Maxarovo de la Thrace à RO-29 ; chefs-lieux de MI-22, MZ-23, RO-29,
  SX-37 et TR-41 revus, tous dans leur État. Renumérotation alphabétique : VB-42 → VB-43,
  VI-43 → VI-44, VZ-44 → VZ-45, ZA-45 → ZA-46. Cf. ADR
  docs/decisions/2026-11-04-redecoupage-bulgare.md.

- 2026-11-05 : passe de fondation (dernier redécoupage). Baraña (BR-04) fondue dans SL-32
  Slavonija ; Lašva (LV-21) fondue dans Vrhbosna ; Istočen Vardar (VI-44) partagé en VS-45
  Severen Vardar (Skopje), PA-23 Pajonija (Veles) et BE-03 Bregalnica (Štip) ; ZL-48 Zlatibor
  (Užice) détaché de PI-24 Istočno Podriñe, dont le chef-lieu passe de Višegrad (situé dans PZ-28)
  à Loznica ; US-43 Usora (Doboj) détachée de BZ-05 Zapadna Bosna. Renumérotation alphabétique : BN-03 → BN-04, MI-22 → MI-21, MZ-23 → MZ-22,
  VB-43 → VB-44, VZ-45 → VZ-46, ZA-46 → ZA-47. Cf. ADR
  docs/decisions/2026-11-05-passe-de-fondation.md.

> L'Article 1 bis de la Constitution v4 (docs/constitution/v4.md) est aligné
> sur cette liste : 52 États (48 territoriaux + 4 villes-États), plus les
> 2 municipalités confédérales autonomes.