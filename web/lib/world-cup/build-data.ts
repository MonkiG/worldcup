import { compareThirdPlaceTeams } from "../qualification-rules";
import type {
  BracketSlot,
  FixtureMatch,
  Group,
  Match,
  MatchResult,
  Team,
  WorldCupData,
  WorldCupSource,
} from "../types";
import { laterRounds, roundOf32 } from "./bracket-template";

function teamAt(groups: Group[], groupName: string, position: number) {
  return groups
    .find((group) => group.group === groupName)
    ?.teams.find((team) => team.position === position);
}

function isThirdSlot(slot: string) {
  return slot.startsWith("3");
}

function allMatchings(slots: string[], groups: string[]) {
  const solutions: Record<string, string>[] = [];

  function walk(
    index: number,
    remainingGroups: Set<string>,
    assignment: Record<string, string>,
  ) {
    if (index === slots.length) {
      solutions.push({ ...assignment });
      return;
    }

    const slot = slots[index];
    const allowed = new Set(slot.slice(1));

    for (const group of [...remainingGroups].sort()) {
      if (!allowed.has(group)) continue;
      const nextGroups = new Set(remainingGroups);
      nextGroups.delete(group);
      assignment[slot] = group;
      walk(index + 1, nextGroups, assignment);
      delete assignment[slot];
    }
  }

  walk(0, new Set(groups), {});
  return solutions;
}

function qualifiers(groups: Group[]) {
  const teams = groups.flatMap((group) => group.teams);
  const automatic = teams.filter((team) => team.position <= 2);
  const thirdPlaceTable = teams
    .filter((team) => team.position === 3)
    .sort(compareThirdPlaceTeams);

  return {
    automatic,
    "best-thirds": thirdPlaceTable.slice(0, 8),
    "third-place-table": thirdPlaceTable,
    "provisional?": teams.some((team) => team.played < 3),
  };
}

function resolveThirdSlots(bestThirds: Team[]) {
  const slots = [
    ...new Set(
      roundOf32
        .flatMap((match) => [match.home, match.away])
        .filter(isThirdSlot),
    ),
  ];
  const teamsByGroup = Object.fromEntries(
    bestThirds.map((team) => [team.group, team]),
  );
  const solutions = allMatchings(slots, Object.keys(teamsByGroup));

  if (solutions.length === 0) {
    throw new Error(
      `No valid Round-of-32 allocation for groups: ${Object.keys(teamsByGroup).join(", ")}`,
    );
  }

  return Object.fromEntries(
    slots.map((slot) => {
      const possibleGroups = [
        ...new Set(solutions.map((solution) => solution[slot])),
      ].sort();

      if (possibleGroups.length === 1) {
        return [
          slot,
          { team: teamsByGroup[possibleGroups[0]], "resolved?": true },
        ];
      }

      return [
        slot,
        {
          "candidate-groups": possibleGroups,
          "candidate-teams": possibleGroups.map((group) => teamsByGroup[group]),
          "resolved?": false,
        },
      ];
    }),
  ) as Record<string, Omit<BracketSlot, "slot">>;
}

function buildBracket(groups: Group[]): WorldCupData["bracket"] {
  const qualification = qualifiers(groups);
  const thirdSlots = resolveThirdSlots(qualification["best-thirds"]);

  function resolveSlot(slot: string): BracketSlot {
    if (isThirdSlot(slot)) {
      return { ...thirdSlots[slot], slot };
    }

    const match = slot.match(/^([12])([A-L])$/);
    return {
      slot,
      team: match ? teamAt(groups, match[2], Number(match[1])) : undefined,
      "resolved?": true,
    };
  }

  return {
    qualification,
    rounds: {
      "round-of-32": roundOf32.map(
        (match): Match => ({
          ...match,
          home: resolveSlot(match.home),
          away: resolveSlot(match.away),
          round: "round-of-32",
        }),
      ),
      later: laterRounds,
    },
  };
}

function applyResults(fixtures: FixtureMatch[], results: MatchResult[]) {
  const resultsByMatch = new Map(results.map((result) => [result.match, result]));

  return fixtures.map((fixture) => {
    const result = fixture.match ? resultsByMatch.get(fixture.match) : undefined;
    if (!result) return fixture;
    const { venue, label, status, ...base } = fixture;

    return {
      ...base,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      venue,
      label,
      status: result.status ?? "FT",
    };
  });
}

export function buildWorldCupData(source: WorldCupSource): WorldCupData {
  const groups = source.live.groups;
  const bracket = buildBracket(groups);

  return {
    source: source.sources.standings,
    sources: source.sources,
    "generated-at": source["generated-at"],
    groups,
    matches: applyResults(source.fixtures.matches, source.live.results),
    bracket,
  };
}
