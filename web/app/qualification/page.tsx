import { PageShell } from "@/components/page-shell";
import { QualificationWatchSection } from "@/components/tracker-sections";
import { getWorldCupData } from "@/lib/data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Best Third-Place Qualification",
  description:
    "Follow the FIFA World Cup 2026 best third-place table, cut line and qualification status.",
};

export default function QualificationPage() {
  const data = getWorldCupData();
  const qualification = data.bracket.qualification;

  return (
    <PageShell active="qualification" data={data} source={data.source}>
      <QualificationWatchSection teams={qualification["third-place-table"]} />
    </PageShell>
  );
}
