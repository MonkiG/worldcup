import { CalendarSection } from "@/components/calendar-section";
import { PageShell } from "@/components/page-shell";
import { getWorldCupData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function CalendarPage() {
  const data = getWorldCupData();

  return (
    <PageShell active="calendar" source={data.sources?.fixtures ?? data.source}>
      <CalendarSection matches={data.matches ?? []} />
    </PageShell>
  );
}
