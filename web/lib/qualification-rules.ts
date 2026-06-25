import type { BracketSlot, Match, Team } from "./types";

export function compareThirdPlaceTeams(left: Team, right: Team) {
  return (
    right.points - left.points ||
    right["goal-difference"] - left["goal-difference"] ||
    right["goals-for"] - left["goals-for"] ||
    right["team-conduct-score"] - left["team-conduct-score"] ||
    left.group.localeCompare(right.group)
  );
}

export function bestThirdPlaceCandidate(teams: Team[] = []) {
  return [...teams].sort(compareThirdPlaceTeams).at(0);
}

function isSlot(value: BracketSlot | string): value is BracketSlot {
  return typeof value !== "string";
}

function unresolvedThirdSlots(matches: Match[]) {
  const slots = new Map<string, Team[]>();

  for (const match of matches) {
    for (const side of [match.home, match.away]) {
      if (
        isSlot(side) &&
        !side.team &&
        side.slot.startsWith("3") &&
        side["candidate-teams"]?.length
      ) {
        slots.set(side.slot, side["candidate-teams"]);
      }
    }
  }

  return [...slots.entries()];
}

function betterAssignment(
  candidate: Map<string, Team>,
  current: Map<string, Team> | null,
  slots: string[],
  ranks: Map<string, number>,
) {
  if (!current) return true;

  for (const slot of slots) {
    const candidateRank = ranks.get(candidate.get(slot)?.slug ?? "") ?? Infinity;
    const currentRank = ranks.get(current.get(slot)?.slug ?? "") ?? Infinity;
    if (candidateRank !== currentRank) return candidateRank < currentRank;
  }

  return false;
}

export function projectThirdPlaceSlots(matches: Match[]) {
  const slots = unresolvedThirdSlots(matches);
  const rankedTeams = [
    ...new Map(
      slots
        .flatMap(([, teams]) => teams)
        .sort(compareThirdPlaceTeams)
        .map((team) => [team.slug, team]),
    ).values(),
  ];
  const ranks = new Map(rankedTeams.map((team, index) => [team.slug, index]));
  const searchSlots = [...slots].sort(
    ([leftSlot, leftTeams], [rightSlot, rightTeams]) =>
      leftTeams.length - rightTeams.length || leftSlot.localeCompare(rightSlot),
  );
  const displaySlots = slots.map(([slot]) => slot);
  let best: Map<string, Team> | null = null;

  function walk(index: number, usedTeams: Set<string>, assignment: Map<string, Team>) {
    if (index === searchSlots.length) {
      if (betterAssignment(assignment, best, displaySlots, ranks)) {
        best = new Map(assignment);
      }
      return;
    }

    const [slot, teams] = searchSlots[index];
    for (const team of [...teams].sort(compareThirdPlaceTeams)) {
      if (usedTeams.has(team.slug)) continue;
      usedTeams.add(team.slug);
      assignment.set(slot, team);
      walk(index + 1, usedTeams, assignment);
      assignment.delete(slot);
      usedTeams.delete(team.slug);
    }
  }

  walk(0, new Set(), new Map());

  return best ?? new Map<string, Team>();
}
