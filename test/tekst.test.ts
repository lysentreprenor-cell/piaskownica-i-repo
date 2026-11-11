import { test } from "node:test";
import assert from "node:assert/strict";
import { slug, liczSlowa, skroc } from "../src/tekst.ts";

test("slug usuwa polskie znaki i spacje", () => {
  assert.equal(slug("Zażółć gęślą jaźń!"), "zazolc-gesla-jazn");
  assert.equal(slug("  Łódź  "), "lodz");
});

test("liczSlowa", () => {
  assert.equal(liczSlowa(""), 0);
  assert.equal(liczSlowa("  ala  ma\tkota "), 3);
});

test("skroc", () => {
  assert.equal(skroc("krótki", 10), "krótki");
  assert.equal(skroc("bardzo długi tekst", 8), "bardzo…");
  assert.equal(skroc("abc", 0), "");
});
