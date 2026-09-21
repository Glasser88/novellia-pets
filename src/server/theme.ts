"use server";

import { cookies } from "next/headers";
import { isTheme, THEME_COOKIE, type Theme } from "@/shared/theme";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** The user's explicit theme choice, or undefined to follow the system. */
export const getTheme = async (): Promise<Theme | undefined> => {
  const value = (await cookies()).get(THEME_COOKIE)?.value;
  return isTheme(value) ? value : undefined;
};

/**
 * Server Action: remember the choice in a cookie. The root layout reads it
 * and renders the class on <html>, so there is no flash and no client script.
 * Setting a cookie in an action makes Next re-render the current route.
 */
export const setTheme = async (theme: Theme): Promise<void> => {
  (await cookies()).set(THEME_COOKIE, theme, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
};
