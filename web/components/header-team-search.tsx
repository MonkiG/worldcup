"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TeamReference } from "@/components/team-reference";
import type { WorldCupData } from "@/lib/types";

function normalize(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function HeaderTeamSearch({ data }: { data: WorldCupData }) {
  const teams = useMemo(
    () => data.groups.flatMap((group) => group.teams),
    [data.groups],
  );
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);
  const suggestions = normalizedQuery
    ? teams
        .filter(
          (team) =>
            normalize(team.team).includes(normalizedQuery) ||
            normalize(team.slug).includes(normalizedQuery),
        )
        .slice(0, 6)
    : [];

  return (
    <div className="header-search">
      <label className="header-search__label" htmlFor="team-search">
        Search team
      </label>
      <input
        autoComplete="off"
        id="team-search"
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        placeholder="Country..."
        type="search"
        value={query}
      />

      {suggestions.length > 0 ? (
        <div className="header-search__suggestions">
          {suggestions.map((team) => (
            <Link
              href={`/teams/${team.slug}`}
              key={team.slug}
              onClick={() => setQuery("")}
            >
              <TeamReference linked={false} team={team} />
              <small>Group {team.group}</small>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
