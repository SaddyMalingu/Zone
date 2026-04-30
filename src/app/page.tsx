import Header from "@/components/Header";
import ContentFeed from "@/components/ContentFeed";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-zone-bg">
      <Header />

      {/* Hero band */}
      <div className="relative border-b border-zone-border bg-gradient-to-b from-zone-accent/5 to-transparent">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zone-text">
            The &nbsp;
            <span className="bg-gradient-to-r from-zone-accent to-zone-glow bg-clip-text text-transparent">
              Zone
            </span>
          </h1>
          <p className="text-zone-muted text-sm sm:text-base max-w-xl mx-auto">
            An infinite AI-generated content feed — images and videos created in real-time
            from unique, ever-changing prompts.
          </p>

          {/* Animated pulse line */}
          <div className="flex items-center justify-center gap-1 pt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-zone-accent/60 animate-pulse-slow"
                style={{
                  height: `${8 + Math.sin(i * 0.8) * 6}px`,
                  animationDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content feed */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <ContentFeed />
      </div>

      {/* Footer */}
      <footer className="border-t border-zone-border mt-16 py-6">
        <div className="max-w-screen-2xl mx-auto px-6 text-center text-zone-muted text-xs font-mono">
          Zone · AI Content Portal · Powered by Hugging Face & Replicate
        </div>
      </footer>
    </main>
  );
}
