/** Proste funkcje tekstowe — materiał do ćwiczeń dla agenta Code Power. */

/** Zamienia tekst na slug do adresu: małe litery, bez polskich znaków, myślniki zamiast spacji. */
export function slug(tekst: string): string {
  return tekst
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Liczy słowa (ciągi znaków oddzielone białymi znakami). */
export function liczSlowa(tekst: string): number {
  const t = tekst.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Skraca tekst do `max` znaków, dokładając „…”, gdy coś ucięto. */
export function skroc(tekst: string, max: number): string {
  if (max < 1) return "";
  return tekst.length <= max ? tekst : tekst.slice(0, max - 1).trimEnd() + "…";
}
