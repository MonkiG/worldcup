import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  heading,
  meta,
  tone = "default",
}: {
  eyebrow: string;
  heading: string;
  meta: ReactNode;
  tone?: "default" | "light";
}) {
  return (
    <header
      className={`section-heading ${
        tone === "light" ? "section-heading--light" : ""
      }`}
    >
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{heading}</h2>
      </div>
      <div className="section-heading__meta">{meta}</div>
    </header>
  );
}
