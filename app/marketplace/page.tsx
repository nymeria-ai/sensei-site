"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SuiteCard } from "@/components/SuiteCard";
import { AuthButton } from "@/components/AuthButton";

const CATEGORIES = [
  { key: "", label: "All" },
  { key: "sales", label: "Sales" },
  { key: "support", label: "Support" },
  { key: "dev", label: "Dev" },
  { key: "content", label: "Content" },
  { key: "fun", label: "Fun" },
];

const SORTS = [
  { key: "rating", label: "Rating" },
  { key: "downloads", label: "Downloads" },
  { key: "newest", label: "Newest" },
];

export default function MarketplacePage() {
  const [suites, setSuites] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("rating");
  const [total, setTotal] = useState(0);

  const fetchSuites = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    params.set("sort", sort);

    const res = await fetch(`/api/marketplace/suites?${params}`);
    const data = await res.json();
    setSuites(data.suites || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [query, category, sort]);

  useEffect(() => {
    const timeout = setTimeout(fetchSuites, 300);
    return () => clearTimeout(timeout);
  }, [fetchSuites]);

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
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Suite <span className="badge-shimmer">Marketplace</span>
          </h1>
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
              onChange={(e) => setQuery(e.target.value)}
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
                  onClick={() => setCategory(cat.key)}
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
              onChange={(e) => setSort(e.target.value)}
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
