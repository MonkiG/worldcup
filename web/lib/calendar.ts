import type {
  BracketSlot,
  FixtureMatch,
  Match,
  Team,
  WorldCupData,
} from "./types";
import {
  bestThirdPlaceCandidate,
  projectThirdPlaceSlots,
} from "./qualification-rules";

export const calendarPageSize = 24;
export const fixtureCalendarTimeZone = "America/Mexico_City";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatRound(value = "") {
  const labels: Record<string, string> = {
    final: "Final",
    "quarter-final": "Quarter-final",
    "round-of-16": "Round of 16",
    "round-of-32": "Round of 32",
    "semi-final": "Semi-final",
    "third-place": "Third place",
  };

  return labels[value] ?? value;
}

function teamFromBracketSide(
  side: BracketSlot | string,
  thirdPlaceProjection: Map<string, Team>,
) {
  if (typeof side === "string") {
    return { name: side, slug: slugify(side) };
  }

  if (side.team) {
    return { name: side.team.team, slug: side.team.slug };
  }

  if (side["candidate-teams"]?.length) {
    const team =
      thirdPlaceProjection.get(side.slot) ??
      bestThirdPlaceCandidate(side["candidate-teams"]);
    if (team) return { name: team.team, slug: team.slug };

    return {
      name: side["candidate-teams"].map((team) => team.team).join(" / "),
      slug: slugify(side.slot),
    };
  }

  return { name: side.slot, slug: slugify(side.slot) };
}

function bracketMatches(data: WorldCupData): Match[] {
  return [
    ...data.bracket.rounds["round-of-32"],
    ...data.bracket.rounds.later,
  ];
}

export function enrichCalendarMatches(data: WorldCupData): FixtureMatch[] {
  const thirdPlaceProjection = projectThirdPlaceSlots(
    data.bracket.rounds["round-of-32"],
  );
  const bracketByMatch = new Map(
    bracketMatches(data).map((match) => [match.match, match]),
  );

  return (data.matches ?? []).map((fixture) => {
    const bracket = fixture.match ? bracketByMatch.get(fixture.match) : undefined;
    if (!bracket) return fixture;

    return {
      ...fixture,
      home: teamFromBracketSide(bracket.home, thirdPlaceProjection),
      away: teamFromBracketSide(bracket.away, thirdPlaceProjection),
      round: formatRound(bracket.round) || fixture.round,
    };
  });
}

export function sortMatches(matches: FixtureMatch[] = []) {
  return [...matches].sort((left, right) => left.date.localeCompare(right.date));
}

export function getCalendarFocus(matches: FixtureMatch[] = [], now = new Date()) {
  const sorted = sortMatches(matches);
  const currentMatches = sorted.filter((match) => {
    const start = new Date(match.date).getTime();
    const end = start + 2 * 60 * 60 * 1000;
    return now.getTime() >= start && now.getTime() <= end;
  });
  const nextDate =
    currentMatches[0]?.date ??
    sorted.find((match) => new Date(match.date).getTime() >= now.getTime())
      ?.date ??
    sorted.at(-1)?.date;
  const nextMatches = nextDate
    ? sorted.filter((match) => match.date === nextDate)
    : [];
  const focusMatches = currentMatches.length > 0 ? currentMatches : nextMatches;
  const current = currentMatches[0] ?? null;
  const next = focusMatches[0] ?? null;

  return { current, currentMatches, focusMatches, next, nextMatches, sorted };
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

export function venueLabel(value?: string) {
  const venue = value?.trim();
  if (!venue || venue === "·" || venue === "Â·") return "Venue TBD";
  return venue;
}

export function fixtureDayKey(value: string) {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone: fixtureCalendarTimeZone,
    year: "numeric",
  }).formatToParts(new Date(value));
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatFixtureDay(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: fixtureCalendarTimeZone,
  }).format(new Date(value));
}

export function matchTitle(match?: FixtureMatch | null) {
  if (!match) return "Schedule pending";
  if (match.home?.name && match.away?.name) {
    return `${match.home.name} vs ${match.away.name}`;
  }

  return match.round || `Match ${match.match ?? ""}`.trim();
}
