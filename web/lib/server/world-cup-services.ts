import { enrichCalendarMatches, getCalendarFocus } from "../calendar";
import {
  getBracketPredictions,
  isQualifiedTeam,
} from "../bracket-predictions";
import { getWorldCupData } from "./world-cup-repository";
import type { FixtureMatch, Team } from "../types";

export function getHomePageData() {
  const data = getWorldCupData();
  const calendarMatches = enrichCalendarMatches(data);
  const { focusMatches } = getCalendarFocus(calendarMatches);

  return { data, focusMatches };
}

export function getCalendarPageData() {
  const data = getWorldCupData();
  const matches = enrichCalendarMatches(data);
  const focus = getCalendarFocus(matches);

  return { data, focus, matches };
}

export function getGroupsPageData() {
  const data = getWorldCupData();

  return {
    data,
    bestThirds: data.bracket.qualification["best-thirds"],
    groups: data.groups,
  };
}

export function getBracketPageData() {
  const data = getWorldCupData();

  return {
    data,
    firstRound: data.bracket.rounds["round-of-32"],
    later: data.bracket.rounds.later,
  };
}

export function getQualificationPageData() {
  const data = getWorldCupData();

  return {
    data,
    teams: data.bracket.qualification["third-place-table"],
  };
}

export function getTeamPageData(slug: string) {
  const data = getWorldCupData();
  const team = data.groups
    .flatMap((group) => group.teams)
    .find((candidate) => candidate.slug === slug);

  if (!team) {
    return {
      data,
      team: null,
      fixtures: [],
      bracketPredictions: [],
      qualified: false,
    };
  }

  const fixtures = enrichCalendarMatches(data).filter((match) =>
    fixtureIncludesTeam(match, team),
  );
  const bracketPredictions = getBracketPredictions(data, team);
  const qualified = isQualifiedTeam(data, team);

  return {
    data,
    team,
    fixtures,
    bracketPredictions,
    qualified,
  };
}

function fixtureIncludesTeam(match: FixtureMatch, team: Team) {
  return match.home?.slug === team.slug || match.away?.slug === team.slug;
}
