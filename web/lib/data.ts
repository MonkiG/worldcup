import fs from "node:fs";
import path from "node:path";
import type { WorldCupData } from "./types";

export function getWorldCupData(): WorldCupData {
  const dataPath = path.join(process.cwd(), "..", "data", "latest.json");
  return JSON.parse(fs.readFileSync(dataPath, "utf8")) as WorldCupData;
}
