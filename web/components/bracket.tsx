"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { BracketSlot, Match, Team } from "@/lib/types";
import {
  bestThirdPlaceCandidate,
  projectThirdPlaceSlots,
} from "@/lib/qualification-rules";
import { TeamMark } from "./group-table";
import { TeamLink } from "./team-link";
import { TeamReference } from "./team-reference";

const roundLabels: Record<string, string> = {
  "round-of-32": "Round of 32",
  "round-of-16": "Round of 16",
  "quarter-final": "Quarter-finals",
  "semi-final": "Semi-finals",
  "third-place": "Third place",
  final: "Final",
};

function shortName(team: Team) {
  return team.team.replace(/\s[A-Z]{3}$/, "");
}

function CandidateTeam({
  projectedTeam,
  teams = [],
}: {
  projectedTeam?: Team;
  teams?: Team[];
}) {
  const team = projectedTeam ?? bestThirdPlaceCandidate(teams);
  if (!team) return null;

  return (
    <span className="candidate-team">
      <TeamReference team={team}>{shortName(team)}</TeamReference>
    </span>
  );
}

function Slot({
  slot,
  thirdPlaceProjection,
}: {
  slot: BracketSlot | string;
  thirdPlaceProjection: Map<string, Team>;
}) {
  if (typeof slot === "string") {
    return (
      <div className="match-team match-team--placeholder">
        <span className="winner-token">{slot}</span>
        <span>To be decided</span>
      </div>
    );
  }

  if (slot.team) {
    return (
      <div className="match-team">
        <TeamMark team={slot.team} />
        <TeamLink team={slot.team}>{shortName(slot.team)}</TeamLink>
        <span className="slot-token">{slot.slot}</span>
      </div>
    );
  }

  return (
    <div className="match-team match-team--pending">
      <span className="team-mark">?</span>
      <div className="match-team__pending-copy">
        <span>
          Projected best 3rd / {slot["candidate-groups"]?.join(", ") ?? slot.slot}
        </span>
        <CandidateTeam
          projectedTeam={thirdPlaceProjection.get(slot.slot)}
          teams={slot["candidate-teams"]}
        />
      </div>
      <span className="slot-token">{slot.slot}</span>
    </div>
  );
}

function MatchCard({
  match,
  thirdPlaceProjection,
}: {
  match: Match;
  thirdPlaceProjection: Map<string, Team>;
}) {
  return (
    <article className="match-card">
      <header className="match-card__header">
        <span>M{match.match}</span>
        {match.date && (
          <time dateTime={match.date}>
            {new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
            }).format(new Date(`${match.date}T12:00:00Z`))}
          </time>
        )}
      </header>
      <Slot slot={match.home} thirdPlaceProjection={thirdPlaceProjection} />
      <div className="match-divider">
        <span>vs</span>
      </div>
      <Slot slot={match.away} thirdPlaceProjection={thirdPlaceProjection} />
    </article>
  );
}

export function Bracket({
  firstRound,
  later,
}: {
  firstRound: Match[];
  later: Match[];
}) {
  const rounds = useMemo(
    () => [
      { key: "round-of-32", matches: firstRound },
      ...["round-of-16", "quarter-final", "semi-final", "final"].map((key) => ({
        key,
        matches: later.filter((match) => match.round === key),
      })),
    ],
    [firstRound, later],
  );
  const thirdPlaceProjection = useMemo(
    () => projectThirdPlaceSlots(firstRound),
    [firstRound],
  );
  const bracketRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef(new Map<string, HTMLElement>());
  const [connectorPaths, setConnectorPaths] = useState<string[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const registerMatch = useCallback(
    (roundIndex: number, matchIndex: number, node: HTMLElement | null) => {
      const key = `${roundIndex}-${matchIndex}`;
      if (node) matchRefs.current.set(key, node);
      else matchRefs.current.delete(key);
    },
    [],
  );

  const measureConnectors = useCallback(() => {
    const bracket = bracketRef.current;
    if (!bracket) return;

    const bracketRect = bracket.getBoundingClientRect();
    const paths: string[] = [];

    for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex += 1) {
      const sourceMatches = rounds[roundIndex].matches;
      const targetMatches = rounds[roundIndex + 1].matches;

      targetMatches.forEach((_, targetIndex) => {
        const firstSource = matchRefs.current.get(
          `${roundIndex}-${targetIndex * 2}`,
        );
        const secondSource = matchRefs.current.get(
          `${roundIndex}-${targetIndex * 2 + 1}`,
        );
        const target = matchRefs.current.get(
          `${roundIndex + 1}-${targetIndex}`,
        );

        if (!firstSource || !secondSource || !target) return;

        const firstRect = firstSource.getBoundingClientRect();
        const secondRect = secondSource.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const x1 = firstRect.right - bracketRect.left;
        const y1 = firstRect.top + firstRect.height / 2 - bracketRect.top;
        const x2 = secondRect.right - bracketRect.left;
        const y2 = secondRect.top + secondRect.height / 2 - bracketRect.top;
        const targetX = targetRect.left - bracketRect.left;
        const targetY = targetRect.top + targetRect.height / 2 - bracketRect.top;
        const jointX = x1 + (targetX - x1) / 2;

        paths.push(
          [
            `M ${x1} ${y1} H ${jointX}`,
            `M ${x2} ${y2} H ${jointX}`,
            `M ${jointX} ${y1} V ${y2}`,
            `M ${jointX} ${targetY} H ${targetX}`,
          ].join(" "),
        );
      });
    }

    setCanvasSize({
      width: bracket.scrollWidth,
      height: bracket.scrollHeight,
    });
    setConnectorPaths(paths);
  }, [rounds]);

  useLayoutEffect(() => {
    measureConnectors();
    const observer = new ResizeObserver(measureConnectors);
    if (bracketRef.current) observer.observe(bracketRef.current);
    window.addEventListener("resize", measureConnectors);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureConnectors);
    };
  }, [measureConnectors]);

  return (
    <div className="bracket-shell">
      <div className="bracket" aria-label="Knockout bracket" ref={bracketRef}>
        <svg
          aria-hidden="true"
          className="bracket-lines"
          height={canvasSize.height}
          viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
          width={canvasSize.width}
        >
          {connectorPaths.map((path, index) => (
            <path d={path} key={index} />
          ))}
        </svg>

        {rounds.map((round, roundIndex) => (
          <section
            className={`bracket-round bracket-round--${round.key}`}
            key={round.key}
          >
            <header className="bracket-round__header">
              <span>{roundLabels[round.key]}</span>
              <strong>{round.matches.length}</strong>
            </header>
            <div className="bracket-round__matches">
              {round.matches.map((match, matchIndex) => (
                <div
                  className="match-node"
                  key={match.match}
                  ref={(node) =>
                    registerMatch(roundIndex, matchIndex, node)
                  }
                >
                  <MatchCard
                    match={match}
                    thirdPlaceProjection={thirdPlaceProjection}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
