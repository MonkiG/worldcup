import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { buildBracket } from "./bracket.mjs";
import { standingsUrl } from "./standings.mjs";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const outputPath = path.join(projectRoot, "data", "latest.json");

export function buildSnapshot(groups) {
  return {
    source: standingsUrl,
    "generated-at": new Date().toISOString(),
    groups,
    bracket: buildBracket(groups),
  };
}

export async function writeSnapshot(snapshot) {
  const output = path.resolve(outputPath);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(snapshot, null, 2)}\n`);
  return path.relative(process.cwd(), output);
}
