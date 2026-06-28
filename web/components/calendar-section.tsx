import {
  calendarPageSize,
  getCalendarFocus,
  matchTitle,
  venueLabel,
} from "@/lib/calendar";
import type { FixtureMatch } from "@/lib/types";
import { FixtureMiniCalendar } from "./fixture-mini-calendar";
import { LocalMatchDate, LocalMatchTime } from "./local-match-time";
import { SectionHeading } from "./section-heading";
import { TeamReference } from "./team-reference";

function hasResult(match: FixtureMatch) {
  return (
    match.status === "FT" &&
    typeof match.homeScore === "number" &&
    typeof match.awayScore === "number"
  );
}

function knockoutTone(round = "") {
  const normalized = round.toLowerCase();
  if (normalized === "final") return "final";
  if (normalized.includes("third")) return "third-place";
  if (normalized.includes("semi")) return "semi-final";
  if (normalized.includes("quarter")) return "quarter-final";
  return null;
}

function RoundLabel({ round }: { round?: string }) {
  const tone = knockoutTone(round);

  if (!tone) return <>{round || "Fixture"}</>;

  return (
    <span className={`fixture-round fixture-round--${tone}`}>
      {tone === "final" ? "★ " : ""}
      {round}
    </span>
  );
}

function MatchTeams({
  match,
  showResult = false,
}: {
  match: FixtureMatch;
  showResult?: boolean;
}) {
  return (
    <div className="fixture-teams">
      <strong>
        <TeamReference className="team-reference--home" team={match.home} />
      </strong>
      {showResult && hasResult(match) ? (
        <span className="fixture-score">
          <b>{match.homeScore}</b>
          <i>-</i>
          <b>{match.awayScore}</b>
        </span>
      ) : (
        <span className="fixture-versus">vs</span>
      )}
      <strong>
        <TeamReference className="team-reference--away" team={match.away} />
      </strong>
    </div>
  );
}

function MatchTitleLinks({ match }: { match?: FixtureMatch | null }) {
  if (!match?.home || !match.away) return <>{matchTitle(match)}</>;

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

function FixtureRow({
  match,
  focused,
}: {
  match: FixtureMatch;
  focused: boolean;
}) {
  const tone = knockoutTone(match.round);

  return (
    <article
      className={`fixture-row${focused ? " fixture-row--focused" : ""}${
        tone ? ` fixture-row--${tone}` : ""
      }`}
      id={match.id}
    >
      <div>
        <span className="fixture-row__date">
          <LocalMatchDate value={match.date} />
        </span>
        <strong>
          <LocalMatchTime value={match.date} />
        </strong>
      </div>
      <MatchTeams match={match} showResult />
      <span>
        <RoundLabel round={match.round} />
      </span>
      <span>{venueLabel(match.venue)}</span>
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
  const { currentMatches, focusMatches, sorted } = getCalendarFocus(matches);
  const focus = focusMatches[0] ?? null;
  const focusedIds = new Set(focusMatches.map((match) => match.id));
  const hasMultipleFocusMatches = focusMatches.length > 1;
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
            {currentMatches.length > 0
              ? hasMultipleFocusMatches
                ? "Live windows"
                : "Live window"
              : hasMultipleFocusMatches
                ? "Next matches"
                : "Next match"}
          </span>
          <h3>
            {hasMultipleFocusMatches ? (
              `${focusMatches.length} matches`
            ) : (
              <MatchTitleLinks match={focus} />
            )}
          </h3>
          {focus ? (
            <>
              <div className="fixture-focus__time">
                <strong>
                  <LocalMatchDate value={focus.date} />
                </strong>
                <span>
                  <LocalMatchTime value={focus.date} />
                </span>
              </div>
              <div className="fixture-focus__matches">
                {focusMatches.map((match) => (
                  <div className="fixture-focus__match" key={match.id}>
                    <MatchTeams match={match} />
                    <small>
                      {venueLabel(match.venue) || match.round || "Fixture details pending"}
                    </small>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>No fixtures found in the latest data yet.</p>
          )}
          <FixtureMiniCalendar focusMatchId={focus?.id} matches={sorted} />
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
              focused={focusedIds.has(match.id)}
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
