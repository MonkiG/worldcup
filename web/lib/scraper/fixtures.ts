import type { FixtureMatch, FixtureTeam } from "../types";
import { launchBrowser } from "./browser";
import { logger } from "./logger";

export const fixturesUrl =
  "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=&wtw-filter=ALL";

function extractFixturesFromDocument(): FixtureMatch[] {
  const slugify = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const cleanText = (value?: string | null) => value?.replace(/\s+/g, " ").trim() ?? "";
  const datePattern =
    /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) \d{1,2} [A-Z][a-z]+ 2026$/;
  const timePattern = /^\d{1,2}:\d{2}$/;
  const scorePattern = /^\d+$/;
  const stopLabels = new Set(["View groups", "View brackets", "·", "Â·"]);
  const teamFromName = (value: string): FixtureTeam | undefined => {
    const team = cleanText(value);
    return team ? { name: team, slug: slugify(team) } : undefined;
  };

  function isMatchStart(lines: string[], index: number) {
    return (
      lines[index] &&
      !stopLabels.has(lines[index]) &&
      (timePattern.test(lines[index + 1]) ||
        (scorePattern.test(lines[index + 1]) && lines[index + 2] === "FT"))
    );
  }

  function toIsoDate(dateLine: string, time: string) {
    return new Date(`${dateLine} ${time}`).toISOString();
  }

  const lines = document.body.innerText
    .split("\n")
    .map((line) => cleanText(line))
    .filter(Boolean);
  const fixtures: FixtureMatch[] = [];
  let currentDate = "";
  let matchNumber = 1;

  for (let index = 0; index < lines.length; index += 1) {
    if (datePattern.test(lines[index])) {
      currentDate = lines[index];
      continue;
    }

    if (!currentDate || !isMatchStart(lines, index)) continue;

    const homeName = lines[index];
    const isScheduled = timePattern.test(lines[index + 1]);
    const kickoff = isScheduled ? lines[index + 1] : "12:00";
    const awayName = isScheduled ? lines[index + 2] : lines[index + 4];
    const status = isScheduled ? "scheduled" : lines[index + 2];
    const homeScore = isScheduled ? undefined : Number(lines[index + 1]);
    const awayScore = isScheduled ? undefined : Number(lines[index + 3]);
    const roundIndex = isScheduled ? index + 3 : index + 5;
    const roundName = lines[roundIndex] ?? "";
    const metaStart = roundIndex + 1;
    const nextMatchIndex = lines.findIndex(
      (line, nextIndex) =>
        nextIndex > metaStart &&
        (datePattern.test(line) || isMatchStart(lines, nextIndex)),
    );
    const metaLines = lines
      .slice(metaStart, nextMatchIndex === -1 ? lines.length : nextMatchIndex)
      .filter((line) => !stopLabels.has(line));
    const group = metaLines.find((line) => /^Group [A-L]$/.test(line));
    const venue =
      metaLines.find(
        (line) =>
          line !== group &&
          !line.startsWith("(") &&
          line !== "·" &&
          line !== "Â·",
      ) ?? "";
    const round = group ?? roundName;
    const date = toIsoDate(currentDate, kickoff);

    fixtures.push({
      id: `fixture-${matchNumber}`,
      match: matchNumber,
      date,
      round,
      home: teamFromName(homeName),
      away: teamFromName(awayName),
      homeScore,
      awayScore,
      venue,
      label: `${homeName} vs ${awayName}`,
      status,
    });

    matchNumber += 1;
    index = (nextMatchIndex === -1 ? lines.length : nextMatchIndex) - 1;
  }

  return fixtures.sort((left, right) => left.date.localeCompare(right.date));
}

export async function scrapeFixtures() {
  logger.start("Scraping fixtures");
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    logger.visit(fixturesUrl);
    await page.goto(fixturesUrl, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    logger.info("Waiting for rendered fixture dates");
    await page.waitForFunction(
      () =>
        /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) \d{1,2} [A-Z][a-z]+ 2026/.test(
          document.body.innerText,
        ),
      undefined,
      { timeout: 45_000 },
    );

    const fixtures = await page.evaluate(extractFixturesFromDocument);
    logger.data(`Extracted ${fixtures.length} fixtures`);
    if (fixtures.length > 0) {
      logger.value("Fixture date range", {
        first: fixtures[0].date,
        last: fixtures.at(-1)?.date,
      });
    }

    return fixtures;
  } finally {
    await browser.close();
    logger.info("Closed fixtures browser");
  }
}
