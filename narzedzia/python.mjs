// Narzędzie „python”: uruchamia kod z pliku danych i oddaje JSON {ok, wynik}.
// Zawsze kończy się kodem 0 — błąd kodu użytkownika to wynik, nie awaria przebiegu.
import { spawnSync } from "node:child_process";

export const LIMIT_ZNAKOW = 20_000;
export function przytnij(t, max = LIMIT_ZNAKOW) {
  return t.length <= max ? t : t.slice(0, max) + `\n… [ucięto ${t.length - max} znaków]`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = spawnSync("python3", [process.argv[2]], { encoding: "utf8", timeout: 120_000, maxBuffer: 10 * 1024 * 1024 });
  const wynik = (r.stdout || "") + (r.stderr ? `\n[stderr]\n${r.stderr}` : "") +
    (r.error?.code === "ETIMEDOUT" ? "\n[przerwano po 120 s]" : "");
  process.stdout.write(JSON.stringify({ ok: r.status === 0, wynik: przytnij(wynik.trim()) }));
}
