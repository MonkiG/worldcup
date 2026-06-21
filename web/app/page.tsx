import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { formatGeneratedAt } from "@/lib/format";
import { getWorldCupData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function Home() {
  const data = getWorldCupData();
  const generated = formatGeneratedAt(data["generated-at"]);

  return (
    <main id="top">
      <SiteHeader active="home" />

      <section className="dashboard-hero">
        <div className="dashboard-hero__grid" />
        <div className="dashboard-hero__main">
          <div className="dashboard-hero__copy">
            <span className="kicker">
              Tournament intelligence / Updated {generated}
            </span>
            <h1>
              The tournament,
              <span> mapped live.</span>
            </h1>
            <p>
              Standings, qualification pressure and the projected path through
              the 2026 knockout stage, now split into focused views.
            </p>
          </div>

          <aside className="next-stage">
            <span className="next-stage__label">Next stage</span>
            <div className="next-stage__round">Round of 32</div>
            <div className="next-stage__date">
              <strong>28</strong>
              <span>
                Jun
                <br />
                2026
              </span>
            </div>
            <small>32 qualified teams / 16 fixtures</small>
          </aside>
        </div>

        <div className="scoreboard-strip">
          <article>
            <span>Groups</span>
            <strong>12</strong>
            <small>A to L</small>
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
          <Link href="/bracket">
            Open bracket
            <span>-&gt;</span>
          </Link>
        </div>
      </section>

      <section className="content-section">
        <header className="section-heading">
          <div>
            <span className="eyebrow">Choose a view</span>
            <h2>Tracker pages</h2>
          </div>
          <div className="section-heading__meta">
            <p>
              Each tournament feature now has its own page, so standings,
              knockout projections and best-third qualification can be opened
              directly.
            </p>
          </div>
        </header>

        <div className="feature-grid">
          <Link className="feature-card" href="/groups">
            <span>01</span>
            <strong>Group standings</strong>
            <small>All twelve tables with direct and third-place markers.</small>
          </Link>
          <Link className="feature-card feature-card--dark" href="/bracket">
            <span>02</span>
            <strong>Knockout bracket</strong>
            <small>Round of 32 through the final in one bracket view.</small>
          </Link>
          <Link className="feature-card" href="/qualification">
            <span>03</span>
            <strong>Best thirds</strong>
            <small>The current qualification race and the cut line.</small>
          </Link>
        </div>
      </section>

      <SiteFooter source={data.source} />
    </main>
  );
}
