import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command, InvalidArgumentError } from "commander";
import { scrapeFixtures } from "./fixtures.mjs";
import { logger } from "./logger.mjs";
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

  program.configureOutput({
    writeErr: () => {},
  });

  program.parse(args, { from: "user" });
  return program.opts();
}

export async function run(args = process.argv.slice(2)) {
  const { target } = parseCliArgs(args);
  logger.start(`Running scraper target "${target}"`);

  const existing = await readSnapshot();
  if (existing) {
    logger.info(
      `Loaded existing snapshot from ${existing["generated-at"] ?? "unknown date"}`,
    );
  } else {
    logger.warn("No existing snapshot found");
  }

  const shouldScrapeGroups = target === "groups" || target === "all";
  const shouldScrapeFixtures = target === "fixtures" || target === "all";
  logger.info(
    `Plan: groups=${shouldScrapeGroups ? "scrape" : "reuse"}, fixtures=${
      shouldScrapeFixtures ? "scrape" : "reuse"
    }`,
  );

  const [groups, matches] = await Promise.all([
    shouldScrapeGroups ? scrapeGroups() : existing?.groups,
    shouldScrapeFixtures ? scrapeFixtures() : existing?.matches,
  ]);

  if (!groups) {
    throw new Error("No existing groups found. Run with --target groups first.");
  }

  logger.data(`Snapshot groups: ${groups.length}`);
  logger.data(`Snapshot fixtures: ${matches?.length ?? 0}`);

  const snapshot = buildSnapshot({ groups, matches });
  logger.info("Writing data/latest.json");
  const output = await writeSnapshot(snapshot);
  logger.success(`Wrote ${output}`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  run().catch((error) => {
    logger.error(error.message);
    process.exitCode = 1;
  });
}
