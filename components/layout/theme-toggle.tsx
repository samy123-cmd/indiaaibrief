"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  type ThemeValue,
  isThemeValue,
} from "@/lib/theme";

function readThemePreference(): ThemeValue {
  if (typeof document === "undefined") return "system";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`),
  );
  const value = match?.[1] ? decodeURIComponent(match[1]) : "system";
  return isThemeValue(value) ? value : "system";
}

function writeThemePreference(value: ThemeValue): void {
  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function applyTheme(preference: ThemeValue): void {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved =
    preference === "dark" || (preference === "system" && systemDark)
      ? "dark"
      : "light";
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
  document.documentElement.dataset.theme = preference;
}

function isDocumentDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

/** Client-only theme toggle — system preference + manual, cookie-persistent. */
export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemeValue>("system");
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const nextPreference = readThemePreference();
    setPreference(nextPreference);
    setIsDark(isDocumentDark());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readThemePreference() === "system") {
        applyTheme("system");
        setIsDark(isDocumentDark());
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mounted]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <span className="h-5 w-5 rounded-full border border-border" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => {
        const next: ThemeValue = isDark ? "light" : "dark";
        writeThemePreference(next);
        applyTheme(next);
        setPreference(next);
        setIsDark(next === "dark");
      }}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
      <span className="sr-only">Theme: {preference}</span>
    </Button>
  );
}
