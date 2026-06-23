import { CalendarSection } from "@/components/calendar-section";
import { PageShell } from "@/components/page-shell";
import { calendarPageSize, getCalendarFocus } from "@/lib/calendar";
import { getWorldCupData } from "@/lib/data";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fixtures and Results",
  description:
    "Browse the FIFA World Cup 2026 match calendar with localized kickoff times, venues and completed results.",
};

type CalendarPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const data = getWorldCupData();
  const params = await searchParams;
  const page = Number.parseInt(params?.page ?? "", 10);
  const { current, next, sorted } = getCalendarFocus(data.matches ?? []);
  const focus = current ?? next;

  if (!params?.page && focus) {
    const focusIndex = sorted.findIndex((match) => match.id === focus.id);
    const focusPage =
      Math.floor(Math.max(0, focusIndex) / calendarPageSize) + 1;

    redirect(`/calendar?page=${focusPage}#${focus.id}`);
  }

  return (
    <PageShell
      active="calendar"
      data={data}
      source={data.sources?.fixtures ?? data.source}
    >
      <CalendarSection matches={data.matches ?? []} page={page} />
    </PageShell>
  );
}
