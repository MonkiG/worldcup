import { chromium } from "playwright-core";

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
  return chromium.launch(browserLaunchOptions());
}
