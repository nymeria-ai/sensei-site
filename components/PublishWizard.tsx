"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Scenario = {
  id: string;
  name: string;
  layer: "execution" | "reasoning" | "self-improvement";
  prompt: string;
  kpis: string;
};

const EMPTY_SCENARIO: Scenario = {
  id: "",
  name: "",
  layer: "execution",
  prompt: "",
  kpis: "",
};

export function PublishWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");

  // Step 2: Scenarios
  const [scenarios, setScenarios] = useState<Scenario[]>([{ ...EMPTY_SCENARIO }]);

  const addScenario = () => setScenarios([...scenarios, { ...EMPTY_SCENARIO }]);
  const removeScenario = (i: number) =>
    setScenarios(scenarios.filter((_, idx) => idx !== i));
  const updateScenario = (i: number, field: keyof Scenario, value: string) => {
    const updated = [...scenarios];
    updated[i] = { ...updated[i], [field]: value };
    setScenarios(updated);
  };

  // Generate YAML
  const generateYaml = () => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let yaml = `id: ${slug}\nversion: "1.0.0"\nname: "${name}"\ndescription: >\n  ${description}\ndefaults:\n  timeout_ms: 60000\n  judge_model: "gpt-4o"\nscenarios:\n`;

    for (const s of scenarios) {
      if (!s.id && !s.name) continue;
      const sid = s.id || s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      yaml += `  - id: ${sid}\n`;
      yaml += `    name: "${s.name}"\n`;
      yaml += `    layer: ${s.layer}\n`;
      yaml += `    input:\n`;
      yaml += `      prompt: |\n        ${s.prompt.replace(/\n/g, "\n        ")}\n`;
      if (s.kpis) {
        yaml += `    kpis:\n`;
        for (const kpi of s.kpis.split(",").map((k) => k.trim())) {
          if (!kpi) continue;
          const kid = kpi.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          yaml += `      - id: ${kid}\n`;
          yaml += `        name: "${kpi}"\n`;
          yaml += `        weight: ${(1 / s.kpis.split(",").filter((k) => k.trim()).length).toFixed(2)}\n`;
          yaml += `        method: llm-judge\n`;
          yaml += `        config:\n`;
          yaml += `          max_score: 5\n`;
          yaml += `          rubric: "Rate the ${kpi.toLowerCase()} quality from 1-5"\n`;
        }
      }
    }
    return yaml;
  };

  const yamlPreview = generateYaml();

  const handlePublish = async () => {
    setPublishing(true);
    setError("");
    try {
      const res = await fetch("/api/marketplace/suites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          yaml_content: yamlPreview,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to publish");
        return;
      }
      const data = await res.json();
      router.push(`/marketplace/${data.slug}`);
    } catch {
      setError("Failed to publish suite");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Form */}
      <div>
        {/* Step indicators */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                step === s
                  ? "bg-[#d4a574] text-[#0a0a0a]"
                  : step > s
                  ? "bg-[#d4a574]/20 text-[#d4a574]"
                  : "bg-white/5 text-[#e8e4df]/40"
              }`}
            >
              Step {s}: {s === 1 ? "Info" : s === 2 ? "Scenarios" : "Review"}
            </button>
          ))}
        </div>

        {/* Step 1: Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Suite Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Suite"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-[#e8e4df] text-sm focus:border-[#d4a574]/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What does this suite evaluate?"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-[#e8e4df] text-sm focus:border-[#d4a574]/50 focus:outline-none transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-[#e8e4df] text-sm focus:border-[#d4a574]/50 focus:outline-none cursor-pointer"
              >
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="dev">Dev</option>
                <option value="content">Content</option>
                <option value="fun">Fun</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tags (comma-separated)</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="sales, outreach, email"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-[#e8e4df] text-sm focus:border-[#d4a574]/50 focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!name}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-[#d4a574] text-[#0a0a0a] hover:bg-[#c9956b] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Next: Add Scenarios
            </button>
          </div>
        )}

        {/* Step 2: Scenarios */}
        {step === 2 && (
          <div className="space-y-4">
            {scenarios.map((s, i) => (
              <div key={i} className="p-4 rounded-lg bg-[#0f0f0f] border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-[#d4a574]">Scenario {i + 1}</span>
                  {scenarios.length > 1 && (
                    <button
                      onClick={() => removeScenario(i)}
                      className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  value={s.id}
                  onChange={(e) => updateScenario(i, "id", e.target.value)}
                  placeholder="scenario-id"
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm focus:border-[#d4a574]/50 focus:outline-none"
                />
                <input
                  value={s.name}
                  onChange={(e) => updateScenario(i, "name", e.target.value)}
                  placeholder="Scenario Name"
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm focus:border-[#d4a574]/50 focus:outline-none"
                />
                <select
                  value={s.layer}
                  onChange={(e) => updateScenario(i, "layer", e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm focus:border-[#d4a574]/50 focus:outline-none cursor-pointer"
                >
                  <option value="execution">Execution</option>
                  <option value="reasoning">Reasoning</option>
                  <option value="self-improvement">Self-Improvement</option>
                </select>
                <textarea
                  value={s.prompt}
                  onChange={(e) => updateScenario(i, "prompt", e.target.value)}
                  placeholder="Task prompt for the agent..."
                  rows={2}
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm focus:border-[#d4a574]/50 focus:outline-none resize-none"
                />
                <input
                  value={s.kpis}
                  onChange={(e) => updateScenario(i, "kpis", e.target.value)}
                  placeholder="KPIs (comma-separated): Accuracy, Tone, Clarity"
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm focus:border-[#d4a574]/50 focus:outline-none"
                />
              </div>
            ))}
            <button
              onClick={addScenario}
              className="w-full py-2 text-sm rounded-lg border border-dashed border-white/20 text-[#e8e4df]/50 hover:text-[#d4a574] hover:border-[#d4a574]/30 transition-all cursor-pointer"
            >
              + Add Scenario
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-[#e8e4df]/60 hover:text-[#e8e4df] transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#d4a574] text-[#0a0a0a] hover:bg-[#c9956b] transition-colors cursor-pointer"
              >
                Review & Publish
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#0f0f0f] border border-white/10">
              <h4 className="font-bold mb-2">{name}</h4>
              <p className="text-sm text-[#e8e4df]/50 mb-2">{description}</p>
              <div className="flex gap-2 text-xs text-[#e8e4df]/40">
                <span>Category: {category}</span>
                <span>Scenarios: {scenarios.filter((s) => s.name).length}</span>
              </div>
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-[#e8e4df]/60 hover:text-[#e8e4df] transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#d4a574] text-[#0a0a0a] hover:bg-[#c9956b] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {publishing ? "Publishing..." : "Publish Suite"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: YAML Preview */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <h4 className="text-sm font-medium text-[#e8e4df]/50 mb-2">Live YAML Preview</h4>
          <div className="rounded-xl overflow-hidden border border-white/10">
            <div className="bg-[#1a1a1a] px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="ml-2 text-[10px] text-[#e8e4df]/30 font-mono">suite.yaml</span>
            </div>
            <pre className="bg-[#0f0f0f] p-4 font-mono text-xs text-[#e8e4df]/60 overflow-auto max-h-[600px] leading-relaxed">
              {yamlPreview}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
