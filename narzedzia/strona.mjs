// Narzędzie „strona”: otwiera adres w prawdziwej przeglądarce (renderuje JavaScript)
// i oddaje JSON {ok, wynik} z tytułem i widocznym tekstem strony.
import { readFileSync } from "node:fs";
import { przytnij } from "./python.mjs";

export function adresZ(dane) {
  const u = new URL(dane.trim());
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("Tylko adresy http(s)");
  return u.href;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let out;
  try {
    const adres = adresZ(readFileSync(process.argv[2], "utf8"));
    const { chromium } = await import("playwright");
    const b = await chromium.launch();
    try {
      const p = await b.newPage();
      await p.goto(adres, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => p.waitForLoadState("load"));
      const tytul = await p.title();
      const tekst = await p.evaluate(() => document.body?.innerText || "");
      out = { ok: true, wynik: przytnij(`Tytuł: ${tytul}\nAdres: ${p.url()}\n\n${tekst.trim()}`) };
    } finally { await b.close(); }
  } catch (e) { out = { ok: false, wynik: String(e?.message || e) }; }
  process.stdout.write(JSON.stringify(out));
}
