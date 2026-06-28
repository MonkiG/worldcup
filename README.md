# FIFA World Cup 2026 bracket tracker

## Overview

This repository tracks the FIFA World Cup 2026 group stage, match calendar,
results, best third-place race, and projected knockout bracket.

The app is now self-contained inside the Next.js project in `web`:

- the dashboard routes live in `web/app`;
- the TypeScript scraper lives in `web/lib/scraper`;
- the canonical source file lives in `web/data/world-cup-source.json`;
- the derived compatibility snapshot lives in `web/data/latest.json`;
- the manual refresh dashboard lives at `/admin/refresh`.

There are no REST endpoints, no server actions, and no database in the current
data path. Pages read one filesystem source on the server and derive all
standings, scores, qualification, bracket, and calendar views from it.

## Features

- Group tables for all 12 World Cup groups.
- Best third-place ranking and qualification projection.
- Round-of-32 knockout bracket projection.
- Calendar page for fixtures and results.
- Team pages with fixtures, results, profile stats, and projected bracket path.
- Server-side page services in `web/lib/server`.
- TypeScript FIFA scraper in `web/lib/scraper`.
- Manual admin dashboard for refreshes.

## Requirements

- Node.js 22+
- npm
- Chrome or Chromium for the scraper
- `make`, if you want to use Makefile shortcuts

The scraper uses `playwright-core` and launches an existing browser. Set
`CHROME_BIN` if Chrome is installed in a non-standard location.

## Install

```bash
make install
```

Or:

```bash
npm --prefix web install
```

## Run The App

```bash
make front
```

Or:

```bash
npm --prefix web run dev
```

Open `http://localhost:3000`.

## Scraper Commands

The scraper is part of the Next project:

```bash
npm --prefix web run scrape
npm --prefix web run scrape:all
npm --prefix web run snapshot
```

Makefile equivalents:

```bash
make scrape
make scrape-all
make snapshot
```

`scrape` and `scrape:all` refresh everything from FIFA: fixtures, live
standings, finished match results, the canonical source, and the derived
snapshot. `snapshot` only rebuilds `web/data/latest.json` from the existing
`web/data/world-cup-source.json`.

## Manual Refresh Endpoint

Open the manual dashboard at:

```text
/admin/refresh
```

Paste `WORLD_CUP_REFRESH_SECRET` and run either a full refresh or a snapshot
rebuild from the browser.

The app exposes a protected admin endpoint:

```text
POST /api/admin/refresh
GET /api/admin/refresh
```

Set `WORLD_CUP_REFRESH_SECRET` and call it with a bearer token:

```bash
curl -X POST http://localhost:3000/api/admin/refresh \
  -H "Authorization: Bearer $WORLD_CUP_REFRESH_SECRET"
```

Use `?mode=snapshot` to rebuild the derived snapshot without scraping FIFA:

```bash
curl -X POST "http://localhost:3000/api/admin/refresh?mode=snapshot" \
  -H "Authorization: Bearer $WORLD_CUP_REFRESH_SECRET"
```

Important Vercel note: Vercel serverless functions do not provide a durable
writable filesystem for `web/data/*.json`. This filesystem approach works for
local development and long-running Node deployments. On Vercel, use a
persistent store such as Vercel Blob, KV, Postgres, or a commit-based update
flow if runtime refreshes must survive across invocations.

## Data Files

Canonical source:

```text
web/data/world-cup-source.json
```

Derived compatibility snapshot:

```text
web/data/latest.json
```

The canonical source stores fixture schedule separately from live standings and
results. The app builds all route data from that single source.

## Verification

```bash
make front-build
make front-check
make check
```

Or:

```bash
npm --prefix web run build
npm --prefix web run check
```

## Main Files

- `web/lib/scraper/cli.ts`: scraper CLI entrypoint.
- `web/lib/scraper/run.ts`: complete scrape and snapshot orchestration.
- `web/lib/scraper/fixtures.ts`: FIFA fixture/result extraction.
- `web/lib/scraper/standings.ts`: FIFA standings extraction.
- `web/lib/scraper/data-store.ts`: canonical source and snapshot writing.
- `web/lib/server/world-cup-repository.ts`: reads the canonical source file.
- `web/lib/server/world-cup-services.ts`: prepares data for each route.
- `web/lib/world-cup/build-data.ts`: derives app data from the source.
- `web/app/*/page.tsx`: Next.js route pages.
- `web/components/*`: reusable dashboard UI components.
