"use client";

import { useEffect, useState } from "react";
import { getProjects, saveProjects } from "@/lib/store";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function ProjectsView({ user }) {
  const [projects, setProjects] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", desc: "", instructions: "" });
  const [note, setNote] = useState("");

  useEffect(() => setProjects(getProjects(user.id)), [user.id]);

  function persist(next) {
    setProjects(next);
    saveProjects(user.id, next);
  }

  function create() {
    if (!draft.name.trim()) return;
    const p = {
      id: uid(),
      ...draft,
      notes: [],
      at: Date.now(),
    };
    persist([p, ...projects]);
    setDraft({ name: "", desc: "", instructions: "" });
    setCreating(false);
    setOpenId(p.id);
  }

  const open = projects.find((p) => p.id === openId);

  function addNote() {
    if (!note.trim() || !open) return;
    const updated = {
      ...open,
      notes: [{ id: uid(), text: note, at: Date.now() }, ...open.notes],
    };
    persist(projects.map((p) => (p.id === open.id ? updated : p)));
    setNote("");
  }

  function removeProject(id) {
    persist(projects.filter((p) => p.id !== id));
    if (openId === id) setOpenId(null);
  }

  // ---- detail view ----
  if (open) {
    return (
      <div style={page}>
        <button className="btn btn-ghost" onClick={() => setOpenId(null)} style={{ marginBottom: 18 }}>
          ← All projects
        </button>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={folderIcon}>◫</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 28 }}>{open.name}</h1>
            <p style={{ color: "var(--text-2)", marginTop: 4 }}>{open.desc || "No description."}</p>
          </div>
        </div>

        {open.instructions && (
          <div className="card" style={{ padding: 16, marginTop: 18 }}>
            <div className="label">Custom instructions</div>
            <p style={{ margin: 0, color: "var(--text-2)", whiteSpace: "pre-wrap" }}>{open.instructions}</p>
          </div>
        )}

        <div className="label" style={{ marginTop: 26 }}>Project notes & context</div>
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <input
            className="input"
            placeholder="Add a note, link or instruction for this project…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <button className="btn btn-primary" onClick={addNote}>Add</button>
        </div>
        <div style={{ marginTop: 16 }}>
          {open.notes.length === 0 && (
            <p style={{ color: "var(--text-3)" }}>No notes yet — add context to keep this project focused.</p>
          )}
          {open.notes.map((n) => (
            <div key={n.id} className="card" style={{ padding: "12px 15px", marginBottom: 8 }}>
              <div style={{ whiteSpace: "pre-wrap" }}>{n.text}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
                {new Date(n.at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- list view ----
  return (
    <div style={page}>
      <Header
        title="Projects"
        sub="Group your work — like a focused space for each goal, with its own context and instructions."
        action={
          <button className="btn btn-primary" onClick={() => setCreating(true)}>＋ New project</button>
        }
      />

      {creating && (
        <div className="card rise" style={{ padding: 20, marginBottom: 22 }}>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Project name</label>
            <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Launch plan" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Description</label>
            <input className="input" value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} placeholder="What's this project about?" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Custom instructions (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={draft.instructions}
              onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
              placeholder="How should Aurexis behave inside this project?"
              style={{ resize: "vertical" }}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={create}>Create project</button>
          </div>
        </div>
      )}

      {projects.length === 0 && !creating && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}>
          No projects yet. Create your first focused workspace.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
        {projects.map((p) => (
          <div key={p.id} className="card rise" style={{ padding: 18, cursor: "pointer", position: "relative" }} onClick={() => setOpenId(p.id)}>
            <div style={{ ...folderIcon, width: 40, height: 40, fontSize: 20, marginBottom: 12 }}>◫</div>
            <h3 style={{ fontSize: 18 }}>{p.name}</h3>
            <p style={{ color: "var(--text-3)", fontSize: 13, margin: "6px 0 0", minHeight: 34 }}>
              {p.desc || "No description."}
            </p>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 12 }}>
              {p.notes.length} note{p.notes.length === 1 ? "" : "s"}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); removeProject(p.id); }}
              style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-3)", cursor: "pointer" }}
            >✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const page = { maxWidth: 880, margin: "0 auto", padding: "34px 30px 60px" };
const folderIcon = {
  width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center",
  fontSize: 26, color: "var(--ink)", flexShrink: 0,
  background: "linear-gradient(180deg,var(--gold-bright),var(--gold))",
};

function Header({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: 32 }}>{title}</h1>
        <p style={{ color: "var(--text-2)", margin: "6px 0 0", maxWidth: 520 }}>{sub}</p>
      </div>
      {action}
    </div>
  );
}

export { Header, page };
