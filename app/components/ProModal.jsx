"use client";

import { useEffect, useState } from "react";

const PERKS = [
  ["⚡", "Faster replies", "Priority routing so Aurexis answers quicker."],
  ["📁", "Faster projects", "Build and switch projects without limits."],
  ["✦", "More innovative answers", "Unlock richer, more creative responses."],
  ["🎨", "More creative range", "Longer context and more expressive replies."],
];

export default function ProModal({ onClose, onUpgrade, isPro }) {
  const [qr, setQr] = useState(null);
  const payload =
    process.env.NEXT_PUBLIC_PAYMENT_QR ||
    "upi://pay?pa=example@upi&pn=Aurexis%20Pro&am=25&cu=USD&tn=Aurexis%20Pro%20Yearly";

  useEffect(() => {
    let alive = true;
    import("qrcode")
      .then((QR) =>
        QR.toDataURL(payload, {
          margin: 1,
          width: 220,
          color: { dark: "#1b2150", light: "#ffffff" },
        })
      )
      .then((url) => alive && setQr(url))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [payload]);

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} className="card rise" style={modal}>
        <button onClick={onClose} style={closeBtn}>✕</button>
        <div style={{ textAlign: "center" }}>
          <span className="pill" style={{ marginBottom: 12 }}>Aurexis Pro</span>
          <h2 style={{ fontSize: 30 }}>
            $25 <span style={{ fontSize: 16, color: "var(--text-3)" }}>/ year</span>
          </h2>
          <p style={{ color: "var(--text-2)", marginTop: 6 }}>
            Everything in Aurexis, faster and more capable.
          </p>
        </div>

        <div style={{ display: "grid", gap: 10, margin: "22px 0" }}>
          {PERKS.map(([icon, t, d]) => (
            <div key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={perkIcon}>{icon}</div>
              <div>
                <b style={{ fontSize: 14.5 }}>{t}</b>
                <div style={{ fontSize: 13, color: "var(--text-3)" }}>{d}</div>
              </div>
            </div>
          ))}
        </div>

        {isPro ? (
          <div className="card" style={{ padding: 16, textAlign: "center", color: "var(--ok)" }}>
            ✓ You're on Aurexis Pro. Thank you!
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center" }}>
              <div className="label">Scan to pay</div>
              <div style={qrBox}>
                {qr ? (
                  <img src={qr} alt="Payment QR" style={{ width: 200, height: 200, borderRadius: 10 }} />
                ) : (
                  <div style={{ color: "var(--text-3)", padding: 60 }}>Generating QR…</div>
                )}
              </div>
              <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 10 }}>
                Scan with any UPI / payment app. Configure the destination via
                NEXT_PUBLIC_PAYMENT_QR.
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 16 }}
              onClick={onUpgrade}
            >
              I've paid — activate Pro
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  display: "grid",
  placeItems: "center",
  zIndex: 100,
  padding: 20,
};
const modal = { width: "100%", maxWidth: 400, padding: 28, position: "relative" };
const closeBtn = {
  position: "absolute",
  top: 16,
  right: 16,
  background: "none",
  border: "none",
  color: "var(--text-3)",
  cursor: "pointer",
  fontSize: 16,
};
const perkIcon = {
  width: 34,
  height: 34,
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  background: "var(--accent-weak)",
  border: "1px solid var(--line-strong)",
  flexShrink: 0,
};
const qrBox = {
  display: "grid",
  placeItems: "center",
  background: "var(--ink)",
  borderRadius: 14,
  padding: 10,
  marginTop: 6,
};
