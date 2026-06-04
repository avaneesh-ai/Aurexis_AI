"use client";

import { useEffect, useState } from "react";
import { DEFAULT_MODEL } from "@/lib/models";
import { getPrefs } from "@/lib/store";

// Co-work: a shared workspace where you and Aurexis build on a document
// together — write, then ask Aurexis to expand, tighten, or rewrite it.
export default function CoworkView({ user }) {
  const [doc, setDoc] = useState("");
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL);

  useEffect(() => {
    const p = getPrefs(user.id);
    if (p.model) setModel(p.model);
    const saved = localStorage.getItem(`aurexis.cowork.${user.id}`);
    if (saved) setDoc(saved);
  }, [user.id]);

  function save(v) {
    setDoc(v);
    localStorage.setItem(`aurexis.cowork.${user.id}`, v);
  }

  async function assist(instruction) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content:
                `${instruction}\n\nHere is the working document:\n\n${doc || "(empty)"}` +
                "\n\nReturn only the revised document text.",
            },
          ],
        }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        save(acc);
      }
    } catch {
      save(doc + "\n\n⚠️ Aurexis couldn't reach the model. Check OLLAMA_BASE_URL.");
    }
    setBusy(false);
  }

  const actions = [
    ["✨ Improve", "Improve and polish this document while keeping its meaning."],
    ["📝 Expand", "Expand this document with more useful detail."],
    ["✂️ Tighten", "Make this document clearer and more concise."],
    ["🎯 Summarize", "Summarize this document into key points."],
  ];

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "34px 30px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h1 style={{ fontSize: 32 }}>Co-work</h1>
        <span className="pill">beta</span>
      </div>
      <p style={{ color: "var(--text-2)", margin: "6px 0 20px", maxWidth: 560 }}>
        A shared canvas for you and Aurexis. Write here, then hand it to Aurexis
        to refine — you stay in control, it does the heavy lifting.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {actions.map(([label, instruction]) => (
          <button key={label} className="btn btn-ghost" disabled={busy} onClick={() => assist(instruction)}>
            {label}
          </button>
        ))}
        {busy && <span style={{ color: "var(--gold-bright)", alignSelf: "center" }}>Aurexis is working…</span>}
      </div>

      <textarea
        value={doc}
        onChange={(e) => save(e.target.value)}
        placeholder="Start writing here — a draft, an outline, an idea…"
        style={{
          width: "100%",
          minHeight: "52vh",
          background: "rgba(0,0,0,0.28)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          color: "var(--text)",
          padding: 22,
          fontSize: 15.5,
          lineHeight: 1.7,
          fontFamily: "var(--body)",
          resize: "vertical",
          outline: "none",
        }}
      />
      <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 10 }}>
        Auto-saved to this device.
      </p>
    </div>
  );
}
