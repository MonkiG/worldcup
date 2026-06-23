import { PageShell } from "@/components/page-shell";
import { GroupStandingsSection } from "@/components/tracker-sections";
import { getWorldCupData } from "@/lib/data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Group Standings",
  description:
    "View all FIFA World Cup 2026 group tables, points, goal difference and qualification markers.",
};

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
