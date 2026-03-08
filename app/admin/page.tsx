import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, userLinks, emailSubscribers, votes, dataStatus } from "@/lib/db/index";
import { desc, count, eq } from "drizzle-orm";
import AdminActions from "./AdminActions";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null | undefined) {
  if (!value) return "-";
  try {
    return new Date(value).toISOString().replace("T", " ").slice(0, 16);
  } catch {
    return "-";
  }
}

function daysSince(value: Date | null | undefined) {
  if (!value) return null;
  return Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
}

function card(title: string, value: string, note: string, tone = "#10b981") {
  return { title, value, note, tone };
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("wf_admin")?.value;
  if (adminCookie !== (process.env.ADMIN_PASSWORD ?? "admin")) {
    redirect("/admin/login");
  }

  try {
    const [pendingLinks, allLinks, emailCount, flaggedVotes, dataRows, approvedCount] = await Promise.all([
      db.select().from(userLinks).where(eq(userLinks.status, "pending")).orderBy(desc(userLinks.createdAt)),
      db.select().from(userLinks),
      db.select({ c: count() }).from(emailSubscribers),
      db.select().from(votes).where(eq(votes.flagged, true)).orderBy(desc(votes.createdAt)).limit(50),
      db.select().from(dataStatus),
      db.select({ c: count() }).from(userLinks).where(eq(userLinks.status, "approved")),
    ]);

    const staleDatasets = dataRows.filter((row) => {
      const age = daysSince(row.lastSuccessAt);
      return age !== null && age > (row.datasetName === "gas_prices" ? 7 : 35);
    });
    const failingDatasets = dataRows.filter((row) => row.lastError);
    const categoryCounts = pendingLinks.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const cards = [
      card("Pending links", String(pendingLinks.length), "Needs review", pendingLinks.length ? "#f59e0b" : "#10b981"),
      card("Approved links", String(approvedCount[0]?.c ?? 0), "Live community inventory"),
      card("Email subscribers", String(emailCount[0]?.c ?? 0), "Stored in newsletter table"),
      card("Stale datasets", String(staleDatasets.length), "Rows older than freshness threshold", staleDatasets.length ? "#ef4444" : "#10b981"),
    ];

    return (
      <main style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 56px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: "#10b981", margin: 0 }}>Wattfull Admin</h1>
              <p style={{ color: "#94a3b8", marginTop: 6, marginBottom: 0 }}>Moderate community content, review dataset freshness, and spot stale operational state before it leaks into the public site.</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="/api/admin" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#0f172a", background: "#d1fae5", padding: "10px 14px", borderRadius: 10, fontWeight: 700 }}>Open admin JSON</a>
              <a href="/" style={{ textDecoration: "none", color: "#cbd5e1", border: "1px solid #334155", padding: "10px 14px", borderRadius: 10, fontWeight: 700 }}>Back to site</a>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
            {cards.map((item) => (
              <div key={item.title} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em" }}>{item.title}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: item.tone, marginTop: 8 }}>{item.value}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>{item.note}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 18, marginBottom: 28 }}>
            <section style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Operations snapshot</div>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ background: "#0f172a", borderRadius: 12, padding: 14, color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}>
                  {staleDatasets.length ? `${staleDatasets.length} datasets are stale enough to review before trusting public freshness signals.` : "No stale datasets currently exceed the configured freshness threshold."}
                </div>
                <div style={{ background: "#0f172a", borderRadius: 12, padding: 14, color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}>
                  {failingDatasets.length ? `${failingDatasets.length} datasets still have a recorded lastError and should be checked in ingest logs.` : "No ingest errors are currently recorded in data_status."}
                </div>
                <div style={{ background: "#0f172a", borderRadius: 12, padding: 14, color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}>
                  Pending link mix: {Object.keys(categoryCounts).length ? Object.entries(categoryCounts).map(([key, value]) => `${key} ${value}`).join(" | ") : "No pending link categories right now."}
                </div>
              </div>
            </section>

            <section style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Recommended next checks</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#cbd5e1", lineHeight: 1.9, fontSize: 13 }}>
                <li>Approve or reject pending referral codes so tabs on the public site stay current.</li>
                <li>Review stale rows in data_status before trusting freshness badges.</li>
                <li>Use /api/admin export if you need a raw snapshot for external review.</li>
                <li>Re-run data ingest jobs if gas or electricity data is old.</li>
              </ul>
            </section>
          </div>

          <Section title={`Data Pipeline Status (${dataRows.length})`}>
            {dataRows.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No ingest jobs have completed yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155" }}>
                    {["Dataset", "Last Success", "Age", "Rows", "Status", "Last Error"].map((heading) => (
                      <th key={heading} style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontWeight: 600 }}>{heading}</th>
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
                        <td style={{ padding: "10px 12px", color: stale ? "#f87171" : "#4ade80" }}>{age !== null ? `${age}d` : "-"}</td>
                        <td style={{ padding: "10px 12px" }}>{row.rowCount ?? "-"}</td>
                        <td style={{ padding: "10px 12px", color: row.lastError ? "#f87171" : stale ? "#f59e0b" : "#4ade80" }}>{row.lastError ? "Failing" : stale ? "Stale" : "Healthy"}</td>
                        <td style={{ padding: "10px 12px", color: "#f87171", fontSize: 12, maxWidth: 300, wordBreak: "break-all" }}>{row.lastError ? row.lastError.slice(0, 120) : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Section>

          <Section title={`Pending Community Links (${pendingLinks.length})`}>
            {pendingLinks.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No pending submissions.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pendingLinks.map((link) => (
                  <div key={link.id} style={{ background: "#111827", borderRadius: 12, padding: "16px 18px", display: "flex", gap: 16, alignItems: "flex-start", border: "1px solid #1f2937" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{link.title}</div>
                      <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>
                        Category: <b>{link.category}</b> | Code: <code style={{ background: "#0f172a", padding: "1px 5px", borderRadius: 3 }}>{link.code}</code>
                      </div>
                      {link.url ? <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", fontSize: 12 }}>{link.url.slice(0, 100)}</a> : null}
                      <div style={{ color: "#64748b", fontSize: 11, marginTop: 6 }}>Submitted {formatDate(link.createdAt)} | Reports: {link.reportCount}</div>
                    </div>
                    <AdminActions id={link.id} />
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title={`Flagged Votes (${flaggedVotes.length})`}>
            {flaggedVotes.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No suspicious vote bursts detected.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155" }}>
                    {["Item", "Direction", "IP Hash", "Device Hash", "Time"].map((heading) => (
                      <th key={heading} style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontWeight: 600 }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flaggedVotes.map((vote) => (
                    <tr key={vote.id} style={{ borderBottom: "1px solid #1e293b" }}>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12 }}>{vote.itemType}/{vote.itemId}</td>
                      <td style={{ padding: "8px 12px", color: vote.direction === "up" ? "#4ade80" : "#f87171" }}>{vote.direction}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 11 }}>{vote.ipHash?.slice(0, 12)}...</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 11 }}>{vote.deviceHash?.slice(0, 12)}...</td>
                      <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{formatDate(vote.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title={`Email Subscribers (${emailCount[0]?.c ?? 0})`}>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7 }}>
              Full JSON export remains available at <a href="/api/admin" target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>/api/admin</a> while authenticated. This is still a lightweight operations surface, not a full CMS.
            </p>
          </Section>
        </div>
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return (
      <main style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 14, padding: "24px 28px" }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f59e0b", marginBottom: 10 }}>Admin is authenticated, but the database is not initialized yet.</h1>
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 18 }}>
              The login succeeded. The admin dashboard then tried to query Neon tables that do not exist yet or are not accessible from the current connection.
            </p>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>Server error</div>
            <pre style={{ background: "#0f172a", borderRadius: 10, padding: "14px 16px", overflowX: "auto", fontSize: 12, color: "#e2e8f0", marginBottom: 18 }}>{message}</pre>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>What to do</div>
            <ol style={{ paddingLeft: 18, color: "#cbd5e1", lineHeight: 1.8 }}>
              <li>Open your Neon project.</li>
              <li>Open the SQL Editor.</li>
              <li>Run the SQL from <code style={{ background: "#0f172a", padding: "2px 6px", borderRadius: 4 }}>lib/db/bootstrap.sql</code>.</li>
              <li>Reload <code style={{ background: "#0f172a", padding: "2px 6px", borderRadius: 4 }}>/admin</code>.</li>
            </ol>
            <p style={{ color: "#94a3b8", marginTop: 16 }}>After that, pending Tesla referral codes should appear here for approval.</p>
          </div>
        </div>
      </main>
    );
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid #334155" }}>{title}</h2>
      {children}
    </section>
  );
}
