export default function Loading() {
  return (
    <div className="min-h-screen bg-ghost-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-midnight-navy flex items-center justify-center animate-pulse">
          <span className="text-white font-black text-sm">XR</span>
        </div>
        <p className="text-sm font-label font-semibold uppercase tracking-wider text-on-surface-variant">
          Loading…
        </p>
      </div>
    </div>
  );
}
