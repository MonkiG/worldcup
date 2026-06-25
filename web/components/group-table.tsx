import type { Group, Team } from "@/lib/types";
import { getFifaCode } from "@/lib/team-codes";
import { TeamFlag } from "./team-flag";
import { TeamLink } from "./team-link";

function teamParts(team: Team) {
  const match = team.team.match(/^(.*)\s([A-Z]{3})$/);
  return match
    ? { name: match[1], code: match[2] }
    : { name: team.team, code: getFifaCode(team.slug) };
}

export function TeamMark({ team }: { team: Team }) {
  const { code, name } = teamParts(team);
  return (
    <span className="team-mark">
      <TeamFlag code={code} name={name} />
    </span>
  );
}

export function TeamName({ team }: { team: Team }) {
  const { name, code } = teamParts(team);
  return (
    <span className="team-name">
      <TeamMark team={team} />
      <TeamLink className="team-name__label" team={team}>
        {name}
      </TeamLink>
      <span className="team-name__code">{code}</span>
    </span>
  );
}

export function GroupTable({
  bestThirdSlugs,
  group,
}: {
  bestThirdSlugs?: Set<string>;
  group: Group;
}) {
  return (
    <article className="group-card">
      <header className="group-card__header">
        <div>
          <span className="eyebrow">Standings</span>
          <h3>Group {group.group}</h3>
        </div>
        <span className="group-card__games">3 matches each</span>
      </header>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th aria-label="Position">#</th>
              <th>Team</th>
              <th>PL</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            {group.teams.map((team) => {
              const isBestThird =
                team.position === 3 && bestThirdSlugs?.has(team.slug);

              return (
                <tr
                  className={isBestThird ? "is-best-third" : undefined}
                  key={`${team.group}-${team.position}`}
                >
                  <td>
                    <span
                      className={`rank rank--${team.position} ${
                        isBestThird ? "rank--best-third" : ""
                      }`}
                    >
                      {team.position}
                    </span>
                  </td>
                  <td>
                    <span className="team-cell">
                      <TeamName team={team} />
                      {isBestThird && (
                        <span className="qualifier-badge">Best 3rd</span>
                      )}
                    </span>
                  </td>
                  <td>{team.played}</td>
                  <td>{team.won}</td>
                  <td>{team.drawn}</td>
                  <td>{team.lost}</td>
                  <td>
                    {team["goal-difference"] > 0 ? "+" : ""}
                    {team["goal-difference"]}
                  </td>
                  <td className="points">{team.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
