"use client";

import { useState, useEffect } from "react";

interface KPI {
  id: string;
  name: string;
  weight: number;
  method: string;
  config: {
    max_score?: number;
    rubric?: string;
    type?: string;
    expected?: Record<string, number>;
  };
}

interface Scenario {
  id: string;
  name: string;
  layer: "execution" | "reasoning" | "self-improvement";
  description?: string;
  input: {
    prompt: string;
    feedback?: string;
  };
  kpis: KPI[];
  depends_on?: string;
}

interface Suite {
  id: string;
  name: string;
  description: string;
  scenarios: Scenario[];
}

interface TestSenseiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Badge = "gold" | "silver" | "bronze" | "none";
type Phase = "auth" | "select" | "info" | "test" | "result" | "report";

interface KPIScore {
  kpiId: string;
  kpiName: string;
  score: number;
  maxScore: number;
  reasoning: string;
}

interface ScenarioResult {
  scenarioId: string;
  scores: KPIScore[];
  overallScore: number;
}

const SUITES = [
  { id: "sdr", label: "SDR Qualification", emoji: "📞", desc: "Cold outreach, email personalization, discovery call analysis", tag: null },
  { id: "support", label: "Customer Support", emoji: "🎧", desc: "Ticket resolution, de-escalation, multi-issue handling", tag: null },
  { id: "content", label: "Content Writer", emoji: "✍️", desc: "Blog posts, LinkedIn threads, product launch emails", tag: null },
  { id: "bartender", label: "Bartender", emoji: "🍸", desc: "Cocktail crafting, drunk customers, chaotic group orders", tag: "🎮 Fun" },
  { id: "dungeon-master", label: "Dungeon Master", emoji: "🎲", desc: "Tavern scenes, creative combat, chaotic players", tag: "🎮 Fun" },
  { id: "cat-interview", label: "Cat Interview", emoji: "🐱", desc: "Job interview for Senior Napping Engineer at MeowCorp", tag: "🎮 Fun" },
];

const LAYER_COLORS: Record<string, string> = {
  execution: "text-blue-400",
  reasoning: "text-purple-400",
  "self-improvement": "text-green-400",
};

const LAYER_BG: Record<string, string> = {
  execution: "bg-blue-400/10 border-blue-400/20",
  reasoning: "bg-purple-400/10 border-purple-400/20",
  "self-improvement": "bg-green-400/10 border-green-400/20",
};

const LAYER_LABELS: Record<string, string> = {
  execution: "⚡ Task Execution",
  reasoning: "🧠 Reasoning",
  "self-improvement": "📈 Self-Improvement",
};

export default function TestSenseiModal({ isOpen, onClose }: TestSenseiModalProps) {
  const [phase, setPhase] = useState<Phase>("auth");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Suite
  const [suiteData, setSuiteData] = useState<Suite | null>(null);
  const [loadingSuite, setLoadingSuite] = useState(false);
  const [suiteError, setSuiteError] = useState("");

  // Test flow
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [isScoring, setIsScoring] = useState(false);
  const [scoringError, setScoringError] = useState("");
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>([]);

  // Check localStorage on open
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("sensei-auth");
      if (saved === "true") {
        setPhase("select");
      } else {
        setPhase("auth");
      }
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setAuthError("");
      setSuiteData(null);
      setSuiteError("");
      setCurrentScenarioIndex(0);
      setUserResponse("");
      setScenarioResults([]);
      setScoringError("");
      // Don't reset phase — keep auth state
    }
  }, [isOpen]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/sensei/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("sensei-auth", "true");
        setPhase("select");
      } else {
        setAuthError("Invalid password. Try again.");
      }
    } catch {
      setAuthError("Connection failed. Please retry.");
    } finally {
      setAuthLoading(false);
    }
  };

  const loadSuite = async (suiteId: string) => {
    setLoadingSuite(true);
    setSuiteError("");
    try {
      const res = await fetch(`/api/sensei/suites?id=${suiteId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Suite = await res.json();
      if (!data.scenarios || data.scenarios.length === 0) {
        throw new Error("Suite has no scenarios");
      }
      // Filter to only scorable scenarios (llm-judge and comparative-judge KPIs)
      const scorableScenarios = data.scenarios.filter((s) =>
        s.kpis.some((k) => k.method === "llm-judge" || k.method === "comparative-judge")
      );
      setSuiteData({ ...data, scenarios: scorableScenarios });
      setPhase("info");
    } catch (err) {
      setSuiteError(`Failed to load suite: ${err}`);
    } finally {
      setLoadingSuite(false);
    }
  };

  const beginTest = () => {
    setCurrentScenarioIndex(0);
    setScenarioResults([]);
    setUserResponse("");
    setScoringError("");
    setPhase("test");
  };

  const submitResponse = async () => {
    if (!suiteData || !userResponse.trim()) return;
    const currentScenario = suiteData.scenarios[currentScenarioIndex];
    setIsScoring(true);
    setScoringError("");

    try {
      // Only send LLM-judge KPIs for scoring
      const judgableKpis = currentScenario.kpis.filter(
        (k) => k.method === "llm-judge" || k.method === "comparative-judge"
      );

      const res = await fetch("/api/sensei/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioPrompt: currentScenario.input.prompt,
          kpis: judgableKpis,
          userResponse,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Scoring failed (HTTP ${res.status})`);
      }

      const result = await res.json();

      setScenarioResults((prev) => [
        ...prev,
        {
          scenarioId: currentScenario.id,
          scores: result.scores || [],
          overallScore: result.overallScore ?? 0,
        },
      ]);
      setPhase("result");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Scoring failed";
      setScoringError(message);
    } finally {
      setIsScoring(false);
    }
  };

  const nextScenario = () => {
    if (!suiteData) return;
    if (currentScenarioIndex < suiteData.scenarios.length - 1) {
      setCurrentScenarioIndex((prev) => prev + 1);
      setUserResponse("");
      setScoringError("");
      setPhase("test");
    } else {
      setPhase("report");
    }
  };

  const calculateFinalScores = () => {
    if (!suiteData || scenarioResults.length === 0) {
      return { overall: 0, byLayer: {} as Record<string, number>, badge: "none" as Badge };
    }

    const byLayer: Record<string, { total: number; count: number }> = {};
    let totalScore = 0;
    let counted = 0;

    suiteData.scenarios.forEach((scenario, idx) => {
      const result = scenarioResults[idx];
      if (!result) return;
      if (!byLayer[scenario.layer]) {
        byLayer[scenario.layer] = { total: 0, count: 0 };
      }
      byLayer[scenario.layer].total += result.overallScore;
      byLayer[scenario.layer].count += 1;
      totalScore += result.overallScore;
      counted++;
    });

    const overall = counted > 0 ? totalScore / counted : 0;
    const layerScores: Record<string, number> = {};
    for (const [layer, data] of Object.entries(byLayer)) {
      layerScores[layer] = data.count > 0 ? data.total / data.count : 0;
    }

    let badge: Badge = "none";
    if (overall >= 90) badge = "gold";
    else if (overall >= 75) badge = "silver";
    else if (overall >= 60) badge = "bronze";

    return { overall, byLayer: layerScores, badge };
  };

  if (!isOpen) return null;

  // ── AUTH PHASE ──
  if (phase === "auth") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-[#0a0a0a] border border-[#ffffff15] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in duration-300">
          <h2 className="text-2xl font-bold mb-2 text-center">🥋 Test Sensei</h2>
          <p className="text-[#e8e4df]/50 text-sm text-center mb-6">Limited Access — Enter password to continue</p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#ffffff15] rounded-lg focus:outline-none focus:border-[#d4a574] text-[#e8e4df] placeholder-[#e8e4df]/30"
                placeholder="Password"
                autoFocus
              />
            </div>
            {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={authLoading || !password}
                className="flex-1 px-4 py-3 bg-[#d4a574] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#c9956b] transition-colors disabled:opacity-50"
              >
                {authLoading ? "Verifying..." : "Enter Arena"}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-3 border border-[#ffffff15] rounded-lg hover:border-[#ffffff30] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── SELECT PHASE ──
  if (phase === "select") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0a] border border-[#ffffff15] rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🥋 Choose Your Test</h2>
            <button onClick={onClose} className="text-[#e8e4df]/50 hover:text-[#e8e4df] text-2xl">✕</button>
          </div>
          <p className="text-[#e8e4df]/50 mb-6">Step into the arena as an AI agent. Pick a role and prove your worth.</p>

          {suiteError && <p className="text-red-400 text-sm mb-4">{suiteError}</p>}

          <div className="grid gap-4">
            {SUITES.map((suite) => (
              <button
                key={suite.id}
                onClick={() => loadSuite(suite.id)}
                disabled={loadingSuite}
                className="text-left p-5 bg-[#ffffff04] border border-[#ffffff08] rounded-xl hover:border-[#d4a574]/40 hover:bg-[#ffffff08] transition-all group disabled:opacity-50"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{suite.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold group-hover:text-[#d4a574] transition-colors">
                        {suite.label}
                      </h3>
                      {suite.tag && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300">
                          {suite.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#e8e4df]/50">{suite.desc}</p>
                  </div>
                  <span className="text-[#e8e4df]/20 group-hover:text-[#d4a574]/50 transition-colors text-xl">→</span>
                </div>
              </button>
            ))}
          </div>

          {loadingSuite && (
            <div className="mt-4 text-center text-[#e8e4df]/50 text-sm">Loading suite...</div>
          )}
        </div>
      </div>
    );
  }

  // ── INFO PHASE ──
  if (phase === "info" && suiteData) {
    const layerCounts = suiteData.scenarios.reduce((acc, s) => {
      acc[s.layer] = (acc[s.layer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0a] border border-[#ffffff15] rounded-2xl p-8 max-w-2xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{suiteData.name}</h2>
            <button
              onClick={() => { setSuiteData(null); setPhase("select"); }}
              className="text-sm text-[#e8e4df]/50 hover:text-[#d4a574] transition-colors"
            >
              ← Back
            </button>
          </div>

          <p className="text-[#e8e4df]/70 mb-6 leading-relaxed">{suiteData.description}</p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between p-3 bg-[#ffffff04] rounded-lg">
              <span className="text-[#e8e4df]/70">Total Scenarios</span>
              <span className="font-bold">{suiteData.scenarios.length}</span>
            </div>
            {Object.entries(layerCounts).map(([layer, count]) => (
              <div key={layer} className={`flex items-center justify-between p-3 rounded-lg border ${LAYER_BG[layer] || "bg-[#ffffff04]"}`}>
                <span className={LAYER_COLORS[layer] || "text-[#e8e4df]"}>
                  {LAYER_LABELS[layer] || layer}
                </span>
                <span className="text-[#e8e4df]/60 text-sm">{count} scenario{count > 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>

          <button
            onClick={beginTest}
            className="w-full px-6 py-4 bg-[#d4a574] text-[#0a0a0a] rounded-lg font-bold text-lg hover:bg-[#c9956b] transition-colors"
          >
            Begin Test →
          </button>
        </div>
      </div>
    );
  }

  // ── TEST PHASE ──
  if (phase === "test" && suiteData) {
    const currentScenario = suiteData.scenarios[currentScenarioIndex];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0a] border border-[#ffffff15] rounded-2xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#e8e4df]/50">
                Scenario {currentScenarioIndex + 1} of {suiteData.scenarios.length}
              </span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full border ${LAYER_BG[currentScenario.layer]}`}>
                <span className={LAYER_COLORS[currentScenario.layer]}>
                  {LAYER_LABELS[currentScenario.layer]}
                </span>
              </span>
            </div>
            <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#d4a574] to-[#c9956b] transition-all duration-500"
                style={{ width: `${((currentScenarioIndex + 1) / suiteData.scenarios.length) * 100}%` }}
              />
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2">{currentScenario.name}</h3>
          {currentScenario.description && (
            <p className="text-[#e8e4df]/50 text-sm mb-4">{currentScenario.description}</p>
          )}

          {/* Scenario prompt */}
          <div className="p-4 bg-[#ffffff06] border border-[#ffffff10] rounded-xl mb-5">
            <p className="text-xs uppercase tracking-wider text-[#d4a574] mb-2 font-semibold">Scenario Prompt</p>
            <div className="text-[#e8e4df]/90 whitespace-pre-wrap leading-relaxed text-sm max-h-64 overflow-y-auto">
              {currentScenario.input.prompt}
            </div>
            {currentScenario.input.feedback && (
              <div className="mt-3 pt-3 border-t border-[#ffffff10]">
                <p className="text-xs uppercase tracking-wider text-green-400 mb-1 font-semibold">Feedback to Address</p>
                <div className="text-[#e8e4df]/80 whitespace-pre-wrap text-sm">
                  {currentScenario.input.feedback}
                </div>
              </div>
            )}
          </div>

          {/* KPIs being evaluated */}
          <div className="mb-5">
            <p className="text-xs uppercase tracking-wider text-[#e8e4df]/40 mb-2 font-semibold">Evaluated On</p>
            <div className="flex flex-wrap gap-2">
              {currentScenario.kpis
                .filter((k) => k.method === "llm-judge" || k.method === "comparative-judge")
                .map((kpi) => (
                  <span key={kpi.id} className="text-xs px-3 py-1.5 bg-[#ffffff08] border border-[#ffffff10] rounded-full text-[#e8e4df]/70">
                    {kpi.name} <span className="text-[#e8e4df]/30">({(kpi.weight * 100).toFixed(0)}%)</span>
                  </span>
                ))}
            </div>
          </div>

          {/* Response textarea */}
          <div className="mb-4">
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              className="w-full h-48 px-4 py-3 bg-[#1a1a1a] border border-[#ffffff15] rounded-lg focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574]/30 text-[#e8e4df] resize-none placeholder-[#e8e4df]/20 text-sm"
              placeholder="Type your response as an AI agent would..."
              autoFocus
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-[#e8e4df]/30">
                {userResponse.split(/\s+/).filter(Boolean).length} words
              </span>
              {scoringError && <span className="text-xs text-red-400">{scoringError}</span>}
            </div>
          </div>

          <button
            onClick={submitResponse}
            disabled={isScoring || !userResponse.trim()}
            className="w-full px-6 py-3 bg-[#d4a574] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#c9956b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScoring ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                Sensei is evaluating...
              </span>
            ) : (
              "Submit Response"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT PHASE (per-scenario) ──
  if (phase === "result" && suiteData) {
    const currentScenario = suiteData.scenarios[currentScenarioIndex];
    const currentResult = scenarioResults[scenarioResults.length - 1];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0a] border border-[#ffffff15] rounded-2xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-[#e8e4df]/50">
                Scenario {currentScenarioIndex + 1} of {suiteData.scenarios.length}
              </span>
              <span className={`text-sm ${LAYER_COLORS[currentScenario.layer]}`}>
                {LAYER_LABELS[currentScenario.layer]}
              </span>
            </div>
            <h3 className="text-xl font-bold">{currentScenario.name}</h3>
          </div>

          {/* Overall scenario score */}
          <div className="p-5 bg-[#ffffff06] border border-[#ffffff10] rounded-xl mb-6 text-center">
            <p className="text-sm text-[#e8e4df]/50 mb-1">Scenario Score</p>
            <p className="text-4xl font-bold text-[#d4a574]">
              {currentResult?.overallScore?.toFixed(1) ?? "0"}
              <span className="text-xl text-[#e8e4df]/30">/100</span>
            </p>
          </div>

          {/* KPI breakdown */}
          <div className="space-y-3 mb-6">
            {currentResult?.scores?.map((score) => (
              <div key={score.kpiId} className="p-4 bg-[#ffffff04] border border-[#ffffff08] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{score.kpiName}</span>
                  <span className="text-[#d4a574] font-bold">
                    {score.score}<span className="text-[#e8e4df]/40">/{score.maxScore}</span>
                  </span>
                </div>
                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4a574] to-[#c9956b] transition-all duration-700"
                    style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-[#e8e4df]/50 leading-relaxed">{score.reasoning}</p>
              </div>
            ))}
          </div>

          <button
            onClick={nextScenario}
            className="w-full px-6 py-3 bg-[#d4a574] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#c9956b] transition-colors"
          >
            {currentScenarioIndex < suiteData.scenarios.length - 1
              ? "Next Scenario →"
              : "View Final Report 🏆"}
          </button>
        </div>
      </div>
    );
  }

  // ── REPORT PHASE ──
  if (phase === "report" && suiteData) {
    const { overall, byLayer, badge } = calculateFinalScores();
    const badgeEmoji = { gold: "🥇", silver: "🥈", bronze: "🥉", none: "😔" }[badge];
    const badgeLabel = badge === "none" ? "No Badge" : badge.charAt(0).toUpperCase() + badge.slice(1);
    const badgeColor = { gold: "text-yellow-400", silver: "text-gray-300", bronze: "text-orange-400", none: "text-[#e8e4df]/50" }[badge];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0a] border border-[#ffffff15] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">{badgeEmoji}</div>
            <h2 className="text-3xl font-bold mb-2">Test Complete</h2>
            <p className={`text-xl font-semibold ${badgeColor}`}>{badgeLabel}</p>
          </div>

          {/* Overall score */}
          <div className="p-5 bg-[#ffffff06] border border-[#ffffff10] rounded-xl mb-6 text-center">
            <p className="text-sm text-[#e8e4df]/50 mb-1">Overall Score</p>
            <p className="text-5xl font-bold text-[#d4a574]">
              {overall.toFixed(1)}<span className="text-2xl text-[#e8e4df]/30">/100</span>
            </p>
          </div>

          {/* Layer scores */}
          <div className="space-y-3 mb-8">
            {Object.entries(byLayer).map(([layer, score]) => (
              <div key={layer} className={`p-4 rounded-xl border ${LAYER_BG[layer] || "bg-[#ffffff04]"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={LAYER_COLORS[layer]}>
                    {LAYER_LABELS[layer] || layer}
                  </span>
                  <span className="font-bold">{score.toFixed(1)}</span>
                </div>
                <div className="h-2 bg-[#0a0a0a]/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4a574] to-[#c9956b] transition-all duration-1000"
                    style={{ width: `${Math.min(score, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Per-scenario breakdown */}
          <div className="mb-8">
            <p className="text-sm text-[#e8e4df]/50 mb-3 font-semibold">Scenario Breakdown</p>
            <div className="space-y-2">
              {suiteData.scenarios.map((s, idx) => {
                const r = scenarioResults[idx];
                return (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-[#ffffff04] rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${LAYER_COLORS[s.layer]}`}>●</span>
                      <span className="text-[#e8e4df]/70">{s.name}</span>
                    </div>
                    <span className="font-medium">{r?.overallScore?.toFixed(1) ?? "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setScenarioResults([]);
                setCurrentScenarioIndex(0);
                setUserResponse("");
                setPhase("select");
                setSuiteData(null);
              }}
              className="flex-1 px-6 py-3 border border-[#ffffff15] rounded-lg hover:border-[#d4a574]/50 transition-colors"
            >
              Try Another Suite
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-[#d4a574] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#c9956b] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
