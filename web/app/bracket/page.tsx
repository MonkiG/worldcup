import { Bracket } from "@/components/bracket";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getWorldCupData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function BracketPage() {
  const data = getWorldCupData();

  return (
    <main id="top">
      <SiteHeader active="bracket" />

      <section className="bracket-section page-section" id="bracket">
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
            <span className="scroll-hint">Scroll horizontally to explore</span>
          </div>
        </header>
        <Bracket
          firstRound={data.bracket.rounds["round-of-32"]}
          later={data.bracket.rounds.later}
        />
      </section>

      <SiteFooter source={data.source} />
    </main>
  );
}
