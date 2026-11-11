# Piaskownica i repo — poligon dla SimplyChat

Repozytorium do **ćwiczeń i testów Code Power** w SimplyChat. Tu agent może czytać kod,
zmieniać go, uruchamiać piaskownicę, otwierać pull requesty i budować — a pomyłka nie
dotyka żadnego prawdziwego projektu (SimplyChat, Gadacz itd.).

## Co tu jest

| Plik | Po co |
|---|---|
| `src/tekst.ts` | Mały moduł (slug, licznik słów, skracanie) — materiał do zadań typu „dodaj funkcję”, „popraw błąd” |
| `test/tekst.test.ts` | Testy (`node:test` przez `tsx`) |
| `.github/workflows/agent-sandbox.yml` | Piaskownica przez GitHub Actions — ta sama co w SimplyChat, wywoływana przez `run_sandbox` |
| `.github/workflows/ci.yml` | CI na każdym PR i pushu na `main` |

Skrypty: `npm run check` (tsc), `npm test`, `npm run build` — dokładnie te, które uruchamia
piaskownica (E2B albo Actions).

## Jak użyć z SimplyChat

1. W ustawieniach GitHub App SimplyChat dodaj to repozytorium do instalacji
   (uprawnienia: Contents R/W, Pull requests R/W, **Actions: Write** — dla piaskownicy przez Actions).
2. W SimplyChat wybierz repozytorium `piaskownica-i-repo` i tryb Code Power.
3. Daj zadanie, np. „dodaj funkcję `odwroc(tekst)` z testem”. Agent zrobi zmianę,
   puści piaskownicę, otworzy PR.

Z kluczem `E2B_API_KEY` na serwerze SimplyChat piaskownica idzie przez E2B (sekundy),
bez niego przez `agent-sandbox.yml` (minuty).

## Zasady

- Nic tu nie jest produkcją — PR-y agenta można scalać i zamykać bez żalu.
- Bez sekretów w kodzie. Workflow piaskownicy ma tylko `contents: read`.
