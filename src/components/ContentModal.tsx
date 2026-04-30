import { useEffect, useRef } from "react";

interface ContentModalProps {
  open: boolean;
  onClose: () => void;
  item: any;
}

export default function ContentModal({ open, onClose, item }: ContentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and ESC close
  useEffect(() => {
    if (!open) return;
    const focusable = () => {
      if (modalRef.current) {
        const els = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (els.length) els[0].focus();
      }
    };
    focusable();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && modalRef.current) {
        const els = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in-modal">
      <div ref={modalRef} tabIndex={-1} className="bg-zone-surface rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-scale-in-modal" role="dialog" aria-modal="true">
        <button
          className="absolute top-3 right-3 text-zone-muted hover:text-zone-accent text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="mb-4">
          {item.type === "image" ? (
            <img src={item.url} alt={item.prompt} className="w-full rounded-lg" />
          ) : (
            <video src={item.url} controls className="w-full rounded-lg" />
          )}
        </div>
        <div className="space-y-2">
          <div className="font-mono text-sm text-zone-accent">{item.type}</div>
          <div className="font-mono text-base text-zone-text break-words">{item.prompt}</div>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 8).map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 rounded text-xs bg-zone-border text-zone-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {item.metadata && (
            <pre className="bg-zone-bg/60 rounded p-2 text-xs text-zone-muted overflow-x-auto">
              {typeof item.metadata === "string" ? item.metadata : JSON.stringify(item.metadata, null, 2)}
            </pre>
          )}
          <div className="flex justify-between text-xs text-zone-muted pt-2">
            <span>{item.provider}</span>
            <span>{new Date(item.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
