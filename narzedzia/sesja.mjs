// Narzędzie „sesja”: jedna maszyna na całe zadanie Code Power, jak kontener Claude Code.
//
// Dane (JSON, zaszyfrowane): {repo, ref, token, url, sessionId, sessionToken}
//   Repo klonowane raz (token tylko do odczytu), zależności instalowane raz, potem pętla:
//   maszyna pyta serwer SimplyChat o następne polecenie, wykonuje je i odsyła wynik — sekundy
//   zamiast minuty na każdą próbę.
// Bezpieczeństwo:
//   - polecenia i pliki idą jako `tester` bez sudo; PO instalacji zależności `tester` traci
//     dostęp do sieci (iptables), więc podrzucone polecenie nie wyśle prywatnego kodu na zewnątrz;
//   - token do repo kasowany po klonie (plik danych, remote), unieważniany przez serwer;
//   - nic z poleceń ani wyników nie trafia do logu publicznego repo.
import { mkdirSync, readFileSync, rmSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { KATALOG, jakoTester, oddajTesterowi } from "./tester.mjs";

export const MAX_WYNIK = 12_000;
export const MAX_CZAS_POLECENIA_S = 600;

export function sprawdzSesje(d) {
  if (!d || typeof d !== "object") throw new Error("Brak danych");
  if (typeof d.repo !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(d.repo)) throw new Error("Nieprawidłowe repozytorium");
  if (typeof d.ref !== "string" || !/^[A-Za-z0-9._/-]{1,180}$/.test(d.ref) || d.ref.includes("..")) throw new Error("Nieprawidłowa gałąź");
  if (typeof d.token !== "string" || !/^[A-Za-z0-9_.-]{20,400}$/.test(d.token)) throw new Error("Nieprawidłowy token");
  if (typeof d.url !== "string" || !/^https:\/\/[A-Za-z0-9.-]+(:\d+)?$/.test(d.url)) throw new Error("Nieprawidłowy adres serwera");
  if (typeof d.sessionId !== "string" || !/^[a-z0-9-]{8,64}$/.test(d.sessionId)) throw new Error("Nieprawidłowa sesja");
  if (typeof d.sessionToken !== "string" || !/^[a-f0-9]{32,128}$/.test(d.sessionToken)) throw new Error("Nieprawidłowy token sesji");
  return d;
}

/** Ścieżka pliku od modelu: względna, bez „..”, bez .git. */
export function bezpiecznaSciezka(path) {
  if (typeof path !== "string") return undefined;
  const p = path.replace(/^\.\/+/, "");
  if (!p || p.startsWith("/") || p.split("/").some(part => part === ".." || part === ".git") || p.length > 400) return undefined;
  return p;
}

export function ogon(t, max = MAX_WYNIK) {
  return t.length <= max ? t : `[…początek pominięty…]\n${t.slice(-max)}`;
}

// Zapis plików jako `tester` — katalog repo należy do niego, nie do użytkownika przebiegu.
const ZAPIS = `
const fs=require("fs"),path=require("path");let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{
for(const f of JSON.parse(d)){const p=path.join(process.cwd(),f.path);
if(f.deleted){fs.rmSync(p,{force:true});continue}
fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,f.binary?Buffer.from(f.content,"base64"):f.content)}})`;

async function main() {
  const plik = process.argv[2];
  const d = sprawdzSesje(JSON.parse(readFileSync(plik, "utf8")));
  unlinkSync(plik);
  const naglowki = { "content-type": "application/json", "x-sesja-token": d.sessionToken };
  const adres = (koncowka) => `${d.url}/api/narzedziownia/sesja/${d.sessionId}/${koncowka}`;
  const wyslij = (koncowka, body) => fetch(adres(koncowka), { method: "POST", headers: naglowki, body: JSON.stringify(body) }).catch(() => undefined);

  const dir = `${KATALOG}/repo`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(KATALOG, { recursive: true });
  const klon = spawnSync("git", ["clone", "--depth", "1", "--branch", d.ref, `https://x-access-token:${d.token}@github.com/${d.repo}.git`, dir], { encoding: "utf8", timeout: 180_000 });
  if (klon.status !== 0) {
    await wyslij("gotowe", { ok: false, log: ogon(String(klon.stderr).replaceAll(d.token, "***"), 3_000) });
    return;
  }
  spawnSync("git", ["-C", dir, "remote", "remove", "origin"]);
  d.token = "";
  oddajTesterowi(KATALOG);
  const install = jakoTester("bash", ["-c", "if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; elif [ -f package.json ]; then npm install --no-audit --no-fund; else echo 'brak package.json'; fi"], { cwd: dir, timeout: 600_000 });
  // Od tej chwili `tester` nie ma sieci (poza pętlą zwrotną).
  if (process.env.NARZEDZIA_TESTER === "1") {
    for (const tool of ["iptables", "ip6tables"]) {
      spawnSync("sudo", ["-n", tool, "-I", "OUTPUT", "-m", "owner", "--uid-owner", "tester", "-j", "REJECT"]);
      spawnSync("sudo", ["-n", tool, "-I", "OUTPUT", "-o", "lo", "-m", "owner", "--uid-owner", "tester", "-j", "ACCEPT"]);
    }
  }
  await wyslij("gotowe", { ok: install.status === 0, log: ogon(`$ instalacja zależności (kod ${install.status})\n${(install.stdout || "") + (install.stderr || "")}`, 3_000) });

  const koniec = Date.now() + 55 * 60_000;
  let ostatnie = Date.now();
  while (Date.now() < koniec && Date.now() - ostatnie < 15 * 60_000) {
    const odp = await fetch(adres("polecenie"), { headers: naglowki }).catch(() => undefined);
    if (!odp) { await new Promise(r => setTimeout(r, 3_000)); continue; }
    if (odp.status === 204) continue;
    if (odp.status !== 200) break;
    const body = await odp.json().catch(() => ({}));
    if (body.koniec) break;
    if (!body.id) continue;
    ostatnie = Date.now();
    const pliki = (Array.isArray(body.files) ? body.files : [])
      .map(f => ({ ...f, path: bezpiecznaSciezka(f.path) }))
      .filter(f => f.path && (f.deleted || typeof f.content === "string"));
    if (pliki.length) jakoTester("node", ["-e", ZAPIS], { cwd: dir, input: JSON.stringify(pliki), timeout: 60_000 });
    const czas = Math.min(Math.max(Number(body.timeoutS) || 120, 5), MAX_CZAS_POLECENIA_S);
    const r = typeof body.command === "string" && body.command.trim()
      ? jakoTester("bash", ["-c", body.command], { cwd: dir, timeout: czas * 1000 })
      : { status: 0, stdout: "", stderr: "" };
    const wynik = (r.stdout || "") + (r.stderr ? `${r.stdout ? "\n" : ""}${r.stderr}` : "") + (r.error?.code === "ETIMEDOUT" ? `\n[przerwano po ${czas} s]` : "");
    await wyslij("wynik", { id: body.id, exitCode: typeof r.status === "number" ? r.status : -1, output: ogon(wynik) });
    spawnSync("sudo", ["-n", "pkill", "-9", "-u", "tester"]);
  }
  await wyslij("koniec", {});
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(() => { process.exitCode = 0; }).finally(() => {
    process.stdout.write(JSON.stringify({ ok: true, wynik: "Sesja zakończona." }));
  });
}
