# FIFA World Cup 2026 bracket tracker

A Node.js scraper and Next.js dashboard for FIFA's official standings page. It
stores the 12 group tables, ranks the eight best third-place teams, and projects
the 32-team knockout bracket.

See [docs/TABLE_RULES.md](docs/TABLE_RULES.md) for an explanation of points,
group positions, tie-breakers, best-third-place qualification, and bracket
slots.

## Project commands

Run `make help` to see all commands. The main workflow is:

```bash
make install       # install Next.js dependencies
make scrape        # refresh data/latest.json
make front         # start http://localhost:3000
```

Useful verification commands:

```bash
make test
make front-check
make front-build
make check
```

To change the scraper output or parse saved HTML:

```bash
make scrape DATA_FILE=data/2026-06-19.json
make scrape-from HTML=test/fixtures/fifa-standings.html
```

The output is deliberately marked `provisional` until every team has played
three group matches. FIFA tie-break order is points, goal difference, goals
scored, then team conduct score. A final tie can require drawing lots, so the
project uses the group letter only as a deterministic fallback and retains all
source standings in the JSON for auditing.

## Run it

Requirements: Node.js 22+ and Chrome or Chromium. FIFA renders the tables
client-side, so the scraper opens the page with Playwright and reads the
rendered semantic tables. Set `CHROME_BIN` if the browser is installed in a
non-standard location.

```bash
make install
make scrape
```

The result is written to `data/latest.json`. Other useful options:

```bash
make scrape DATA_FILE=data/2026-06-19.json
make scrape-from HTML=test/fixtures/fifa-standings.html
make test
```

## Daily schedule

`.github/workflows/daily.yml` runs at 12:15 UTC every day and commits
`data/latest.json` when it changes. It can also be started manually from
GitHub Actions. Change the cron expression later when the desired match-day
calendar is known.

For a local cron job:

```cron
15 6 * * * cd /absolute/path/to/worldcup && /usr/bin/make scrape >> scraper.log 2>&1
```

Cron uses the machine's local timezone. Use absolute paths for the project and
the `make` executable.

## Bracket behavior

First- and second-place teams map directly to FIFA's Round-of-32 slots.
The eight third-place slots accept different group combinations. The projector
enumerates valid allocations:

- a team is filled in when its slot is uniquely determined;
- otherwise the JSON includes `candidate-groups` and `candidate-teams`;
- later rounds retain official winner/loser references such as `W74` and
  `L101`.

This avoids inventing a team assignment while the group stage is incomplete.
The scraper validates that FIFA still exposes exactly 12 groups with four teams
each and exits with an error if that contract changes.

## Next.js dashboard

The `web` directory contains both the scraper scripts and the responsive
dashboard for the group tables, best-third-place ranking, and projected
knockout bracket.

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`. The UI reads `../data/latest.json` on every
server render, so refreshing the page after a scraper run shows the new data.

The main Node files are intentionally separated:

- `web/scripts/scrape.mjs` handles the browser, CLI and JSON file.
- `web/scripts/bracket.mjs` calculates qualifiers and bracket slots.
- `web/test/bracket.test.mjs` tests the pure bracket logic.
