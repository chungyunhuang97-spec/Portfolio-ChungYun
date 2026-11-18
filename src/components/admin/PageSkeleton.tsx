/** Instant placeholder shown while an admin page's data loads. */
export function PageSkeleton({ variant = "list" }: { variant?: "list" | "editor" }) {
  return (
    <div aria-busy="true" aria-label="載入中" className="animate-pulse space-y-8">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded-full bg-black/10" />
        <div className="h-10 w-72 max-w-full rounded-2xl bg-black/10" />
      </div>
      {variant === "editor" ? (
        <div className="max-w-3xl space-y-4">
          <div className="h-14 rounded-full bg-white/70" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-[22px] bg-white/70" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-[26px] bg-white/70" />
          ))}
        </div>
      )}
    </div>
  );
}
