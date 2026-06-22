import type { FixtureMatch } from "./types";

export const calendarPageSize = 24;

export function sortMatches(matches: FixtureMatch[] = []) {
  return [...matches].sort((left, right) => left.date.localeCompare(right.date));
}

export function getCalendarFocus(matches: FixtureMatch[] = [], now = new Date()) {
  const sorted = sortMatches(matches);
  const current =
    sorted.find((match) => {
      const start = new Date(match.date).getTime();
      const end = start + 2 * 60 * 60 * 1000;
      return now.getTime() >= start && now.getTime() <= end;
    }) ?? null;

  const next =
    current ??
    sorted.find((match) => new Date(match.date).getTime() >= now.getTime()) ??
    sorted.at(-1) ??
    null;

  return { current, next, sorted };
}

export function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatMatchTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

export function matchTitle(match?: FixtureMatch | null) {
  if (!match) return "Schedule pending";
  if (match.home?.name && match.away?.name) {
    return `${match.home.name} vs ${match.away.name}`;
  }

  return match.round || `Match ${match.match ?? ""}`.trim();
}
