import { roundOf32, laterRounds } from "./bracket-template.mjs";
import { qualifiers } from "./qualification.mjs";

export { qualifiers };

function teamAt(groups, groupName, position) {
  return groups
    .find((group) => group.group === groupName)
    ?.teams.find((team) => team.position === position);
}

function isThirdSlot(slot) {
  return slot.startsWith("3");
}

function allMatchings(slots, groups) {
  const solutions = [];

  function walk(index, remainingGroups, assignment) {
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

function resolveThirdSlots(bestThirds) {
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
          "candidate-teams": possibleGroups.map(
            (group) => teamsByGroup[group],
          ),
          "resolved?": false,
        },
      ];
    }),
  );
}

export function buildBracket(groups) {
  const qualification = qualifiers(groups);
  const thirdSlots = resolveThirdSlots(qualification["best-thirds"]);

  function resolveSlot(slot) {
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
      "round-of-32": roundOf32.map((match) => ({
        ...match,
        home: resolveSlot(match.home),
        away: resolveSlot(match.away),
        round: "round-of-32",
      })),
      later: laterRounds,
    },
  };
}
