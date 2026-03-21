"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { SuiteCard } from "@/components/SuiteCard";
import { AuthButton } from "@/components/AuthButton";
import { trackSuiteSearch, trackCategoryFilter, trackSortChange, trackLoadMore, trackCTAClick } from "@/lib/posthog";

const CATEGORIES = [
  { key: "", label: "All" },
  { key: "engineering", label: "Engineering" },
  { key: "sales", label: "Sales" },
  { key: "marketing", label: "Marketing" },
  { key: "product", label: "Product" },
  { key: "design", label: "Design" },
  { key: "support", label: "Support" },
  { key: "testing", label: "Testing" },
  { key: "analytics", label: "Analytics" },
  { key: "paid-media", label: "Paid Media" },
  { key: "specialized", label: "Specialized" },
  { key: "devrel", label: "DevRel" },
  { key: "pm", label: "PM" },
  { key: "compliance", label: "Compliance" },
  { key: "dev", label: "Dev" },
  { key: "content", label: "Content" },
];

const SORTS = [
  { key: "rating", label: "Rating" },
  { key: "downloads", label: "Downloads" },
  { key: "newest", label: "Newest" },
];

export default function MarketplacePage() {
  const [suites, setSuites] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("rating");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchSuites = useCallback(async (pageNum: number, append: boolean) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    params.set("sort", sort);
    params.set("page", String(pageNum));
    params.set("limit", "20");

    const res = await fetch(`/api/marketplace/suites?${params}`);
    const data = await res.json();
    const newSuites = data.suites || [];

    if (append) {
      setSuites((prev) => [...prev, ...newSuites]);
    } else {
      setSuites(newSuites);
    }
    setTotal(data.total || 0);
    setHasMore(pageNum < (data.totalPages || 1));

    if (pageNum === 1) {
      setLoading(false);
    } else {
      setLoadingMore(false);
    }
  }, [query, category, sort]);

  // Reset and fetch page 1 when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    const timeout = setTimeout(() => fetchSuites(1, false), 300);
    return () => clearTimeout(timeout);
  }, [fetchSuites]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage((prev) => {
            const next = prev + 1;
            trackLoadMore(next);
            fetchSuites(next, true);
            return next;
          });
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, fetchSuites]);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold text-[#e8e4df]">
              <span>🥋</span> Sensei
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-xs text-[#e8e4df]/40">
              <Link href="/marketplace" className="text-[#d4a574]">Marketplace</Link>
              <a href="https://github.com/mondaycom/sensei" target="_blank" rel="noopener noreferrer" className="hover:text-[#e8e4df] transition-colors">GitHub</a>
              <a href="https://github.com/mondaycom/sensei#readme" target="_blank" rel="noopener noreferrer" className="hover:text-[#e8e4df] transition-colors">Docs</a>
            </nav>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <Image
              src="/images/marketplace/gi-fun.png"
              alt=""
              width={90}
              height={90}
              className="hidden sm:block opacity-60 h-20 sm:h-24 w-auto"
            />
            <h1 className="text-4xl sm:text-5xl font-bold">
              Suite <span className="badge-shimmer">Marketplace</span>
            </h1>
            <Image
              src="/images/marketplace/gi-developer.png"
              alt=""
              width={90}
              height={90}
              className="hidden sm:block opacity-60 h-20 sm:h-24 w-auto"
            />
          </div>
          <p className="text-[#e8e4df]/50 max-w-xl mx-auto mb-8">
            Discover, download, and publish evaluation suites for AI agents.
          </p>
          <Link
            href="/marketplace/publish"
            className="inline-block px-6 py-3 text-sm font-semibold rounded-lg bg-[#d4a574] text-[#0a0a0a] hover:bg-[#c9956b] transition-colors"
          >
            Publish a Suite
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (e.target.value.length > 2) trackSuiteSearch(e.target.value, total); }}
              placeholder="Search suites..."
              className="w-full max-w-md px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[#e8e4df] text-sm placeholder:text-[#e8e4df]/30 focus:border-[#d4a574]/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Category pills + Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => { setCategory(cat.key); trackCategoryFilter(cat.key || "all"); }}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                    category === cat.key
                      ? "bg-[#d4a574] text-[#0a0a0a]"
                      : "bg-white/5 text-[#e8e4df]/50 hover:bg-white/10 hover:text-[#e8e4df]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); trackSortChange(e.target.value); }}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-[#e8e4df]/60 focus:outline-none cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : suites.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#e8e4df]/40 text-lg">No suites found</p>
              <p className="text-[#e8e4df]/25 text-sm mt-2">Try a different search or category</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#e8e4df]/30 mb-4">{total} suite{total !== 1 ? "s" : ""}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {suites.map((suite: unknown) => {
                  const s = suite as Record<string, unknown>;
                  return (
                    <SuiteCard
                      key={s.slug as string}
                      suite={s as Parameters<typeof SuiteCard>[0]["suite"]}
                    />
                  );
                })}
              </div>
              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-4" />
              {loadingMore && (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#d4a574]/30 border-t-[#d4a574] rounded-full animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-xs text-[#e8e4df]/30">
          <span>🥋 Sensei Suite Marketplace</span>
        </div>
      </footer>
    </main>
  );
}
