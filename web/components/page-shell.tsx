import type { ReactNode } from "react";
import { SiteFooter, SiteHeader, type NavKey } from "./site-chrome";

export function PageShell({
  active,
  children,
  source,
}: {
  active: NavKey;
  children: ReactNode;
  source: string;
}) {
  return (
    <main id="top">
      <SiteHeader active={active} />
      {children}
      <SiteFooter source={source} />
    </main>
  );
}
