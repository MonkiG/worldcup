"use client";

import { useMemo, useState } from "react";
import { calendarPageSize, fixtureDayKey } from "@/lib/calendar";
import type { FixtureMatch } from "@/lib/types";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthKey(value: string) {
  return fixtureDayKey(value).slice(0, 7);
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function monthDays(value: string) {
  const [year, month] = value.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    days: Array.from({ length: daysInMonth }, (_, index) => index + 1),
    month,
    startOffset: firstDay.getUTCDay(),
    year,
  };
}

function knockoutTone(round = "") {
  const normalized = round.toLowerCase();
  if (normalized === "final") return "final";
  if (normalized.includes("third")) return "third-place";
  if (normalized.includes("semi")) return "semi-final";
  if (normalized.includes("quarter")) return "quarter-final";
  return null;
}

function dayTone(matches: FixtureMatch[]) {
  if (matches.some((match) => knockoutTone(match.round) === "final")) {
    return "final";
  }
  if (matches.some((match) => knockoutTone(match.round) === "third-place")) {
    return "third-place";
  }
  if (matches.some((match) => knockoutTone(match.round) === "semi-final")) {
    return "semi-final";
  }
  if (matches.some((match) => knockoutTone(match.round) === "quarter-final")) {
    return "quarter-final";
  }

  return null;
}

export function FixtureMiniCalendar({
  focusDate,
  matches,
}: {
  focusDate?: string;
  matches: FixtureMatch[];
}) {
  const sorted = useMemo(
    () => [...matches].sort((left, right) => left.date.localeCompare(right.date)),
    [matches],
  );
  const months = useMemo(
    () => [...new Set(sorted.map((match) => monthKey(match.date)))],
    [sorted],
  );
  const initialMonth = Math.max(
    0,
    months.findIndex((month) => Boolean(focusDate && monthKey(focusDate) === month)),
  );
  const [monthIndex, setMonthIndex] = useState(initialMonth);
  const activeMonth = months[monthIndex] ?? months[0];
  const matchIndex = new Map(sorted.map((match, index) => [match.id, index]));
  const matchesByDay = new Map<string, FixtureMatch[]>();

  for (const match of sorted) {
    const key = fixtureDayKey(match.date);
    matchesByDay.set(key, [...(matchesByDay.get(key) ?? []), match]);
  }

  if (!activeMonth) return null;

  const { days, month, startOffset, year } = monthDays(activeMonth);
  const activeMonthMatches = sorted.filter(
    (match) => monthKey(match.date) === activeMonth,
  );
  const todayKey = fixtureDayKey(new Date().toISOString());

  return (
    <div className="fixture-calendar" aria-label="Fixture calendar by month">
      <article className="fixture-calendar__month">
        <header>
          <button
            aria-label="Previous fixture month"
            disabled={monthIndex === 0}
            onClick={() => setMonthIndex((value) => Math.max(0, value - 1))}
            type="button"
          >
            &lt;
          </button>
          <div>
            <strong>{monthLabel(activeMonth)}</strong>
            <span>{activeMonthMatches.length} matches</span>
          </div>
          <button
            aria-label="Next fixture month"
            disabled={monthIndex >= months.length - 1}
            onClick={() =>
              setMonthIndex((value) => Math.min(months.length - 1, value + 1))
            }
            type="button"
          >
            &gt;
          </button>
        </header>
        <div className="fixture-calendar__weekdays">
          {weekdayLabels.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="fixture-calendar__days">
          {Array.from({ length: startOffset }).map((_, index) => (
            <span
              aria-hidden="true"
              className="fixture-calendar__blank"
              key={`blank-${activeMonth}-${index}`}
            />
          ))}
          {days.map((day) => {
            const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayMatches = matchesByDay.get(key) ?? [];
            const firstMatch = dayMatches[0];
            const firstIndex = firstMatch ? matchIndex.get(firstMatch.id) ?? 0 : 0;
            const targetPage = Math.floor(firstIndex / calendarPageSize) + 1;
            const tone = dayTone(dayMatches);
            const todayClass =
              key === todayKey ? " fixture-calendar__day--today" : "";

            if (!firstMatch) {
              return (
                <span className={`fixture-calendar__day${todayClass}`} key={key}>
                  {day}
                </span>
              );
            }

            return (
              <a
                className={`fixture-calendar__day fixture-calendar__day--match${
                  tone ? ` fixture-calendar__day--${tone}` : ""
                }${todayClass}`}
                href={`/calendar?page=${targetPage}#day-${key}`}
                key={key}
              >
                <strong>{day}</strong>
                <span>{dayMatches.length}</span>
              </a>
            );
          })}
        </div>
      </article>
    </div>
  );
}
