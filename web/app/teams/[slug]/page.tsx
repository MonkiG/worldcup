import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocalMatchDate, LocalMatchTime } from "@/components/local-match-time";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { getWorldCupData } from "@/lib/data";
import type { BracketSlot, FixtureMatch, Team } from "@/lib/types";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function findTeam(data: Awaited<ReturnType<typeof getWorldCupData>>, slug: string) {
  return data.groups
    .flatMap((group) => group.teams)
    .find((candidate) => candidate.slug === slug);
}

function hasResult(match: FixtureMatch) {
  return (
    match.status === "FT" &&
    typeof match.homeScore === "number" &&
    typeof match.awayScore === "number"
  );
}

function fixtureIncludesTeam(match: FixtureMatch, team: Team) {
  return match.home?.slug === team.slug || match.away?.slug === team.slug;
}

function slotTeam(slot: BracketSlot | string) {
  return typeof slot === "string" ? undefined : slot.team;
}

function qualificationLabel(team: Team, automatic: Team[], bestThirds: Team[]) {
  if (automatic.some((candidate) => candidate.slug === team.slug)) {
    return "Direct qualification slot";
  }

  if (bestThirds.some((candidate) => candidate.slug === team.slug)) {
    return "Best third-place slot";
  }

  if (team.position === 3) return "Third-place watch";
  if (team.position > 3) return "Outside qualification places";
  return "Group stage position pending";
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

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const data = getWorldCupData();
  const { slug } = await params;
  const team = findTeam(data, slug);

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
  const data = getWorldCupData();
  const { slug } = await params;
  const team = findTeam(data, slug);

  if (!team) notFound();

  const fixtures = (data.matches ?? []).filter((match) =>
    fixtureIncludesTeam(match, team),
  );
  const bracketMatches = data.bracket.rounds["round-of-32"].filter((match) => {
    const home = slotTeam(match.home);
    const away = slotTeam(match.away);
    return home?.slug === team.slug || away?.slug === team.slug;
  });
  const qualification = qualificationLabel(
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
            <span className="eyebrow">Tournament profile</span>
            <h3>{team.team}</h3>
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
                    <strong>{match.home?.name ?? "TBD"}</strong>
                    <span>vs</span>
                    <strong>{match.away?.name ?? "TBD"}</strong>
                  </div>
                  <span>{match.round || "Fixture"}</span>
                  <small>{match.venue || "Venue TBD"}</small>
                </article>
              ))}
            </section>

            <section>
              <h3>Projected bracket</h3>
              {bracketMatches.length > 0 ? (
                <div className="team-page-bracket">
                  {bracketMatches.map((match) => (
                    <article key={match.match}>
                      <span>Match {match.match}</span>
                      <strong>{match.round}</strong>
                      <small>{match.date ?? "Date pending"}</small>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="team-page-empty">
                  No projected bracket slot is resolved for this country yet.
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
