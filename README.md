# FIFA World Cup 2026 bracket tracker

## Project note

This project was built and refactored with help from Codex ChatGPT 5.5 as a
coding assistant. Codex helped with the Next.js UI split, scraper refactor,
workflow validation, reusable modules, and project documentation.

## Overview

This repository tracks the FIFA World Cup 2026 group stage and projected
knockout bracket.

It contains:

- a Next.js dashboard in `web`;
- a standalone Node.js scraper project in `scraper`;
- shared tournament data in `data/latest.json`;
- a daily GitHub Actions workflow that refreshes the group standings.

The app reads `data/latest.json` from the filesystem on every server render.
That means the scraper can update the JSON first, then the Next.js app can show
the latest data without requiring an API service or database.

## Features

- Group tables for all 12 World Cup groups.
- Best third-place ranking and qualification projection.
- Round-of-32 knockout bracket projection.
- Calendar page for fixtures when match data exists in `data/latest.json`.
- Separate dashboard pages for groups, qualification, bracket, and calendar.
- Reusable frontend components for page shell, sections, tables, bracket, and
  calendar views.
- Standalone scraper project with focused modules for browser setup, standings,
  fixtures, snapshot writing, qualification, and bracket projection.

The output is deliberately marked `provisional` until every team has played
three group matches. FIFA tie-break order is points, goal difference, goals
scored, then team conduct score. A final tie can require drawing lots, so this
project uses the group letter only as a deterministic fallback and keeps the
source standings in the JSON for auditing.

For the qualification rules, see
[docs/TABLE_RULES.md](docs/TABLE_RULES.md).

## Requirements

- Node.js 22+
- npm
- Chrome or Chromium for the scraper
- `make`, if you want to use the Makefile shortcuts

The scraper uses `playwright-core` and launches an existing browser. Set
`CHROME_BIN` if Chrome is installed in a non-standard location.

## Project Structure

```text
.
├── .github/workflows/daily.yml
├── data/latest.json
├── docs/TABLE_RULES.md
├── scraper/
│   ├── browser.mjs
│   ├── bracket.mjs
│   ├── bracket-template.mjs
│   ├── fixtures.mjs
│   ├── qualification.mjs
│   ├── scrape.mjs
│   ├── snapshot.mjs
│   ├── standings.mjs
│   └── test/
└── web/
    ├── app/
    ├── components/
    └── lib/
```

## Install

Using the Makefile:

```bash
make install
```

Or with npm directly:

```bash
npm --prefix web install
npm --prefix scraper install
```

## Run the App

Using the Makefile:

```bash
make front
```

Or with npm directly:

```bash
npm --prefix web run dev
```

Open `http://localhost:3000`.

The dashboard pages are:

- `/` for the home dashboard.
- `/groups` for group tables.
- `/qualification` for best third-place qualification.
- `/bracket` for the knockout projection.
- `/calendar` for fixtures.

## Scraper Commands

The scraper is its own npm project under `scraper`.

```bash
npm --prefix scraper run scrape:groups
npm --prefix scraper run scrape:fixtures
npm --prefix scraper run scrape:all
```

Makefile equivalents:

```bash
make scrape
make scrape-groups
make scrape-fixtures
make scrape-all
```

`make scrape` runs the group scraper only.

The CLI also supports the target flag directly:

```bash
node scraper/scrape.mjs --target groups
node scraper/scrape.mjs --target fixtures
node scraper/scrape.mjs --target all
```

The valid targets are:

- `groups`: scrape FIFA group standings and rebuild the bracket projection.
- `fixtures`: scrape FIFA fixtures and keep the existing group data.
- `all`: scrape both groups and fixtures.

The scraper prints colored progress logs with `picocolors`, including the
selected target, pages visited, browser launch mode, extracted data counts, and
the snapshot write path. Set `SCRAPER_LOG=quiet` to hide progress logs while
still showing errors.

## Data File

The generated data lives in:

```text
data/latest.json
```

The Next.js app reads that file from the repository filesystem. The workflow
currently updates group standings only. Fixture data can be added or updated
manually in `data/latest.json`; the app tolerates missing fixture data and will
show the calendar when `matches` exists.

## GitHub Actions Workflow

`.github/workflows/daily.yml` runs every day at `12:15 UTC` and can also be
started manually from GitHub Actions.

The workflow:

1. checks out the repository;
2. installs Node.js 22;
3. installs dependencies for both `web` and `scraper`;
4. installs Chrome;
5. runs `npm --prefix scraper run scrape:groups`;
6. commits `data/latest.json` only when it changed.

The workflow intentionally scrapes only groups for now. It does not scrape
fixtures, so manually maintained fixture data is not part of the automated
refresh path.

## Verification

Using the Makefile:

```bash
make test
make front-build
make front-check
make check
```

Or with npm directly:

```bash
npm --prefix scraper run test
npm --prefix web run build
npm --prefix web run check
```

`make check` runs scraper tests, builds the frontend, then runs the TypeScript
check. The build runs before the typecheck because Next.js generates type files
inside `.next`.

## Bracket Behavior

First- and second-place teams map directly to FIFA's Round-of-32 slots.
The eight third-place slots depend on which groups produce the best third-place
teams, so the bracket projector enumerates valid allocations.

When a slot can be resolved uniquely, the JSON contains the projected team.
When it cannot be resolved yet, the JSON includes candidate groups and teams.
Later rounds keep official winner and loser references such as `W74` and
`L101`.

This avoids inventing team assignments while the group stage is incomplete.
The scraper validates that FIFA still exposes exactly 12 groups with four teams
each and exits with an error if that contract changes.

## Main Files

- `scraper/scrape.mjs`: scraper CLI entrypoint.
- `scraper/browser.mjs`: Playwright browser launch helpers.
- `scraper/standings.mjs`: FIFA standings extraction.
- `scraper/fixtures.mjs`: FIFA fixtures extraction.
- `scraper/snapshot.mjs`: `data/latest.json` generation.
- `scraper/bracket.mjs`: knockout bracket projection.
- `scraper/qualification.mjs`: group and third-place qualification logic.
- `web/lib/data.ts`: reads `data/latest.json`.
- `web/lib/calendar.ts`: finds current and upcoming matches.
- `web/app/*/page.tsx`: Next.js route pages.
- `web/components/*`: reusable dashboard UI components.
