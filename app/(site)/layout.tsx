import { ThemeProvider } from "@/lib/ThemeContext";
import { SiteShell } from "@/components/SiteShell";

/**
 * Layout for all primary site pages (/, /ev, /solar, /gear, …).
 * Wraps with ThemeProvider so useTheme() works in every child component,
 * then SiteShell adds the sticky nav, footer, and chat widget.
 *
 * SEO routes (/ev-charging-cost, /cost-to-own, /ev-vs-gas) and /admin
 * are intentionally OUTSIDE this group and use their own layouts.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SiteShell>{children}</SiteShell>
    </ThemeProvider>
  );
}
