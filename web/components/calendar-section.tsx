import {
  formatMatchDate,
  formatMatchTime,
  calendarPageSize,
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

function FixtureRow({
  match,
  focused,
}: {
  match: FixtureMatch;
  focused: boolean;
}) {
  return (
    <article
      className={`fixture-row${focused ? " fixture-row--focused" : ""}`}
      id={match.id}
    >
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

export function CalendarSection({
  matches,
  page,
}: {
  matches: FixtureMatch[];
  page?: number;
}) {
  const { current, next, sorted } = getCalendarFocus(matches);
  const focus = current ?? next;
  const pageCount = Math.max(1, Math.ceil(sorted.length / calendarPageSize));
  const focusIndex = focus
    ? sorted.findIndex((match) => match.id === focus.id)
    : 0;
  const defaultPage = Math.floor(Math.max(0, focusIndex) / calendarPageSize) + 1;
  const currentPage =
    Number.isFinite(page) && page && page > 0
      ? Math.min(page, pageCount)
      : defaultPage;
  const start = (currentPage - 1) * calendarPageSize;
  const visibleMatches = sorted.slice(start, start + calendarPageSize);

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
          {visibleMatches.map((match) => (
            <FixtureRow
              key={match.id}
              match={match}
              focused={match.id === focus?.id}
            />
          ))}
          {pageCount > 1 ? (
            <nav className="fixtures-pagination" aria-label="Fixture pages">
              <a
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "is-disabled" : ""}
                href={`/calendar?page=${Math.max(1, currentPage - 1)}`}
              >
                Prev
              </a>
              <span>
                Page {currentPage} of {pageCount}
              </span>
              <a
                aria-disabled={currentPage === pageCount}
                className={currentPage === pageCount ? "is-disabled" : ""}
                href={`/calendar?page=${Math.min(pageCount, currentPage + 1)}`}
              >
                Next
              </a>
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  );
}
