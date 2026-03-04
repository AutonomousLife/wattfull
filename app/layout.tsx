
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wattfull — Energy Decisions, Done Right",
  description: "Free EV savings calculators, solar ROI tools, and honest gear reviews. Real data, not guesses.",
  keywords: "EV calculator, solar ROI, power station reviews, energy savings, electric vehicle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}