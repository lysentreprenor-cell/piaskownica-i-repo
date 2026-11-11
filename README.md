# Narzędziownia SimplyChat

Narzędzia, które SimplyChat uruchamia, gdy w rozmowie potrzebuje czegoś, czego jego serwer nie
umie albo nie powinien robić (serwer celowo nie ma powłoki — trzyma klucze i bazę).
Każde narzędzie działa na **GitHub Actions w tym repo**. Repo jest **publiczne**, więc przebiegi
są **darmowe i bez limitu minut**.

## Narzędzia

| Nazwa | Dane | Wynik |
|---|---|---|
| `python` | kod Pythona | wyjście programu (do 20 000 znaków, limit 120 s) |
| `strona` | adres http(s) | tytuł i widoczny tekst strony po wyrenderowaniu JavaScriptu |

Workflow: `.github/workflows/narzedzie.yml` (wejścia `narzedzie`, `dane`, `zlecenie`).
Wynik jest w logu kroku „oddaj wynik” między `===WYNIK===` a `===KONIEC===`, jako JSON
`{ "ok": true|false, "wynik": "..." }` — zaszyfrowany, gdy jest klucz.

## Prywatność — ważne

Repo jest publiczne: **logi przebiegów i wejścia workflow widzi każdy**. Dlatego:

1. Wygeneruj klucz (64 znaki hex), np. `openssl rand -hex 32`.
2. Dodaj go jako sekret repo: Settings → Secrets and variables → Actions → New repository secret,
   nazwa `NARZEDZIOWNIA_KLUCZ`.
3. Ten sam klucz dodaj w sekretach SimplyChat (Replit) pod tą samą nazwą.

Z kluczem dane i wyniki są szyfrowane AES-256-GCM (`narzedzia/szyfr.mjs`). **Bez klucza
wszystko idzie jawnie i jest publiczne** — tak wolno tylko przy ręcznych próbach.

## Dodanie narzędzia

1. Skrypt `narzedzia/<nazwa>.mjs`: czyta plik danych (`process.argv[2]`), wypisuje JSON
   `{ok, wynik}`, zawsze kończy się kodem 0.
2. Nazwa do listy `options` i krok `if: inputs.narzedzie == '<nazwa>'` w `narzedzie.yml`.
3. Test w `narzedzia/narzedzia.test.mjs`, `npm test`.
