"use client";

import { useEffect, useRef, useState } from "react";
import { CURATED_MODELS, DEFAULT_MODEL } from "@/lib/models";
import { getChats, saveChats, getPrefs, savePrefs } from "@/lib/store";
import { Mark } from "./Logo";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function ChatView({ user }) {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [liveModels, setLiveModels] = useState([]);
  const [configured, setConfigured] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scroller = useRef(null);

  useEffect(() => {
    const c = getChats(user.id);
    setChats(c);
    setActiveId(c[0]?.id || null);
    const p = getPrefs(user.id);
    if (p.model) setModel(p.model);
    fetch("/api/models")
      .then((r) => r.json())
      .then((d) => {
        setLiveModels(d.models || []);
        setConfigured(d.configured);
      })
      .catch(() => {});
  }, [user.id]);

  useEffect(() => {
    if (scroller.current)
      scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [chats, activeId, streaming]);

  const active = chats.find((c) => c.id === activeId) || null;

  function persist(next) {
    setChats(next);
    saveChats(user.id, next);
  }

  function newChat() {
    const chat = { id: uid(), title: "New chat", messages: [], at: Date.now() };
    persist([chat, ...chats]);
    setActiveId(chat.id);
  }

  function deleteChat(id) {
    const next = chats.filter((c) => c.id !== id);
    persist(next);
    if (activeId === id) setActiveId(next[0]?.id || null);
  }

  function chooseModel(tag) {
    setModel(tag);
    savePrefs(user.id, { ...getPrefs(user.id), model: tag });
    setPickerOpen(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    let chat = active;
    let list = chats;
    if (!chat) {
      chat = { id: uid(), title: "New chat", messages: [], at: Date.now() };
      list = [chat, ...chats];
      setActiveId(chat.id);
    }

    const userMsg = { role: "user", content: text };
    const aiMsg = { role: "assistant", content: "" };
    chat = {
      ...chat,
      messages: [...chat.messages, userMsg, aiMsg],
      title:
        chat.messages.length === 0 ? text.slice(0, 42) : chat.title,
    };
    list = list.map((c) => (c.id === chat.id ? chat : c));
    persist(list);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: chat.messages
            .filter((m) => m.content || m.role === "user")
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Something went wrong.");
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        chat = {
          ...chat,
          messages: chat.messages.map((m, i) =>
            i === chat.messages.length - 1 ? { ...m, content: acc } : m
          ),
        };
        list = list.map((c) => (c.id === chat.id ? chat : c));
        setChats([...list]);
      }
      saveChats(user.id, list);
    } catch (err) {
      chat = {
        ...chat,
        messages: chat.messages.map((m, i) =>
          i === chat.messages.length - 1
            ? {
                ...m,
                content:
                  "⚠️ " +
                  err.message +
                  (configured
                    ? ""
                    : "\n\nTip: set OLLAMA_BASE_URL in your Vercel environment variables, then redeploy."),
                error: true,
              }
            : m
        ),
      };
      persist(list.map((c) => (c.id === chat.id ? chat : c)));
    } finally {
      setStreaming(false);
    }
  }

  const currentModelLabel =
    CURATED_MODELS.find((m) => m.tag === model)?.name || model;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Chats rail */}
      <aside
        style={{
          width: 248,
          borderRight: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: 16 }}>
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={newChat}
          >
            ＋ New chat
          </button>
        </div>
        <div className="label" style={{ padding: "0 18px 6px" }}>
          Chats
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 14px" }}>
          {chats.length === 0 && (
            <p style={{ color: "var(--text-3)", fontSize: 13, padding: "0 8px" }}>
              No chats yet. Start a new one!
            </p>
          )}
          {chats.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveId(c.id)}
              style={{
                padding: "10px 11px",
                borderRadius: 10,
                cursor: "pointer",
                marginBottom: 3,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background:
                  c.id === activeId ? "var(--accent-weak)" : "transparent",
                border:
                  c.id === activeId
                    ? "1px solid var(--line-strong)"
                    : "1px solid transparent",
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: 13.5,
                  color: c.id === activeId ? "var(--text)" : "var(--text-2)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(c.id);
                }}
                title="Delete"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-3)",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Conversation */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* model bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 22px",
            borderBottom: "1px solid var(--line)",
            position: "relative",
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--display)", fontSize: 18 }}>
              Aurexis
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>
              your friendly AI · powered by Ollama
            </div>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => setPickerOpen((v) => !v)}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <span style={{ color: "var(--gold-bright)" }}>◈</span>
            {currentModelLabel}
            <span style={{ color: "var(--text-3)" }}>▾</span>
          </button>

          {pickerOpen && (
            <ModelPicker
              model={model}
              live={liveModels}
              configured={configured}
              onPick={chooseModel}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>

        {/* messages */}
        <div ref={scroller} style={{ flex: 1, overflowY: "auto", padding: "26px 0" }}>
          {!active || active.messages.length === 0 ? (
            <Empty name={user.name} onPick={setInput} />
          ) : (
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 22px" }}>
              {active.messages.map((m, i) => (
                <Bubble key={i} role={m.role} content={m.content} error={m.error} />
              ))}
              {streaming &&
                active.messages[active.messages.length - 1]?.content === "" && (
                  <Typing />
                )}
            </div>
          )}
        </div>

        {/* composer */}
        <div style={{ padding: "14px 22px 22px" }}>
          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 10,
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Message Aurexis…"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "var(--text)",
                resize: "none",
                fontFamily: "inherit",
                fontSize: 15,
                outline: "none",
                maxHeight: 160,
                padding: "8px 8px",
              }}
            />
            <button
              className="btn btn-primary"
              onClick={send}
              disabled={streaming || !input.trim()}
              style={{ padding: "10px 16px" }}
            >
              {streaming ? "…" : "Send ↑"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelPicker({ model, live, configured, onPick, onClose }) {
  // merge curated + live (live models not in curated get appended)
  const liveTags = live.map((m) => m.tag);
  const extras = live
    .filter((m) => !CURATED_MODELS.some((c) => c.tag === m.tag))
    .map((m) => ({
      tag: m.tag,
      name: m.tag,
      by: m.family || "installed",
      size: m.size || "",
      blurb: "Installed on your Ollama server.",
      tags: ["installed"],
    }));
  const all = [...CURATED_MODELS, ...extras];

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 40 }}
      />
      <div
        className="card rise"
        style={{
          position: "absolute",
          top: 64,
          right: 22,
          width: 360,
          maxHeight: 460,
          overflowY: "auto",
          zIndex: 50,
          padding: 10,
        }}
      >
        <div style={{ padding: "6px 8px 10px", color: "var(--text-3)", fontSize: 12 }}>
          Choose a model{" "}
          {!configured && "· (set OLLAMA_BASE_URL to enable)"}
        </div>
        {all.map((m) => {
          const installed = liveTags.includes(m.tag);
          return (
            <button
              key={m.tag}
              onClick={() => onPick(m.tag)}
              style={{
                width: "100%",
                textAlign: "left",
                background:
                  m.tag === model ? "var(--accent-weak)" : "transparent",
                border:
                  m.tag === model
                    ? "1px solid var(--line-strong)"
                    : "1px solid transparent",
                borderRadius: 11,
                padding: "10px 11px",
                cursor: "pointer",
                marginBottom: 3,
                color: "var(--text)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <b style={{ fontSize: 14 }}>{m.name}</b>
                {m.size && (
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>{m.size}</span>
                )}
                {installed && (
                  <span className="pill" style={{ fontSize: 9.5, padding: "2px 7px" }}>
                    ● ready
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 2 }}>
                {m.blurb}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Bubble({ role, content, error }) {
  const isUser = role === "user";
  return (
    <div
      className="rise"
      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 18 }}
    >
      {!isUser && <Avatar />}
      <div
        style={{
          maxWidth: "78%",
          padding: "12px 16px",
          borderRadius: 16,
          borderTopLeftRadius: isUser ? 16 : 4,
          borderTopRightRadius: isUser ? 4 : 16,
          background: isUser
            ? "linear-gradient(180deg,var(--gold-bright),var(--gold))"
            : error
            ? "rgba(224,122,95,0.1)"
            : "var(--panel-solid)",
          color: isUser ? "var(--ink)" : error ? "#f0b2a1" : "var(--text)",
          border: isUser ? "none" : "1px solid var(--line)",
          whiteSpace: "pre-wrap",
          fontSize: 15,
          lineHeight: 1.6,
        }}
      >
        {content || "…"}
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        flexShrink: 0,
        marginRight: 10,
        marginTop: 2,
        background: "var(--grad)",
        boxShadow: "0 0 16px -3px var(--accent-line)",
      }}
    />
  );
}

function Typing() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "4px 6px 0 40px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 9,
            background: "var(--gold)",
            animation: "pulse 1s infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

function Empty({ name, onPick }) {
  const prompts = [
    "Explain a tricky idea simply",
    "Help me plan my week",
    "Brainstorm names for my project",
    "Write a kind, clear email",
  ];
  return (
    <div style={{ maxWidth: 620, margin: "8vh auto 0", textAlign: "center", padding: "0 22px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <Mark size={64} />
      </div>
      <h2 style={{ fontSize: 28, marginBottom: 8 }}>
        Hi{name ? `, ${name.split(" ")[0]}` : " there"} — I'm Aurexis ✦
      </h2>
      <p style={{ color: "var(--text-2)", marginTop: 0, marginBottom: 26 }}>
        Friendly, fast and ready to help. What's on your mind today?
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="card"
            style={{
              padding: "13px 15px",
              textAlign: "left",
              cursor: "pointer",
              color: "var(--text-2)",
              fontSize: 13.5,
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
