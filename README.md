# Aurexis ✦

A friendly AI workspace powered by **Ollama** — chat, projects, and a co-work
canvas, all behind a polished sign-up flow, with switchable **dark / light**
backgrounds.

Built with Next.js (App Router). Ready to push to GitHub and deploy on Vercel.

---

## What's inside

- **Onboarding** — email + password → name + mobile → email verification link →
  a "Log in to Aurexis?" confirmation → you're in. You stay signed in on the
  device (no repeated logins).
- **Aurexis chatbot** — friendly system personality, streaming replies, a model
  picker showing strong Ollama models (and the ones actually installed on your
  server), **New chat**, and a **Chats** history rail.
- **Projects** — focused workspaces with their own description, custom
  instructions and notes (like ChatGPT/Claude projects).
- **Co-work** — a shared document canvas you and Aurexis refine together.
- **Light & dark mode** — a toggle (in the sidebar, on the sign-in screen, and
  in Settings) swaps between the two photographic backgrounds and re-themes the
  whole app. Your choice is remembered.
- **Settings** — profile, appearance, default model, subscription, admin
  access, data export/clear, sign out.
- **Aurexis Pro** — $25/year, with a scannable payment **QR code**.
- **Admin tab** — lists registered users; only visible on a device where the
  admin key has been entered.

---

## 1. Run locally

```bash
npm install
cp .env.example .env.local   # then fill in OLLAMA_BASE_URL
npm run dev
```

Open http://localhost:3000

---

## 2. Connect Ollama

Ollama serves an HTTP API on port `11434`. Your deployed app needs a URL it can
reach over the internet (Vercel can't see your `localhost`). Options:

- Run Ollama on a small cloud server and expose it over HTTPS (recommended), or
- Tunnel your local machine for testing: `cloudflared tunnel --url http://localhost:11434`

Then pull a model on that host, e.g. `ollama pull llama3.2`.

Set the URL as `OLLAMA_BASE_URL`. That's the one **required** variable.

---

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → Import** your repo.
3. **Settings → Environment Variables** — add at least:

   | Variable | Required | Purpose |
   |---|---|---|
   | `OLLAMA_BASE_URL` | ✅ | Your Ollama server URL |
   | `OLLAMA_API_KEY` | optional | Bearer token if Ollama is behind auth |
   | `ADMIN_KEY` | recommended | Secret to unlock the Admin tab (change the default) |
   | `RESEND_API_KEY` | optional | Send real verification emails |
   | `EMAIL_FROM` | optional | From-address for emails |
   | `NEXT_PUBLIC_PAYMENT_QR` | optional | What the Pro QR encodes (UPI / payment link) |

4. **Deploy.** Ollama activates as soon as `OLLAMA_BASE_URL` is set.

---

## How each feature works (and how to harden it)

This app is designed to **work the moment you deploy** with zero extra services.
A few features use the browser for storage by default; here's the honest picture
and how to upgrade each one.

- **Staying logged in & storing chats/projects** — kept in the browser
  (`localStorage`) per device. No database needed. All reads/writes go through
  `lib/store.js`.
- **Email verification** — without `RESEND_API_KEY`, the verification link is
  shown on screen (demo mode) and is confirmed on the same device. With Resend
  configured, a real email is sent. For true cross-device confirmation you'd
  store pending accounts in a shared database (below).
- **Admin "this device only"** — entering the correct `ADMIN_KEY` in
  *Settings → Admin access* flags **that browser** as admin, so the tab appears
  only there. The key is checked on the server and never shipped to the client.
- **Theme** — the light/dark choice is stored locally and applied before first
  paint (no flash). Backgrounds live in `public/bg-dark.png` and
  `public/bg-light.png` — swap those files to restyle without touching code.
- **Pro & payment** — the QR encodes whatever you put in
  `NEXT_PUBLIC_PAYMENT_QR` (a UPI string, Stripe/PayPal link, etc.). Activation
  is a local flag; wire it to your payment provider's webhook for real billing.

### Going cross-device (shared database)

The one thing browser storage *can't* do is let the Admin tab see users who
signed up on **other** devices. To enable that — and real cross-device login —
replace the functions in **`lib/store.js`** with calls to a shared database
(Vercel Postgres, Supabase, Turso, etc.). Every component already routes through
that file, so the UI needs no changes. Password handling should also move
server-side (bcrypt/argon2) at that point — the current client-side scramble is
fine for a demo but is **not** real security.

---

## Project structure

```
public/
  logo.png                # the Aurexis mark
  icon.png                # favicon
  bg-dark.png             # dark-mode background
  bg-light.png            # light-mode background
app/
  page.js                 # app shell: session, sidebar, section routing
  layout.js               # fonts, metadata, no-flash theme script
  globals.css             # dual-theme (blue → violet) design system
  verify/page.js          # the screen the email link opens
  api/
    chat/route.js         # streaming proxy to Ollama
    models/route.js       # lists installed Ollama models
    send-verification/route.js
    admin-unlock/route.js
  components/              # Logo, ThemeToggle, AuthFlow, ChatView,
                          # ProjectsView, CoworkView, SettingsView,
                          # AdminView, ProModal
lib/
  models.js               # curated Ollama model shortlist
  store.js                # storage layer (swap for a DB to go cross-device)
  theme.js                # light/dark helper
```
