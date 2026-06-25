import type { ReactNode } from "react";
import Link from "next/link";
import type { FixtureTeam, Team } from "@/lib/types";

type LinkableTeam = FixtureTeam | Team | null | undefined;

function teamName(team: LinkableTeam) {
  if (!team) return "TBD";
  return "team" in team ? team.team : team.name;
}

function isResolvedCountry(slug: string | undefined) {
  return Boolean(slug && !/^(?:[12][a-l]|3[a-l]+|w\d+|l\d+|tbd)$/i.test(slug));
}

export function TeamLink({
  children,
  className,
  team,
}: {
  children?: ReactNode;
  className?: string;
  team: LinkableTeam;
}) {
  const label = children ?? teamName(team);

  if (!team || !isResolvedCountry(team.slug)) {
    return <span className={className}>{label}</span>;
  }

  return (
    <Link className={className} href={`/teams/${team.slug}`}>
      {label}
    </Link>
  );
}
