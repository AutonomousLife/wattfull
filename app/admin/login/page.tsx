import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * /admin/login — simple password gate for the admin dashboard.
 * Sets httpOnly cookie on success, redirects to /admin.
 */

async function loginAction(formData: FormData) {
  "use server";
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";
  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set("wf_admin", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });
    redirect("/admin");
  }
  // Wrong password — let form re-render with error
  redirect("/admin/login?error=1");
}

export default function AdminLoginPage({ searchParams }: { searchParams: { error?: string; from?: string } }) {
  const hasError = searchParams.error === "1";

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
      <div style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: "40px 32px",
        width: "100%",
        maxWidth: 380,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <h1 style={{ color: "#f8fafc", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          ⚡ Wattfull Admin
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28 }}>
          Enter your admin password to continue.
        </p>

        {hasError && (
          <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16, background: "rgba(239,68,68,0.1)", padding: "8px 12px", borderRadius: 6 }}>
            Incorrect password. Try again.
          </p>
        )}

        <form action={loginAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="password"
            name="password"
            placeholder="Admin password"
            required
            autoFocus
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#f8fafc",
              fontSize: 15,
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              background: "#10b981",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
            }}
          >
            Sign In →
          </button>
        </form>
      </div>
    </main>
  );
}
