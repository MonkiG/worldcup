"use client";

import { useEffect, useState } from "react";

type LocalTime = {
  date: string;
  day: string;
  time: string;
};

function formatLocalTime(value: string): LocalTime {
  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date),
    day: new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
    }).format(date),
    time: new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date),
  };
}

function formatUtcFallback(value: string): LocalTime {
  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date),
    day: new Intl.DateTimeFormat("en", {
      day: "2-digit",
      timeZone: "UTC",
    }).format(date),
    time: new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    }).format(date),
  };
}

export function LocalMatchDate({ value }: { value: string }) {
  const [local, setLocal] = useState<LocalTime | null>(null);
  const fallback = formatUtcFallback(value);

  useEffect(() => {
    setLocal(formatLocalTime(value));
  }, [value]);

  return <>{local?.date ?? fallback.date}</>;
}

export function LocalMatchDay({ value }: { value: string }) {
  const [local, setLocal] = useState<LocalTime | null>(null);
  const fallback = formatUtcFallback(value);

  useEffect(() => {
    setLocal(formatLocalTime(value));
  }, [value]);

  return <>{local?.day ?? fallback.day}</>;
}

export function LocalMatchTime({ value }: { value: string }) {
  const [local, setLocal] = useState<LocalTime | null>(null);
  const fallback = formatUtcFallback(value);

  useEffect(() => {
    setLocal(formatLocalTime(value));
  }, [value]);

  return <>{local?.time ?? fallback.time}</>;
}
