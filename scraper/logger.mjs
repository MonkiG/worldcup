import pc from "picocolors";

const isQuiet = process.env.SCRAPER_LOG === "quiet";

function timestamp() {
  return pc.gray(new Date().toISOString());
}

function write(label, color, message, { force = false } = {}) {
  if (isQuiet && !force) return;
  console.error(`${timestamp()} ${color(label)} ${message}`);
}

function formatValue(value) {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export const logger = {
  start(message) {
    write("start", pc.cyan, message);
  },
  info(message) {
    write("info ", pc.blue, message);
  },
  visit(url) {
    write("visit", pc.magenta, url);
  },
  data(message) {
    write("data ", pc.yellow, message);
  },
  success(message) {
    write("done ", pc.green, message);
  },
  warn(message) {
    write("warn ", pc.yellow, message);
  },
  error(message) {
    write("error", pc.red, message, { force: true });
  },
  value(label, value) {
    if (isQuiet) return;
    console.error(`${timestamp()} ${pc.yellow("data ")} ${label}:`);
    console.error(
      formatValue(value)
        .split("\n")
        .map((line) => `  ${pc.gray(line)}`)
        .join("\n"),
    );
  },
};
