import { DashboardHero, FeatureLinks } from "@/components/home-dashboard";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { formatGeneratedAt } from "@/lib/format";
import { getWorldCupData } from "@/lib/data";
import { getCalendarFocus } from "@/lib/calendar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Standings, Fixtures and Bracket",
  description:
    "Track the FIFA World Cup 2026 with group standings, fixtures, results, best third-place qualification and projected knockout bracket.",
  openGraph: {
    title: "World Cup 2026 live tracker",
    description:
      "Group standings, match calendar, results and projected knockout bracket for the FIFA World Cup 2026.",
  },
};

export default function Home() {
  const data = getWorldCupData();
  const generated = formatGeneratedAt(data["generated-at"]);
  const { next } = getCalendarFocus(data.matches ?? []);

  return (
    <PageShell active="home" data={data} source={data.source}>
      <DashboardHero generated={generated} nextMatch={next} />

      <section className="content-section">
        <SectionHeading
          eyebrow="Choose a view"
          heading="Tracker pages"
          meta={
            <p>
              Each tournament feature now has its own page, so standings,
              knockout projections and best-third qualification can be opened
              directly.
            </p>
          }
        />
        <FeatureLinks />
      </section>
    </PageShell>
  );
}
