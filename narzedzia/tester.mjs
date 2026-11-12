// Uruchamianie obcego kodu (Python od modelu, testy cudzego repo) na osobnym użytkowniku
// systemowym `tester`, bez sudo. Krok „oddaj wynik” ma w env klucz NARZEDZIOWNIA_KLUCZ i
// uruchamia skrypty z katalogu repo — kod uruchomiony jako ten sam użytkownik mógłby te skrypty
// podmienić i wykraść klucz. `tester` nie ma zapisu do katalogu roboczego ani do sudo.
// Włączane przez NARZEDZIA_TESTER=1 (ustawia to workflow); lokalnie, bez tej zmiennej,
// uruchamia normalnie.
import { spawnSync } from "node:child_process";

export const KATALOG = "/tmp/narzedzia";

export function jakoTester(cmd, args, opts = {}) {
  const base = { encoding: "utf8", maxBuffer: 20 * 1024 * 1024, ...opts };
  if (process.env.NARZEDZIA_TESTER !== "1") return spawnSync(cmd, args, { ...base, env: { ...process.env, CI: "true" } });
  return spawnSync("sudo", ["-n", "-u", "tester", "env", `PATH=${process.env.PATH}`, "HOME=/home/tester", "CI=true", cmd, ...args], base);
}

export function oddajTesterowi(path) {
  if (process.env.NARZEDZIA_TESTER === "1") spawnSync("sudo", ["-n", "chown", "-R", "tester:tester", path]);
}
