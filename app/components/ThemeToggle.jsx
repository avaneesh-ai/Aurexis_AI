"use client";

import { useEffect, useState } from "react";
import { getTheme, setTheme } from "@/lib/theme";

// Compact, premium dark/light switch. The active half slides under a
// gradient pill; clicking either side swaps the whole app's background.
export default function ThemeToggle({ compact = false }) {
  const [theme, setT] = useState("dark");

  useEffect(() => {
    setT(getTheme());
  }, []);

  function choose(next) {
    setTheme(next);
    setT(next);
  }

  const isDark = theme === "dark";

  return (
    <div
      role="group"
      aria-label="Theme"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        padding: 4,
        borderRadius: 999,
        border: "1px solid var(--line)",
        background: "var(--panel)",
        backdropFilter: "blur(10px)",
        gap: 2,
        userSelect: "none",
      }}
    >
      {/* sliding highlight */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 4,
          left: isDark ? 4 : "calc(50% + 0px)",
          width: "calc(50% - 4px)",
          height: "calc(100% - 8px)",
          borderRadius: 999,
          background: "var(--grad)",
          transition: "left 0.28s cubic-bezier(0.2,0.7,0.2,1)",
          boxShadow: "0 6px 18px -8px rgba(91,140,255,0.7)",
        }}
      />
      {[
        { id: "dark", icon: "☾", label: "Dark" },
        { id: "light", icon: "☀", label: "Light" },
      ].map((o) => {
        const active = theme === o.id;
        return (
          <button
            key={o.id}
            onClick={() => choose(o.id)}
            aria-pressed={active}
            title={`${o.label} mode`}
            style={{
              position: "relative",
              zIndex: 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: compact ? "6px 12px" : "7px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              color: active ? "#fff" : "var(--text-3)",
              transition: "color 0.2s",
            }}
          >
            <span style={{ fontSize: 14 }}>{o.icon}</span>
            {!compact && o.label}
          </button>
        );
      })}
    </div>
  );
}
