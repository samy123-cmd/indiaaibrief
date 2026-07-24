export const THEME_COOKIE_NAME = "iab_theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ThemeValue = "light" | "dark" | "system";

export function isThemeValue(value: string | undefined | null): value is ThemeValue {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveThemeClass(
  preference: ThemeValue,
  systemDark: boolean,
): "light" | "dark" {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return systemDark ? "dark" : "light";
}

/** Inline script — runs before paint to prevent theme flash. Cookie-backed. */
export const themeInitScript = `(() => {
  try {
    const match = document.cookie.match(/(?:^|; )${THEME_COOKIE_NAME}=([^;]*)/);
    const raw = match ? decodeURIComponent(match[1]) : "system";
    const preference = raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = preference === "dark" || (preference === "system" && systemDark) ? "dark" : "light";
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
    root.dataset.theme = preference;
  } catch (_) {}
})();`;
