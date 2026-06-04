"use client";

// Aurexis mark: the uploaded glowing aperture "A". It's designed on a dark
// field, so we present it inside a rounded near-black tile with an accent
// glow — reads as a crisp app icon on BOTH the dark and light themes.
export function Mark({ size = 36, glow = true }) {
  const pad = Math.round(size * 0.1);
  return (
    <span
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: "radial-gradient(120% 120% at 50% 18%, #11142b 0%, #05060f 100%)",
        border: "1px solid var(--line-strong)",
        boxShadow: glow
          ? "0 0 0 1px rgba(91,140,255,0.12), 0 10px 28px -10px rgba(91,140,255,0.55)"
          : "none",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <img
        src="/logo.png"
        alt="Aurexis"
        width={size - pad * 2}
        height={size - pad * 2}
        style={{ display: "block", objectFit: "contain" }}
      />
    </span>
  );
}

export function Logo({ size = 34, word = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Mark size={size} />
      {word && (
        <span
          className="grad-text"
          style={{
            fontFamily: "var(--display)",
            fontWeight: 700,
            fontSize: size * 0.62,
            letterSpacing: "-0.02em",
          }}
        >
          Aurexis
        </span>
      )}
    </div>
  );
}
