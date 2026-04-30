"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import ContentCard from "./ContentCard";
import ContentModal from "./ContentModal";
import type { ContentFeedItem } from "@/types";

const PAGE_SIZE = 24;

  const [items, setItems] = useState<ContentFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loadingMoreRef = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentFeedItem | null>(null);

  const openModal = (item: ContentFeedItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const fetchContent = useCallback(async (reset = false) => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    try {
      const nextPage = reset ? 0 : page;
      const res = await fetch(`/api/content?limit=${PAGE_SIZE}&offset=${nextPage * PAGE_SIZE}`);
      if (!res.ok) throw new Error("Failed to fetch content");
      const data = await res.json();
      const newItems: ContentFeedItem[] = (data.content as ContentFeedItem[]).map((i) => ({ ...i, isNew: true }));
      setItems((prev) => reset ? newItems : [...prev, ...newItems]);
      setHasMore(data.content.length === PAGE_SIZE);
      setPage(reset ? 1 : nextPage + 1);
      setLoading(false);
      // Clear isNew flag after 3s
      if (newItems.length > 0) {
        setTimeout(() => {
          setItems((curr) => curr.map((i) => ({ ...i, isNew: false })));
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading content");
      setLoading(false);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [page]);

  const triggerGeneration = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", { method: "POST" });
      const data = await res.json();
      if (data.success && data.content) {
        const newItem: ContentFeedItem = { ...data.content, isNew: true, createdAt: new Date() };
        setItems((prev) => [newItem, ...prev].slice(0, 80));
        // Save to content store
        await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.content),
        });
        setTimeout(() => {
          setItems((curr) => curr.map((i) => (i.id === newItem.id ? { ...i, isNew: false } : i)));
        }, 3000);
      }
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setGenerating(false);
    }
  }, [generating]);

  // Initial load
  useEffect(() => {
    fetchContent(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-zone-glow border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zone-muted text-sm font-mono">Initializing Zone Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate button */}
      <div className="flex justify-center">
        <button
          onClick={triggerGeneration}
          disabled={generating}
          className={`
            px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
            border border-zone-accent text-zone-text
            ${generating
              ? "opacity-50 cursor-not-allowed bg-zone-surface"
              : "bg-zone-accent/20 hover:bg-zone-accent/40 hover:shadow-lg hover:shadow-zone-accent/30 active:scale-95"
            }
          `}
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border border-zone-glow border-t-transparent rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            "⚡ Generate Now"
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center font-mono bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Masonry-style grid */}
      {items.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <p className="text-zone-muted text-6xl">◎</p>
          <p className="text-zone-muted font-mono text-sm">
            No content yet. Click Generate Now to start.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="break-inside-avoid cursor-pointer" onClick={() => openModal(item)}>
                <ContentCard item={item} />
              </div>
            ))}
          </div>
          <ContentModal open={modalOpen} onClose={closeModal} item={selectedItem} />
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => fetchContent()}
                className="px-6 py-2 rounded-lg bg-zone-accent/20 hover:bg-zone-accent/40 border border-zone-accent text-zone-text font-semibold"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
