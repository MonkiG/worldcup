import type { ReactNode } from "react";
import { SiteFooter, SiteHeader, type NavKey } from "./site-chrome";
import type { WorldCupData } from "@/lib/types";

export function PageShell({
  active,
  children,
  data,
  source,
}: {
  active: NavKey;
  children: ReactNode;
  data: WorldCupData;
  source: string;
}) {
  return (
    <main id="top">
      <SiteHeader active={active} data={data} />
      {children}
      <SiteFooter source={source} />
    </main>
  );
}
