import type { ReactNode } from "react";
import { getFifaCode } from "@/lib/team-codes";
import type { FixtureTeam, Team } from "@/lib/types";
import { TeamFlag } from "./team-flag";
import { TeamLink } from "./team-link";

type ReferencedTeam = FixtureTeam | Team | null | undefined;

function isResolvedCountry(slug: string | undefined) {
  return Boolean(slug && !/^(?:[12][a-l]|3[a-l]+|w\d+|l\d+|ru\d+|tbd)$/i.test(slug));
}

function teamName(team: ReferencedTeam) {
  if (!team) return "TBD";
  return "team" in team ? team.team : team.name;
}

export function TeamReference({
  children,
  className,
  linked = true,
  showFlag = true,
  team,
}: {
  children?: ReactNode;
  className?: string;
  linked?: boolean;
  showFlag?: boolean;
  team: ReferencedTeam;
}) {
  const label = children ?? teamName(team);

  if (!team || !isResolvedCountry(team.slug)) {
    return <span className={className}>{label}</span>;
  }

  return (
    <span className={`team-reference ${className ?? ""}`.trim()}>
      {showFlag ? (
        <span className="team-reference__flag">
          <TeamFlag code={getFifaCode(team.slug)} name={teamName(team)} />
        </span>
      ) : null}
      {linked ? <TeamLink team={team}>{label}</TeamLink> : <span>{label}</span>}
    </span>
  );
}
