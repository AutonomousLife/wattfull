import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wattfull.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wattfull - Energy Decisions, Done Right",
    template: "%s | Wattfull",
  },
  description: "Free EV savings calculators, solar ROI tools, ownership comparisons, and honest gear recommendations built on transparent assumptions.",
  keywords: [
    "EV calculator",
    "solar ROI",
    "EV vs gas",
    "energy savings",
    "state incentives",
    "power station reviews",
  ],
  openGraph: {
    title: "Wattfull - Energy Decisions, Done Right",
    description: "Data-driven EV, solar, and ownership decisions with transparent assumptions and premium tools.",
    url: siteUrl,
    siteName: "Wattfull",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wattfull - Energy Decisions, Done Right",
    description: "Data-driven EV, solar, and ownership decisions with transparent assumptions and premium tools.",
  },
};

const darkModeScript = `
(function() {
  try {
    var saved = localStorage.getItem('wattfull-dark');
    var dark = saved !== null ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
