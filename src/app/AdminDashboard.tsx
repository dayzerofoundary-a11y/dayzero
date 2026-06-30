/**
 * AdminDashboard — authentication is now server-side.
 *
 * The password is verified by POST /api/v1/admin/login which returns a
 * short-lived session token. All subsequent admin API calls include that
 * token in the Authorization header. The client never compares passwords
 * locally and never reads VITE_ADMIN_PASSWORD.
 */
import { useState } from "react";
import { LockKeyhole } from "lucide-react";

interface Submission {
  id: string;
  name: string;
  email: string;
  role: string;
  affiliation: string;
  category: string;
  idea: string;
  castId: string;
  ip: string;
  createdAt: string;
}

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function AdminDashboard() {
  const [token, setToken]           = useState<string | null>(null);
  const [password, setPassword]     = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading]       = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError]           = useState("");

  // ── Server-side login ────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message ?? "Invalid password");
        return;
      }
      setToken(data.data.token);
      await fetchSubmissions(data.data.token);
    } catch (err: any) {
      setError(`Could not reach the server at "${API}/api/v1/admin/login". Details: ${err?.message || String(err)}`);
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Fetch submissions using server-issued token ──────────────────────────
  const fetchSubmissions = async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/v1/admin/submissions`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401 || res.status === 403) {
        setToken(null);
        setError("Session expired. Please log in again.");
        return;
      }
      const data = await res.json();
      setSubmissions(data.data ?? []);
    } catch {
      setError("Failed to fetch submissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    setToken(null);
    setPassword("");
    setSubmissions([]);
    setError("");
  };

  // ── Login screen ─────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "#131929", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <form onSubmit={handleLogin} style={{ background: "#F4EFE4", padding: "3rem", width: "100%", maxWidth: "400px", border: "1px solid rgba(168,130,44,0.4)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <LockKeyhole size={32} color="#A8822C" style={{ marginBottom: "1rem" }} />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#131929" }}>Admin Portal</h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "#6A6355", marginTop: "0.5rem" }}>Server-authenticated access</p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6A6355", marginBottom: "0.5rem" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(19,25,41,0.25)", padding: "0.5rem 0", fontFamily: "'DM Sans', sans-serif", fontSize: "1rem", color: "#131929", outline: "none" }}
              autoFocus
              required
            />
          </div>

          {error && (
            <div style={{ color: "#8B1A1A", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", marginBottom: "1.5rem" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            style={{ width: "100%", background: "#131929", color: "#F4EFE4", padding: "0.8rem", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", cursor: loginLoading ? "not-allowed" : "pointer", opacity: loginLoading ? 0.7 : 1, transition: "background 0.2s" }}
          >
            {loginLoading ? "Authenticating…" : "Authenticate"}
          </button>
        </form>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#F4EFE4", padding: "4rem 2rem", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: "#131929", marginBottom: "0.5rem" }}>Idea Registry</h1>
            <p style={{ fontSize: "0.9rem", color: "#6A6355" }}>Secure administration panel · DayZero Foundry</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => fetchSubmissions(token)}
              style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "1px solid #A8822C", color: "#A8822C", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Refresh
            </button>
            <button
              onClick={handleLock}
              style={{ padding: "0.6rem 1.2rem", background: "#131929", border: "none", color: "#F4EFE4", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Lock
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: "#8B1A1A", marginBottom: "1.5rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#6A6355" }}>Loading secure records…</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 4px 20px rgba(19,25,41,0.05)" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #131929", textAlign: "left", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#131929" }}>
                  <th style={{ padding: "1.2rem 1rem" }}>Ref ID</th>
                  <th style={{ padding: "1.2rem 1rem" }}>Date</th>
                  <th style={{ padding: "1.2rem 1rem" }}>Submitter</th>
                  <th style={{ padding: "1.2rem 1rem" }}>Category</th>
                  <th style={{ padding: "1.2rem 1rem" }}>Organisation</th>
                  <th style={{ padding: "1.2rem 1rem" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#6A6355" }}>
                      No submissions yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: "1px solid rgba(19,25,41,0.1)", fontSize: "0.85rem", color: "#3F3A30" }}>
                      <td style={{ padding: "1rem", fontFamily: "'Courier New', Courier, monospace", fontWeight: 600, color: "#A8822C" }}>{sub.castId}</td>
                      <td style={{ padding: "1rem" }}>
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <strong>{sub.name}</strong><br />
                        <span style={{ fontSize: "0.75rem", color: "#6A6355" }}>{sub.email}</span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ background: "rgba(168,130,44,0.1)", padding: "0.3rem 0.6rem", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 500, color: "#A8822C" }}>
                          {sub.category || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {sub.affiliation || "—"}<br />
                        <span style={{ fontSize: "0.75rem", color: "#6A6355" }}>{sub.role}</span>
                      </td>
                      <td style={{ padding: "1rem", maxWidth: "300px" }}>
                        <div style={{ maxHeight: "100px", overflowY: "auto", padding: "0.5rem", background: "rgba(19,25,41,0.03)", fontSize: "0.75rem", whiteSpace: "pre-wrap" }}>
                          {sub.idea}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
