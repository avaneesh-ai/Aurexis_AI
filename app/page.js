"use client";

import { useEffect, useState } from "react";
import { Logo, Mark } from "./components/Logo";
import AuthFlow from "./components/AuthFlow";
import ChatView from "./components/ChatView";
import ProjectsView from "./components/ProjectsView";
import CoworkView from "./components/CoworkView";
import SettingsView from "./components/SettingsView";
import AdminView from "./components/AdminView";
import ProModal from "./components/ProModal";
import ThemeToggle from "./components/ThemeToggle";
import InstallButton from "./components/InstallButton";
import {
  getSession,
  clearSession,
  isAdminDevice,
  updateUser,
} from "@/lib/store";

const NAV = [
  { id: "chat", label: "Aurexis", icon: "✦" },
  { id: "projects", label: "Projects", icon: "◫" },
  { id: "cowork", label: "Co-work", icon: "⌘" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export default function Home() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [section, setSection] = useState("chat");
  const [admin, setAdmin] = useState(false);
  const [proOpen, setProOpen] = useState(false);

  useEffect(() => {
    setUser(getSession());
    setAdmin(isAdminDevice());
    setReady(true);
  }, []);

  if (!ready)
    return (
      <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <div style={{ animation: "pulse 1.4s ease-in-out infinite" }}>
          <Mark size={56} />
        </div>
      </div>
    );

  if (!user) return <AuthFlow onAuthed={(u) => setUser(u)} />;

  function signOut() {
    clearSession();
    setUser(null);
    setSection("chat");
  }

  function activatePro() {
    const updated = updateUser(user.id, { pro: true });
    setUser(updated);
    setProOpen(false);
  }

  const isPro = !!user.pro;
  const nav = admin ? [...NAV, { id: "admin", label: "Admin", icon: "🛡" }] : NAV;

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
      {/* Sidebar */}
      <nav
        style={{
          width: 244,
          flexShrink: 0,
          borderRight: "1px solid var(--line)",
          background: "color-mix(in srgb, var(--bg-2) 78%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          padding: 16,
        }}
      >
        <div style={{ padding: "8px 6px 22px" }}>
          <Logo size={34} />
        </div>

        {nav.map((n) => {
          const on = section === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                textAlign: "left",
                padding: "11px 13px",
                marginBottom: 4,
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 14.5,
                fontWeight: on ? 600 : 500,
                color: on ? "var(--text)" : "var(--text-2)",
                background: on ? "var(--accent-weak)" : "transparent",
                border: on ? "1px solid var(--accent-line)" : "1px solid transparent",
                transition: "background 0.18s, color 0.18s, border-color 0.18s",
              }}
            >
              <span
                style={{
                  width: 20,
                  textAlign: "center",
                  color: on ? "var(--accent-bright)" : "var(--text-3)",
                }}
              >
                {n.icon}
              </span>
              {n.label}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        <InstallButton />

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <ThemeToggle />
        </div>

        {!isPro && (
          <button
            onClick={() => setProOpen(true)}
            className="card"
            style={{
              padding: 14,
              cursor: "pointer",
              textAlign: "left",
              marginBottom: 12,
              borderColor: "var(--accent-line)",
            }}
          >
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15 }}>
              <span className="grad-text">Aurexis Pro</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
              Faster &amp; more innovative · $25/yr
            </div>
          </button>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              background: "var(--grad)",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {(user.name || user.email)[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name || "You"}{" "}
              {isPro && <span style={{ color: "var(--accent-bright)" }}>· Pro</span>}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        {section === "chat" && <ChatView user={user} />}
        {section === "projects" && <ProjectsView user={user} />}
        {section === "cowork" && <CoworkView user={user} />}
        {section === "settings" && (
          <SettingsView
            user={user}
            isPro={isPro}
            onUpgrade={() => setProOpen(true)}
            onSignOut={signOut}
            onUserUpdate={(u) => u && setUser(u)}
            onAdminChange={(v) => setAdmin(v)}
          />
        )}
        {section === "admin" && admin && <AdminView />}
      </main>

      {proOpen && (
        <ProModal isPro={isPro} onClose={() => setProOpen(false)} onUpgrade={activatePro} />
      )}
    </div>
  );
}
