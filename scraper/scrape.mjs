import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command, InvalidArgumentError } from "commander";
import { scrapeFixtures } from "./fixtures.mjs";
import { scrapeGroups } from "./standings.mjs";
import { buildSnapshot, readSnapshot, writeSnapshot } from "./snapshot.mjs";

const targets = new Set(["groups", "fixtures", "all"]);

function target(value) {
  if (targets.has(value)) return value;
  throw new InvalidArgumentError("expected groups, fixtures, or all");
}

export function parseCliArgs(args = process.argv.slice(2), { silent = false } = {}) {
  const program = new Command()
    .name("worldcup-scraper")
    .description("Refresh World Cup standings and fixture data")
    .exitOverride()
    .option(
      "-t, --target <target>",
      "data to scrape: groups, fixtures, or all",
      target,
      "groups",
    );

  if (silent) {
    program.configureOutput({
      writeErr: () => {},
    });
  }

  program.parse(args, { from: "user" });
  return program.opts();
}

export async function run(args = process.argv.slice(2)) {
  const { target } = parseCliArgs(args);
  const existing = await readSnapshot();
  const shouldScrapeGroups = target === "groups" || target === "all";
  const shouldScrapeFixtures = target === "fixtures" || target === "all";
  const [groups, matches] = await Promise.all([
    shouldScrapeGroups ? scrapeGroups() : existing?.groups,
    shouldScrapeFixtures ? scrapeFixtures() : existing?.matches,
  ]);

  if (!groups) {
    throw new Error("No existing groups found. Run with --target groups first.");
  }

  const output = await writeSnapshot(buildSnapshot({ groups, matches }));
  console.log(`Wrote ${output}`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
