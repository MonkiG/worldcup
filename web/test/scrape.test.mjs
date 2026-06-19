import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs } from "../scripts/scrape.mjs";

test("parses custom input and output paths", () => {
  assert.deepEqual(
    parseArgs(["--input", "standings.html", "--output", "result.json"]),
    {
      input: "standings.html",
      output: "result.json",
    },
  );
});

test("rejects a missing option value", () => {
  assert.throws(() => parseArgs(["--input"]), /requires a file path/);
});
