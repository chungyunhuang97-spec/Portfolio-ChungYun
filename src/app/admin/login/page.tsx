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
    <main className="admin-shell flex min-h-[100dvh] items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-[32px] border border-white/70 bg-white p-8 shadow-[0_30px_70px_-40px_rgba(12,12,14,0.5)]">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-admin-text-faint"><span className="size-2 rounded-full bg-admin-lime ring-4 ring-admin-ink/90" />ADMIN</p>
        <h1 className="mt-3 text-3xl font-semibold text-admin-text">登入後台</h1>

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
            className="mt-2 rounded-full bg-admin-ink px-4 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "登入中…" : "登入"}
          </button>
        </form>
      </div>
    </main>
  );
}
