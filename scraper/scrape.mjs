import path from "node:path";
import { fileURLToPath } from "node:url";
import { scrapeFixtures } from "./fixtures.mjs";
import { scrapeGroups } from "./standings.mjs";
import { buildSnapshot, writeSnapshot } from "./snapshot.mjs";

export async function run() {
  const [groups, matches] = await Promise.all([scrapeGroups(), scrapeFixtures()]);
  const output = await writeSnapshot(buildSnapshot({ groups, matches }));
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
