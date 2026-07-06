export type ThemeChoice = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const themeChoices = ["light", "dark", "system"] as const;

export function normalizeThemeChoice(value: string | null): ThemeChoice {
  return value === "light" || value === "dark" || value === "system"
    ? value
    : "system";
}

export function resolveThemeChoice(
  choice: ThemeChoice,
  systemDark: boolean,
): ResolvedTheme {
  if (choice !== "system") {
    return choice;
  }

  return systemDark ? "dark" : "light";
}
