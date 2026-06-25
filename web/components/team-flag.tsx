"use client";

import { useState } from "react";

export function TeamFlag({
  className = "team-mark__flag",
  code,
  fallbackClassName = "team-mark__code",
  name,
}: {
  className?: string;
  code: string;
  fallbackClassName?: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={fallbackClassName}>{code}</span>;
  }

  return (
    <img
      alt={`${name} flag`}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
      src={`/flags/${encodeURIComponent(code)}.png`}
    />
  );
}
