# Rate Plain

Public Bank of Canada rates on one screen, plus a plain-language payment check and checklist for a household renewal date.

Built for Code for Change (solo entry by John Khan, Toronto, Ontario). General information only. Not advice and not a payment quote.

Live demo: https://alenzacodes.github.io/rate-plain/

## Features

- Daily Bank of Canada policy rate (V39079) and 5-year benchmark bond yield (BD.CDN.5YR.DQ.YLD) since January 2020, charted together
- Latest value of each series with its date
- Payment check: your current rate against the rate in your renewal letter, monthly and over a year
- Months left until your renewal date
- Four plain next steps
- Nothing you type leaves the browser

## Run locally

```bash
python3 -m http.server 8082
```

Open http://localhost:8082/.

## Tests

```bash
node tests/test_data.mjs
```

Checks the saved series, month counting, and the payment formula against a hand-worked example (400,000 at 5% over 25 years is 2,326.42 a month with semi-annual compounding).

## Refresh the data

```bash
python3 scripts/refresh_data.py
```

Rebuilds `data/policy-rate.json` and `data/bond-5yr.json` from the Valet API. The saved copy was retrieved on 13 November 2026, America/Toronto, with values through 12 November 2026.

## How the payment is worked out

Monthly payment on a fixed rate balance, with the annual rate compounded twice a year, which is the usual convention for Canadian fixed rate mortgages. Real payments depend on your lender's terms, fees and payment frequency.

## Project structure

```text
rate-plain/
├── data/                 # Bank of Canada series
│   ├── bond-5yr.json     # 5-year bond yield
│   └── policy-rate.json  # Policy rate
├── scripts/
│   └── refresh_data.py   # Rebuilds data/*.json from the Bank of Canada Valet API
├── tests/                # Automated tests
│   └── test_data.mjs
├── app.js                # Interface logic
├── DEMO-SCRIPT.md        # Demo video script
├── DEVPOST.md            # Submission write-up
├── index.html            # Page markup
├── lib.js                # Pure helpers (browser and Node)
├── LICENSE               # Licence
├── README.md             # This file
└── styles.css            # Styles
```

## Data sources

- [Bank of Canada Valet, V39079](https://www.bankofcanada.ca/valet/observations/V39079/json), target for the overnight rate
- [Bank of Canada Valet, BD.CDN.5YR.DQ.YLD](https://www.bankofcanada.ca/valet/observations/BD.CDN.5YR.DQ.YLD/json), 5-year benchmark bond yield
- [Bank of Canada terms of use](https://www.bankofcanada.ca/terms/)

## Stack

HTML, CSS and JavaScript with no build step. Python for the data refresh. Deep blue `#011F5B` and deep red `#990000` on white.

## License

MIT. See `LICENSE`.
