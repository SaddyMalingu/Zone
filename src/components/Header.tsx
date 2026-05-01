import GenerationStatus from "./GenerationStatus";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zone-border bg-zone-bg/80 backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-zone-accent to-zone-glow animate-glow-pulse flex items-center justify-center text-white font-bold text-sm">
            Z
          </div>
          <span className="text-zone-text font-semibold tracking-widest text-lg">
            Zone
          </span>
          <span className="text-zone-muted text-xs font-mono hidden sm:block">
            / AI Content Portal
          </span>
        </div>

        {/* Engine status */}
        <GenerationStatus />
      </div>
    </header>
  );
}
