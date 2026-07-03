# Babycare UI Polish Design

## Goal

Improve Babycare's day-to-day mobile experience for parents recording feeding,
diaper, and sleep events under one-handed and night-time conditions. The design
keeps the current calm family tone while adding a stronger design-token system,
low-light mode, bottom-biased navigation, clearer form ergonomics, and a simple
daily rhythm visualization.

## Inputs

- Current product state on `main`: V1.2.1 behavior is implemented, including
  editable record times, visible high-frequency form fields, dashboard summary
  cards, seven-day summaries, and mobile-friendly quick actions.
- User preference: no `15/30 minutes ago` style quick time buttons.
- User preference: feeding and diaper forms should not hide important content in
  collapsed sections.
- UI reference image: recommends one-handed ergonomics, dark mode, progressive
  density control, and cross-record visualization.
- Local UI skills used for design direction: `design-system`, `ui-styling`, and
  `ui-ux-pro-max`.

## Design Direction

Use a "calm care cockpit" direction:

- Keep the current low-saturation family palette instead of switching to a
  generic pink health-app palette.
- Make high-frequency actions reachable from the lower half of the phone screen.
- Support night use with a low-emission dark theme.
- Avoid hiding fields behind disclosure controls when that adds friction.
- Use conditional visibility only when the field is irrelevant, such as stool
  details for wet-only diaper records.
- Add compact visual summaries that explain the day without turning the app into
  an analytics product.

## Design System

Adopt a three-layer token model in `app/globals.css`:

1. Primitive tokens: raw palette, spacing, radius, shadow, and duration values.
2. Semantic tokens: background, surface, foreground, muted text, border, focus,
   feeding, diaper, sleep, and neutral action roles.
3. Component tokens: button, input, card, shell, bottom nav, and chart colors.

The current palette should be retained and formalized:

- Feeding: soft green, based on current `--primary` and `--primary-strong`.
- Diaper: muted clay, based on current `--accent`.
- Sleep: muted blue-gray-purple, based on current sleep button and rest colors.
- Neutral surfaces: warm off-white in light mode, low-emission charcoal in dark
  mode.

Hardcoded colors in core UI files should be replaced with semantic tokens where
the values represent reusable roles. One-off record category colors should become
component or semantic tokens instead of inline hex values.

## Dark Mode

Add full dark theme support using CSS variables and a small theme toggle.

Dark mode requirements:

- Follow system preference by default.
- Allow explicit light/dark selection from account or shell controls.
- Use low-emission surfaces:
  - Background near `#050606`.
  - Surface near `#111312`.
  - Primary text near `#e7ebe7`.
  - Muted text with at least 3:1 contrast.
- Avoid large pure-white areas.
- Keep category colors recognizable but less bright than light mode.
- Keep focus rings visible in both themes.

Dark mode should not rely on color alone. Record categories still need visible
labels, shapes, and text values.

## Navigation And One-Handed Use

Keep the existing top shell for child context and account/family management, but
add a mobile-first bottom action area for frequent work.

Recommended mobile bottom bar:

- Home
- Timeline
- Record

The Record action should expose feeding, diaper, and sleep as large touch
targets. The first implementation can use an inline expanded tray or a simple
mobile action panel; it should not introduce a complex multi-step modal.

Touch target rules:

- Minimum interactive height: 48px for primary mobile actions.
- Minimum gap between adjacent actions: 8px.
- Pressed feedback should use opacity, shadow, or color changes without layout
  shift.
- Fixed bottom UI must leave safe scroll padding so content is not hidden.

Desktop can keep the current header-first navigation, with optional bottom bar
hidden at wider breakpoints.

## Icons

Use `lucide-react` as the single icon library for the UI polish pass.

Icon rules:

- Use Lucide icons for navigation, quick actions, record categories, settings,
  and theme controls.
- Keep icons decorative only when adjacent text already names the action.
- Add `aria-label` or screen-reader text for icon-only controls.
- Use one stroke style and consistent sizing across the same hierarchy.
- Default sizes:
  - 20px for compact header and table actions.
  - 24px for bottom navigation and form action icons.
  - 28px for primary record action icons when paired with large labels.
- Do not use emoji as structural UI icons.
- Do not mix Lucide with another icon set unless a required symbol is genuinely
  missing.

## Forms

Form priority is speed and certainty.

Shared form rules:

- Keep record/start time visible and editable.
- Do not add relative time shortcut buttons.
- Keep labels visible, not placeholder-only.
- Use a consistent field component style for inputs, selects, and textareas.
- Keep primary submit actions large and easy to reach.
- Use clear error messages near the top and preserve accessible form labels.

Feeding form:

- Keep visible fields: record time, amount, content, notes.
- Consider common amount chips only if they do not replace free numeric input.
  This is optional and not part of the first pass.
- Separate bottle feeding and breastfeeding visually with clear section headings.

Diaper form:

- Replace the select with segmented controls for wet, dirty, and both if the
  implementation can preserve accessibility and server-action compatibility.
- Hide stool color and consistency only for wet-only records.
- Show stool color and consistency directly for dirty or both records.
- Do not use a collapsed "details" area.

Sleep form:

- Keep start time visible and editable.
- Keep notes visible.
- Keep the primary action close to the bottom of the viewport on mobile.

## Dashboard

The dashboard should remain operational, not marketing-like.

Recommended layout order:

1. Child context and day status header.
2. Large quick actions or mobile bottom record action.
3. Active timers, when present.
4. Today summary cards.
5. Daily rhythm visualization.
6. Bottle insights and seven-day summary.
7. Recent events.

Summary cards should use consistent card tokens, typography, and category
markers. Values must remain readable on small screens and in dark mode.

## Daily Rhythm Visualization

Add a compact "today rhythm" module that combines the most useful record types
on a 24-hour axis.

Initial scope:

- Horizontal time axis from 00:00 to 24:00.
- Sleep records shown as horizontal duration bars.
- Bottle feedings shown as point or bar markers with amount labels.
- Diaper records shown as small markers with text labels or accessible title
  text.
- Always include text summaries so the chart is not the only source of meaning.

Implementation recommendation:

- Start with custom CSS/SVG rather than introducing a charting dependency.
- Keep it responsive and readable at 375px width.
- Avoid hover-only data access; mobile users need visible values or tap targets.
- Use line styles, labels, and marker shapes in addition to color.

Out of scope for the first UI polish pass:

- AI insights.
- Predictive recommendations.
- Zoomable chart interactions.
- Complex multi-day overlays.

## Accessibility

Apply the UI skill checklist to the web app context:

- All interactive controls must be keyboard reachable.
- Focus indicators must be visible in light and dark modes.
- Form fields need labels and clear errors.
- Text contrast should meet WCAG AA.
- Color must not be the only category indicator.
- Motion should respect `prefers-reduced-motion`.
- Layout must work at 375px, 768px, 1024px, and desktop widths.

## Implementation Boundaries

Likely files:

- `app/globals.css`: token structure, light/dark variables, component utility
  classes, reduced-motion support.
- `components/app-shell.tsx`: mobile bottom navigation/action area and optional
  theme control placement.
- `components/forms/feeding-form.tsx`: tokenized field/button styling.
- `components/forms/diaper-form.tsx`: conditional stool details and tokenized
  controls.
- `components/forms/sleep-form.tsx`: tokenized field/button styling.
- `components/dashboard/summary-cards.tsx`: tokenized summary card styles.
- `components/dashboard/quick-actions.tsx`: large action styling and bottom
  action integration.
- `components/dashboard/day-rhythm-chart.tsx`: new compact daily rhythm module.
- `lib/dashboard.ts` or a small formatter helper if the chart needs normalized
  timeline data.
- `package.json` and `package-lock.json`: add `lucide-react` for consistent
  vector icons if it is not already present.

Avoid broad refactors outside the shell, dashboard, form, and token surface.

## Testing And Verification

Expected verification:

- `npm test`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

Manual UI checks:

- 375px mobile viewport.
- 768px tablet viewport.
- Desktop viewport.
- Light mode.
- Dark mode.
- Reduced motion enabled.
- Keyboard tab order through shell, quick actions, and forms.

If browser automation is available during implementation, capture mobile and
desktop screenshots before declaring the UI pass complete.

## Non-Goals

- No native mobile app.
- No new public API.
- No push notification system.
- No charting library unless the custom rhythm chart becomes too costly.
- No return to collapsed optional sections for feeding and diaper forms.
- No relative time quick buttons for record time.

## Implementation Status

Implemented on `main` after the post-v1.2.1 design pass:

- Tokenized light and dark themes.
- Lucide icon system.
- Mobile bottom navigation and record shortcuts.
- Tokenized high-frequency record forms.
- Conditional stool details for diaper records.
- Daily rhythm dashboard visualization.

## Approval Notes

This design is intended as a post-v1.2.1 UI polish pass. It should be implemented
incrementally: token and dark mode first, navigation/forms second, daily rhythm
visualization third.
