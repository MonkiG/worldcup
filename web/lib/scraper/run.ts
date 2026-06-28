import type { WorldCupSource } from "../types";
import { extractResults, readOrMigrateSource, writeSnapshot, writeSource } from "./data-store";
import { scrapeFixtures } from "./fixtures";
import { logger } from "./logger";
import { scrapeGroups } from "./standings";

export type ScrapeMode = "refresh" | "snapshot";

export async function refreshWorldCupData() {
  logger.start("Refreshing complete World Cup source");
  const [fixtures, groups] = await Promise.all([scrapeFixtures(), scrapeGroups()]);
  const results = extractResults(fixtures);
  const generatedAt = new Date().toISOString();

  const source: WorldCupSource = {
    version: 1,
    sources: {
      standings:
        "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings",
      fixtures:
        "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=&wtw-filter=ALL",
    },
    "generated-at": generatedAt,
    fixtures: {
      "generated-at": generatedAt,
      matches: fixtures,
    },
    live: {
      "generated-at": generatedAt,
      groups,
      results,
    },
  };

  const sourceOutput = await writeSource(source);
  const snapshotOutput = await writeSnapshot(source);
  logger.success(`Wrote ${sourceOutput}`);
  logger.success(`Wrote ${snapshotOutput}`);
  return source;
}

export async function rebuildSnapshot() {
  const source = await readOrMigrateSource();
  if (!source) {
    throw new Error("No source data found to rebuild the snapshot.");
  }

  const output = await writeSnapshot(source);
  logger.success(`Wrote ${output}`);
  return source;
}

export async function runScraper(mode: ScrapeMode = "refresh") {
  if (mode === "snapshot") return rebuildSnapshot();
  return refreshWorldCupData();
}
