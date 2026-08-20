"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-shell flex min-h-[100dvh] items-center justify-center bg-admin-bg px-6">
      <div className="w-full max-w-sm rounded-lg border border-admin-border bg-admin-surface p-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-admin-text-faint">ADMIN</p>
        <h1 className="mt-3 text-2xl font-semibold text-admin-text">Sign in</h1>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm text-admin-text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-admin-border bg-admin-bg px-3 py-2.5 text-sm text-admin-text outline-none transition-colors focus:border-admin-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm text-admin-text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-admin-border bg-admin-bg px-3 py-2.5 text-sm text-admin-text outline-none transition-colors focus:border-admin-accent"
            />
          </div>

          {error && <p className="text-sm text-admin-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-admin-text px-4 py-2.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-admin-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
