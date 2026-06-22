import Link from "next/link";

export type NavKey = "home" | "groups" | "bracket" | "qualification" | "calendar";

const navItems: Array<{ key: NavKey; href: string; label: string }> = [
  { key: "groups", href: "/groups", label: "Groups" },
  { key: "calendar", href: "/calendar", label: "Calendar" },
  { key: "bracket", href: "/bracket", label: "Knockout" },
  { key: "qualification", href: "/qualification", label: "Best thirds" },
];

export function SiteHeader({ active = "home" }: { active?: NavKey }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="World Cup 2026 home">
        <span className="brand__ball">26</span>
        <span>
          <strong>World Cup Tracker</strong>
          <small>Canada / Mexico / USA</small>
        </span>
      </Link>

      <nav aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            aria-current={active === item.key ? "page" : undefined}
            className={active === item.key ? "is-active" : undefined}
            href={item.href}
            key={item.key}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="live-pill">
        <span />
        Provisional data
      </div>
    </header>
  );
}

export function SiteFooter({ source }: { source: string }) {
  return (
    <footer className="site-footer">
      <div className="brand brand--footer">
        <span className="brand__ball">26</span>
        <span>
          <strong>World Cup Tracker</strong>
          <small>Independent bracket project</small>
        </span>
      </div>
      <p>
        Data sourced from FIFA and marked provisional until all relevant results
        are final.
      </p>
      <div className="footer-links">
        <a href={source} target="_blank" rel="noreferrer">
          FIFA source
        </a>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}
