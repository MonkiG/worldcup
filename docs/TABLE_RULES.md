# World Cup 2026 table and qualification rules

This document explains how positions are defined in the group tables and in the
best-third-place table used by this project.

## Group-stage format

The tournament has:

- 48 teams;
- 12 groups, named A through L;
- four teams in each group;
- three group matches per team.

After the group stage:

- the first two teams in each group qualify automatically: `12 × 2 = 24`;
- the eight best third-place teams also qualify;
- the remaining 16 teams enter the Round of 32.

## Match points

Teams receive:

| Result | Points |
|---|---:|
| Win | 3 |
| Draw | 1 |
| Loss | 0 |

The table columns mean:

| Column | Meaning |
|---|---|
| `PL` / `P` | Matches played |
| `W` | Matches won |
| `D` | Matches drawn |
| `L` | Matches lost |
| `GF` | Goals scored |
| `GA` | Goals conceded |
| `GD` | Goal difference: `GF - GA` |
| `PTS` | Total points |
| `TCS` | Team conduct score |

## Positions inside one group

The teams in each group are ordered using the following criteria, in order.
The next criterion is considered only when the previous one does not separate
the tied teams.

1. Total points from all group matches.
2. Points obtained in matches played between the tied teams.
3. Goal difference in matches played between the tied teams.
4. Goals scored in matches played between the tied teams.
5. Overall goal difference from all group matches.
6. Overall goals scored in all group matches.
7. Team conduct score.
8. FIFA ranking used by the tournament regulations.

Criteria 2–4 form a mini-table containing only the tied teams. If this
mini-table separates some teams but leaves others tied, the head-to-head
criteria are reapplied to the teams that remain tied before continuing to the
overall criteria.

### Example: two teams tied on points

Assume Japan and Sweden both finish with six points.

Their direct match is checked before their overall goal difference:

- if Japan defeated Sweden, Japan ranks above Sweden;
- if they drew, their head-to-head goal difference and goals scored are also
  equal, so the comparison continues with overall goal difference.

This is different from older World Cup editions where overall goal difference
was considered before head-to-head results.

### Example: three teams tied

If three teams finish with four points, FIFA creates a mini-table using only
the matches between those three teams.

The mini-table compares:

1. head-to-head points;
2. head-to-head goal difference;
3. head-to-head goals scored.

Results against the fourth team do not count during this part of the
tiebreaker.

## Team conduct score

The conduct score rewards the team with fewer disciplinary deductions.

| Card received by a player or team official | Deduction |
|---|---:|
| Yellow card | -1 |
| Second yellow card followed by a red card | -3 |
| Direct red card | -4 |
| Yellow card followed by a direct red card | -5 |

Only one deduction is applied to a person in a single match.

A higher score is better:

- `-1` ranks above `-3`;
- `-3` ranks above `-5`.

## Best-third-place table

After the positions inside all 12 groups have been determined, each
third-place team enters one combined table.

Because these teams played in different groups, head-to-head results cannot be
used. They are ordered by:

1. Total points from all group matches.
2. Overall goal difference.
3. Overall goals scored.
4. Team conduct score.
5. FIFA ranking used by the tournament regulations.

The first eight teams in this combined table qualify for the Round of 32. The
remaining four third-place teams are eliminated.

### Example

| Team | PTS | GD | GF | TCS |
|---|---:|---:|---:|---:|
| Team A | 4 | +1 | 4 | -4 |
| Team B | 4 | +1 | 3 | -1 |
| Team C | 4 | 0 | 6 | 0 |

The order is:

1. Team A: same points and goal difference as Team B, but more goals scored.
2. Team B.
3. Team C: its six goals do not compensate for its lower goal difference.

Each criterion must be exhausted before moving to the next one.

## How the project currently handles the tables

### Group tables

The scraper reads the group positions directly from FIFA's rendered standings
page. It does **not** recalculate positions inside each group.

This is intentional because FIFA's table already applies:

- head-to-head mini-tables;
- disciplinary deductions;
- any official corrections or decisions.

The `position` field in `web/data/latest.json` is therefore FIFA's current
position.

### Best-third-place table

The project currently calculates this table in
`web/scripts/bracket.mjs` using:

1. points;
2. goal difference;
3. goals scored;
4. team conduct score.

If every value remains tied, the current code uses the group letter as a
deterministic fallback. That fallback is useful for keeping provisional output
stable, but it is **not the official final criterion**. The official FIFA
ranking should be added before relying on the application to resolve a complete
tie in production.

During the group stage, all displayed positions and bracket pairings are
provisional because teams have not necessarily played all three matches.

## Knockout-slot allocation

Qualifying first- and second-place teams have fixed Round-of-32 slots, such as:

- `1A`: winner of Group A;
- `2A`: runner-up of Group A;
- `1L`: winner of Group L.

Third-place slots list several possible source groups, for example:

```text
3ABCDF
```

This means that the slot may be filled by a qualifying third-place team from
Group A, B, C, D, or F.

The exact allocation depends on which eight groups supply the qualifying
third-place teams. The application enumerates valid allocations and:

- displays the team when the slot has only one valid assignment;
- displays candidate groups when several assignments remain possible.

## Sources

- [FIFA World Cup 2026 standings](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings)
- [World Cup 2026 third-place standings and tiebreakers](https://www.sbnation.com/fifa-world-cup/1117914/world-cup-2026-third-place-standings)
- [World Cup 2026 Group A rules and discipline summary](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_Group_A)

The FIFA competition regulations remain the authoritative source if any
summary or implementation differs from an official tournament decision.
