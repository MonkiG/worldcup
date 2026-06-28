const isQuiet = process.env.SCRAPER_LOG === "quiet";

const colors = {
  blue: "\u001b[34m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  gray: "\u001b[90m",
  magenta: "\u001b[35m",
  red: "\u001b[31m",
  reset: "\u001b[39m",
  yellow: "\u001b[33m",
};

function color(value: string, tone: keyof typeof colors) {
  return `${colors[tone]}${value}${colors.reset}`;
}

function write(label: string, tone: keyof typeof colors, message: string, force = false) {
  if (isQuiet && !force) return;
  console.error(`${color(new Date().toISOString(), "gray")} ${color(label, tone)} ${message}`);
}

export const logger = {
  data(message: string) {
    write("data ", "yellow", message);
  },
  error(message: string) {
    write("error", "red", message, true);
  },
  info(message: string) {
    write("info ", "blue", message);
  },
  start(message: string) {
    write("start", "cyan", message);
  },
  success(message: string) {
    write("done ", "green", message);
  },
  value(label: string, value: unknown) {
    if (isQuiet) return;
    write("data ", "yellow", `${label}: ${JSON.stringify(value)}`);
  },
  visit(url: string) {
    write("visit", "magenta", url);
  },
  warn(message: string) {
    write("warn ", "yellow", message);
  },
};
