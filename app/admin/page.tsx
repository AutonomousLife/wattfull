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

export default async function AdminPage() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("wf_admin")?.value;
  if (adminCookie !== (process.env.ADMIN_PASSWORD ?? "admin")) {
    redirect("/admin/login");
  }

  try {
    const [pendingLinks, allLinks, emailCount, flaggedVotes, dataRows, approvedCount] = await Promise.all([
      db.select().from(userLinks).where(eq(userLinks.status, "pending")).orderBy(desc(userLinks.createdAt)),
      db.select({ c: count() }).from(userLinks),
      db.select({ c: count() }).from(emailSubscribers),
      db.select().from(votes).where(eq(votes.flagged, true)).orderBy(desc(votes.createdAt)).limit(50),
      db.select().from(dataStatus),
      db.select({ c: count() }).from(userLinks).where(eq(userLinks.status, "approved")),
    ]);

    return (
      <main style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#10b981" }}>Wattfull Admin</h1>
              <p style={{ color: "#94a3b8", marginTop: 4 }}>
                {allLinks[0]?.c ?? 0} links | {emailCount[0]?.c ?? 0} subscribers | {approvedCount[0]?.c ?? 0} approved
              </p>
            </div>
            <a href="/" style={{ color: "#94a3b8", fontSize: 13, textDecoration: "none" }}>Back to site</a>
          </div>

          <Section title={`Data Pipeline Status (${dataRows.length})`}>
            {dataRows.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No ingest jobs have completed yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155" }}>
                    {["Dataset", "Last Success", "Age", "Rows", "Last Error"].map((heading) => (
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
                  <div key={link.id} style={{ background: "#1e293b", borderRadius: 10, padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{link.title}</div>
                      <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>
                        Category: <b>{link.category}</b> | Code: <code style={{ background: "#0f172a", padding: "1px 5px", borderRadius: 3 }}>{link.code}</code>
                      </div>
                      {link.url ? <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", fontSize: 12 }}>{link.url.slice(0, 80)}</a> : null}
                      <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>Submitted {formatDate(link.createdAt)} | Reports: {link.reportCount}</div>
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
            <p style={{ color: "#94a3b8", fontSize: 14 }}>
              Full JSON export remains available at <a href="/api/admin" target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>/api/admin</a> while authenticated.
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
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #334155" }}>{title}</h2>
      {children}
    </section>
  );
}
