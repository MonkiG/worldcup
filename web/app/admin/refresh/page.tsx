import type { Metadata } from "next";
import { AdminRefreshPanel } from "@/components/admin-refresh-panel";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { getWorldCupData } from "@/lib/server/world-cup-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manual Data Refresh",
  description: "Run the World Cup scraper manually from the admin dashboard.",
};

export default function AdminRefreshPage() {
  const data = getWorldCupData();

  return (
    <PageShell active="home" data={data} source={data.source}>
      <section className="content-section admin-page page-section">
        <SectionHeading
          eyebrow="Admin"
          heading="Refresh data"
          meta={
            <p>
              Run the full FIFA scrape on demand or rebuild the local snapshot
              from the stored source.
            </p>
          }
        />
        <AdminRefreshPanel />
      </section>
    </PageShell>
  );
}
