// Streams a chat completion from your Ollama server.
// Reads OLLAMA_BASE_URL (and optional OLLAMA_API_KEY) from the environment.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT =
  "You are Aurexis, a warm, upbeat and genuinely friendly AI companion. " +
  "You speak naturally and kindly, like a thoughtful friend who happens to " +
  "be brilliant. Be encouraging, clear and concise. Use the occasional " +
  "light touch of warmth, but never be saccharine. When you help with code " +
  "or hard problems, stay precise and practical.";

export async function POST(req) {
  const base = process.env.OLLAMA_BASE_URL;
  if (!base) {
    return Response.json(
      {
        error:
          "OLLAMA_BASE_URL is not set. Add it in Vercel → Settings → Environment Variables.",
      },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { model, messages } = body || {};
  if (!model || !Array.isArray(messages)) {
    return Response.json(
      { error: "Both `model` and `messages` are required." },
      { status: 400 }
    );
  }

  const headers = { "Content-Type": "application/json" };
  if (process.env.OLLAMA_API_KEY)
    headers["Authorization"] = `Bearer ${process.env.OLLAMA_API_KEY}`;

  let upstream;
  try {
    upstream = await fetch(`${base.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });
  } catch (e) {
    return Response.json(
      { error: `Could not reach Ollama at ${base}. ${e.message}` },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return Response.json(
      { error: `Ollama responded ${upstream.status}. ${text.slice(0, 300)}` },
      { status: 502 }
    );
  }

  // Translate Ollama's NDJSON into a plain text token stream for the client.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      const lines = decoder.decode(value, { stream: true }).split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const json = JSON.parse(trimmed);
          const token = json.message?.content || "";
          if (token) controller.enqueue(encoder.encode(token));
        } catch {
          /* ignore partial lines */
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
