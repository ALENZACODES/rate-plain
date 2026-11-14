"""Rebuild data/*.json from the Bank of Canada Valet API.

Run from the repo root: python3 scripts/refresh_data.py
Keeps every business day observation from 2020-01-01 onward.
"""
import json
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo

SERIES = [
    ("V39079", "data/policy-rate.json"),
    ("BD.CDN.5YR.DQ.YLD", "data/bond-5yr.json"),
]
START = "2020-01-01"


def fetch(series):
    url = f"https://www.bankofcanada.ca/valet/observations/{series}/json?start_date={START}"
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.load(r)


def main():
    today = datetime.now(ZoneInfo("America/Toronto")).strftime("%Y-%m-%d")
    for series, path in SERIES:
        raw = fetch(series)
        obs = []
        for o in raw["observations"]:
            cell = o.get(series)
            if not cell or cell.get("v") in (None, ""):
                continue
            obs.append({"d": o["d"], "v": float(cell["v"])})
        obs.sort(key=lambda p: p["d"])
        out = {
            "source": {
                "name": "Bank of Canada Valet API",
                "series": series,
                "label": raw["seriesDetail"][series]["label"],
                "url": f"https://www.bankofcanada.ca/valet/observations/{series}/json",
                "terms": "https://www.bankofcanada.ca/terms/",
                "retrievedEt": today,
                "startDate": START,
            },
            "observations": obs,
        }
        with open(path, "w") as f:
            json.dump(out, f, separators=(",", ":"))
            f.write("\n")
        print(series, len(obs), obs[0], obs[-1])


if __name__ == "__main__":
    main()
