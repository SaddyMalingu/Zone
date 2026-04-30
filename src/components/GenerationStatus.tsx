"use client";

import { useEffect, useState } from "react";

interface EngineStatus {
  isRunning: boolean;
  activeJobs: number;
  totalGenerated: number;
}

export default function GenerationStatus() {
  const [status, setStatus] = useState<EngineStatus>({
    isRunning: false,
    activeJobs: 0,
    totalGenerated: 0,
  });

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/engine");
        if (res.ok) setStatus(await res.json());
      } catch (_) {}
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 text-xs font-mono text-zone-muted">
      {/* Engine status indicator */}
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            status.isRunning ? "bg-green-400 animate-pulse" : "bg-zone-muted"
          }`}
        />
        <span>{status.isRunning ? "ENGINE ACTIVE" : "ENGINE IDLE"}</span>
      </div>

      {status.activeJobs > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zone-glow animate-pulse-slow" />
          <span>{status.activeJobs} job{status.activeJobs !== 1 ? "s" : ""} running</span>
        </div>
      )}

      <div className="text-zone-muted/60">
        {status.totalGenerated.toLocaleString()} generated
      </div>
    </div>
  );
}
