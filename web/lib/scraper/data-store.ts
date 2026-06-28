import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildWorldCupData } from "../world-cup/build-data";
import type { FixtureMatch, MatchResult, WorldCupData, WorldCupSource } from "../types";
import { fixturesUrl } from "./fixtures";
import { standingsUrl } from "./standings";

const webRoot = process.cwd();
const dataDirectory = path.join(webRoot, "data");
export const sourcePath = path.join(dataDirectory, "world-cup-source.json");
export const snapshotPath = path.join(dataDirectory, "latest.json");

export async function readJson<T>(filePath: string) {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
  return path.relative(process.cwd(), filePath);
}

export async function readSource() {
  return readJson<WorldCupSource>(sourcePath);
}

export function stripFixtureLiveFields(match: FixtureMatch): FixtureMatch {
  const { homeScore, awayScore, status, ...fixture } = match;
  if (status && status !== "FT") {
    return { ...fixture, status };
  }

  return fixture;
}

export function extractResults(matches: FixtureMatch[] = []): MatchResult[] {
  const now = new Date().toISOString();

  return matches
    .filter(
      (match) =>
        match.match &&
        typeof match.homeScore === "number" &&
        typeof match.awayScore === "number",
    )
    .map((match) => ({
      match: match.match as number,
      homeScore: match.homeScore as number,
      awayScore: match.awayScore as number,
      status: match.status ?? "FT",
      updatedAt: now,
    }));
}

export function createSource({
  generatedAt = new Date().toISOString(),
  fixtures = [],
  groups = [],
  results = [],
}: {
  generatedAt?: string;
  fixtures?: FixtureMatch[];
  groups?: WorldCupSource["live"]["groups"];
  results?: MatchResult[];
}): WorldCupSource {
  return {
    version: 1,
    sources: {
      standings: standingsUrl,
      fixtures: fixturesUrl,
    },
    "generated-at": generatedAt,
    fixtures: {
      "generated-at": generatedAt,
      matches: fixtures.map(stripFixtureLiveFields),
    },
    live: {
      "generated-at": generatedAt,
      groups,
      results,
    },
  };
}

export function sourceFromSnapshot(snapshot: WorldCupData | null) {
  if (!snapshot) return null;

  return createSource({
    generatedAt: snapshot["generated-at"],
    fixtures: snapshot.matches ?? [],
    groups: snapshot.groups,
    results: extractResults(snapshot.matches ?? []),
  });
}

export async function readOrMigrateSource() {
  const source = await readSource();
  if (source) return source;

  const snapshot = await readJson<WorldCupData>(snapshotPath);
  const migrated = sourceFromSnapshot(snapshot);
  if (migrated) await writeSource(migrated);
  return migrated;
}

export async function writeSource(source: WorldCupSource) {
  return writeJson(sourcePath, {
    ...source,
    fixtures: {
      ...source.fixtures,
      matches: source.fixtures.matches.map(stripFixtureLiveFields),
    },
  });
}

export function buildSnapshot(source: WorldCupSource) {
  return buildWorldCupData(source);
}

export async function writeSnapshot(source: WorldCupSource) {
  return writeJson(snapshotPath, buildSnapshot(source));
}
