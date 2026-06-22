import { launchBrowser } from "./browser.mjs";

export const fixturesUrl =
  "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=&wtw-filter=ALL";

function extractFixturesFromDocument() {
  const slugify = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const cleanText = (value) => value?.replace(/\s+/g, " ").trim() ?? "";
  const teamFromText = (value) => {
    const team = cleanText(value).replace(/\s[A-Z]{3}$/, "");
    return team ? { name: team, slug: slugify(team) } : undefined;
  };
  const nodes = [
    ...document.querySelectorAll(
      "article, li, [data-testid*='match'], [data-testid*='fixture'], [class*='match'], [class*='fixture']",
    ),
  ];
  const fixturesByKey = new Map();

  for (const node of nodes) {
    const time = node.querySelector("time[datetime]");
    const date = time?.getAttribute("datetime");
    if (!date) continue;

    const text = cleanText(node.textContent);
    if (!text || text.length > 800) continue;

    const teamLinks = [
      ...node.querySelectorAll("a[href*='/teams/'], a[href*='/team/']"),
    ];
    const teams = teamLinks
      .map((link) => teamFromText(link.textContent))
      .filter(Boolean);
    const uniqueTeams = [
      ...new Map(teams.map((team) => [team.slug, team])).values(),
    ];

    const matchNumber = text.match(/\bM(?:atch)?\s*(\d{1,3})\b/i)?.[1];
    const round =
      text.match(
        /(Group [A-L]|Round of 32|Round of 16|Quarter-finals?|Semi-finals?|Third place|Final)/i,
      )?.[1] ?? "";
    const venue =
      text.match(
        /(MetLife Stadium|AT&T Stadium|SoFi Stadium|Mercedes-Benz Stadium|NRG Stadium|Lincoln Financial Field|Lumen Field|Levi'?s Stadium|Gillette Stadium|Hard Rock Stadium|BC Place|BMO Field|Estadio Azteca|Estadio Guadalajara|Estadio BBVA)[^,]*/i,
      )?.[0] ?? "";

    const fixture = {
      id: matchNumber ? `match-${matchNumber}` : `${date}-${slugify(text).slice(0, 60)}`,
      match: matchNumber ? Number(matchNumber) : undefined,
      date,
      round,
      home: uniqueTeams[0],
      away: uniqueTeams[1],
      venue,
      label: text,
    };

    fixturesByKey.set(fixture.id, fixture);
  }

  return [...fixturesByKey.values()].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}

export async function scrapeFixtures() {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.goto(fixturesUrl, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await page.waitForFunction(
      () => document.querySelectorAll("time[datetime]").length > 0,
      undefined,
      { timeout: 45_000 },
    );

    return page.evaluate(extractFixturesFromDocument);
  } finally {
    await browser.close();
  }
}
