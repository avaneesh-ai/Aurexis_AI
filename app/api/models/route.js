// Lists the models actually installed on your Ollama server (/api/tags).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.OLLAMA_BASE_URL;
  if (!base) return Response.json({ models: [], configured: false });

  const headers = {};
  if (process.env.OLLAMA_API_KEY)
    headers["Authorization"] = `Bearer ${process.env.OLLAMA_API_KEY}`;

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/tags`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return Response.json({ models: [], configured: true });
    const data = await res.json();
    const models = (data.models || []).map((m) => ({
      tag: m.name,
      size: m.details?.parameter_size || null,
      family: m.details?.family || null,
    }));
    return Response.json({ models, configured: true });
  } catch {
    return Response.json({ models: [], configured: true });
  }
}
