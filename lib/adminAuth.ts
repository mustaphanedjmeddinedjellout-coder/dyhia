import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "admin_session";

export const isAdminLoggedIn = async () =>
  (await cookies()).get(ADMIN_COOKIE_NAME)?.value === "1";

export const setAdminCookie = async () => {
  (await cookies()).set(ADMIN_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
};

export const clearAdminCookie = async () => {
  (await cookies()).set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
};
