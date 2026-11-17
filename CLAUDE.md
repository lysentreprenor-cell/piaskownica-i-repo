# Narzędziownia SimplyChat (repo `piaskownica-i-repo`)

Repo PUBLICZNE (darmowe Actions). Narzędzia w `narzedzia/*.mjs`, uruchamiane przez
`.github/workflows/narzedzie.yml`. Szczegóły i dodawanie narzędzi: README.md.

- Nigdy nie wypisuj do logu danych ani wyniku jawnie — tylko przez `szyfr.mjs zaszyfruj`.
- Klucz `NARZEDZIOWNIA_KLUCZ` tylko w krokach „odbierz” i „oddaj”, nigdy w kroku narzędzia.
- `dane` nigdy w `run:` — tylko przez env/plik.
- Przed pushem: `npm test`. Odpowiedzi po polsku.

## Zasady właściciela (od 17.11.2026, obowiązują w każdej sesji)

**Zakaz zgadywania.** Przyczynę błędu podajesz dopiero po sprawdzeniu w kodzie, logach, GitHubie albo na zrzucie od właściciela. Gdy nie da się sprawdzić: napisz „nie wiem” i czego potrzebujesz, żeby się dowiedzieć. Bez list „prawdopodobnych przyczyn” i bez liczb, których nie zmierzyłeś.

**Projektowanie ekranów** (stosuj, gdy tworzysz lub zmieniasz interfejs):
1. Pierwszy ekran od razu mówi, co robi aplikacja i dla kogo. Powracający użytkownik trafia od razu do swojej pracy, nie do hasła reklamowego.
2. Standardowa nawigacja, menu i przyciski, jak w znanych aplikacjach. Nie wymyślaj wzorców od nowa.
3. Jeden system wyglądu: jedna paleta kolorów, jedna skala odstępów, czcionek i zaokrągleń, zapisana w jednym miejscu (zmienne CSS lub tokeny). Żadnych wartości wpisanych „na oko”.
4. Spójny, spokojny kierunek wizualny. Bez emoji jako ozdoby sekcji i bez przypadkowych kolorów. Jeśli aplikacja ma już swój wygląd, trzymaj się go.
5. Mniej znaczy więcej: jeden główny przycisk na ekranie, rzeczy rzadkie schowane, ale zawsze możliwe do znalezienia, także czytnikiem ekranu.
6. Każdy stan jest zaprojektowany: ładowanie, pusty ekran, brak sieci, błąd, powrót z tła. Błąd mówi, co się stało i co zrobić — nigdy samo „Failed to fetch” ani „spróbuj ponownie”.
7. Dostępność od początku: kontrast co najmniej 4,5:1, przyciski co najmniej 44×44 px, etykiety (aria-label, alt, label) dla czytników ekranu, działanie przy powiększonej czcionce systemowej, kolor nigdy nie jest jedyną informacją.
8. Telefon jako główne urządzenie: ważne przyciski w zasięgu kciuka, pole tekstowe i jego przyciski widoczne przy otwartej klawiaturze, działanie na słabym internecie.
9. Zaufanie: przed kosztem, płatnością lub nieodwracalnym działaniem pokaż, co się stanie, i poczekaj na potwierdzenie. Bez ukrytych subskrypcji i wymuszanych zgód; powiedz wprost, gdzie są dane.
10. Prosty polski („Zapisano”, nie „Operacja zakończona sukcesem”) i podstawowe pomiary, czy użytkownicy docierają do głównej funkcji — o zmianach decydują dane, nie przeczucie.

Gdy wygląd koliduje z bezpieczeństwem albo z jasnym komunikatem o błędzie, wygrywa bezpieczeństwo i jasny komunikat.
