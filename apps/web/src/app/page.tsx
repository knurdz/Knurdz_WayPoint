export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-2xl p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/30 rounded-full">
          Tech-Triathlon 2026 · Hackathon
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
          Waypoint Intelligent Enterprise
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Shared logistics optimization engine across 120 retail outlets, 2 depots, and a 60-vehicle dedicated fleet.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <a
            href="/dispatcher"
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors"
          >
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Dispatcher</div>
            <div className="text-[11px] text-slate-500">Mission Control</div>
          </a>
          <a
            href="/loader"
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors"
          >
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Loader</div>
            <div className="text-[11px] text-slate-500">Dock Terminal</div>
          </a>
          <a
            href="/driver"
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors"
          >
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Driver</div>
            <div className="text-[11px] text-slate-500">Mobile PWA</div>
          </a>
          <a
            href="/store"
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors"
          >
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Store</div>
            <div className="text-[11px] text-slate-500">Orders & POD</div>
          </a>
        </div>
      </div>
    </div>
  );
}
