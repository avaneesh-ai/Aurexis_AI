"use client";

import { useEffect, useState } from "react";
import { Logo } from "../components/Logo";
import { verifyToken, setSession, getUsers } from "@/lib/store";

export default function VerifyPage() {
  const [state, setState] = useState("loading"); // loading | confirm | done | bad
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return setState("bad");
    // Find the pending user for this token on this device.
    const match = getUsers().find((u) => u.token === token);
    if (!match) return setState("bad");
    setUser(match);
    setState("confirm");
  }, []);

  function approve() {
    const verified = verifyToken(user.token);
    if (!verified) return setState("bad");
    setSession(verified.id);
    setState("done");
    setTimeout(() => (window.location.href = "/"), 900);
  }

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="card rise" style={{ width: "100%", maxWidth: 430, padding: 34, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Logo size={42} />
        </div>

        {state === "loading" && <p style={{ color: "var(--text-3)" }}>Checking your link…</p>}

        {state === "bad" && (
          <>
            <h2 style={{ fontSize: 23, marginBottom: 8 }}>This link didn't work</h2>
            <p style={{ color: "var(--text-2)" }}>
              The verification link is invalid or was opened on a different
              device than the one you registered on.
            </p>
            <a href="/" className="btn btn-ghost" style={{ display: "inline-block", marginTop: 12, textDecoration: "none" }}>
              Back to start
            </a>
          </>
        )}

        {state === "confirm" && (
          <>
            <h2 style={{ fontSize: 24, marginBottom: 10 }}>
              Log in to Aurexis?
            </h2>
            <p style={{ color: "var(--text-2)", marginTop: 0 }}>
              You're about to sign{" "}
              <b style={{ color: "var(--text)" }}>{user.name || user.email}</b>{" "}
              into Aurexis on this device.
            </p>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={approve}>
              Okay, log me in
            </button>
            <a href="/" style={{ display: "inline-block", marginTop: 16, color: "var(--text-3)", fontSize: 13 }}>
              Not now
            </a>
          </>
        )}

        {state === "done" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✶</div>
            <h2 style={{ fontSize: 23 }}>You're in!</h2>
            <p style={{ color: "var(--text-3)" }}>Taking you to Aurexis…</p>
          </>
        )}
      </div>
    </div>
  );
}
