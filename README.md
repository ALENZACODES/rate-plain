# Rate Plain

Public Bank of Canada rates on one screen, plus a plain-language checklist for a household renewal date.

Built for Code for Change (solo entry by John Khan). General information only. Not advice.

## Run

```bash
python3 -m http.server 8082
```

Open `http://localhost:8082/`.

## Tests

```bash
node tests/test_data.mjs
```

## Data sources

- [BoC Valet V39079](https://www.bankofcanada.ca/valet/observations/V39079/json) policy rate
- [BoC Valet BD.CDN.5YR.DQ.YLD](https://www.bankofcanada.ca/valet/observations/BD.CDN.5YR.DQ.YLD/json) 5-year benchmark bond yield

Cached snapshots in `data/` were retrieved 2026-11-05 America/Toronto.

## License

MIT.
