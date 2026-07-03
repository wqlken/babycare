# Babycare UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the post-v1.2.1 UI polish pass: tokenized light/dark design, Lucide icons, mobile bottom actions, ergonomic forms, and a compact daily rhythm visualization.

**Architecture:** Keep the existing Next.js App Router and Server Action structure. Add styling and interaction in small focused components, keep data normalization for the rhythm chart in a pure helper, and avoid broad refactors outside shell, dashboard, form, and token surfaces.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS v4, CSS variables, Server Actions, Vitest, lucide-react.

## Global Constraints

- Use `lucide-react` as the single icon library for UI polish.
- Keep the current low-saturation Babycare palette; do not switch to a generic pink health-app palette.
- Do not add relative time shortcut buttons for record time.
- Do not restore collapsed optional sections for feeding and diaper forms.
- Use CSS variables for reusable colors and component roles.
- Keep primary mobile touch targets at least 48px high with at least 8px between adjacent controls.
- Use conditional visibility only when fields are irrelevant, such as stool details for wet-only diaper records.
- Start the daily rhythm visualization with custom CSS/SVG, not a charting dependency.
- Preserve the existing Server Action write flow.

---

## File Structure

- `package.json`, `package-lock.json`: add `lucide-react`.
- `app/globals.css`: introduce primitive, semantic, and component tokens; add dark theme variables, reusable UI classes, safe bottom spacing, focus styles, and reduced-motion support.
- `components/theme-toggle.tsx`: client component for light/dark/system theme selection.
- `components/app-shell.tsx`: add mobile bottom navigation/action area and theme toggle placement.
- `components/dashboard/quick-actions.tsx`: use Lucide icons and tokenized action styles.
- `components/dashboard/summary-cards.tsx`: use tokenized card styles and category markers.
- `components/dashboard/active-timers.tsx`: use tokenized active timer styles.
- `components/forms/feeding-form.tsx`: use tokenized form classes and Lucide action icons.
- `components/forms/diaper-form.tsx`: delegate diaper type state to a small client component.
- `components/forms/diaper-type-fields.tsx`: client component for accessible segmented diaper type controls and conditional stool fields.
- `components/forms/sleep-form.tsx`: use tokenized form classes and Lucide action icons.
- `lib/day-rhythm.ts`: normalize feeding, diaper, and sleep records into 24-hour chart segments and markers.
- `components/dashboard/day-rhythm-chart.tsx`: render the compact daily rhythm visualization.
- `lib/dashboard.ts`: expose current-day records or normalized rhythm data to the dashboard.
- `app/(app)/page.tsx`: place the rhythm chart in the dashboard order.
- `tests/unit/day-rhythm.test.ts`: cover normalization logic for sleep bars, bottle markers, diaper markers, and cross-midnight clipping.
- `docs/superpowers/specs/2026-07-03-babycare-ui-polish-design.md`: update implementation status after completion.

---

## Task 1: Token Foundation, Dark Theme, And Lucide Dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/globals.css`

**Interfaces:**
- Produces CSS variables used by later tasks:
  - `--background`, `--foreground`, `--surface`, `--surface-muted`, `--border-soft`
  - `--text-muted`, `--focus-ring`
  - `--accent-feeding`, `--accent-feeding-strong`, `--accent-feeding-soft`
  - `--accent-diaper`, `--accent-diaper-strong`, `--accent-diaper-soft`
  - `--accent-sleep`, `--accent-sleep-strong`, `--accent-sleep-soft`
  - `--action-neutral`, `--action-neutral-strong`
- Produces reusable classes used by later tasks:
  - `.bc-card`
  - `.bc-field`
  - `.bc-label`
  - `.bc-input`
  - `.bc-button`
  - `.bc-button-secondary`
  - `.bc-touch-link`
  - `.bc-focus-ring`

- [ ] **Step 1: Install Lucide**

Run:

```powershell
npm install lucide-react
```

Expected: `package.json` contains `lucide-react` in `dependencies`, and `package-lock.json` is updated.

- [ ] **Step 2: Replace `app/globals.css` token block**

Edit `app/globals.css` so the top-level token section contains this structure, preserving the existing `@import "tailwindcss";` line:

```css
:root {
  color-scheme: light;

  --color-cream-50: #fffdf9;
  --color-cream-100: #f7f3ee;
  --color-cream-200: #efe7dd;
  --color-cream-300: #ded4c8;
  --color-ink-900: #2f3432;
  --color-ink-700: #4a514e;
  --color-ink-600: #5d6661;
  --color-ink-500: #766e66;
  --color-feeding-500: #6f8f86;
  --color-feeding-600: #53756d;
  --color-feeding-100: #dce8e3;
  --color-diaper-500: #b88b7d;
  --color-diaper-600: #986f63;
  --color-diaper-100: #f0ddd6;
  --color-sleep-500: #8584a6;
  --color-sleep-600: #737196;
  --color-sleep-100: #dddceb;
  --color-danger-600: #b42318;
  --space-safe-bottom: 6rem;
  --radius-card: 0.5rem;
  --radius-control: 0.5rem;
  --shadow-card: 0 1px 2px rgb(47 52 50 / 0.08);
  --duration-fast: 150ms;

  --background: var(--color-cream-100);
  --foreground: var(--color-ink-900);
  --surface: var(--color-cream-50);
  --surface-muted: var(--color-cream-200);
  --border-soft: var(--color-cream-300);
  --text-muted: var(--color-ink-500);
  --focus-ring: var(--color-feeding-600);
  --accent-feeding: var(--color-feeding-500);
  --accent-feeding-strong: var(--color-feeding-600);
  --accent-feeding-soft: var(--color-feeding-100);
  --accent-diaper: var(--color-diaper-500);
  --accent-diaper-strong: var(--color-diaper-600);
  --accent-diaper-soft: var(--color-diaper-100);
  --accent-sleep: var(--color-sleep-500);
  --accent-sleep-strong: var(--color-sleep-600);
  --accent-sleep-soft: var(--color-sleep-100);
  --action-neutral: #8d877e;
  --action-neutral-strong: #6f6961;
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --background: #050606;
  --foreground: #e7ebe7;
  --surface: #111312;
  --surface-muted: #1b1f1d;
  --border-soft: #2c3430;
  --text-muted: #aab3ad;
  --focus-ring: #9fc5b7;
  --accent-feeding: #8fb5a9;
  --accent-feeding-strong: #a6d1c3;
  --accent-feeding-soft: #18231f;
  --accent-diaper: #c59a8c;
  --accent-diaper-strong: #dfb4a5;
  --accent-diaper-soft: #291d1a;
  --accent-sleep: #aaa8d0;
  --accent-sleep-strong: #c2c0ea;
  --accent-sleep-soft: #202034;
  --action-neutral: #a9a197;
  --action-neutral-strong: #cbc2b5;
  --shadow-card: 0 1px 2px rgb(0 0 0 / 0.32);
}
```

- [ ] **Step 3: Add reusable component classes**

Append these classes to `app/globals.css` after the existing global interaction rules:

```css
.bc-focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.bc-focus-ring:focus-visible {
  outline-color: var(--focus-ring);
}

.bc-card {
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-card);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.bc-field {
  display: block;
}

.bc-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
}

.bc-input {
  margin-top: 0.5rem;
  min-height: 3rem;
  width: 100%;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-control);
  background: var(--surface);
  color: var(--foreground);
  padding: 0.75rem;
}

.bc-button,
.bc-button-secondary,
.bc-touch-link {
  min-height: 3rem;
  border-radius: var(--radius-control);
  font-weight: 600;
}

.bc-button-secondary,
.bc-touch-link {
  border: 1px solid var(--border-soft);
  background: var(--surface);
  color: var(--foreground);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Run verification**

Run:

```powershell
npm run lint
npx tsc --noEmit
```

Expected: both commands exit with code 0.

- [ ] **Step 5: Commit**

```powershell
git add package.json package-lock.json app/globals.css
git commit -m "feat: add UI token foundation"
```

---

## Task 2: Theme Toggle And Mobile Bottom Navigation

**Files:**
- Create: `components/theme-toggle.tsx`
- Modify: `components/app-shell.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes Lucide icons from Task 1.
- Produces `ThemeToggle`:

```ts
export function ThemeToggle(): JSX.Element;
```

- Produces shell behavior: mobile bottom nav with Home, Timeline, and Record actions.

- [ ] **Step 1: Create client theme toggle**

Create `components/theme-toggle.tsx`:

```tsx
"use client";

import { Moon, Monitor, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeChoice = "system" | "light" | "dark";

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = choice === "system" ? (systemDark ? "dark" : "light") : choice;

  root.dataset.theme = resolved;
  root.dataset.themeChoice = choice;
  window.localStorage.setItem("babycare-theme", choice);
}

export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem("babycare-theme") as ThemeChoice | null;
    const next = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setChoice(next);
    applyTheme(next);
  }, []);

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
```

- [ ] **Step 2: Add mobile bottom safe padding**

Modify the outer shell in `components/app-shell.tsx` so the root element includes mobile bottom padding:

```tsx
<div className="min-h-screen bg-[var(--background)] pb-[var(--space-safe-bottom)] text-[var(--foreground)] md:pb-0">
```

- [ ] **Step 3: Add theme toggle to header**

Import and render `ThemeToggle` in `components/app-shell.tsx`:

```tsx
import { ThemeToggle } from "@/components/theme-toggle";
```

Place it inside the header controls after account settings:

```tsx
<ThemeToggle />
```

- [ ] **Step 4: Add mobile bottom navigation**

In `components/app-shell.tsx`, render this after `main` and before the closing root `div`:

```tsx
{currentChildId ? (
  <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-soft)] bg-[var(--surface)]/95 px-3 pb-3 pt-2 shadow-[0_-8px_24px_rgb(0_0_0_/_0.08)] backdrop-blur md:hidden">
    <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
      <Link className="bc-focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-sm font-medium text-[var(--foreground)]" href="/">
        <Home aria-hidden="true" size={24} />
        首页
      </Link>
      <Link className="bc-focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-sm font-medium text-[var(--foreground)]" href={`/children/${currentChildId}/timeline`}>
        <Clock3 aria-hidden="true" size={24} />
        时间线
      </Link>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-[var(--surface-muted)] p-1">
        <Link aria-label="记录喂养" className="bc-focus-ring flex min-h-12 items-center justify-center rounded-md bg-[var(--accent-feeding)] text-white" href={`/children/${currentChildId}/feedings/new`}>
          <Milk aria-hidden="true" size={24} />
        </Link>
        <Link aria-label="记录尿布" className="bc-focus-ring flex min-h-12 items-center justify-center rounded-md bg-[var(--accent-diaper)] text-white" href={`/children/${currentChildId}/diapers/new`}>
          <Baby aria-hidden="true" size={24} />
        </Link>
        <Link aria-label="开始睡眠" className="bc-focus-ring flex min-h-12 items-center justify-center rounded-md bg-[var(--accent-sleep)] text-white" href={`/children/${currentChildId}/sleep`}>
          <Moon aria-hidden="true" size={24} />
        </Link>
      </div>
    </div>
  </nav>
) : null}
```

Add the matching Lucide imports:

```tsx
import { Baby, Clock3, Home, Milk, Moon } from "lucide-react";
```

- [ ] **Step 5: Run verification**

Run:

```powershell
npm run lint
npx tsc --noEmit
```

Expected: both commands exit with code 0.

- [ ] **Step 6: Commit**

```powershell
git add components/app-shell.tsx components/theme-toggle.tsx app/globals.css
git commit -m "feat: add mobile shell controls"
```

---

## Task 3: Tokenize Dashboard Actions, Cards, And Active Timers

**Files:**
- Modify: `components/dashboard/quick-actions.tsx`
- Modify: `components/dashboard/summary-cards.tsx`
- Modify: `components/dashboard/active-timers.tsx`

**Interfaces:**
- Consumes tokens and Lucide icons from Tasks 1 and 2.
- Keeps existing component props unchanged.

- [ ] **Step 1: Update quick actions**

Modify `components/dashboard/quick-actions.tsx` to use Lucide icons and semantic colors:

```tsx
import { Baby, Clock3, Milk, Moon } from "lucide-react";
import Link from "next/link";

type QuickActionsProps = {
  childId: string;
};

export function QuickActions({ childId }: QuickActionsProps) {
  const actions = [
    {
      href: `/children/${childId}/feedings/new`,
      label: "喂养",
      Icon: Milk,
      tone: "bg-[var(--accent-feeding)]",
    },
    {
      href: `/children/${childId}/diapers/new`,
      label: "尿布",
      Icon: Baby,
      tone: "bg-[var(--accent-diaper)]",
    },
    {
      href: `/children/${childId}/sleep`,
      label: "睡眠",
      Icon: Moon,
      tone: "bg-[var(--accent-sleep)]",
    },
    {
      href: `/children/${childId}/timeline`,
      label: "时间线",
      Icon: Clock3,
      tone: "bg-[var(--action-neutral)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.Icon;

        return (
          <Link
            className={`${action.tone} bc-focus-ring flex min-h-16 items-center justify-center gap-2 rounded-lg px-4 py-5 text-center text-lg font-semibold text-white shadow-sm active:shadow-none`}
            href={action.href}
            key={action.href}
          >
            <Icon aria-hidden="true" size={28} />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Update summary cards**

Modify the card class in `components/dashboard/summary-cards.tsx`:

```tsx
className="bc-card p-4"
```

Modify text colors:

```tsx
<p className="text-sm text-[var(--text-muted)]">{card.label}</p>
<p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
  {card.value}
</p>
```

- [ ] **Step 3: Update active timers**

Modify `components/dashboard/active-timers.tsx` so active timer containers use token colors:

```tsx
className="rounded-lg border border-[var(--border-soft)] bg-[var(--accent-feeding-soft)] p-4"
```

and:

```tsx
className="rounded-lg border border-[var(--border-soft)] bg-[var(--accent-sleep-soft)] p-4"
```

Modify stop buttons:

```tsx
className="bc-focus-ring min-h-12 rounded-lg bg-[var(--accent-feeding-strong)] px-4 py-3 text-sm font-medium text-white"
```

and:

```tsx
className="bc-focus-ring min-h-12 rounded-lg bg-[var(--accent-sleep-strong)] px-4 py-3 text-sm font-medium text-white"
```

- [ ] **Step 4: Run verification**

Run:

```powershell
npm run lint
npx tsc --noEmit
```

Expected: both commands exit with code 0.

- [ ] **Step 5: Commit**

```powershell
git add components/dashboard/quick-actions.tsx components/dashboard/summary-cards.tsx components/dashboard/active-timers.tsx
git commit -m "feat: polish dashboard controls"
```

---

## Task 4: Tokenize Forms And Add Conditional Diaper Details

**Files:**
- Modify: `components/forms/feeding-form.tsx`
- Modify: `components/forms/diaper-form.tsx`
- Create: `components/forms/diaper-type-fields.tsx`
- Modify: `components/forms/sleep-form.tsx`

**Interfaces:**
- Produces `DiaperTypeFields`:

```ts
export function DiaperTypeFields(): JSX.Element;
```

- Keeps submitted field names unchanged:
  - `type`
  - `stoolColor`
  - `stoolConsistency`

- [ ] **Step 1: Create diaper type client component**

Create `components/forms/diaper-type-fields.tsx`:

```tsx
"use client";

import { Baby, Droplets } from "lucide-react";
import { useState } from "react";

type DiaperType = "wet" | "dirty" | "both";

const options: Array<{ value: DiaperType; label: string }> = [
  { value: "wet", label: "尿湿" },
  { value: "dirty", label: "便便" },
  { value: "both", label: "都有" },
];

export function DiaperTypeFields() {
  const [type, setType] = useState<DiaperType>("wet");
  const showStoolFields = type === "dirty" || type === "both";

  return (
    <fieldset className="space-y-4">
      <legend className="bc-label">类型</legend>
      <input name="type" type="hidden" value={type} />
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const active = type === option.value;

          return (
            <button
              aria-pressed={active}
              className={`bc-focus-ring flex min-h-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
                active
                  ? "border-[var(--accent-diaper-strong)] bg-[var(--accent-diaper-soft)] text-[var(--foreground)]"
                  : "border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-muted)]"
              }`}
              key={option.value}
              onClick={() => setType(option.value)}
              type="button"
            >
              {option.value === "wet" ? (
                <Droplets aria-hidden="true" size={20} />
              ) : (
                <Baby aria-hidden="true" size={20} />
              )}
              {option.label}
            </button>
          );
        })}
      </div>

      {showStoolFields ? (
        <div className="space-y-4">
          <label className="block">
            <span className="bc-label">便便颜色</span>
            <select className="bc-input bc-focus-ring" defaultValue="" name="stoolColor">
              <option value="">未指定</option>
              <option value="yellow">黄色</option>
              <option value="brown">棕色</option>
              <option value="green">绿色</option>
              <option value="black">黑色</option>
              <option value="red">红色</option>
              <option value="white">白色</option>
              <option value="other">其他</option>
            </select>
          </label>
          <label className="block">
            <span className="bc-label">便便性状</span>
            <select className="bc-input bc-focus-ring" defaultValue="" name="stoolConsistency">
              <option value="">未指定</option>
              <option value="watery">水样</option>
              <option value="loose">稀软</option>
              <option value="soft">软便</option>
              <option value="formed">成形</option>
              <option value="hard">偏硬</option>
              <option value="mucousy">黏液</option>
              <option value="other">其他</option>
            </select>
          </label>
        </div>
      ) : null}
    </fieldset>
  );
}
```

- [ ] **Step 2: Replace diaper type and stool fields**

In `components/forms/diaper-form.tsx`, import:

```tsx
import { DiaperTypeFields } from "@/components/forms/diaper-type-fields";
```

Remove the existing `type`, `stoolColor`, and `stoolConsistency` label/select blocks. Insert:

```tsx
<DiaperTypeFields />
```

- [ ] **Step 3: Tokenize field classes in form files**

In `components/forms/feeding-form.tsx`, `components/forms/diaper-form.tsx`, and `components/forms/sleep-form.tsx`, replace repeated input/select/textarea class strings with:

```tsx
className="bc-input bc-focus-ring"
```

Replace label text spans with:

```tsx
className="bc-label"
```

Replace secondary home links with:

```tsx
className="bc-touch-link bc-focus-ring flex items-center justify-center px-4 py-3"
```

- [ ] **Step 4: Add Lucide icons to primary form buttons**

Use these imports:

```tsx
import { Baby, Milk, Moon } from "lucide-react";
```

Render icons inside primary buttons:

```tsx
<button className="bc-focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-feeding-strong)] px-4 py-4 text-lg font-semibold text-white shadow-sm">
  <Milk aria-hidden="true" size={24} />
  保存瓶喂
</button>
```

Use `Baby` for diaper submit and `Moon` for sleep submit.

- [ ] **Step 5: Run verification**

Run:

```powershell
npm run lint
npx tsc --noEmit
```

Expected: both commands exit with code 0.

- [ ] **Step 6: Commit**

```powershell
git add components/forms/feeding-form.tsx components/forms/diaper-form.tsx components/forms/diaper-type-fields.tsx components/forms/sleep-form.tsx
git commit -m "feat: polish record forms"
```

---

## Task 5: Daily Rhythm Data Helper

**Files:**
- Create: `lib/day-rhythm.ts`
- Create: `tests/unit/day-rhythm.test.ts`

**Interfaces:**
- Produces:

```ts
export type RhythmSleepSegment = {
  id: string;
  startPercent: number;
  widthPercent: number;
  label: string;
};

export type RhythmMarker = {
  id: string;
  percent: number;
  label: string;
  kind: "feeding" | "diaper";
  value?: string;
};

export type DayRhythm = {
  date: string;
  sleepSegments: RhythmSleepSegment[];
  markers: RhythmMarker[];
};

export function buildDayRhythm(input: {
  date: string;
  timezone?: string;
  feedings: Array<{
    id: string;
    type: "breast" | "bottle";
    startTime: Date;
    endTime?: Date | null;
    amountMl?: number | null;
  }>;
  diapers: Array<{
    id: string;
    time: Date;
    type: "wet" | "dirty" | "both";
  }>;
  sleeps: Array<{
    id: string;
    startTime: Date;
    endTime?: Date | null;
  }>;
}): DayRhythm;
```

- [ ] **Step 1: Write failing tests**

Create `tests/unit/day-rhythm.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { buildDayRhythm } from "@/lib/day-rhythm";

describe("day rhythm helper", () => {
  test("maps bottle feedings and diaper records onto a local 24-hour axis", () => {
    const rhythm = buildDayRhythm({
      date: "2026-06-25",
      timezone: "Asia/Shanghai",
      feedings: [
        {
          id: "feeding-1",
          type: "bottle",
          startTime: new Date("2026-06-25T06:00:00.000Z"),
          amountMl: 120,
        },
      ],
      diapers: [
        {
          id: "diaper-1",
          time: new Date("2026-06-25T08:00:00.000Z"),
          type: "dirty",
        },
      ],
      sleeps: [],
    });

    expect(rhythm.markers).toEqual([
      {
        id: "feeding-1",
        percent: 58.33,
        label: "14:00 喂养",
        kind: "feeding",
        value: "120 ml",
      },
      {
        id: "diaper-1",
        percent: 66.67,
        label: "16:00 便便",
        kind: "diaper",
      },
    ]);
  });

  test("clips sleep segments to the selected local day", () => {
    const rhythm = buildDayRhythm({
      date: "2026-06-25",
      timezone: "Asia/Shanghai",
      feedings: [],
      diapers: [],
      sleeps: [
        {
          id: "sleep-1",
          startTime: new Date("2026-06-24T15:00:00.000Z"),
          endTime: new Date("2026-06-24T18:00:00.000Z"),
        },
      ],
    });

    expect(rhythm.sleepSegments).toEqual([
      {
        id: "sleep-1",
        startPercent: 0,
        widthPercent: 8.33,
        label: "睡眠 00:00-02:00",
      },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- tests/unit/day-rhythm.test.ts
```

Expected: FAIL because `@/lib/day-rhythm` does not exist.

- [ ] **Step 3: Implement helper**

Create `lib/day-rhythm.ts`:

```ts
import { getLocalDayRange } from "@/lib/time";

export type RhythmSleepSegment = {
  id: string;
  startPercent: number;
  widthPercent: number;
  label: string;
};

export type RhythmMarker = {
  id: string;
  percent: number;
  label: string;
  kind: "feeding" | "diaper";
  value?: string;
};

export type DayRhythm = {
  date: string;
  sleepSegments: RhythmSleepSegment[];
  markers: RhythmMarker[];
};

type DateParts = {
  hour: number;
  minute: number;
};

function roundPercent(value: number) {
  return Math.round(value * 100) / 100;
}

function getParts(date: Date, timezone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function formatTime(date: Date, timezone: string) {
  const parts = getParts(date, timezone);
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

function percentOfDay(date: Date, rangeStart: Date) {
  return roundPercent(((date.getTime() - rangeStart.getTime()) / 86_400_000) * 100);
}

function diaperLabel(type: "wet" | "dirty" | "both") {
  if (type === "wet") return "尿湿";
  if (type === "dirty") return "便便";
  return "都有";
}

export function buildDayRhythm(input: {
  date: string;
  timezone?: string;
  feedings: Array<{
    id: string;
    type: "breast" | "bottle";
    startTime: Date;
    endTime?: Date | null;
    amountMl?: number | null;
  }>;
  diapers: Array<{
    id: string;
    time: Date;
    type: "wet" | "dirty" | "both";
  }>;
  sleeps: Array<{
    id: string;
    startTime: Date;
    endTime?: Date | null;
  }>;
}): DayRhythm {
  const timezone = input.timezone ?? "Asia/Shanghai";
  const range = getLocalDayRange(input.date, timezone);
  const markers: RhythmMarker[] = [];

  for (const feeding of input.feedings) {
    if (feeding.startTime < range.start || feeding.startTime >= range.end) continue;

    markers.push({
      id: feeding.id,
      percent: percentOfDay(feeding.startTime, range.start),
      label: `${formatTime(feeding.startTime, timezone)} 喂养`,
      kind: "feeding",
      value:
        feeding.type === "bottle" && feeding.amountMl
          ? `${feeding.amountMl} ml`
          : undefined,
    });
  }

  for (const diaper of input.diapers) {
    if (diaper.time < range.start || diaper.time >= range.end) continue;

    markers.push({
      id: diaper.id,
      percent: percentOfDay(diaper.time, range.start),
      label: `${formatTime(diaper.time, timezone)} ${diaperLabel(diaper.type)}`,
      kind: "diaper",
    });
  }

  const sleepSegments = input.sleeps
    .map((sleep) => {
      const endTime = sleep.endTime ?? new Date();
      const start = new Date(Math.max(sleep.startTime.getTime(), range.start.getTime()));
      const end = new Date(Math.min(endTime.getTime(), range.end.getTime()));

      if (end <= start) return null;

      return {
        id: sleep.id,
        startPercent: percentOfDay(start, range.start),
        widthPercent: roundPercent(((end.getTime() - start.getTime()) / 86_400_000) * 100),
        label: `睡眠 ${formatTime(start, timezone)}-${formatTime(end, timezone)}`,
      };
    })
    .filter((segment): segment is RhythmSleepSegment => Boolean(segment));

  return {
    date: input.date,
    sleepSegments,
    markers: markers.sort((left, right) => left.percent - right.percent),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
npm test -- tests/unit/day-rhythm.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add lib/day-rhythm.ts tests/unit/day-rhythm.test.ts
git commit -m "feat: add daily rhythm helper"
```

---

## Task 6: Daily Rhythm Chart And Dashboard Integration

**Files:**
- Create: `components/dashboard/day-rhythm-chart.tsx`
- Modify: `lib/dashboard.ts`
- Modify: `app/(app)/page.tsx`

**Interfaces:**
- Consumes `buildDayRhythm` from Task 5.
- `getDashboardData` return object gains:

```ts
dayRhythm: DayRhythm;
```

- [ ] **Step 1: Add rhythm data to dashboard loader**

Modify `lib/dashboard.ts` imports:

```ts
import { buildDayRhythm } from "@/lib/day-rhythm";
```

Add `dayRhythm` to the returned object:

```ts
dayRhythm: buildDayRhythm({
  date: today,
  timezone: "Asia/Shanghai",
  feedings,
  diapers,
  sleeps,
}),
```

- [ ] **Step 2: Create rhythm chart component**

Create `components/dashboard/day-rhythm-chart.tsx`:

```tsx
import type { DayRhythm } from "@/lib/day-rhythm";

type DayRhythmChartProps = {
  rhythm: DayRhythm;
};

export function DayRhythmChart({ rhythm }: DayRhythmChartProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">今日节奏</h2>
        <p className="text-sm text-[var(--text-muted)]">
          睡眠、喂养和尿布记录按 24 小时排列。
        </p>
      </div>
      <div className="bc-card overflow-hidden p-4">
        <div className="relative min-h-32 rounded-lg bg-[var(--surface-muted)] p-3">
          <div className="absolute inset-x-3 top-1/2 h-px bg-[var(--border-soft)]" />
          {rhythm.sleepSegments.map((segment) => (
            <div
              aria-label={segment.label}
              className="absolute top-5 h-8 rounded-full bg-[var(--accent-sleep)]"
              key={segment.id}
              role="img"
              style={{
                left: `${segment.startPercent}%`,
                width: `${segment.widthPercent}%`,
              }}
              title={segment.label}
            />
          ))}
          {rhythm.markers.map((marker) => (
            <div
              className="absolute top-16 -translate-x-1/2 text-center"
              key={marker.id}
              style={{ left: `${marker.percent}%` }}
            >
              <div
                aria-label={`${marker.label}${marker.value ? ` ${marker.value}` : ""}`}
                className={`mx-auto h-4 w-4 rounded-full border-2 border-[var(--surface)] ${
                  marker.kind === "feeding"
                    ? "bg-[var(--accent-feeding)]"
                    : "bg-[var(--accent-diaper)]"
                }`}
                role="img"
                title={`${marker.label}${marker.value ? ` ${marker.value}` : ""}`}
              />
              {marker.value ? (
                <p className="mt-1 whitespace-nowrap text-[10px] text-[var(--text-muted)]">
                  {marker.value}
                </p>
              ) : null}
            </div>
          ))}
          <div className="absolute inset-x-3 bottom-2 flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>
        <ul className="mt-4 space-y-1 text-sm text-[var(--text-muted)]">
          {rhythm.sleepSegments.slice(0, 3).map((segment) => (
            <li key={segment.id}>{segment.label}</li>
          ))}
          {rhythm.markers.slice(0, 5).map((marker) => (
            <li key={marker.id}>
              {marker.label}
              {marker.value ? ` · ${marker.value}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Place rhythm chart on dashboard**

Modify `app/(app)/page.tsx` imports:

```tsx
import { DayRhythmChart } from "@/components/dashboard/day-rhythm-chart";
```

Render after `SummaryCards`:

```tsx
<DayRhythmChart rhythm={dashboard.dayRhythm} />
```

- [ ] **Step 4: Run verification**

Run:

```powershell
npm test -- tests/unit/day-rhythm.test.ts
npm run lint
npx tsc --noEmit
```

Expected: all commands exit with code 0.

- [ ] **Step 5: Commit**

```powershell
git add components/dashboard/day-rhythm-chart.tsx lib/dashboard.ts "app/(app)/page.tsx"
git commit -m "feat: add daily rhythm chart"
```

---

## Task 7: Final UI Verification And Documentation Sync

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-07-03-babycare-ui-polish-design.md`
- Modify: `docs/superpowers/specs/2026-06-24-babycare-mvp-design.md`

**Interfaces:**
- Documents the completed UI polish behavior.
- Does not change application behavior.

- [ ] **Step 1: Update README feature list**

Add these bullets to the README feature list:

```markdown
- The UI uses tokenized light and dark themes for low-light family care use.
- Mobile navigation includes bottom-biased shortcuts for dashboard, timeline, and high-frequency record actions.
- The dashboard includes a compact daily rhythm view for sleep, feeding, and diaper timing.
```

- [ ] **Step 2: Update UI polish design status**

In `docs/superpowers/specs/2026-07-03-babycare-ui-polish-design.md`, add this section before `## Approval Notes`:

```markdown
## Implementation Status

Implemented on `main` after the post-v1.2.1 design pass:

- Tokenized light and dark themes.
- Lucide icon system.
- Mobile bottom navigation and record shortcuts.
- Tokenized high-frequency record forms.
- Conditional stool details for diaper records.
- Daily rhythm dashboard visualization.
```

- [ ] **Step 3: Update MVP design status**

In `docs/superpowers/specs/2026-06-24-babycare-mvp-design.md`, extend Current Implementation Status with:

```markdown
- Post-v1.2 UI polish now includes tokenized light/dark themes, Lucide icons, mobile bottom navigation, conditional diaper detail display, and a compact daily rhythm visualization.
```

- [ ] **Step 4: Run full verification**

Run:

```powershell
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all commands exit with code 0. If `npm run build` fails with Windows sandbox `EPERM`, rerun it outside the sandbox with the same command and record the result.

- [ ] **Step 5: Commit**

```powershell
git add README.md docs/superpowers/specs/2026-07-03-babycare-ui-polish-design.md docs/superpowers/specs/2026-06-24-babycare-mvp-design.md
git commit -m "docs: sync UI polish status"
```

---

## Self-Review

Spec coverage:

- Tokenized design system: Task 1.
- Dark mode: Tasks 1 and 2.
- One-handed bottom navigation: Task 2.
- Lucide icons: Tasks 1, 2, 3, and 4.
- Form ergonomics without collapsed sections: Task 4.
- Diaper conditional stool fields: Task 4.
- Dashboard polish and daily rhythm visualization: Tasks 3, 5, and 6.
- Accessibility and responsive verification: Tasks 1 through 7.
- Documentation sync: Task 7.

Known implementation risks:

- `ThemeToggle` is a client component; keep it isolated so the app shell can remain otherwise simple.
- Diaper segmented controls submit through hidden inputs; preserve the existing `type`, `stoolColor`, and `stoolConsistency` field names.
- Daily rhythm chart positions use percentages; keep visible text summaries so chart meaning is not hover-only or color-only.
- `lucide-react` requires dependency installation before code imports compile.

Execution order:

1. Task 1 must run first because later tasks depend on tokens and Lucide.
2. Task 5 must run before Task 6 because the chart consumes `DayRhythm`.
3. Task 7 must run last because it documents implemented behavior and performs full verification.
