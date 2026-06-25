import type { BracketSlot, Match, Team, WorldCupData } from "./types";
import {
  bestThirdPlaceCandidate,
  projectThirdPlaceSlots,
} from "./qualification-rules";

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

function projectedSlotTeam(
  slot: BracketSlot | string,
  thirdPlaceProjection: Map<string, Team>,
) {
  if (!isSlot(slot)) return undefined;
  return slot.team ?? thirdPlaceProjection.get(slot.slot);
}

function teamSlotStatus(
  slot: BracketSlot | string,
  team: Team,
  thirdPlaceProjection: Map<string, Team>,
) {
  if (!isSlot(slot)) return null;
  if (slot.team?.slug === team.slug) return "locked";
  if (thirdPlaceProjection.get(slot.slot)?.slug === team.slug) {
    return "possible";
  }

  return null;
}

function possibleTeams(
  slot: BracketSlot | string,
  thirdPlaceProjection: Map<string, Team>,
) {
  if (!isSlot(slot)) return [];
  if (slot.team) return [slot.team];
  const candidate =
    projectedSlotTeam(slot, thirdPlaceProjection) ??
    bestThirdPlaceCandidate(slot["candidate-teams"]);
  return candidate ? [candidate] : [];
}

function predictionForMatch(
  match: Match,
  team: Team,
  thirdPlaceProjection: Map<string, Team>,
): BracketPrediction | null {
  const homeStatus = teamSlotStatus(match.home, team, thirdPlaceProjection);
  const awayStatus = teamSlotStatus(match.away, team, thirdPlaceProjection);

  if (!homeStatus && !awayStatus) return null;

  const teamSide = homeStatus ? match.home : match.away;
  const opponentSide = homeStatus ? match.away : match.home;

  return {
    date: match.date,
    match: match.match,
    opponents: possibleTeams(opponentSide, thirdPlaceProjection),
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

  const firstRound = data.bracket.rounds["round-of-32"];
  const thirdPlaceProjection = projectThirdPlaceSlots(firstRound);

  return firstRound
    .filter((match) => {
      const projectedHome = projectedSlotTeam(match.home, thirdPlaceProjection);
      const projectedAway = projectedSlotTeam(match.away, thirdPlaceProjection);
      return (
        projectedHome?.slug === team.slug ||
        projectedAway?.slug === team.slug ||
        slotHasTeam(match.home, team) ||
        slotHasTeam(match.away, team)
      );
    })
    .map((match) => predictionForMatch(match, team, thirdPlaceProjection))
    .filter((prediction): prediction is BracketPrediction => Boolean(prediction));
}
