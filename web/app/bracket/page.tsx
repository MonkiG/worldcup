import { PageShell } from "@/components/page-shell";
import { KnockoutBracketSection } from "@/components/tracker-sections";
import { getWorldCupData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function BracketPage() {
  const data = getWorldCupData();

  return (
    <PageShell active="bracket" data={data} source={data.source}>
      <KnockoutBracketSection
        firstRound={data.bracket.rounds["round-of-32"]}
        later={data.bracket.rounds.later}
      />
    </PageShell>
  );
}
