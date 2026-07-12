import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wattfull.com";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F1EC" },
    { media: "(prefers-color-scheme: dark)", color: "#111113" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
<<<<<<< ours
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
=======
  title: "Wattfull — Energy Decisions, Done Right",
  description: "Compare EVs and energy gear, estimate runtime, visualize carbon impact, and share savings.",
>>>>>>> theirs
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
<<<<<<< ours
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
      </head>
      <body>{children}</body>
=======
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
>>>>>>> theirs
    </html>
  );
}
