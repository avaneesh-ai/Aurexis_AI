"use client";

import { useEffect, useState } from "react";
import { CURATED_MODELS } from "@/lib/models";
import ThemeToggle from "./ThemeToggle";
import {
  updateUser,
  getPrefs,
  savePrefs,
  setAdminDevice,
  isAdminDevice,
} from "@/lib/store";

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 22, marginBottom: 18 }}>
      <h3 style={{ fontSize: 18, marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}

export default function SettingsView({ user, isPro, onUpgrade, onSignOut, onUserUpdate, onAdminChange }) {
  const [name, setName] = useState(user.name || "");
  const [mobile, setMobile] = useState(user.mobile || "");
  const [model, setModel] = useState("llama3.2");
  const [savedMsg, setSavedMsg] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [adminMsg, setAdminMsg] = useState("");
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setModel(getPrefs(user.id).model || "llama3.2");
    setAdmin(isAdminDevice());
  }, [user.id]);

  function saveProfile() {
    const updated = updateUser(user.id, { name, mobile });
    onUserUpdate?.(updated);
    setSavedMsg("Saved!");
    setTimeout(() => setSavedMsg(""), 1500);
  }

  function saveModel(tag) {
    setModel(tag);
    savePrefs(user.id, { ...getPrefs(user.id), model: tag });
  }

  async function unlockAdmin() {
    setAdminMsg("");
    try {
      const res = await fetch("/api/admin-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey }),
      });
      const data = await res.json();
      if (data.ok) {
        setAdminDevice(true);
        setAdmin(true);
        setAdminKey("");
        setAdminMsg("Admin unlocked on this device.");
        onAdminChange?.(true);
      } else {
        setAdminMsg("That key is incorrect.");
      }
    } catch {
      setAdminMsg("Couldn't verify the key.");
    }
  }

  function lockAdmin() {
    setAdminDevice(false);
    setAdmin(false);
    onAdminChange?.(false);
  }

  function exportData() {
    const dump = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("aurexis")) dump[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "aurexis-data.json";
    a.click();
  }

  function clearMine() {
    if (!confirm("Clear your chats, projects and co-work on this device?")) return;
    [`aurexis.chats.${user.id}`, `aurexis.projects.${user.id}`, `aurexis.cowork.${user.id}`].forEach((k) =>
      localStorage.removeItem(k)
    );
    location.reload();
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "34px 30px 60px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 22 }}>Settings</h1>

      <Section title="Profile">
        <div style={{ marginBottom: 14 }}>
          <label className="label">Email</label>
          <input className="input" value={user.email} disabled style={{ opacity: 0.6 }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="label">Mobile</label>
          <input className="input" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={saveProfile}>Save profile</button>
          {savedMsg && <span style={{ color: "var(--ok)" }}>{savedMsg}</span>}
        </div>
      </Section>

      <Section title="Appearance">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 15 }}>Background &amp; theme</div>
            <div style={{ color: "var(--text-3)", fontSize: 13 }}>
              Switch between the dark and light backgrounds anytime.
            </div>
          </div>
          <ThemeToggle />
        </div>
      </Section>

      <Section title="Default model">
        <p style={{ color: "var(--text-3)", marginTop: 0, fontSize: 13.5 }}>
          The Ollama model new chats start with.
        </p>
        <select
          className="input"
          value={model}
          onChange={(e) => saveModel(e.target.value)}
          style={{ appearance: "none" }}
        >
          {CURATED_MODELS.map((m) => (
            <option key={m.tag} value={m.tag} style={{ background: "var(--panel-solid)" }}>
              {m.name} · {m.size}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Subscription">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 15 }}>
              Current plan: <b style={{ color: isPro ? "var(--gold-bright)" : "var(--text)" }}>{isPro ? "Aurexis Pro" : "Free"}</b>
            </div>
            <div style={{ color: "var(--text-3)", fontSize: 13 }}>
              {isPro ? "Faster, more innovative, no limits." : "Upgrade for faster projects and richer answers — $25/yr."}
            </div>
          </div>
          {!isPro && <button className="btn btn-primary" onClick={onUpgrade}>Upgrade to Pro</button>}
        </div>
      </Section>

      <Section title="Admin access">
        <p style={{ color: "var(--text-3)", marginTop: 0, fontSize: 13.5 }}>
          Unlock the Admin tab on this device. It stays hidden everywhere else.
        </p>
        {admin ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--ok)" }}>✓ Admin is enabled on this device.</span>
            <button className="btn btn-ghost" onClick={lockAdmin}>Disable</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <input
              className="input"
              type="password"
              placeholder="Enter admin key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && unlockAdmin()}
            />
            <button className="btn btn-primary" onClick={unlockAdmin}>Unlock</button>
          </div>
        )}
        {adminMsg && <p style={{ fontSize: 13, marginTop: 10, color: admin ? "var(--ok)" : "var(--danger)" }}>{adminMsg}</p>}
      </Section>

      <Section title="Your data">
        <p style={{ color: "var(--text-3)", marginTop: 0, fontSize: 13.5 }}>
          Aurexis keeps you signed in and stores your work on this device.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={exportData}>Export my data</button>
          <button className="btn btn-ghost" onClick={clearMine} style={{ color: "var(--danger)" }}>
            Clear my content
          </button>
        </div>
      </Section>

      <button className="btn btn-ghost" onClick={onSignOut} style={{ width: "100%", color: "var(--danger)" }}>
        Sign out
      </button>
    </div>
  );
}
