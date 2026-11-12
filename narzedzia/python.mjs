// Narzędzie „python”: uruchamia kod z pliku danych i oddaje JSON {ok, wynik}.
// Zawsze kończy się kodem 0 — błąd kodu użytkownika to wynik, nie awaria przebiegu.
import { copyFileSync, mkdirSync } from "node:fs";
import { KATALOG, jakoTester, oddajTesterowi } from "./tester.mjs";

export const LIMIT_ZNAKOW = 20_000;
export function przytnij(t, max = LIMIT_ZNAKOW) {
  return t.length <= max ? t : t.slice(0, max) + `\n… [ucięto ${t.length - max} znaków]`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(KATALOG, { recursive: true });
  const kod = `${KATALOG}/kod.py`;
  copyFileSync(process.argv[2], kod);
  oddajTesterowi(KATALOG);
  const r = jakoTester("python3", [kod], { cwd: KATALOG, timeout: 120_000 });
  const wynik = (r.stdout || "") + (r.stderr ? `\n[stderr]\n${r.stderr}` : "") +
    (r.error?.code === "ETIMEDOUT" ? "\n[przerwano po 120 s]" : "");
  process.stdout.write(JSON.stringify({ ok: r.status === 0, wynik: przytnij(wynik.trim()) }));
}
