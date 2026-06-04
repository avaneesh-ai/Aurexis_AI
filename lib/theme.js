// ---------------------------------------------------------------------------
// Aurexis theme control. The active theme ("dark" | "light") is stored on the
// <html> element as data-theme and persisted in localStorage so it survives
// reloads and applies before first paint (see the inline script in layout.js).
// ---------------------------------------------------------------------------

const KEY = "aurexis.theme";

export function getTheme() {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") || "dark";
}

export function setTheme(theme) {
  const t = theme === "light" ? "light" : "dark";
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", t);
  }
  try {
    window.localStorage.setItem(KEY, t);
  } catch {}
  return t;
}

export function toggleTheme() {
  return setTheme(getTheme() === "dark" ? "light" : "dark");
}
