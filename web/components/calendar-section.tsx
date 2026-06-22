import {
  formatMatchDate,
  formatMatchTime,
  getCalendarFocus,
  matchTitle,
} from "@/lib/calendar";
import type { FixtureMatch } from "@/lib/types";
import { SectionHeading } from "./section-heading";

function MatchTeams({ match }: { match: FixtureMatch }) {
  return (
    <div className="fixture-teams">
      <strong>{match.home?.name ?? "TBD"}</strong>
      <span>vs</span>
      <strong>{match.away?.name ?? "TBD"}</strong>
    </div>
  );
}

function FixtureRow({ match }: { match: FixtureMatch }) {
  return (
    <article className="fixture-row">
      <div>
        <span className="fixture-row__date">{formatMatchDate(match.date)}</span>
        <strong>{formatMatchTime(match.date)}</strong>
      </div>
      <MatchTeams match={match} />
      <span>{match.round || "Fixture"}</span>
      <span>{match.venue || "Venue TBD"}</span>
    </article>
  );
}

export function CalendarSection({ matches }: { matches: FixtureMatch[] }) {
  const { current, next, sorted } = getCalendarFocus(matches);
  const focus = current ?? next;
  const upcoming = focus
    ? sorted.filter(
        (match) => new Date(match.date).getTime() >= new Date(focus.date).getTime(),
      )
    : sorted;

  return (
    <section className="content-section calendar-section page-section">
      <SectionHeading
        eyebrow="Match calendar"
        heading="Schedule"
        meta={
          <p>
            Dates and kickoffs are sourced from FIFA fixtures and refreshed by
            the scraper with the standings data.
          </p>
        }
      />

      <div className="calendar-layout">
        <aside className="fixture-focus">
          <span className="fixture-focus__label">
            {current ? "Live window" : "Next match"}
          </span>
          <h3>{matchTitle(focus)}</h3>
          {focus ? (
            <>
              <div className="fixture-focus__time">
                <strong>{formatMatchDate(focus.date)}</strong>
                <span>{formatMatchTime(focus.date)}</span>
              </div>
              <MatchTeams match={focus} />
              <small>{focus.venue || focus.round || "Fixture details pending"}</small>
            </>
          ) : (
            <p>No fixtures found in the latest data yet.</p>
          )}
        </aside>

        <div className="fixtures-list">
          <div className="fixtures-list__head">
            <span>Date</span>
            <span>Match</span>
            <span>Round</span>
            <span>Venue</span>
          </div>
          {upcoming.slice(0, 18).map((match) => (
            <FixtureRow key={match.id} match={match} />
          ))}
        </div>
      </div>
    </section>
  );
}
