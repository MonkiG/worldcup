import { PageShell } from "@/components/page-shell";
import { KnockoutBracketSection } from "@/components/tracker-sections";
import { getBracketPageData } from "@/lib/server/world-cup-services";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projected Knockout Bracket",
  description:
    "Explore the projected FIFA World Cup 2026 knockout bracket from the Round of 32 through the final.",
};

export default function BracketPage() {
  const { data, firstRound, later } = getBracketPageData();

  return (
    <PageShell active="bracket" data={data} source={data.source}>
      <KnockoutBracketSection firstRound={firstRound} later={later} />
    </PageShell>
  );
}
