import Link from "next/link";
import { venueLabel } from "@/lib/calendar";
import type { FixtureMatch } from "@/lib/types";
import {
  LocalMatchDate,
  LocalMatchDay,
  LocalMatchTime,
} from "./local-match-time";
import { TeamReference } from "./team-reference";

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

function LinkedMatchTitle({ match }: { match?: FixtureMatch | null }) {
  if (!match?.home || !match.away) return <>{match?.label ?? "Draw path"}</>;

  return (
    <>
      <TeamReference
        className="team-reference--home"
        showFlag={false}
        team={match.home}
      />
      <span> vs </span>
      <TeamReference
        className="team-reference--away"
        showFlag={false}
        team={match.away}
      />
    </>
  );
}

export function DashboardHero({
  generated,
  nextMatches = [],
}: {
  generated: string;
  nextMatches?: FixtureMatch[];
}) {
  const primaryMatch = nextMatches[0] ?? null;
  const hasMultipleMatches = nextMatches.length > 1;

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
          <span className="next-stage__label">
            {hasMultipleMatches ? "Next matches" : "Next match"}
          </span>
          <div className="next-stage__round">
            {nextMatches.length > 0 ? (
              <div className="next-stage__matches">
                {nextMatches.map((match) => (
                  <div className="next-stage__match" key={match.id}>
                    <LinkedMatchTitle match={match} />
                  </div>
                ))}
              </div>
            ) : (
              <LinkedMatchTitle match={null} />
            )}
          </div>
          <div className="next-stage__date">
            <strong>
              {primaryMatch ? <LocalMatchDay value={primaryMatch.date} /> : "28"}
            </strong>
            <span>
              {primaryMatch ? (
                <>
                  <LocalMatchDate value={primaryMatch.date} />
                  <br />
                  <LocalMatchTime value={primaryMatch.date} />
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
          <small>
            {hasMultipleMatches
              ? `${nextMatches.length} matches at this kickoff`
              : venueLabel(primaryMatch?.venue)}
          </small>
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
