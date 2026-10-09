import { test } from "node:test";
import assert from "node:assert/strict";
import { checkReviewLink, normalizeLink } from "./review-link.ts";

test("accepts the Google review link shapes from the brief", () => {
  for (const url of [
    "https://g.page/r/CbA1xYz123/review",
    "g.page/r/CbA1xYz123/review", // pasted without scheme
    "https://search.google.com/local/writereview?placeid=ChIJ123",
    "https://maps.app.goo.gl/AbC123xyz",
    "https://www.google.com/maps/place/Kopi+Senja",
    "https://google.co.id/maps?cid=123",
  ]) {
    assert.equal(checkReviewLink(url), "google", url);
  }
});

test("warns (but allows) other valid links", () => {
  assert.equal(checkReviewLink("https://example.com/review"), "other");
  assert.equal(checkReviewLink("https://g.page/kopi-senja"), "other"); // not the /r/…/review form
  assert.equal(checkReviewLink("https://search.google.com/local/writereview"), "other"); // no placeid
});

test("rejects empty and non-URLs", () => {
  assert.equal(checkReviewLink("   "), "empty");
  assert.equal(checkReviewLink("kopi senja"), "invalid");
  assert.equal(checkReviewLink("localhost"), "invalid");
  assert.equal(checkReviewLink("javascript:alert(1)"), "invalid");
  assert.equal(normalizeLink("ftp://g.page/r/x/review"), null);
});
