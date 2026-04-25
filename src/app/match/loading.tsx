export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="h-8 w-40 bg-white/5 rounded-lg animate-pulse mb-6" />
      <div className="h-10 w-72 bg-white/5 rounded-lg animate-pulse mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/5 p-5 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-1/2 bg-white/5 rounded" />
                <div className="h-4 w-1/3 bg-white/5 rounded" />
                <div className="h-16 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
