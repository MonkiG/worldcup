import Link from "next/link";
import { matchTitle } from "@/lib/calendar";
import type { FixtureMatch } from "@/lib/types";
import {
  LocalMatchDate,
  LocalMatchDay,
  LocalMatchTime,
} from "./local-match-time";

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
    href: "/calendar",
    index: "02",
    title: "Match calendar",
    detail: "Upcoming kickoffs, venues and the next match window.",
  },
  {
    href: "/bracket",
    index: "03",
    title: "Knockout bracket",
    detail: "Round of 32 through the final in one bracket view.",
    dark: true,
  },
  {
    href: "/qualification",
    index: "04",
    title: "Best thirds",
    detail: "The current qualification race and the cut line.",
  },
];

export function DashboardHero({
  generated,
  nextMatch,
}: {
  generated: string;
  nextMatch?: FixtureMatch | null;
}) {
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
          <span className="next-stage__label">Next match</span>
          <div className="next-stage__round">{matchTitle(nextMatch)}</div>
          <div className="next-stage__date">
            <strong>
              {nextMatch ? <LocalMatchDay value={nextMatch.date} /> : "28"}
            </strong>
            <span>
              {nextMatch ? (
                <>
                  <LocalMatchDate value={nextMatch.date} />
                  <br />
                  <LocalMatchTime value={nextMatch.date} />
                </>
              ) : (
                <>
                  Jun
                  <br />
                  2026
                </>
              )}
            </span>
          </div>
          <small>{nextMatch?.venue || "Calendar refresh pending"}</small>
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
        <Link href="/calendar">
          Open calendar
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
