export type Team = {
  slug: string;
  group: string;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  team: string;
  position: number;
  played: number;
  "goals-for": number;
  "goals-against": number;
  "goal-difference": number;
  "team-conduct-score": number;
};

export type Group = {
  group: string;
  teams: Team[];
};

export type BracketSlot = {
  slot: string;
  team?: Team;
  "resolved?": boolean;
  "candidate-groups"?: string[];
  "candidate-teams"?: Team[];
};

export type Match = {
  match: number;
  round: string;
  date?: string;
  home: BracketSlot | string;
  away: BracketSlot | string;
};

export type WorldCupData = {
  source: string;
  "generated-at": string;
  groups: Group[];
  bracket: {
    qualification: {
      automatic: Team[];
      "best-thirds": Team[];
      "third-place-table": Team[];
      "provisional?": boolean;
    };
    rounds: {
      "round-of-32": Match[];
      later: Match[];
    };
  };
};
