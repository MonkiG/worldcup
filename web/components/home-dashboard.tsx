import Link from "next/link";

const stats = [
  { label: "Groups", value: "12", detail: "A to L" },
  { label: "Teams", value: "48", detail: "24 qualify directly" },
  { label: "Third-place spots", value: "08", detail: "From 12 candidates" },
  { label: "Total matches", value: "104", detail: "Until one champion" },
];

const featureCards = [
  {
    href: "/groups",
    index: "01",
    title: "Group standings",
    detail: "All twelve tables with direct and third-place markers.",
  },
  {
    href: "/bracket",
    index: "02",
    title: "Knockout bracket",
    detail: "Round of 32 through the final in one bracket view.",
    dark: true,
  },
  {
    href: "/qualification",
    index: "03",
    title: "Best thirds",
    detail: "The current qualification race and the cut line.",
  },
];

export function DashboardHero({ generated }: { generated: string }) {
  return (
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
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </article>
        ))}
        <Link href="/bracket">
          Open bracket
          <span>-&gt;</span>
        </Link>
      </div>
    </section>
  );
}

export function FeatureLinks() {
  return (
    <div className="feature-grid">
      {featureCards.map((card) => (
        <Link
          className={`feature-card ${card.dark ? "feature-card--dark" : ""}`}
          href={card.href}
          key={card.href}
        >
          <span>{card.index}</span>
          <strong>{card.title}</strong>
          <small>{card.detail}</small>
        </Link>
      ))}
    </div>
  );
}
