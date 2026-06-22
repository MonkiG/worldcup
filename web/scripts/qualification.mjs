function compareThirds(left, right) {
  return (
    right.points - left.points ||
    right["goal-difference"] - left["goal-difference"] ||
    right["goals-for"] - left["goals-for"] ||
    right["team-conduct-score"] - left["team-conduct-score"] ||
    left.group.localeCompare(right.group)
  );
}

export function qualifiers(groups) {
  const teams = groups.flatMap((group) => group.teams);
  const automatic = teams.filter((team) => team.position <= 2);
  const thirdPlaceTable = teams
    .filter((team) => team.position === 3)
    .sort(compareThirds);

  return {
    automatic,
    "best-thirds": thirdPlaceTable.slice(0, 8),
    "third-place-table": thirdPlaceTable,
    "provisional?": teams.some((team) => team.played < 3),
  };
}
