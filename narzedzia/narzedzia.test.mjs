import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { kluczZ, zaszyfruj, odszyfruj } from "./szyfr.mjs";
import { przytnij } from "./python.mjs";
import { adresZ } from "./strona.mjs";

test("szyfr: tam i z powrotem, z polskimi znakami", () => {
  const k = randomBytes(32);
  const s = zaszyfruj("Zażółć gęślą jaźń", k);
  assert.ok(s.startsWith("enc:") && !s.includes("jaźń"));
  assert.equal(odszyfruj(s, k), "Zażółć gęślą jaźń");
});

test("szyfr: zły klucz nie odszyfruje", () => {
  const s = zaszyfruj("tajne", randomBytes(32));
  assert.throws(() => odszyfruj(s, randomBytes(32)));
});

test("szyfr: zaszyfrowane bez klucza to błąd, jawne przechodzi", () => {
  assert.throws(() => odszyfruj("enc:AAAA", null), /NARZEDZIOWNIA_KLUCZ/);
  assert.equal(odszyfruj("print(1)", null), "print(1)");
});

test("kluczZ sprawdza format", () => {
  assert.equal(kluczZ(""), null);
  assert.throws(() => kluczZ("abc"));
  assert.equal(kluczZ("a".repeat(64)).length, 32);
});

test("przytnij", () => {
  assert.equal(przytnij("abc", 5), "abc");
  assert.match(przytnij("abcdefgh", 3), /^abc\n… \[ucięto 5 znaków\]$/);
});

test("adresZ: tylko http(s)", () => {
  assert.equal(adresZ(" https://example.com "), "https://example.com/");
  assert.throws(() => adresZ("file:///etc/passwd"));
  assert.throws(() => adresZ("nie adres"));
});

import { kroki, sprawdzDane, ogon } from "./testy.mjs";

test("testy: kroki jak w piaskownicy SimplyChat", () => {
  assert.deepEqual(kroki("all").map(k => k.name), ["check", "test", "build"]);
  assert.deepEqual(kroki("test").map(k => k.run), ["npm test --if-present"]);
});

test("testy: sprawdzDane odrzuca wstrzyknięcia", () => {
  const ok = { repo: "o/r", ref: "simplychat-sandbox/abc", token: "ghs_" + "a".repeat(36), command: "all" };
  assert.equal(sprawdzDane(ok).repo, "o/r");
  assert.throws(() => sprawdzDane({ ...ok, repo: "o/r; rm -rf /" }));
  assert.throws(() => sprawdzDane({ ...ok, ref: "../x" }));
  assert.throws(() => sprawdzDane({ ...ok, ref: "main --upload-pack=x y" }));
  assert.throws(() => sprawdzDane({ ...ok, command: "rm" }));
  assert.throws(() => sprawdzDane({ ...ok, token: "x' && curl" }));
});

test("ogon", () => {
  assert.equal(ogon("abc", 5), "abc");
  assert.equal(ogon("abcdef", 2), "[…]\nef");
});
