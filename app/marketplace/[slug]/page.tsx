"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BeltBadge } from "@/components/BeltBadge";
import { InstallTabs } from "@/components/InstallTabs";
import { RatingSlider } from "@/components/RatingSlider";
import { AuthButton } from "@/components/AuthButton";
import TestSenseiModal from "@/components/TestSenseiModal";

type SuiteDetail = {
  slug: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  yaml_content: string;
  avg_rating: number;
  rating_count: number;
  download_count: number;
  publisher_name: string | null;
  publisher_avatar: string | null;
  publisher_github: string | null;
  belt: { name: string; color: string; emoji: string };
  tags: string[];
  rating_distribution: { score: number; count: number }[];
  version: string;
  created_at: string;
};

export default function SuiteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [suite, setSuite] = useState<SuiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showYaml, setShowYaml] = useState(false);
  const [showTest, setShowTest] = useState(false);

  const fetchSuite = async () => {
    const res = await fetch(`/api/marketplace/suites/${slug}`);
    if (res.ok) {
      setSuite(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => { fetchSuite(); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-open test modal if returning from sign-in with ?test=1
  useEffect(() => {
    if (searchParams.get("test") === "1" && session && !loading && suite) {
      setShowTest(true);
      // Clean up the URL without triggering navigation
      window.history.replaceState({}, "", `/marketplace/${slug}`);
    }
  }, [searchParams, session, loading, suite, slug]);

  const handleTestClick = () => {
    if (!session) {
      // Redirect to sign-in, then come back with ?test=1
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/marketplace/${slug}?test=1`)}`);
      return;
    }
    setShowTest(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 w-64 bg-white/5 rounded animate-pulse mb-4" />
          <div className="h-6 w-96 bg-white/5 rounded animate-pulse mb-8" />
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </main>
    );
  }

  if (!suite) {
    return (
      <main className="min-h-screen pt-20 px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Suite not found</h1>
        <Link href="/marketplace" className="text-[#d4a574] text-sm hover:underline">
          Back to Marketplace
        </Link>
      </main>
    );
  }

  // Calculate max for distribution chart
  const maxVotes = Math.max(1, ...suite.rating_distribution.map((d) => d.count));

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
              <Link href="/marketplace" className="hover:text-[#d4a574] transition-colors">Marketplace</Link>
            </nav>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Content */}
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6 text-xs text-[#e8e4df]/30">
            <Link href="/marketplace" className="hover:text-[#d4a574] transition-colors">
              Marketplace
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#e8e4df]/60">{suite.name}</span>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
            <img
              src={suite.image_url || "/images/gi-execution.png"}
              alt={suite.name}
              className="w-24 h-24 object-contain"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{suite.name}</h1>
                <BeltBadge name={suite.belt.name} color={suite.belt.color} size="md" />
              </div>
              <p className="text-[#e8e4df]/50 mb-4 leading-relaxed">{suite.description}</p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div>
                  <span className="text-2xl font-bold text-[#d4a574]">{suite.avg_rating.toFixed(1)}</span>
                  <span className="text-[#e8e4df]/40"> / 10</span>
                </div>
                <div className="text-[#e8e4df]/40">
                  {suite.rating_count} vote{suite.rating_count !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1 text-[#e8e4df]/40">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {suite.download_count} downloads
                </div>
                <span className="text-xs text-[#e8e4df]/20">v{suite.version}</span>
              </div>

              {/* Test it button */}
              <button
                onClick={handleTestClick}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d4a574] to-[#c9956b] text-[#0a0a0a] rounded-lg font-bold text-sm hover:from-[#c9956b] hover:to-[#b8845a] transition-all shadow-lg shadow-[#d4a574]/20 cursor-pointer"
              >
                <span className="text-lg">🥋</span>
                {session ? "Test it!" : "Sign in to Test"}
              </button>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Install section */}
              <section>
                <h2 className="text-lg font-bold mb-4">Install</h2>
                <InstallTabs slug={suite.slug} />
              </section>

              {/* Rating distribution */}
              <section>
                <h2 className="text-lg font-bold mb-4">Rating Distribution</h2>
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  {suite.rating_distribution.length === 0 ? (
                    <p className="text-sm text-[#e8e4df]/40 text-center py-4">No ratings yet</p>
                  ) : (
                    <div className="space-y-2">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
                        const dist = suite.rating_distribution.find((d) => d.score === score);
                        const count = dist?.count || 0;
                        const pct = (count / maxVotes) * 100;
                        return (
                          <div key={score} className="flex items-center gap-3 text-xs">
                            <span className="w-4 text-right text-[#e8e4df]/40">{score}</span>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#d4a574]/60 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-6 text-[#e8e4df]/30">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* YAML Preview */}
              <section>
                <button
                  onClick={() => setShowYaml(!showYaml)}
                  className="flex items-center gap-2 text-lg font-bold mb-4 cursor-pointer hover:text-[#d4a574] transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${showYaml ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  YAML Source
                </button>
                {showYaml && (
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <div className="bg-[#1a1a1a] px-4 py-2 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                      </div>
                      <span className="ml-2 text-[10px] text-[#e8e4df]/30 font-mono">{suite.slug}.yaml</span>
                    </div>
                    <pre className="bg-[#0f0f0f] p-5 font-mono text-xs text-[#e8e4df]/60 overflow-auto max-h-[500px] leading-relaxed">
                      {suite.yaml_content}
                    </pre>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Rate */}
              <RatingSlider slug={suite.slug} onRated={fetchSuite} />

              {/* Publisher info */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-bold mb-3">Publisher</h3>
                <div className="flex items-center gap-3">
                  {suite.publisher_avatar ? (
                    <img src={suite.publisher_avatar} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#d4a574]/10 flex items-center justify-center text-lg">
                      🥋
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {suite.publisher_name || "Sensei Official"}
                    </p>
                    {suite.publisher_github && (
                      <a
                        href={`https://github.com/${suite.publisher_github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#e8e4df]/30 hover:text-[#d4a574] transition-colors"
                      >
                        @{suite.publisher_github}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {suite.tags.length > 0 && (
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-bold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {suite.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs rounded-full bg-white/5 text-[#e8e4df]/40 border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Modal */}
      <TestSenseiModal
        isOpen={showTest}
        onClose={() => setShowTest(false)}
        preloadSuiteId={suite.slug}
      />
    </main>
  );
}
