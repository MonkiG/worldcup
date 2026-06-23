import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "World Cup 2026 Tracker",
    template: "%s | World Cup 2026 Tracker",
  },
  description:
    "Follow FIFA World Cup 2026 group standings, fixtures, results, best third-place teams and projected knockout bracket.",
  applicationName: "World Cup 2026 Tracker",
  keywords: [
    "World Cup 2026",
    "FIFA World Cup",
    "World Cup standings",
    "World Cup fixtures",
    "World Cup bracket",
    "World Cup results",
    "best third-place teams",
  ],
  authors: [{ name: "World Cup Tracker" }],
  creator: "World Cup Tracker",
  publisher: "World Cup Tracker",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "World Cup 2026 Tracker",
    description:
      "Group standings, fixture results, qualification watch and projected World Cup 2026 knockout bracket.",
    type: "website",
    locale: "en_US",
    siteName: "World Cup 2026 Tracker",
  },
  twitter: {
    card: "summary",
    title: "World Cup 2026 Tracker",
    description:
      "Track World Cup 2026 standings, fixtures, results and knockout bracket projections.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
