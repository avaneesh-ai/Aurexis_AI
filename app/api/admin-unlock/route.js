// Verifies the admin secret server-side so the key never ships to the client.
// A device that passes this becomes an "admin device" (flag stored locally),
// which is why the Admin tab only appears on the laptop where it was unlocked.

export const runtime = "nodejs";

export async function POST(req) {
  const { key } = await req.json().catch(() => ({}));
  const expected = process.env.ADMIN_KEY || "aurexis-admin-change-me";
  if (typeof key === "string" && key === expected) {
    return Response.json({ ok: true });
  }
  return Response.json({ ok: false }, { status: 401 });
}
