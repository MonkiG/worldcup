import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { buildBracket } from "./bracket.mjs";

const projectRoot = path.resolve(import.meta.dirname, "../..");

export const standingsUrl =
  "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings";

const outputPath = path.join(projectRoot, "data", "latest.json");

function browserLaunchOptions() {
  const executablePath =
    process.env.CHROME_BIN ??
    process.env.CHROME_PATH ??
    process.env.GOOGLE_CHROME_BIN;

  return {
    ...(executablePath ? { executablePath } : { channel: "chrome" }),
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox"],
  };
}

export async function scrapeGroups() {
  const browser = await chromium.launch(browserLaunchOptions());

  try {
    const page = await browser.newPage();

    await page.goto(standingsUrl, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("table caption")].filter((caption) =>
          caption.textContent?.startsWith(
            "Standings and Group Tables - Group ",
          ),
        ).length === 12,
      undefined,
      { timeout: 45_000 },
    );

    const groups = await page.evaluate(() => {
      const integer = (value) => Number.parseInt(value.trim(), 10);
      const tables = [...document.querySelectorAll("table")].filter((table) =>
        table
          .querySelector("caption")
          ?.textContent?.trim()
          .startsWith("Standings and Group Tables - Group "),
      );

      return tables.map((table) => {
        const caption = table.querySelector("caption")?.textContent?.trim();
        const group = caption?.match(/Group ([A-L])$/)?.[1];
        const teams = [...table.querySelectorAll("tbody tr")].map((row) => {
          const cells = [...row.querySelectorAll("td")].map((cell) =>
            cell.innerText.trim().replace(/\s+/g, " "),
          );
          const href = row.querySelector("a[href*='/teams/']")?.getAttribute(
            "href",
          );
          const teamName = cells[2];
          const fallbackSlug = teamName
            .replace(/\s[A-Z]{3}$/, "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

          return {
            slug: href?.split("/").filter(Boolean).at(-1) ?? fallbackSlug,
            group,
            won: integer(cells[4]),
            "team-conduct-score": integer(cells[10]),
            lost: integer(cells[6]),
            points: integer(cells[11]),
            drawn: integer(cells[5]),
            team: teamName,
            "goals-against": integer(cells[8]),
            position: integer(cells[1]),
            played: integer(cells[3]),
            "goals-for": integer(cells[7]),
            "goal-difference": integer(cells[9]),
          };
        });

        return { group, teams };
      });
    });

    if (groups.length !== 12) {
      throw new Error(
        `FIFA layout changed: expected 12 groups, found ${groups.length}`,
      );
    }

    const invalidGroups = groups.filter((group) => group.teams.length !== 4);
    if (invalidGroups.length > 0) {
      throw new Error(
        `FIFA layout changed: expected four teams in groups ${invalidGroups
          .map((group) => group.group)
          .join(", ")}`,
      );
    }

    return groups;
  } finally {
    await browser.close();
  }
}

export async function run() {
  const groups = await scrapeGroups();
  const result = {
    source: standingsUrl,
    "generated-at": new Date().toISOString(),
    groups,
    bracket: buildBracket(groups),
  };
  const output = path.resolve(outputPath);

  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`Wrote ${path.relative(process.cwd(), output)}`);
}

if (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
