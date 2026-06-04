// ---------------------------------------------------------------------------
// Aurexis storage layer.
//
// By default this uses the browser's localStorage so the whole app works the
// moment you deploy — no database required. Everything a user creates
// (account, chats, projects) lives on their own device, which also
// satisfies "stay logged in" without a server session.
//
// LIMITATION (documented in the README): localStorage is per-device. To let
// the Admin tab list users across *different* devices, swap the functions in
// this file for calls to a shared database (Vercel Postgres, Supabase, Turso,
// etc.). Every read/write goes through here, so that's the only file to touch.
// ---------------------------------------------------------------------------

const K = {
  users: "aurexis.users",
  session: "aurexis.session",
  admin: "aurexis.device_admin",
  chats: (uid) => `aurexis.chats.${uid}`,
  projects: (uid) => `aurexis.projects.${uid}`,
  prefs: (uid) => `aurexis.prefs.${uid}`,
};

const isBrowser = () => typeof window !== "undefined";

function read(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

// A deliberately simple obfuscation. NOT real security — see README. With a
// real database you would hash passwords server-side (bcrypt/argon2).
function scramble(str) {
  try {
    return btoa(unescape(encodeURIComponent("ax::" + str)));
  } catch {
    return str;
  }
}

// ---- Users ---------------------------------------------------------------

export function getUsers() {
  return read(K.users, []);
}

export function getUserByEmail(email) {
  const e = (email || "").trim().toLowerCase();
  return getUsers().find((u) => u.email === e) || null;
}

export function createPendingUser({ email, password, name, mobile }) {
  const users = getUsers();
  const e = email.trim().toLowerCase();
  const existing = users.find((u) => u.email === e);
  const token = uid() + uid();
  const record = {
    id: existing?.id || uid(),
    email: e,
    password: scramble(password),
    name: name?.trim() || "",
    mobile: mobile?.trim() || "",
    verified: false,
    token,
    pro: existing?.pro || false,
    device:
      isBrowser() && navigator.platform ? navigator.platform : "unknown",
    createdAt: existing?.createdAt || new Date().toISOString(),
    lastLogin: null,
  };
  const next = existing
    ? users.map((u) => (u.id === record.id ? record : u))
    : [...users, record];
  write(K.users, next);
  return record;
}

export function verifyToken(token) {
  const users = getUsers();
  const user = users.find((u) => u.token === token);
  if (!user) return null;
  user.verified = true;
  user.lastLogin = new Date().toISOString();
  write(
    K.users,
    users.map((u) => (u.id === user.id ? user : u))
  );
  return user;
}

export function authenticate(email, password) {
  const user = getUserByEmail(email);
  if (!user) return { error: "No account found for that email." };
  if (user.password !== scramble(password))
    return { error: "Incorrect password." };
  if (!user.verified)
    return { error: "Please verify your email first.", user };
  user.lastLogin = new Date().toISOString();
  const users = getUsers().map((u) => (u.id === user.id ? user : u));
  write(K.users, users);
  return { user };
}

export function updateUser(id, patch) {
  const users = getUsers().map((u) =>
    u.id === id ? { ...u, ...patch } : u
  );
  write(K.users, users);
  return users.find((u) => u.id === id);
}

// ---- Session -------------------------------------------------------------

export function getSession() {
  const s = read(K.session, null);
  if (!s) return null;
  const user = getUsers().find((u) => u.id === s.userId);
  return user && user.verified ? user : null;
}

export function setSession(userId) {
  write(K.session, { userId, at: new Date().toISOString() });
}

export function clearSession() {
  if (isBrowser()) window.localStorage.removeItem(K.session);
}

// ---- Device admin flag ---------------------------------------------------

export function isAdminDevice() {
  return read(K.admin, false) === true;
}

export function setAdminDevice(value) {
  write(K.admin, value === true);
}

// ---- Per-user collections ------------------------------------------------

export const getChats = (uid) => read(K.chats(uid), []);
export const saveChats = (uid, v) => write(K.chats(uid), v);

export const getProjects = (uid) => read(K.projects(uid), []);
export const saveProjects = (uid, v) => write(K.projects(uid), v);

export const getPrefs = (uid) =>
  read(K.prefs(uid), { model: null, theme: "dark" });
export const savePrefs = (uid, v) => write(K.prefs(uid), v);
