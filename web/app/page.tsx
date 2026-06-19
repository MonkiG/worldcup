import { Bracket } from "@/components/bracket";
import { GroupTable, TeamName } from "@/components/group-table";
import { getWorldCupData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function Home() {
  const data = getWorldCupData();
  const qualification = data.bracket.qualification;
  const generated = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(data["generated-at"]));

  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="World Cup 2026 home">
          <span className="brand__ball">26</span>
          <span>
            <strong>World Cup Tracker</strong>
            <small>Canada · Mexico · USA</small>
          </span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#groups">Groups</a>
          <a href="#bracket">Knockout</a>
          <a href="#third-place">Best thirds</a>
        </nav>

        <div className="live-pill">
          <span />
          Provisional data
        </div>
      </header>

      <section className="dashboard-hero">
        <div className="dashboard-hero__grid" />
        <div className="dashboard-hero__main">
          <div className="dashboard-hero__copy">
            <span className="kicker">
              Tournament intelligence · Updated {generated}
            </span>
            <h1>
              The tournament,
              <span> mapped live.</span>
            </h1>
            <p>
              Standings, qualification pressure and the projected path through
              the 2026 knockout stage—all in one match-day view.
            </p>
          </div>

          <aside className="next-stage">
            <span className="next-stage__label">Next stage</span>
            <div className="next-stage__round">Round of 32</div>
            <div className="next-stage__date">
              <strong>28</strong>
              <span>Jun<br />2026</span>
            </div>
            <small>32 qualified teams · 16 fixtures</small>
          </aside>
        </div>

        <div className="scoreboard-strip">
          <article>
            <span>Groups</span>
            <strong>12</strong>
            <small>A — L</small>
          </article>
          <article>
            <span>Teams</span>
            <strong>48</strong>
            <small>24 qualify directly</small>
          </article>
          <article>
            <span>Third-place spots</span>
            <strong>08</strong>
            <small>From 12 candidates</small>
          </article>
          <article>
            <span>Total matches</span>
            <strong>104</strong>
            <small>Until one champion</small>
          </article>
          <a href="#bracket">
            Open bracket
            <span>→</span>
          </a>
        </div>
      </section>

      <div className="section-tabs">
        <a href="#groups"><span>01</span> Group standings</a>
        <a href="#bracket"><span>02</span> Knockout bracket</a>
        <a href="#third-place"><span>03</span> Qualification watch</a>
      </div>

      <section className="content-section" id="groups">
        <header className="section-heading">
          <div>
            <span className="eyebrow">Group stage</span>
            <h2>Standings</h2>
          </div>
          <div className="section-heading__meta">
            <p>
              Top two qualify automatically. The eight strongest third-place
              teams also advance.
            </p>
            <div className="legend">
              <span><i className="legend__direct" /> Direct</span>
              <span><i className="legend__third" /> Best-third race</span>
            </div>
          </div>
        </header>

        <div className="groups-grid">
          {data.groups.map((group) => (
            <GroupTable group={group} key={group.group} />
          ))}
        </div>
      </section>

      <section className="bracket-section" id="bracket">
        <header className="section-heading section-heading--light">
          <div>
            <span className="eyebrow">Knockout stage</span>
            <h2>Road to the final</h2>
          </div>
          <div className="section-heading__meta">
            <p>
              The bracket is recalculated after every standings update.
              Unresolved third-place slots display all remaining candidates.
            </p>
            <span className="scroll-hint">Scroll horizontally to explore →</span>
          </div>
        </header>
        <Bracket
          firstRound={data.bracket.rounds["round-of-32"]}
          later={data.bracket.rounds.later}
        />
      </section>

      <section className="content-section third-place-section" id="third-place">
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
              className={`third-place-row ${index === 7 ? "third-place-row--cut" : ""}`}
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

      <footer className="site-footer">
        <div className="brand brand--footer">
          <span className="brand__ball">26</span>
          <span>
            <strong>World Cup Tracker</strong>
            <small>Independent bracket project</small>
          </span>
        </div>
        <p>
          Data sourced from FIFA and marked provisional until all relevant
          results are final.
        </p>
        <div className="footer-links">
          <a href={data.source} target="_blank" rel="noreferrer">FIFA source ↗</a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
