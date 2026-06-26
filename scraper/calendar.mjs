function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function compareThirdPlaceTeams(left, right) {
  return (
    right.points - left.points ||
    right["goal-difference"] - left["goal-difference"] ||
    right["goals-for"] - left["goals-for"] ||
    right["team-conduct-score"] - left["team-conduct-score"] ||
    left.group.localeCompare(right.group)
  );
}

function bestThirdPlaceCandidate(teams = []) {
  return [...teams].sort(compareThirdPlaceTeams).at(0);
}

function isSlot(value) {
  return typeof value !== "string";
}

function projectThirdPlaceSlots(matches) {
  const slots = new Map();

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

  const rankedTeams = [
    ...new Map(
      [...slots.values()]
        .flat()
        .sort(compareThirdPlaceTeams)
        .map((team) => [team.slug, team]),
    ).values(),
  ];
  const ranks = new Map(rankedTeams.map((team, index) => [team.slug, index]));
  const searchSlots = [...slots.entries()].sort(
    ([leftSlot, leftTeams], [rightSlot, rightTeams]) =>
      leftTeams.length - rightTeams.length || leftSlot.localeCompare(rightSlot),
  );
  const displaySlots = [...slots.keys()];
  let best = null;

  function betterAssignment(candidate) {
    if (!best) return true;

    for (const slot of displaySlots) {
      const candidateRank = ranks.get(candidate.get(slot)?.slug ?? "") ?? Infinity;
      const currentRank = ranks.get(best.get(slot)?.slug ?? "") ?? Infinity;
      if (candidateRank !== currentRank) return candidateRank < currentRank;
    }

    return false;
  }

  function walk(index, usedTeams, assignment) {
    if (index === searchSlots.length) {
      if (betterAssignment(assignment)) best = new Map(assignment);
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
  return best ?? new Map();
}

function formatRound(value = "") {
  const labels = {
    final: "Final",
    "quarter-final": "Quarter-final",
    "round-of-16": "Round of 16",
    "round-of-32": "Round of 32",
    "semi-final": "Semi-final",
    "third-place": "Third place",
  };

  return labels[value] ?? value;
}

function teamFromBracketSide(side, thirdPlaceProjection) {
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
      name: side["candidate-teams"].map((candidate) => candidate.team).join(" / "),
      slug: slugify(side.slot),
    };
  }

  return { name: side.slot, slug: slugify(side.slot) };
}

export function syncMatchesWithBracket(matches = [], bracket) {
  const bracketMatches = [
    ...bracket.rounds["round-of-32"],
    ...bracket.rounds.later,
  ];
  const thirdPlaceProjection = projectThirdPlaceSlots(
    bracket.rounds["round-of-32"],
  );
  const bracketByMatch = new Map(
    bracketMatches.map((match) => [match.match, match]),
  );

  return matches.map((fixture) => {
    const bracketMatch = fixture.match
      ? bracketByMatch.get(fixture.match)
      : undefined;
    if (!bracketMatch) return fixture;

    const home = teamFromBracketSide(bracketMatch.home, thirdPlaceProjection);
    const away = teamFromBracketSide(bracketMatch.away, thirdPlaceProjection);

    return {
      ...fixture,
      home,
      away,
      round: formatRound(bracketMatch.round) || fixture.round,
      label: `${home.name} vs ${away.name}`,
    };
  });
}
