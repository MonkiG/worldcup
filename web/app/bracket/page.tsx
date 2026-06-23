import { PageShell } from "@/components/page-shell";
import { KnockoutBracketSection } from "@/components/tracker-sections";
import { getWorldCupData } from "@/lib/data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projected Knockout Bracket",
  description:
    "Explore the projected FIFA World Cup 2026 knockout bracket from the Round of 32 through the final.",
};

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
