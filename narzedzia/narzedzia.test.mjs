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
