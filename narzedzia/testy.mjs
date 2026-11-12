// Narzędzie „testy”: darmowa piaskownica dla repozytoriów, w których Actions są płatne/zablokowane.
//
// Dane (JSON, przychodzą zaszyfrowane): {repo, ref, token, command}
//   token — krótkotrwały token TYLKO DO ODCZYTU tego jednego repo (SimplyChat unieważnia go po
//   przebiegu). Plik danych jest kasowany zaraz po odczycie, zdalne repo usuwane po klonie,
//   a instalacja i testy idą jako użytkownik `tester` — kod z repo nie ma skąd wziąć tokenu.
// Wynik: JSON {ok, wynik} z ogonem logu każdego kroku (szyfrowany w kroku „oddaj”).
import { mkdirSync, readFileSync, rmSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { KATALOG, jakoTester, oddajTesterowi } from "./tester.mjs";
import { przytnij } from "./python.mjs";

export const POLECENIA = ["check", "test", "build", "all"];

export function kroki(command) {
  const check = { name: "check", run: "npm run check --if-present" };
  const test = { name: "test", run: "npm test --if-present" };
  const build = { name: "build", run: "npm run build --if-present" };
  return command === "all" ? [check, test, build] : command === "check" ? [check] : command === "test" ? [test] : [build];
}

export function sprawdzDane(d) {
  if (!d || typeof d !== "object") throw new Error("Brak danych");
  if (typeof d.repo !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(d.repo)) throw new Error("Nieprawidłowe repozytorium");
  if (typeof d.ref !== "string" || !/^[A-Za-z0-9._/-]{1,180}$/.test(d.ref) || d.ref.includes("..")) throw new Error("Nieprawidłowa gałąź");
  if (!POLECENIA.includes(d.command)) throw new Error("Nieprawidłowe polecenie");
  if (typeof d.token !== "string" || !/^[A-Za-z0-9_.-]{20,400}$/.test(d.token)) throw new Error("Nieprawidłowy token");
  return d;
}

export function ogon(t, max = 3_000) {
  return t.length <= max ? t : `[…]\n${t.slice(-max)}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let out;
  try {
    const plik = process.argv[2];
    const d = sprawdzDane(JSON.parse(readFileSync(plik, "utf8")));
    unlinkSync(plik);
    const dir = `${KATALOG}/repo`;
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(KATALOG, { recursive: true });
    const klon = spawnSync("git", ["clone", "--depth", "1", "--branch", d.ref, `https://x-access-token:${d.token}@github.com/${d.repo}.git`, dir], { encoding: "utf8", timeout: 180_000 });
    if (klon.status !== 0) {
      out = { ok: false, wynik: `Piaskownica: nie udało się sklonować ${d.repo}@${d.ref}.\n${ogon(String(klon.stderr).replaceAll(d.token, "***"))}` };
    } else {
      spawnSync("git", ["-C", dir, "remote", "remove", "origin"]);
      d.token = "";
      oddajTesterowi(KATALOG);
      const log = [];
      const install = jakoTester("bash", ["-c", "if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; elif [ -f package.json ]; then npm install --no-audit --no-fund; else echo 'brak package.json'; fi"], { cwd: dir, timeout: 600_000 });
      log.push(`$ instalacja zależności (kod ${install.status})\n${ogon((install.stdout || "") + (install.stderr || ""), 1_500)}`);
      if (install.status !== 0) {
        out = { ok: false, wynik: `Instalacja zależności nie przeszła.\n\n${log.join("\n\n")}` };
      } else {
        const padly = [];
        for (const krok of kroki(d.command)) {
          const r = jakoTester("bash", ["-c", krok.run], { cwd: dir, timeout: 600_000 });
          log.push(`$ ${krok.run} (kod ${r.status})\n${ogon((r.stdout || "") + (r.stderr || ""))}`);
          if (r.status !== 0) padly.push(krok.name);
        }
        out = padly.length
          ? { ok: false, wynik: `Padło: ${padly.join(", ")}.\n\n${log.join("\n\n")}` }
          : { ok: true, wynik: `Przeszło: ${kroki(d.command).map(k => k.name).join(", ")}.\n\n${log.join("\n\n")}` };
      }
    }
  } catch (e) { out = { ok: false, wynik: String(e?.message || e) }; }
  out.wynik = przytnij(out.wynik);
  process.stdout.write(JSON.stringify(out));
}
