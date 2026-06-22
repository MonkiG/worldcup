import test from "node:test";
import assert from "node:assert/strict";
import { parseCliArgs } from "../scrape.mjs";

test("defaults to scraping groups", () => {
  assert.deepEqual(parseCliArgs([]), { target: "groups" });
});

test("accepts fixtures target", () => {
  assert.deepEqual(parseCliArgs(["--target", "fixtures"]), {
    target: "fixtures",
  });
});

test("rejects unknown targets", () => {
  assert.throws(
    () => parseCliArgs(["--target", "teams"], { silent: true }),
    /expected groups/,
  );
});
