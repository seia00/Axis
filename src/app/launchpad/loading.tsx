export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="h-8 w-36 bg-white/5 rounded-lg animate-pulse mb-6" />
      <div className="flex gap-6">
        <aside className="w-52 flex-shrink-0 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </aside>
        <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/5 p-5 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="h-5 w-16 bg-white/5 rounded-full" />
                <div className="h-5 w-20 bg-white/5 rounded-full" />
              </div>
              <div className="h-5 w-3/4 bg-white/5 rounded" />
              <div className="h-16 bg-white/5 rounded" />
              <div className="h-px bg-white/5" />
              <div className="h-5 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
