import type { Match } from "../types";

export const roundOf32 = [
  { match: 73, home: "2A", away: "2B", date: "2026-06-28" },
  { match: 74, home: "1E", away: "3ABCDF", date: "2026-06-29" },
  { match: 75, home: "1F", away: "2C", date: "2026-06-29" },
  { match: 76, home: "1C", away: "2F", date: "2026-06-29" },
  { match: 77, home: "1I", away: "3CDFGH", date: "2026-06-30" },
  { match: 78, home: "2E", away: "2I", date: "2026-06-30" },
  { match: 79, home: "1A", away: "3CEFHI", date: "2026-06-30" },
  { match: 80, home: "1L", away: "3EHIJK", date: "2026-07-01" },
  { match: 81, home: "1D", away: "3BEFIJ", date: "2026-07-01" },
  { match: 82, home: "1G", away: "3AEHIJ", date: "2026-07-01" },
  { match: 83, home: "2K", away: "2L", date: "2026-07-02" },
  { match: 84, home: "1H", away: "2J", date: "2026-07-02" },
  { match: 85, home: "1B", away: "3EFGIJ", date: "2026-07-02" },
  { match: 86, home: "1J", away: "2H", date: "2026-07-03" },
  { match: 87, home: "1K", away: "3DEIJL", date: "2026-07-03" },
  { match: 88, home: "2D", away: "2G", date: "2026-07-03" },
] as const;

export const laterRounds: Match[] = [
  { round: "round-of-16", match: 89, home: "W74", away: "W77" },
  { round: "round-of-16", match: 90, home: "W73", away: "W75" },
  { round: "round-of-16", match: 91, home: "W76", away: "W78" },
  { round: "round-of-16", match: 92, home: "W79", away: "W80" },
  { round: "round-of-16", match: 93, home: "W83", away: "W84" },
  { round: "round-of-16", match: 94, home: "W81", away: "W82" },
  { round: "round-of-16", match: 95, home: "W86", away: "W88" },
  { round: "round-of-16", match: 96, home: "W85", away: "W87" },
  { round: "quarter-final", match: 97, home: "W89", away: "W90" },
  { round: "quarter-final", match: 98, home: "W93", away: "W94" },
  { round: "quarter-final", match: 99, home: "W91", away: "W92" },
  { round: "quarter-final", match: 100, home: "W95", away: "W96" },
  { round: "semi-final", match: 101, home: "W97", away: "W98" },
  { round: "semi-final", match: 102, home: "W99", away: "W100" },
  { round: "third-place", match: 103, home: "L101", away: "L102" },
  { round: "final", match: 104, home: "W101", away: "W102" },
];
