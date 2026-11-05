#!/usr/bin/env python3
"""equilibre.py — équilibre entre les États et les peuples constitutifs.

Méthode : docs/canon/equilibre.md (ADR docs/decisions/2026-11-05-passe-de-fondation.md).

- La population d'un peuple est celle des États territoriaux qui lui sont rattachés
  (portail/data/etats.json, champ p ; population de portail/data/stats.json, tirée des
  recensements de docs/data/population/). Ce n'est pas un décompte ethnique.
- Les villes-États sont neutres : elles votent comme des États (art. 124) mais ne relèvent
  d'aucun peuple. Brčko et Mostar ne sont pas des États.
- Rapport d'un peuple = part des États territoriaux ÷ part de la population.
- Nombre idéal d'États : quota exact (États territoriaux × part de la population), arrondi
  au plus fort reste.

Usage :
  python scripts/equilibre.py            tableau, blocs des votations, concentration
  python scripts/equilibre.py --md       même chose en Markdown (pour la documentation)
  python scripts/equilibre.py --check    contrôle : code 1 si un rapport sort de la bande
                                         (sauf peuple à son nombre idéal d'États)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "portail" / "data"

# Bande admise pour le rapport d'un peuple (ADR 2026-11-05-passe-de-fondation.md).
BAND = (0.85, 1.25)
ORDER = ["slo", "hrv", "srb", "bos", "cng", "mkd", "bul"]
NOMS = {"slo": "Slovènes", "hrv": "Croates", "srb": "Serbes", "bos": "Bosniaques",
        "cng": "Monténégrins", "mkd": "Macédoniens", "bul": "Bulgares"}
# Peuples dont les États, avec leur capitale-ville-État, forment le bloc oriental des votations
EAST = ["srb", "bul"]
CAPITALS = {"srb": "BG-91", "bul": "SF-93", "hrv": "ZG-94", "bos": "SA-92"}


def load():
    etats = json.loads((DATA / "etats.json").read_text(encoding="utf-8"))
    stats = json.loads((DATA / "stats.json").read_text(encoding="utf-8"))
    peuples = json.loads((DATA / "peuples.json").read_text(encoding="utf-8"))
    return etats, stats, peuples


def largest_remainder(quotas, seats):
    base = {k: int(q) for k, q in quotas.items()}
    rest = seats - sum(base.values())
    for k in sorted(quotas, key=lambda k: quotas[k] - base[k], reverse=True)[:rest]:
        base[k] += 1
    return base


def compute():
    etats, stats, _ = load()
    terr = [e for e in etats if e["t"] == "T"]
    cities = [e for e in etats if e["t"] == "F"]  # villes-États ; t = "M" : Brčko, Mostar
    missing = [e["c"] for e in terr if not (stats.get(e["c"]) or {}).get("population")]
    if missing:
        raise SystemExit(f"population absente de stats.json : {missing}")
    n_terr = len(terr)
    n_states = n_terr + len(cities)
    pop = {p: 0 for p in ORDER}
    cnt = {p: 0 for p in ORDER}
    for e in terr:
        pop[e["p"]] += stats[e["c"]]["population"]
        cnt[e["p"]] += 1
    total = sum(pop.values())
    quotas = {p: n_terr * pop[p] / total for p in ORDER}
    ideal = largest_remainder(quotas, n_terr)
    rows = []
    for p in ORDER:
        rows.append({
            "p": p, "name": NOMS[p], "states": cnt[p], "pop": pop[p],
            "s_states": cnt[p] / n_terr, "s_pop": pop[p] / total,
            "ratio": (cnt[p] / n_terr) / (pop[p] / total),
            "mean": pop[p] / cnt[p], "quota": quotas[p], "ideal": ideal[p],
        })
    hhi = sum((stats[e["c"]]["population"] / total) ** 2 for e in terr)
    majority = n_states // 2 + 1
    east = sum(cnt[p] for p in EAST)
    others = n_terr - east
    blocs = {
        "states": n_states, "territorial": n_terr, "cities": len(cities), "majority": majority,
        "east": east, "east_caps": east + sum(1 for p in EAST if p in CAPITALS),
        "others": others, "others_caps": others + sum(1 for p in CAPITALS if p not in EAST),
    }
    return rows, blocs, hhi, total


def fr(x, nd=2):
    return f"{x:.{nd}f}".replace(".", ",")


def thousands(n):
    return f"{round(n, -3):,.0f}".replace(",", " ")


def report(md=False):
    rows, b, hhi, total = compute()
    if md:
        print(f"| Peuple | États | Part des États | Part de la population | Rapport | "
              f"Population moyenne par État | Nombre idéal sur {b['territorial']} |")
        print("|---|---|---|---|---|---|---|")
        for r in rows:
            print(f"| {r['name']} | {r['states']} | {fr(100 * r['s_states'], 1)} % | "
                  f"{fr(100 * r['s_pop'], 1)} % | {fr(r['ratio'])} | {thousands(r['mean'])} | "
                  f"{r['ideal']} ({fr(r['quota'])}) |")
    else:
        print(f"{'peuple':<13}{'États':>6}{'part É.':>9}{'part pop.':>10}{'rapport':>9}"
              f"{'moy./État':>11}{'quota':>8}{'idéal':>7}")
        for r in rows:
            print(f"{r['name']:<13}{r['states']:>6}{100 * r['s_states']:>8.1f}%{100 * r['s_pop']:>9.1f}%"
                  f"{r['ratio']:>9.2f}{r['mean']:>11,.0f}{r['quota']:>8.2f}{r['ideal']:>7}")
    print()
    print(f"États : {b['states']} ({b['territorial']} territoriaux + {b['cities']} villes-États) ; "
          f"majorité des États aux votations : {b['majority']}.")
    print(f"Serbes et Bulgares : {b['east']} États, {b['east_caps']} avec Beograd et Sofija.")
    print(f"Cinq autres peuples : {b['others']} États, {b['others_caps']} avec Zagreb et Sarajevo.")
    print(f"Population des États territoriaux : {total:,} ; concentration (HHI) : {hhi:.4f}.")
    return rows


def check():
    """Code 1 si un rapport sort de la bande et que le peuple n'a pas son nombre idéal d'États.

    Un peuple qui a exactement son nombre idéal d'États (plus fort reste) n'est pas en faute
    s'il sort de la bande : aucun nombre entier ne ferait mieux (cas d'un peuple à un seul
    État). L'écart est alors signalé, sans bloquer.
    """
    rows, b, _, _ = compute()
    out = [r for r in rows if not BAND[0] <= r["ratio"] <= BAND[1]]
    bad = [r for r in out if r["states"] != r["ideal"]]
    for r in rows:
        flag = "HORS BANDE" if r in bad else ("hors bande, nombre idéal" if r in out else "ok")
        print(f"{r['name']:<13} {r['states']:>2} États  rapport {r['ratio']:.2f}  {flag}")
    for label, n in (("Serbes et Bulgares", b["east"]), ("cinq autres peuples", b["others"])):
        if n >= b["majority"]:
            print(f"Avertissement : {label} atteignent seuls la majorité des États ({n} sur {b['states']}).")
    if bad:
        print(f"ERREUR : rapport hors de la bande {BAND[0]}–{BAND[1]} "
              f"(docs/canon/equilibre.md ; ne pas redécouper : décision par ADR).")
        return 1
    if out:
        print(f"Équilibre conforme ; hors bande mais à leur nombre idéal d'États : "
              f"{', '.join(r['name'] for r in out)}.")
    else:
        print(f"Équilibre conforme : tous les rapports dans la bande {BAND[0]}–{BAND[1]}.")
    return 0


if __name__ == "__main__":
    if "--check" in sys.argv:
        sys.exit(check())
    report(md="--md" in sys.argv)
