"use client";

import { useState } from "react";
import { Logo } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import InstallButton from "./InstallButton";
import {
  authenticate,
  createPendingUser,
  getUserByEmail,
  setSession,
} from "@/lib/store";

const wrap = {
  minHeight: "100dvh",
  display: "grid",
  placeItems: "center",
  padding: 24,
};

function Field({ label, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="label">{label}</label>
      <input className="input" {...props} />
    </div>
  );
}

function Steps({ active }) {
  return (
    <div style={{ display: "flex", gap: 7, marginBottom: 26 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            height: 4,
            flex: 1,
            borderRadius: 4,
            background:
              i <= active ? "var(--gold)" : "var(--accent-weak)",
            transition: "background .3s",
          }}
        />
      ))}
    </div>
  );
}

export default function AuthFlow({ onAuthed }) {
  const [mode, setMode] = useState("login"); // login | register
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    email: "",
    password: "",
    name: "",
    mobile: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifyLink, setVerifyLink] = useState(null);
  const [emailed, setEmailed] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  // ---- login -----------------------------------------------------------
  function doLogin() {
    setErr("");
    const { user, error } = authenticate(f.email, f.password);
    if (error) return setErr(error);
    setSession(user.id);
    onAuthed(user);
  }

  // ---- register step 1 --------------------------------------------------
  function next1() {
    setErr("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email))
      return setErr("Please enter a valid email address.");
    if (f.password.length < 6)
      return setErr("Password must be at least 6 characters.");
    const existing = getUserByEmail(f.email);
    if (existing && existing.verified)
      return setErr("That email already has an account. Try signing in.");
    setStep(1);
  }

  // ---- register step 2 -> send verification ----------------------------
  async function next2() {
    setErr("");
    if (!f.name.trim()) return setErr("Please enter your name.");
    if (f.mobile.replace(/\D/g, "").length < 7)
      return setErr("Please enter a valid mobile number.");
    setBusy(true);
    const user = createPendingUser(f);
    const link = `${window.location.origin}/verify?token=${user.token}`;
    setVerifyLink(link);
    try {
      const res = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, link }),
      });
      const data = await res.json();
      setEmailed(Boolean(data.sent));
    } catch {
      setEmailed(false);
    }
    setBusy(false);
    setStep(2);
  }

  // ---------------------------------------------------------------------
  return (
    <div style={wrap}>
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 5 }}>
        <ThemeToggle compact />
      </div>
      <div
        className="card rise"
        style={{ width: "100%", maxWidth: 440, padding: "34px 34px 30px" }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <Logo size={42} />
        </div>

        {mode === "login" ? (
          <>
            <h2 style={{ fontSize: 26, textAlign: "center", marginBottom: 4 }}>
              Welcome back
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "var(--text-3)",
                marginTop: 0,
                marginBottom: 26,
              }}
            >
              Sign in to your friendly workspace.
            </p>
            <Field
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={f.email}
              onChange={set("email")}
            />
            <Field
              label="Password"
              type="password"
              placeholder="••••••••"
              value={f.password}
              onChange={set("password")}
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
            />
            {err && <Error msg={err} />}
            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 6 }}
              onClick={doLogin}
            >
              Sign in
            </button>
            <Switcher
              text="New here?"
              action="Create an account"
              onClick={() => {
                setMode("register");
                setStep(0);
                setErr("");
              }}
            />
          </>
        ) : (
          <>
            <Steps active={step} />
            {step === 0 && (
              <>
                <h2 style={{ fontSize: 24, marginBottom: 4 }}>
                  Create your account
                </h2>
                <p style={{ color: "var(--text-3)", marginTop: 0, marginBottom: 22 }}>
                  Step 1 of 3 — your sign-in details.
                </p>
                <Field
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={f.email}
                  onChange={set("email")}
                />
                <Field
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={f.password}
                  onChange={set("password")}
                  onKeyDown={(e) => e.key === "Enter" && next1()}
                />
                {err && <Error msg={err} />}
                <button
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  onClick={next1}
                >
                  Next →
                </button>
                <Switcher
                  text="Already have an account?"
                  action="Sign in"
                  onClick={() => {
                    setMode("login");
                    setErr("");
                  }}
                />
              </>
            )}

            {step === 1 && (
              <>
                <h2 style={{ fontSize: 24, marginBottom: 4 }}>
                  A little about you
                </h2>
                <p style={{ color: "var(--text-3)", marginTop: 0, marginBottom: 22 }}>
                  Step 2 of 3 — so Aurexis knows what to call you.
                </p>
                <Field
                  label="Full name"
                  placeholder="Your name"
                  value={f.name}
                  onChange={set("name")}
                />
                <Field
                  label="Mobile number"
                  placeholder="+91 98765 43210"
                  value={f.mobile}
                  onChange={set("mobile")}
                  onKeyDown={(e) => e.key === "Enter" && next2()}
                />
                {err && <Error msg={err} />}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setStep(0);
                      setErr("");
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={next2}
                    disabled={busy}
                  >
                    {busy ? "Sending link…" : "Send verification link"}
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="rise" style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    margin: "4px auto 16px",
                    borderRadius: 18,
                    display: "grid",
                    placeItems: "center",
                    background: "var(--accent-weak)",
                    border: "1px solid var(--line-strong)",
                    fontSize: 28,
                  }}
                >
                  ✉️
                </div>
                <h2 style={{ fontSize: 23, marginBottom: 8 }}>Check your email</h2>
                <p style={{ color: "var(--text-2)", marginTop: 0 }}>
                  {emailed ? (
                    <>
                      We sent a confirmation link to{" "}
                      <b style={{ color: "var(--text)" }}>{f.email}</b>. Open it
                      to finish signing in.
                    </>
                  ) : (
                    <>
                      Email sending isn't configured yet, so here's your
                      verification link directly:
                    </>
                  )}
                </p>
                {!emailed && verifyLink && (
                  <a
                    href={verifyLink}
                    className="btn btn-primary"
                    style={{
                      display: "inline-block",
                      marginTop: 8,
                      textDecoration: "none",
                    }}
                  >
                    Open verification link →
                  </a>
                )}
                <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 22 }}>
                  Wrong email?{" "}
                  <button
                    onClick={() => {
                      setStep(1);
                      setErr("");
                    }}
                    style={linkBtn}
                  >
                    Go back
                  </button>
                </p>
              </div>
            )}
          </>
        )}
        <div style={{ marginTop: 18 }}>
          <InstallButton />
        </div>
      </div>
    </div>
  );
}

const linkBtn = {
  background: "none",
  border: "none",
  color: "var(--gold-bright)",
  cursor: "pointer",
  fontSize: "inherit",
  textDecoration: "underline",
  padding: 0,
};

function Error({ msg }) {
  return (
    <div
      style={{
        background: "rgba(224,122,95,0.1)",
        border: "1px solid rgba(224,122,95,0.35)",
        color: "#f0b2a1",
        padding: "10px 13px",
        borderRadius: 10,
        fontSize: 13.5,
        marginBottom: 14,
      }}
    >
      {msg}
    </div>
  );
}

function Switcher({ text, action, onClick }) {
  return (
    <p style={{ textAlign: "center", color: "var(--text-3)", marginTop: 20, marginBottom: 0 }}>
      {text}{" "}
      <button onClick={onClick} style={linkBtn}>
        {action}
      </button>
    </p>
  );
}
