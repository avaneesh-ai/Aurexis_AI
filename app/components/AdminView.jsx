"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/lib/store";

export default function AdminView() {
  const [users, setUsers] = useState([]);
  useEffect(() => setUsers(getUsers()), []);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "34px 30px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h1 style={{ fontSize: 32 }}>Admin</h1>
        <span className="pill">this device only</span>
      </div>
      <p style={{ color: "var(--text-2)", margin: "6px 0 8px", maxWidth: 640 }}>
        Everyone who has registered an account. This tab is only visible on
        devices where the admin key has been entered.
      </p>
      <div
        className="card"
        style={{ padding: "12px 15px", marginBottom: 22, fontSize: 13, color: "var(--text-3)", borderColor: "var(--line-strong)" }}
      >
        ℹ️ With the default browser-storage setup, this lists accounts created on
        <b style={{ color: "var(--text-2)" }}> this device</b>. To see users from every device in real time,
        connect a shared database — see the README (“Going cross-device”). The
        table below already renders whatever the data layer returns, so no UI
        changes are needed after you switch.
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-3)" }}>
                {["Name", "Email", "Mobile", "Verified", "Plan", "Device", "Joined", "Last login"].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ ...td, textAlign: "center", color: "var(--text-3)" }}>
                    No registered users on this device yet.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={td}>{u.name || "—"}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>{u.mobile || "—"}</td>
                  <td style={td}>
                    {u.verified ? <span style={{ color: "var(--ok)" }}>✓ yes</span> : <span style={{ color: "var(--text-3)" }}>pending</span>}
                  </td>
                  <td style={td}>{u.pro ? <span style={{ color: "var(--gold-bright)" }}>Pro</span> : "Free"}</td>
                  <td style={td}>{u.device || "—"}</td>
                  <td style={td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                  <td style={td}>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 14 }}>
        {users.length} account{users.length === 1 ? "" : "s"} registered.
      </p>
    </div>
  );
}

const th = { padding: "13px 15px", fontWeight: 600, whiteSpace: "nowrap" };
const td = { padding: "12px 15px", whiteSpace: "nowrap", color: "var(--text-2)" };
