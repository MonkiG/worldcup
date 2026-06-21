import { DashboardHero, FeatureLinks } from "@/components/home-dashboard";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { formatGeneratedAt } from "@/lib/format";
import { getWorldCupData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function Home() {
  const data = getWorldCupData();
  const generated = formatGeneratedAt(data["generated-at"]);

  return (
    <PageShell active="home" source={data.source}>
      <DashboardHero generated={generated} />

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
