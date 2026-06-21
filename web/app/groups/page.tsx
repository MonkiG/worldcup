import { GroupTable } from "@/components/group-table";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getWorldCupData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function GroupsPage() {
  const data = getWorldCupData();

  return (
    <main id="top">
      <SiteHeader active="groups" />

      <section className="content-section page-section" id="groups">
        <header className="section-heading">
          <div>
            <span className="eyebrow">Group stage</span>
            <h2>Standings</h2>
          </div>
          <div className="section-heading__meta">
            <p>
              Top two qualify automatically. The eight strongest third-place
              teams also advance.
            </p>
            <div className="legend">
              <span>
                <i className="legend__direct" /> Direct
              </span>
              <span>
                <i className="legend__third" /> Best-third race
              </span>
            </div>
          </div>
        </header>

        <div className="groups-grid">
          {data.groups.map((group) => (
            <GroupTable group={group} key={group.group} />
          ))}
        </div>
      </section>

      <SiteFooter source={data.source} />
    </main>
  );
}
