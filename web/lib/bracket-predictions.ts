import type { BracketSlot, Match, Team, WorldCupData } from "./types";

export type BracketPrediction = {
  date?: string;
  match: number;
  opponents: Team[];
  round: string;
  slot: string;
  status: "locked" | "possible";
};

function isSlot(value: BracketSlot | string): value is BracketSlot {
  return typeof value !== "string";
}

function slotHasTeam(slot: BracketSlot | string, team: Team) {
  return (
    isSlot(slot) &&
    (slot.team?.slug === team.slug ||
      slot["candidate-teams"]?.some((candidate) => candidate.slug === team.slug))
  );
}

function teamSlotStatus(slot: BracketSlot | string, team: Team) {
  if (!isSlot(slot)) return null;
  if (slot.team?.slug === team.slug) return "locked";
  if (slot["candidate-teams"]?.some((candidate) => candidate.slug === team.slug)) {
    return "possible";
  }

  return null;
}

function possibleTeams(slot: BracketSlot | string) {
  if (!isSlot(slot)) return [];
  if (slot.team) return [slot.team];
  return slot["candidate-teams"] ?? [];
}

function predictionForMatch(match: Match, team: Team): BracketPrediction | null {
  const homeStatus = teamSlotStatus(match.home, team);
  const awayStatus = teamSlotStatus(match.away, team);

  if (!homeStatus && !awayStatus) return null;

  const teamSide = homeStatus ? match.home : match.away;
  const opponentSide = homeStatus ? match.away : match.home;

  return {
    date: match.date,
    match: match.match,
    opponents: possibleTeams(opponentSide),
    round: match.round,
    slot: isSlot(teamSide) ? teamSide.slot : String(teamSide),
    status: homeStatus ?? awayStatus ?? "possible",
  };
}

export function isQualifiedTeam(data: WorldCupData, team: Team) {
  return [
    ...data.bracket.qualification.automatic,
    ...data.bracket.qualification["best-thirds"],
  ].some((candidate) => candidate.slug === team.slug);
}

export function getBracketPredictions(data: WorldCupData, team: Team) {
  if (!isQualifiedTeam(data, team)) return [];

  return data.bracket.rounds["round-of-32"]
    .filter((match) => slotHasTeam(match.home, team) || slotHasTeam(match.away, team))
    .map((match) => predictionForMatch(match, team))
    .filter((prediction): prediction is BracketPrediction => Boolean(prediction));
}
