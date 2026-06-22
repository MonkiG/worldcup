import test from "node:test";
import assert from "node:assert/strict";
import { buildBracket, qualifiers } from "../../scraper/bracket.mjs";

function team(group, position, points, goalDifference, goalsFor, conduct) {
  return {
    group,
    position,
    team: `${group}${position}`,
    played: 3,
    points,
    "goal-difference": goalDifference,
    "goals-for": goalsFor,
    "team-conduct-score": conduct,
  };
}

const groups = [..."ABCDEFGHIJKL"].map((group) => ({
  group,
  teams: [
    team(group, 1, 7, 4, 6, 0),
    team(group, 2, 5, 2, 4, 0),
    team(group, 3, "ABCD".includes(group) ? 4 : 3, 0, 3, 0),
    team(group, 4, 0, -6, 1, -2),
  ],
}));

test("finds 24 automatic and eight third-place qualifiers", () => {
  const result = qualifiers(groups);
  assert.equal(result.automatic.length, 24);
  assert.equal(result["best-thirds"].length, 8);
  assert.equal(result["provisional?"], false);
});

test("builds the complete knockout shape", () => {
  const result = buildBracket(groups);
  assert.equal(result.rounds["round-of-32"].length, 16);
  assert.equal(result.rounds.later.length, 16);
});
