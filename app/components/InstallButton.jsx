"use client";

import { useEffect, useState } from "react";
import { Mark } from "./Logo";

// "Install Aurexis" entry point.
// • Chrome/Edge/Android: captures beforeinstallprompt and triggers the native
//   install dialog.
// • iOS Safari: no native prompt exists, so we show Add-to-Home-Screen steps.
// • Already installed / unsupported: renders nothing (no dead button).
export default function InstallButton({ variant = "full" }) {
  const [deferred, setDeferred] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [iosOpen, setIosOpen] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const ua = window.navigator.userAgent || "";
    setIsIOS(/iphone|ipad|ipod/i.test(ua) && !window.MSStream);
    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Hide if running as an installed app, just installed, or not installable.
  if (standalone || installed) return null;
  if (!deferred && !isIOS) return null;

  async function handleClick() {
    if (deferred) {
      deferred.prompt();
      try {
        await deferred.userChoice;
      } catch {}
      setDeferred(null);
      return;
    }
    if (isIOS) setIosOpen(true);
  }

  const fullStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    width: "100%",
    marginBottom: 12,
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={variant === "primary" ? "btn btn-primary" : "btn"}
        style={variant === "full" ? fullStyle : { display: "inline-flex", gap: 8, alignItems: "center" }}
        title="Install Aurexis as an app"
      >
        <span style={{ fontSize: 15 }}>⤓</span>
        Install Aurexis
      </button>

      {iosOpen && (
        <div
          onClick={() => setIosOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "center",
            padding: 22,
          }}
        >
          <div
            className="card rise"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 380, padding: 26, textAlign: "center" }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <Mark size={48} />
            </div>
            <h2 style={{ fontSize: 21, marginBottom: 8 }}>Install Aurexis</h2>
            <p style={{ color: "var(--text-2)", marginTop: 0, marginBottom: 18, fontSize: 14 }}>
              On iPhone &amp; iPad, add Aurexis to your Home Screen:
            </p>
            <ol
              style={{
                textAlign: "left",
                color: "var(--text-2)",
                fontSize: 14,
                lineHeight: 1.7,
                paddingLeft: 20,
                margin: "0 0 20px",
              }}
            >
              <li>
                Tap the <b style={{ color: "var(--text)" }}>Share</b> button{" "}
                <span style={{ color: "var(--accent-bright)" }}>⎙</span> in Safari's toolbar.
              </li>
              <li>
                Choose <b style={{ color: "var(--text)" }}>Add to Home Screen</b>.
              </li>
              <li>
                Tap <b style={{ color: "var(--text)" }}>Add</b> — Aurexis appears like any app.
              </li>
            </ol>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setIosOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
