import { PageShell } from "@/components/page-shell";
import { QualificationWatchSection } from "@/components/tracker-sections";
import { getWorldCupData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function QualificationPage() {
  const data = getWorldCupData();
  const qualification = data.bracket.qualification;

  return (
    <PageShell active="qualification" source={data.source}>
      <QualificationWatchSection teams={qualification["third-place-table"]} />
    </PageShell>
  );
}
