import path from "node:path";
import { fileURLToPath } from "node:url";
import { scrapeGroups } from "./standings.mjs";
import { buildSnapshot, writeSnapshot } from "./snapshot.mjs";

export async function run() {
  const groups = await scrapeGroups();
  const output = await writeSnapshot(buildSnapshot(groups));
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
