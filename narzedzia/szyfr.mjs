// Szyfrowanie danych i wyników narzędziowni (AES-256-GCM).
//
// Repo jest PUBLICZNE (Actions za darmo), więc wszystko, co trafia do logów przebiegu i do
// wejść workflow, widzi każdy. Dlatego SimplyChat wysyła dane zaszyfrowane („enc:...”), a wynik
// wraca zaszyfrowany tym samym kluczem. Klucz: sekret repo NARZEDZIOWNIA_KLUCZ (64 znaki hex),
// ten sam w sekretach SimplyChat.
//
//   node szyfr.mjs odszyfruj   — env DANE  → stdout (tekst jawny)
//   node szyfr.mjs zaszyfruj   — stdin     → stdout („enc:...” albo jawnie, gdy brak klucza)
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

export function kluczZ(hex) {
  const h = (hex || "").trim();
  if (!h) return null;
  if (!/^[0-9a-fA-F]{64}$/.test(h)) throw new Error("NARZEDZIOWNIA_KLUCZ musi mieć 64 znaki hex");
  return Buffer.from(h, "hex");
}

export function zaszyfruj(tekst, klucz) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", klucz, iv);
  const ct = Buffer.concat([c.update(tekst, "utf8"), c.final()]);
  return "enc:" + Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64");
}

export function odszyfruj(napis, klucz) {
  if (!napis.startsWith("enc:")) return napis; // jawne — tylko do ręcznych prób
  if (!klucz) throw new Error("Dane są zaszyfrowane, a repo nie ma sekretu NARZEDZIOWNIA_KLUCZ");
  const b = Buffer.from(napis.slice(4), "base64");
  const d = createDecipheriv("aes-256-gcm", klucz, b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28));
  return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const klucz = kluczZ(process.env.KLUCZ);
  const tryb = process.argv[2];
  if (tryb === "odszyfruj") process.stdout.write(odszyfruj(process.env.DANE || "", klucz));
  else if (tryb === "zaszyfruj") {
    const tekst = readFileSync(0, "utf8");
    process.stdout.write(klucz ? zaszyfruj(tekst, klucz) : tekst);
  } else { console.error("użycie: szyfr.mjs odszyfruj|zaszyfruj"); process.exit(2); }
}
