"use client";

import { Check, Moon, Monitor, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  normalizeThemeChoice,
  resolveThemeChoice,
  type ThemeChoice,
} from "@/lib/theme-preference";

const themeOptions = [
  { value: "light" as const, label: "浅色", icon: Sun },
  { value: "dark" as const, label: "深色", icon: Moon },
  { value: "system" as const, label: "跟随系统", icon: Monitor },
];

function resolveTheme(choice: ThemeChoice) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return resolveThemeChoice(choice, systemDark);
}

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  const resolved = resolveTheme(choice);

  root.dataset.theme = resolved;
  root.dataset.themeChoice = choice;
  window.localStorage.setItem("babycare-theme", choice);
}

export function ThemeToggle() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [choice, setChoice] = useState<ThemeChoice>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    return normalizeThemeChoice(window.localStorage.getItem("babycare-theme"));
  });

  useEffect(() => {
    applyTheme(choice);
  }, [choice]);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function updateTheme(next: ThemeChoice) {
    setChoice(next);
    applyTheme(next);
    setOpen(false);
  }

  const activeOption =
    themeOptions.find((option) => option.value === choice) ?? themeOptions[2];
  const ActiveIcon = activeOption.icon;

  return (
    <div ref={containerRef} className="relative" aria-label="主题设置">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="bc-focus-ring flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
        onClick={() => setOpen((current) => !current)}
        title={`主题：${activeOption.label}`}
        type="button"
      >
        <ActiveIcon aria-hidden="true" size={20} />
        <span className="sr-only">切换主题</span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-40 mt-2 w-40 overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-1 shadow-lg"
          role="menu"
        >
          {themeOptions.map((item) => {
            const Icon = item.icon;
            const active = choice === item.value;

            return (
              <button
                aria-checked={active}
                className={`bc-focus-ring flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-medium ${
                  active
                    ? "bg-[var(--accent-feeding-soft)] text-[var(--foreground)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                }`}
                key={item.value}
                onClick={() => updateTheme(item.value)}
                role="menuitemradio"
                type="button"
              >
                <Icon aria-hidden="true" size={18} />
                <span className="flex-1">{item.label}</span>
                {active ? <Check aria-hidden="true" size={16} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
