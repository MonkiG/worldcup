import { TeamName } from "@/components/group-table";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getWorldCupData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function QualificationPage() {
  const data = getWorldCupData();
  const qualification = data.bracket.qualification;

  return (
    <main id="top">
      <SiteHeader active="qualification" />

      <section className="content-section third-place-section page-section" id="qualification">
        <header className="section-heading">
          <div>
            <span className="eyebrow">Qualification watch</span>
            <h2>Best thirds</h2>
          </div>
          <div className="section-heading__meta">
            <p>
              Ranking order: points, goal difference, goals scored, then team
              conduct score.
            </p>
            <span className="cut-note">Orange line = current qualification cut</span>
          </div>
        </header>

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
          {qualification["third-place-table"].map((team, index) => (
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
      </section>

      <SiteFooter source={data.source} />
    </main>
  );
}
