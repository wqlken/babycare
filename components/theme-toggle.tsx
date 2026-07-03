"use client";

import { Moon, Monitor, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeChoice = "system" | "light" | "dark";

function resolveTheme(choice: ThemeChoice) {
  if (choice !== "system") {
    return choice;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  const resolved = resolveTheme(choice);

  root.dataset.theme = resolved;
  root.dataset.themeChoice = choice;
  window.localStorage.setItem("babycare-theme", choice);
}

export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const stored = window.localStorage.getItem(
      "babycare-theme",
    ) as ThemeChoice | null;

    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
  });

  useEffect(() => {
    applyTheme(choice);
  }, [choice]);

  function updateTheme(next: ThemeChoice) {
    setChoice(next);
    applyTheme(next);
  }

  return (
    <div className="flex items-center gap-1" aria-label="主题设置">
      {[
        { value: "light" as const, label: "浅色", icon: Sun },
        { value: "dark" as const, label: "深色", icon: Moon },
        { value: "system" as const, label: "系统", icon: Monitor },
      ].map((item) => {
        const Icon = item.icon;
        const active = choice === item.value;

        return (
          <button
            aria-pressed={active}
            className={`bc-focus-ring min-h-11 min-w-11 rounded-lg border px-2 text-sm ${
              active
                ? "border-[var(--focus-ring)] bg-[var(--accent-feeding-soft)] text-[var(--foreground)]"
                : "border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-muted)]"
            }`}
            key={item.value}
            onClick={() => updateTheme(item.value)}
            title={item.label}
            type="button"
          >
            <Icon aria-hidden="true" className="mx-auto" size={20} />
            <span className="sr-only">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
