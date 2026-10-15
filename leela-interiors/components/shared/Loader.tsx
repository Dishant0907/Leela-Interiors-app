export function Loader({ label = "Leela Interiors" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-5"
    >
      <div className="relative h-14 w-14">
        {/* soft glow */}
        <span
          className="absolute inset-2 rounded-full bg-sky-300/50 blur-md"
          style={{ animation: "loader-breathe 1.8s ease-in-out infinite" }}
        />
        {/* track */}
        <span className="absolute inset-0 rounded-full border-2 border-zinc-200" />
        {/* orbiting arc */}
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 border-r-violet-400"
          style={{ animation: "loader-orbit 0.9s linear infinite" }}
        />
        {/* core */}
        <span
          className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-sky-400 to-violet-400"
          style={{ animation: "loader-breathe 1.8s ease-in-out infinite" }}
        />
      </div>
      <p
        className="text-base font-semibold tracking-[0.25em] text-zinc-900 uppercase"
        style={{ animation: "loader-fade 1.8s ease-in-out infinite" }}
      >
        {label}
      </p>
    </div>
  );
}
