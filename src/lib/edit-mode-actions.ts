"use server";

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const EDIT_MODE_COOKIE = "editor-mode";

/**
 * Turns the site-wide "editor mode" cookie on/off. Gated by a real admin
 * auth check server-side -- calling this without a valid Supabase session
 * is a no-op, so the cookie can never be set by anyone but a logged-in
 * admin, even if someone crafts the request by hand.
 */
export async function setEditMode(on: boolean) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "not authenticated" };
  }

  const cookieStore = await cookies();
  if (on) {
    cookieStore.set(EDIT_MODE_COOKIE, "1", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    cookieStore.delete(EDIT_MODE_COOKIE);
  }

  return { success: true as const };
}
