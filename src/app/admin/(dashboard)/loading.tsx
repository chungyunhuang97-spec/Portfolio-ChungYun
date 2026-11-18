/**
 * Shown instantly while an admin page's data loads. Because the sidebar and
 * top bar live in the layout, a navigation swaps only this area -- so a click
 * gets visible feedback straight away instead of freezing on the old page.
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="載入中" className="animate-pulse space-y-8">
      <div className="flex items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded-full bg-black/10" />
          <div className="h-10 w-64 rounded-2xl bg-black/10" />
        </div>
        <div className="hidden gap-8 sm:flex">
          <div className="h-12 w-20 rounded-2xl bg-black/10" />
          <div className="h-12 w-20 rounded-2xl bg-black/10" />
        </div>
      </div>
      <div className="h-12 w-full max-w-md rounded-full bg-white/70" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 rounded-[26px] bg-white/70" />
        ))}
      </div>
    </div>
  );
}
