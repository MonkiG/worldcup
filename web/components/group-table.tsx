import type { Group, Team } from "@/lib/types";

function teamParts(team: Team) {
  const match = team.team.match(/^(.*)\s([A-Z]{3})$/);
  return match
    ? { name: match[1], code: match[2] }
    : { name: team.team, code: team.slug.slice(0, 3).toUpperCase() };
}

export function TeamMark({ team }: { team: Team }) {
  const { code } = teamParts(team);
  return <span className="team-mark">{code}</span>;
}

export function TeamName({ team }: { team: Team }) {
  const { name, code } = teamParts(team);
  return (
    <span className="team-name">
      <TeamMark team={team} />
      <span className="team-name__label">{name}</span>
      <span className="team-name__code">{code}</span>
    </span>
  );
}

export function GroupTable({ group }: { group: Group }) {
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
            {group.teams.map((team) => (
              <tr key={`${team.group}-${team.position}`}>
                <td>
                  <span className={`rank rank--${team.position}`}>
                    {team.position}
                  </span>
                </td>
                <td>
                  <TeamName team={team} />
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
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
