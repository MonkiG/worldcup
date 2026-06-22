import { CalendarSection } from "@/components/calendar-section";
import { PageShell } from "@/components/page-shell";
import { getWorldCupData } from "@/lib/data";

export const dynamic = "force-dynamic";

type CalendarPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const data = getWorldCupData();
  const params = await searchParams;
  const page = Number.parseInt(params?.page ?? "", 10);

  return (
    <PageShell active="calendar" source={data.sources?.fixtures ?? data.source}>
      <CalendarSection matches={data.matches ?? []} page={page} />
    </PageShell>
  );
}
