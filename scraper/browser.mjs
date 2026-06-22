import { chromium } from "playwright-core";
import { logger } from "./logger.mjs";

export function browserLaunchOptions() {
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

export function launchBrowser() {
  const options = browserLaunchOptions();
  logger.info(
    `Launching Chrome with ${
      options.executablePath ? `executable ${options.executablePath}` : "channel chrome"
    }`,
  );

  return chromium.launch(options);
}
