import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocalMatchDate, LocalMatchTime } from "@/components/local-match-time";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { TeamFlag } from "@/components/team-flag";
import { TeamReference } from "@/components/team-reference";
import { getTeamPageData } from "@/lib/server/world-cup-services";
import { getFifaCode } from "@/lib/team-codes";
import type { BracketPrediction } from "@/lib/bracket-predictions";
import type { FixtureMatch, Team } from "@/lib/types";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function hasResult(match: FixtureMatch) {
  return (
    match.status === "FT" &&
    typeof match.homeScore === "number" &&
    typeof match.awayScore === "number"
  );
}

function qualificationLabel(team: Team, automatic: Team[], bestThirds: Team[]) {
  return qualificationStatus(team, automatic, bestThirds).detail;
}

function qualificationStatus(team: Team, automatic: Team[], bestThirds: Team[]) {
  if (automatic.some((candidate) => candidate.slug === team.slug)) {
    return {
      detail: "Direct qualification slot",
      label: "Qualified",
      tone: "qualified",
    };
  }

  if (bestThirds.some((candidate) => candidate.slug === team.slug)) {
    return {
      detail: "Best third-place slot",
      label: "Best third",
      tone: "best-third",
    };
  }

  if (team.position === 3) {
    return {
      detail: "Third-place watch",
      label: "On the bubble",
      tone: "watch",
    };
  }

  if (team.position > 3) {
    return {
      detail: "Outside qualification places",
      label: "Outside",
      tone: "out",
    };
  }

  return {
    detail: "Group stage position pending",
    label: "Pending",
    tone: "pending",
  };
}

function ResultCell({ match }: { match: FixtureMatch }) {
  if (hasResult(match)) {
    return (
      <span className="team-page-score">
        {match.homeScore} - {match.awayScore}
      </span>
    );
  }

  return <LocalMatchTime value={match.date} />;
}

function bracketRoundLabel(round: string) {
  const labels: Record<string, string> = {
    "round-of-32": "Round of 32",
  };

  return labels[round] ?? round;
}

function OpponentList({ prediction }: { prediction: BracketPrediction }) {
  if (prediction.opponents.length === 0) {
    return <p>Opponent pending</p>;
  }

  return (
    <ul>
      {prediction.opponents.map((opponent) => (
        <li key={opponent.slug}>
          <TeamReference team={opponent} />
        </li>
      ))}
    </ul>
  );
}

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data, team } = getTeamPageData(slug);

  if (!team) {
    return {
      title: "Country not found",
      description: "The requested World Cup 2026 country page was not found.",
    };
  }

  const qualification = qualificationLabel(
    team,
    data.bracket.qualification.automatic,
    data.bracket.qualification["best-thirds"],
  );
  const description = `${team.team} World Cup 2026 profile: Group ${team.group}, ${team.points} points, position ${team.position}, fixtures, results, venues and projected bracket status.`;

  return {
    title: `${team.team} World Cup 2026 Profile`,
    description,
    openGraph: {
      title: `${team.team} at the World Cup 2026`,
      description: `${qualification}. View ${team.team} standings, fixtures, results and knockout projection.`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${team.team} World Cup 2026 Profile`,
      description,
    },
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const { data, team, fixtures, bracketPredictions, qualified } =
    getTeamPageData(slug);

  if (!team) notFound();

  const qualification = qualificationLabel(
    team,
    data.bracket.qualification.automatic,
    data.bracket.qualification["best-thirds"],
  );
  const status = qualificationStatus(
    team,
    data.bracket.qualification.automatic,
    data.bracket.qualification["best-thirds"],
  );

  return (
    <PageShell active="groups" data={data} source={data.source}>
      <section className="content-section team-page-section page-section">
        <SectionHeading
          eyebrow={`Group ${team.group}`}
          heading={team.team}
          meta={
            <p>
              {qualification}. Review the group record, fixture list, results,
              venues and projected knockout references for this country.
            </p>
          }
        />

        <div className="team-page-grid">
          <aside className="team-page-profile">
            <div className="team-page-flag" aria-hidden="true">
              <TeamFlag
                className="team-page-flag__image"
                code={getFifaCode(team.slug)}
                fallbackClassName="team-page-flag__fallback"
                name={team.team}
              />
            </div>
            <span className="eyebrow">Tournament profile</span>
            <h3>
              <TeamReference showFlag={false} team={team} />
            </h3>
            <strong className={`team-page-status team-page-status--${status.tone}`}>
              {status.label}
            </strong>
            <p>{qualification}</p>
            <dl>
              <div>
                <dt>Position</dt>
                <dd>{team.position}</dd>
              </div>
              <div>
                <dt>Points</dt>
                <dd>{team.points}</dd>
              </div>
              <div>
                <dt>Record</dt>
                <dd>
                  {team.won}-{team.drawn}-{team.lost}
                </dd>
              </div>
              <div>
                <dt>Goal difference</dt>
                <dd>{team["goal-difference"]}</dd>
              </div>
              <div>
                <dt>Goals</dt>
                <dd>
                  {team["goals-for"]} / {team["goals-against"]}
                </dd>
              </div>
              <div>
                <dt>Conduct</dt>
                <dd>{team["team-conduct-score"]}</dd>
              </div>
            </dl>
          </aside>

          <div className="team-page-results">
            <section>
              <h3>Fixtures and results</h3>
              {fixtures.map((match) => (
                <article className="team-page-match" key={match.id}>
                  <div>
                    <span>
                      <LocalMatchDate value={match.date} />
                    </span>
                    <strong>
                      <ResultCell match={match} />
                    </strong>
                  </div>
                  <div>
                    <strong>
                      <TeamReference
                        className="team-reference--home"
                        team={match.home}
                      />
                    </strong>
                    <span>vs</span>
                    <strong>
                      <TeamReference
                        className="team-reference--away"
                        team={match.away}
                      />
                    </strong>
                  </div>
                  <span>{match.round || "Fixture"}</span>
                  <small>{match.venue || "Venue TBD"}</small>
                </article>
              ))}
            </section>

            <section>
              <h3>Projected bracket</h3>
              {bracketPredictions.length > 0 ? (
                <div className="team-page-bracket">
                  {bracketPredictions.map((prediction) => (
                    <article key={`${prediction.match}-${prediction.slot}`}>
                      <span>
                        Match {prediction.match} / {prediction.slot}
                      </span>
                      <strong>
                        {prediction.status === "locked"
                          ? "Confirmed path"
                          : "Possible path"}
                      </strong>
                      <small>
                        {bracketRoundLabel(prediction.round)} /{" "}
                        {prediction.date ?? "Date pending"}
                      </small>
                      <div className="team-page-opponents">
                        <em>
                          {prediction.status === "locked"
                            ? "Opponent"
                            : "Possible opponents"}
                        </em>
                        <OpponentList prediction={prediction} />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="team-page-empty">
                  {qualified
                    ? "No possible bracket opponent is resolved for this country yet."
                    : "This country is not in a current qualification slot yet."}
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
