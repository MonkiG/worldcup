import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { buildWorldCupData } from "../world-cup/build-data";
import type { WorldCupData, WorldCupSource } from "../types";

const dataDirectory = path.join(process.cwd(), "data");
const sourcePath = path.join(dataDirectory, "world-cup-source.json");

export const getWorldCupSource = cache((): WorldCupSource => {
  return JSON.parse(fs.readFileSync(sourcePath, "utf8")) as WorldCupSource;
});

export const getWorldCupData = cache((): WorldCupData => {
  return buildWorldCupData(getWorldCupSource());
});
