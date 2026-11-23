#!/usr/bin/env python3
"""Tableau Markdown des mesures Lighthouse de plusieurs dossiers (médianes de mesure.js).

Usage : python docs/lot1/outils/tableau.py docs/lot1/mesures/0-main-inline [docs/lot1/mesures/1-…]
"""
import json
import sys
from pathlib import Path

COLS = (("performance", "Perf."), ("accessibility", "Access."), ("FCP_s", "FCP (s)"), ("LCP_s", "LCP (s)"),
        ("TBT_ms", "TBT (ms)"), ("CLS", "CLS"), ("SI_s", "SI (s)"), ("poids_ko", "Poids (ko)"), ("requetes", "Requêtes"))


def fr(v):
    return f"{v:,}".replace(",", " ").replace(".", ",") if isinstance(v, (int, float)) else str(v)


def main() -> int:
    dirs = [Path(d) for d in sys.argv[1:]]
    data = [(d.name, json.loads((d / "lighthouse.json").read_text())) for d in dirs]
    routes = [r for r in data[0][1] if r.startswith("#")]
    print("| Page | Build | " + " | ".join(c[1] for c in COLS) + " |")
    print("|---|---|" + "---|" * len(COLS))
    for r in routes:
        for name, d in data:
            if r in d:
                print(f"| `{r}` | {name} | " + " | ".join(fr(d[r][k]) for k, _ in COLS) + " |")
    print()
    for name, d in data:
        print(f"- {name} : {d['_']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
