"use client";

import { useState, useEffect } from "react";
import { Suite, Scenario, KPI } from "@/app/api/sensei/suites/route";

interface TestSenseiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Badge = "gold" | "silver" | "bronze" | "none";

interface ScenarioResult {
  scenarioId: string;
  scores: {
    kpiId: string;
    kpiName: string;
    score: number;
    maxScore: number;
    reasoning: string;
  }[];
  overallScore: number;
}

const SUITES = [
  { id: "sdr", label: "SDR Qualification", emoji: "📞", desc: "Sales Development Representative" },
  { id: "support", label: "Customer Support", emoji: "🎧", desc: "Technical support & ticket resolution" },
  { id: "content", label: "Content Writer", emoji: "✍️", desc: "Blog posts, social copy, SEO" },
  { id: "bartender", label: "Bartender 🍸", emoji: "🍸", desc: "Mixology & customer service (Fun)" },
  { id: "dungeon-master", label: "Dungeon Master 🎲", emoji: "🎲", desc: "D&D game mastering (Fun)" },
];

const LAYER_COLORS = {
  execution: "text-blue-400",
  reasoning: "text-purple-400",
  "self-improvement": "text-green-400",
};

const LAYER_LABELS = {
  execution: "Task Execution",
  reasoning: "Reasoning",
  "self-improvement": "Self-Improvement",
};

export default function TestSenseiModal({ isOpen, onClose }: TestSenseiModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Suite selection
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [suiteData, setSuiteData] = useState<Suite | null>(null);
  const [loadingSuite, setLoadingSuite] = useState(false);

  // Test flow
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [isScoring, setIsScoring] = useState(false);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>([]);
  const [showScenarioResult, setShowScenarioResult] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset on close
      setIsAuthenticated(false);
      setPassword("");
      setAuthError("");
      setSelectedSuiteId(null);
      setSuiteData(null);
      setCurrentScenarioIndex(0);
      setUserResponse("");
      setScenarioResults([]);
      setShowScenarioResult(false);
      setTestComplete(false);
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
        setIsAuthenticated(true);
        localStorage.setItem("sensei-auth", "true");
      } else {
        setAuthError("Invalid password");
      }
    } catch (error) {
      setAuthError("Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const loadSuite = async (suiteId: string) => {
    setLoadingSuite(true);
    try {
      const res = await fetch(`/api/sensei/suites?id=${suiteId}`);
      const data = await res.json();
      setSuiteData(data);
      setSelectedSuiteId(suiteId);
    } catch (error) {
      console.error("Failed to load suite:", error);
    } finally {
      setLoadingSuite(false);
    }
  };

  const beginTest = () => {
    setCurrentScenarioIndex(0);
    setScenarioResults([]);
    setTestComplete(false);
  };

  const submitResponse = async () => {
    if (!suiteData || !userResponse.trim()) return;

    const currentScenario = suiteData.scenarios[currentScenarioIndex];
    setIsScoring(true);

    try {
      const res = await fetch("/api/sensei/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioPrompt: currentScenario.input.prompt,
          kpis: currentScenario.kpis,
          userResponse,
        }),
      });

      const result = await res.json();

      const scenarioResult: ScenarioResult = {
        scenarioId: currentScenario.id,
        scores: result.scores,
        overallScore: result.overallScore,
      };

      setScenarioResults((prev) => [...prev, scenarioResult]);
      setShowScenarioResult(true);
    } catch (error) {
      console.error("Scoring failed:", error);
    } finally {
      setIsScoring(false);
    }
  };

  const nextScenario = () => {
    if (!suiteData) return;

    if (currentScenarioIndex < suiteData.scenarios.length - 1) {
      setCurrentScenarioIndex((prev) => prev + 1);
      setUserResponse("");
      setShowScenarioResult(false);
    } else {
      setTestComplete(true);
    }
  };

  const calculateFinalScores = () => {
    if (!suiteData || scenarioResults.length === 0) {
      return { overall: 0, byLayer: {} as Record<string, number>, badge: "none" as Badge };
    }

    const byLayer: Record<string, { total: number; count: number }> = {};
    let totalScore = 0;

    suiteData.scenarios.forEach((scenario, idx) => {
      const result = scenarioResults[idx];
      if (!result) return;

      if (!byLayer[scenario.layer]) {
        byLayer[scenario.layer] = { total: 0, count: 0 };
      }

      byLayer[scenario.layer].total += result.overallScore;
      byLayer[scenario.layer].count += 1;
      totalScore += result.overallScore;
    });

    const overall = totalScore / scenarioResults.length;

    const layerScores: Record<string, number> = {};
    Object.keys(byLayer).forEach((layer) => {
      layerScores[layer] = byLayer[layer].total / byLayer[layer].count;
    });

    let badge: Badge = "none";
    if (overall >= 90) badge = "gold";
    else if (overall >= 80) badge = "silver";
    else if (overall >= 70) badge = "bronze";

    return { overall, byLayer: layerScores, badge };
  };

  if (!isOpen) return null;

  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-[#0a0a0a] border border-[#ffffff15] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2 text-center">🥋 Test Sensei</h2>
          <p className="text-[#e8e4df]/50 text-sm text-center mb-6">Limited Access</p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#ffffff15] rounded-lg focus:outline-none focus:border-[#d4a574] text-[#e8e4df]"
                placeholder="Enter password"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-red-400 text-sm">{authError}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={authLoading}
                className="flex-1 px-4 py-2 bg-[#d4a574] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#c9956b] transition-colors disabled:opacity-50"
              >
                {authLoading ? "Checking..." : "Enter"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#ffffff15] rounded-lg hover:border-[#ffffff30] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Suite selection
  if (!selectedSuiteId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0a] border border-[#ffffff15] rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🥋 Select Test Suite</h2>
            <button
              onClick={onClose}
              className="text-[#e8e4df]/50 hover:text-[#e8e4df] transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid gap-4">
            {SUITES.map((suite) => (
              <button
                key={suite.id}
                onClick={() => loadSuite(suite.id)}
                disabled={loadingSuite}
                className="text-left p-5 bg-[#ffffff04] border border-[#ffffff08] rounded-xl hover:border-[#d4a574]/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{suite.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-[#d4a574] transition-colors">
                      {suite.label}
                    </h3>
                    <p className="text-sm text-[#e8e4df]/50">{suite.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Suite info (before test starts)
  if (suiteData && currentScenarioIndex === 0 && scenarioResults.length === 0) {
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
              onClick={() => setSelectedSuiteId(null)}
              className="text-[#e8e4df]/50 hover:text-[#e8e4df] transition-colors"
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
            <div className="flex items-center justify-between p-3 bg-[#ffffff04] rounded-lg">
              <span className="text-[#e8e4df]/70">Layers</span>
              <span className="font-bold">{Object.keys(layerCounts).length}</span>
            </div>
            <div className="p-3 bg-[#ffffff04] rounded-lg space-y-2">
              {Object.entries(layerCounts).map(([layer, count]) => (
                <div key={layer} className="flex items-center justify-between text-sm">
                  <span className={LAYER_COLORS[layer as keyof typeof LAYER_COLORS]}>
                    {LAYER_LABELS[layer as keyof typeof LAYER_LABELS]}
                  </span>
                  <span className="text-[#e8e4df]/50">{count} scenarios</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={beginTest}
            className="w-full px-6 py-3 bg-[#d4a574] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#c9956b] transition-colors"
          >
            Begin Test
          </button>
        </div>
      </div>
    );
  }

  // Test complete - final report
  if (testComplete && suiteData) {
    const { overall, byLayer, badge } = calculateFinalScores();
    const badgeEmoji = { gold: "🥇", silver: "🥈", bronze: "🥉", none: "—" }[badge];
    const badgeLabel = badge.charAt(0).toUpperCase() + badge.slice(1);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0a] border border-[#ffffff15] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{badgeEmoji}</div>
            <h2 className="text-3xl font-bold mb-2">Test Complete</h2>
            <p className="text-[#d4a574] text-xl font-semibold">{badgeLabel} Badge</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-[#ffffff04] rounded-xl border border-[#ffffff08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#e8e4df]/70">Overall Score</span>
                <span className="text-2xl font-bold text-[#d4a574]">
                  {overall.toFixed(1)}<span className="text-lg text-[#e8e4df]/50">/100</span>
                </span>
              </div>
            </div>

            {Object.entries(byLayer).map(([layer, score]) => (
              <div key={layer} className="p-4 bg-[#ffffff04] rounded-xl">
                <div className="flex items-center justify-between">
                  <span className={LAYER_COLORS[layer as keyof typeof LAYER_COLORS]}>
                    {LAYER_LABELS[layer as keyof typeof LAYER_LABELS]}
                  </span>
                  <span className="font-bold">{score.toFixed(1)}</span>
                </div>
                <div className="mt-2 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4a574] to-[#c9956b]"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setTestComplete(false);
                setScenarioResults([]);
                setCurrentScenarioIndex(0);
                setUserResponse("");
              }}
              className="flex-1 px-6 py-3 border border-[#ffffff15] rounded-lg hover:border-[#d4a574]/50 transition-colors"
            >
              Retake Test
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

  // Testing flow - scenario by scenario
  if (suiteData && !testComplete) {
    const currentScenario = suiteData.scenarios[currentScenarioIndex];
    const currentResult = scenarioResults[currentScenarioIndex];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0a] border border-[#ffffff15] rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#e8e4df]/50">
                Scenario {currentScenarioIndex + 1} of {suiteData.scenarios.length}
              </span>
              <span className={`text-sm font-medium ${LAYER_COLORS[currentScenario.layer]}`}>
                {LAYER_LABELS[currentScenario.layer]}
              </span>
            </div>
            <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d4a574]"
                style={{
                  width: `${((currentScenarioIndex + 1) / suiteData.scenarios.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {!showScenarioResult ? (
            <>
              <h3 className="text-xl font-bold mb-3">{currentScenario.name}</h3>
              <p className="text-[#e8e4df]/60 text-sm mb-6">{currentScenario.description}</p>

              <div className="p-4 bg-[#ffffff04] rounded-xl mb-6">
                <p className="text-sm text-[#e8e4df]/70 font-medium mb-2">Scenario Prompt:</p>
                <p className="text-[#e8e4df]/90 whitespace-pre-wrap leading-relaxed">
                  {currentScenario.input.prompt}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium mb-3">KPIs Being Evaluated:</p>
                <div className="grid gap-2">
                  {currentScenario.kpis.map((kpi) => (
                    <div key={kpi.id} className="flex items-center justify-between p-3 bg-[#ffffff04] rounded-lg text-sm">
                      <span className="text-[#e8e4df]/80">{kpi.name}</span>
                      <span className="text-[#e8e4df]/40">Weight: {(kpi.weight * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Your Response:</label>
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  className="w-full h-48 px-4 py-3 bg-[#1a1a1a] border border-[#ffffff15] rounded-lg focus:outline-none focus:border-[#d4a574] text-[#e8e4df] resize-none"
                  placeholder="Type your response here..."
                />
              </div>

              <button
                onClick={submitResponse}
                disabled={isScoring || !userResponse.trim()}
                className="w-full px-6 py-3 bg-[#d4a574] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#c9956b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScoring ? "Scoring..." : "Submit Response"}
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-6">Scenario Results</h3>

              <div className="p-4 bg-[#ffffff04] rounded-xl mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[#e8e4df]/70">Overall Score</span>
                  <span className="text-2xl font-bold text-[#d4a574]">
                    {currentResult.overallScore.toFixed(1)}<span className="text-lg text-[#e8e4df]/50">/100</span>
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {currentResult.scores.map((score) => (
                  <div key={score.kpiId} className="p-4 bg-[#ffffff04] rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{score.kpiName}</span>
                      <span className="text-[#d4a574]">
                        {score.score}/{score.maxScore}
                      </span>
                    </div>
                    <p className="text-sm text-[#e8e4df]/60 leading-relaxed">
                      {score.reasoning}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={nextScenario}
                className="w-full px-6 py-3 bg-[#d4a574] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#c9956b] transition-colors"
              >
                {currentScenarioIndex < suiteData.scenarios.length - 1
                  ? "Next Scenario →"
                  : "View Final Report"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
