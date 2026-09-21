/**
 * An explicit theme choice. When no choice has been made the page follows the
 * operating system via `prefers-color-scheme` (see globals.css).
 */
export type Theme = "light" | "dark";

export const THEME_COOKIE = "theme";

export const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";
