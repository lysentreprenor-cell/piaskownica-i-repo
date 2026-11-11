# Narzędziownia SimplyChat (repo `piaskownica-i-repo`)

Repo PUBLICZNE (darmowe Actions). Narzędzia w `narzedzia/*.mjs`, uruchamiane przez
`.github/workflows/narzedzie.yml`. Szczegóły i dodawanie narzędzi: README.md.

- Nigdy nie wypisuj do logu danych ani wyniku jawnie — tylko przez `szyfr.mjs zaszyfruj`.
- Klucz `NARZEDZIOWNIA_KLUCZ` tylko w krokach „odbierz” i „oddaj”, nigdy w kroku narzędzia.
- `dane` nigdy w `run:` — tylko przez env/plik.
- Przed pushem: `npm test`. Odpowiedzi po polsku.
