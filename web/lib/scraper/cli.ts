import { logger } from "./logger";
import { runScraper, type ScrapeMode } from "./run";

function parseMode(args: string[]): ScrapeMode {
  const value = args[0] ?? "refresh";
  if (value === "refresh" || value === "all") return "refresh";
  if (value === "snapshot") return "snapshot";

  throw new Error("Usage: tsx lib/scraper/cli.ts [refresh|snapshot]");
}

runScraper(parseMode(process.argv.slice(2))).catch((error) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
