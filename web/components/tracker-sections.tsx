import { Bracket } from "@/components/bracket";
import { GroupTable, TeamName } from "@/components/group-table";
import type { Group, Match, Team } from "@/lib/types";
import { SectionHeading } from "./section-heading";

export function GroupStandingsSection({ groups }: { groups: Group[] }) {
  return (
    <section className="content-section page-section" id="groups">
      <SectionHeading
        eyebrow="Group stage"
        heading="Standings"
        meta={
          <>
            <p>
              Top two qualify automatically. The eight strongest third-place
              teams also advance.
            </p>
            <div className="legend">
              <span>
                <i className="legend__direct" /> Direct
              </span>
              <span>
                <i className="legend__third" /> Best-third race
              </span>
            </div>
          </>
        }
      />

      <div className="groups-grid">
        {groups.map((group) => (
          <GroupTable group={group} key={group.group} />
        ))}
      </div>
    </section>
  );
}

export function KnockoutBracketSection({
  firstRound,
  later,
}: {
  firstRound: Match[];
  later: Match[];
}) {
  return (
    <section className="bracket-section page-section" id="bracket">
      <SectionHeading
        eyebrow="Knockout stage"
        heading="Road to the final"
        meta={
          <>
            <p>
              The bracket is recalculated after every standings update.
              Unresolved third-place slots display all remaining candidates.
            </p>
            <span className="scroll-hint">Scroll horizontally to explore</span>
          </>
        }
        tone="light"
      />
      <Bracket firstRound={firstRound} later={later} />
    </section>
  );
}

export function QualificationWatchSection({ teams }: { teams: Team[] }) {
  return (
    <section
      className="content-section third-place-section page-section"
      id="qualification"
    >
      <SectionHeading
        eyebrow="Qualification watch"
        heading="Best thirds"
        meta={
          <>
            <p>
              Ranking order: points, goal difference, goals scored, then team
              conduct score.
            </p>
            <span className="cut-note">
              Orange line = current qualification cut
            </span>
          </>
        }
      />

      <ThirdPlaceTable teams={teams} />
    </section>
  );
}

function ThirdPlaceTable({ teams }: { teams: Team[] }) {
  return (
    <div className="third-place-table">
      <div className="third-place-table__head">
        <span>Rank</span>
        <span>Team</span>
        <span>Group</span>
        <span>PL</span>
        <span>GD</span>
        <span>PTS</span>
        <span>Status</span>
      </div>
      {teams.map((team, index) => (
        <div
          className={`third-place-row ${
            index === 7 ? "third-place-row--cut" : ""
          }`}
          key={`${team.group}-${team.position}`}
        >
          <strong>{String(index + 1).padStart(2, "0")}</strong>
          <TeamName team={team} />
          <span>{team.group}</span>
          <span>{team.played}</span>
          <span>
            {team["goal-difference"] > 0 ? "+" : ""}
            {team["goal-difference"]}
          </span>
          <strong>{team.points}</strong>
          <span className={`status ${index < 8 ? "status--in" : ""}`}>
            {index < 8 ? "Qualifying" : "Outside"}
          </span>
        </div>
      ))}
    </div>
  );
}
