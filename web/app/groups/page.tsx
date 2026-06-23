import { PageShell } from "@/components/page-shell";
import { GroupStandingsSection } from "@/components/tracker-sections";
import { getWorldCupData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function GroupsPage() {
  const data = getWorldCupData();

  return (
    <PageShell active="groups" data={data} source={data.source}>
      <GroupStandingsSection
        bestThirds={data.bracket.qualification["best-thirds"]}
        groups={data.groups}
      />
    </PageShell>
  );
}
