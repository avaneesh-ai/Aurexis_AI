// Sends the email-verification link.
// If RESEND_API_KEY is set, a real email goes out. Otherwise we return the
// link so the UI can show it (demo mode) — the registration flow is identical.

export const runtime = "nodejs";

export async function POST(req) {
  const { email, link } = await req.json().catch(() => ({}));
  if (!email || !link)
    return Response.json({ error: "email and link required" }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return Response.json({ sent: false, link });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Aurexis <onboarding@resend.dev>",
        to: [email],
        subject: "Confirm your Aurexis account",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2 style="color:#5b8cff">Welcome to Aurexis</h2>
            <p>Tap the button below to confirm your account and sign in.</p>
            <p><a href="${link}" style="background:linear-gradient(135deg,#38d6ff,#5b8cff,#a06bff);color:#fff;
              padding:12px 22px;border-radius:12px;text-decoration:none;
              font-weight:600;display:inline-block">Confirm &amp; sign in</a></p>
            <p style="color:#888;font-size:12px">If you didn't create this
              account, you can ignore this email.</p>
          </div>`,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return Response.json({ sent: false, link, error: t.slice(0, 200) });
    }
    return Response.json({ sent: true });
  } catch (e) {
    return Response.json({ sent: false, link, error: e.message });
  }
}
