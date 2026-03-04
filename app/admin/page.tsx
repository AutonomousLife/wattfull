import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, userLinks, emailSubscribers, votes, dataStatus } from "@/lib/db/index";
import { eq, and, desc, count } from "drizzle-orm";
import AdminActions from "./AdminActions";

export const dynamic = "force-dynamic";

function formatDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function daysSince(d: Date | null | undefined) {
  if (!d) return null;
  return Math.round((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
}

export default async function AdminPage() {
  // Auth check (belt+suspenders — middleware handles redirect, this is a guard)
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("wf_admin")?.value;
  if (adminCookie !== (process.env.ADMIN_PASSWORD ?? "admin")) {
    redirect("/admin/login");
  }

  const [
    pendingLinks,
    allLinks,
    emailCount,
    flaggedVotes,
    dataRows,
  ] = await Promise.all([
    db.select().from(userLinks).where(eq(userLinks.status, "pending")).orderBy(desc(userLinks.createdAt)),
    db.select({ c: count() }).from(userLinks),
    db.select({ c: count() }).from(emailSubscribers),
    db.select().from(votes).where(eq(votes.flagged, true)).orderBy(desc(votes.createdAt)).limit(50),
    db.select().from(dataStatus),
  ]);

  const approvedCount = await db.select({ c: count() }).from(userLinks).where(eq(userLinks.status, "approved"));

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#10b981" }}>⚡ Wattfull Admin</h1>
            <p style={{ color: "#94a3b8", marginTop: 4 }}>
              {allLinks[0]?.c} links · {emailCount[0]?.c} subscribers · {approvedCount[0]?.c} approved
            </p>
          </div>
          <a href="/" style={{ color: "#94a3b8", fontSize: 13, textDecoration: "none" }}>← Back to site</a>
        </div>

        {/* Data Freshness */}
        <Section title="📊 Data Pipeline Status">
          {dataRows.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No ingest jobs run yet. Trigger manually: <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: 4 }}>GET /api/ingest/electricity</code> or <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: 4 }}>GET /api/ingest/gas</code></p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155" }}>
                  {["Dataset", "Last Success", "Age (days)", "Rows", "Last Error"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row) => {
                  const age = daysSince(row.lastSuccessAt);
                  const stale = row.datasetName === "gas_prices" ? age !== null && age > 7 : age !== null && age > 35;
                  return (
                    <tr key={row.id} style={{ borderBottom: "1px solid #1e293b" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>{row.datasetName}</td>
                      <td style={{ padding: "10px 12px" }}>{formatDate(row.lastSuccessAt)}</td>
                      <td style={{ padding: "10px 12px", color: stale ? "#f87171" : "#4ade80" }}>
                        {age !== null ? `${age}d ${stale ? "⚠" : "✓"}` : "—"}
                      </td>
                      <td style={{ padding: "10px 12px" }}>{row.rowCount ?? "—"}</td>
                      <td style={{ padding: "10px 12px", color: "#f87171", fontSize: 12, maxWidth: 300, wordBreak: "break-all" }}>
                        {row.lastError ? row.lastError.slice(0, 120) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Section>

        {/* Pending Links */}
        <Section title={`🔗 Pending Community Links (${pendingLinks.length})`}>
          {pendingLinks.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No pending submissions.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pendingLinks.map((link) => (
                <div key={link.id} style={{ background: "#1e293b", borderRadius: 10, padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{link.title}</div>
                    <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>
                      Category: <b>{link.category}</b> · Code: <code style={{ background: "#0f172a", padding: "1px 5px", borderRadius: 3 }}>{link.code}</code>
                    </div>
                    {link.url && (
                      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", fontSize: 12 }}>
                        {link.url.slice(0, 80)}
                      </a>
                    )}
                    <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
                      Submitted {formatDate(link.createdAt)} · Reports: {link.reportCount}
                    </div>
                  </div>
                  <AdminActions id={link.id} />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Flagged Votes */}
        <Section title={`🚩 Flagged Votes (${flaggedVotes.length})`}>
          {flaggedVotes.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No burst/spam voting detected.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155" }}>
                  {["Item", "Direction", "IP Hash", "Device Hash", "Time"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flaggedVotes.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid #1e293b" }}>
                    <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12 }}>{v.itemType}/{v.itemId}</td>
                    <td style={{ padding: "8px 12px", color: v.direction === "up" ? "#4ade80" : "#f87171" }}>{v.direction}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 11 }}>{v.ipHash?.slice(0, 12)}…</td>
                    <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 11 }}>{v.deviceHash?.slice(0, 12)}…</td>
                    <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{formatDate(v.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Email Subscribers */}
        <Section title={`📧 Email Subscribers (${emailCount[0]?.c ?? 0})`}>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            Download full list:{" "}
            <a
              href="/api/admin"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#60a5fa" }}
            >
              GET /api/admin (JSON export)
            </a>
          </p>
        </Section>

      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #334155" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
