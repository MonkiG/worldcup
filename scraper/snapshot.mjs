import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { buildBracket } from "./bracket.mjs";
import { syncMatchesWithBracket } from "./calendar.mjs";
import { fixturesUrl } from "./fixtures.mjs";
import { standingsUrl } from "./standings.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(projectRoot, "data", "latest.json");

export function buildSnapshot({ groups, matches }) {
  const bracket = buildBracket(groups);

  return {
    source: standingsUrl,
    sources: {
      standings: standingsUrl,
      fixtures: fixturesUrl,
    },
    "generated-at": new Date().toISOString(),
    groups,
    matches: syncMatchesWithBracket(matches, bracket),
    bracket,
  };
}

export async function readSnapshot() {
  try {
    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function writeSnapshot(snapshot) {
  const output = path.resolve(outputPath);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(snapshot, null, 2)}\n`);
  return path.relative(process.cwd(), output);
}
