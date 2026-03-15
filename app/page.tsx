"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Demo Data ─────────────────────────────────────────────────────── */

type DemoSuite = {
  key: string;
  label: string;
  command: string;
  suiteName: string;
  lines: string[];
};

const DEMOS: DemoSuite[] = [
  {
    key: "sdr",
    label: "SDR Agent",
    command: "sensei test --suite sdr --agent https://my-agent.ai/api",
    suiteName: "Sales Development Representative",
    lines: [
      "",
      "🥋 Sensei v1.0.0 — AI Agent Qualification Engine",
      "",
      "Loading suite: Sales Development Representative...",
      "Connecting to agent... ✓",
      "",
      "━━━ Layer 1: Task Execution ━━━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ cold-email-personalization",
      "  Sending task... done (2.3s)",
      "  Scoring KPIs:",
      "    Personalization .............. 4.5/5 ✅",
      "    Value Alignment .............. 4.8/5 ✅",
      "    Call to Action ............... 4.0/5 ✅",
      "    Email Length ................. 142 words ✅",
      "    Subject Line ................. 4.6/5 ✅",
      "  Score: 91.2",
      "",
      "▶ call-transcript-analysis",
      "  Sending task... done (4.1s)",
      "  Scoring KPIs:",
      "    Talk Ratio Detection ......... 95/100 ✅",
      "    Response Latency ............. 90/100 ✅",
      "    Objection Handling ........... 4.2/5 ✅",
      "  Score: 88.7",
      "",
      "━━━ Layer 2: Reasoning ━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ explain-strategy",
      '  Q: "Why did you choose this angle?"',
      '  A: "I focused on the Series B because..."',
      "  Reasoning Depth ................ 4.3/5 ✅",
      "  Strategic Thinking ............. 4.0/5 ✅",
      "  Score: 82.5",
      "",
      "━━━ Layer 3: Self-Improvement ━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ improve-after-feedback",
      '  Feedback: "Too feature-focused, soften CTA"',
      "  Re-running task... done (2.8s)",
      "  Feedback Incorporation ......... 4.5/5 ✅",
      "  Improvement Delta .............. 4.0/5 ✅",
      "  Score: 85.0",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "OVERALL: 87.3 / 100 — 🥈 Silver Badge",
      "",
      "Execution:        91.2  ████████████░░",
      "Reasoning:        82.5  █████████░░░░░",
      "Self-Improvement: 85.0  █████████░░░░░",
      "",
      "Report saved: ./reports/sdr-evaluation-2026-03-15.html",
    ],
  },
  {
    key: "support",
    label: "Support Agent",
    command: "sensei test --suite support --agent https://my-agent.ai/api",
    suiteName: "Customer Support",
    lines: [
      "",
      "🥋 Sensei v1.0.0 — AI Agent Qualification Engine",
      "",
      "Loading suite: Customer Support...",
      "Connecting to agent... ✓",
      "",
      "━━━ Layer 1: Task Execution ━━━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ ticket-resolution",
      "  Sending task... done (1.8s)",
      "  Scoring KPIs:",
      "    Issue Identification ......... 4.9/5 ✅",
      "    Resolution Accuracy .......... 4.7/5 ✅",
      "    Response Tone ................ 4.8/5 ✅",
      "    Escalation Judgment .......... 4.5/5 ✅",
      "  Score: 94.1",
      "",
      "▶ multi-turn-conversation",
      "  Sending task... done (3.5s)",
      "  Scoring KPIs:",
      "    Context Retention ............ 4.6/5 ✅",
      "    Empathy Score ................ 4.4/5 ✅",
      "    Resolution Steps ............. 3 steps ✅",
      "  Score: 89.3",
      "",
      "━━━ Layer 2: Reasoning ━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ explain-diagnosis",
      '  Q: "Why did you suggest this fix?"',
      '  A: "The error pattern matches a known..."',
      "  Diagnostic Clarity ............. 4.6/5 ✅",
      "  Root Cause Accuracy ............ 4.3/5 ✅",
      "  Score: 88.0",
      "",
      "━━━ Layer 3: Self-Improvement ━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ improve-after-csat",
      '  Feedback: "Too technical for non-technical user"',
      "  Re-running task... done (2.1s)",
      "  Tone Adjustment ................ 4.7/5 ✅",
      "  Simplification Score ........... 4.4/5 ✅",
      "  Score: 90.5",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "OVERALL: 90.8 / 100 — 🥇 Gold Badge",
      "",
      "Execution:        94.1  █████████████░",
      "Reasoning:        88.0  ████████████░░",
      "Self-Improvement: 90.5  █████████████░",
      "",
      "Report saved: ./reports/support-evaluation-2026-03-15.html",
    ],
  },
  {
    key: "qa",
    label: "QA Engineer",
    command: "sensei test --suite qa --agent https://my-agent.ai/api",
    suiteName: "QA Engineer",
    lines: [
      "",
      "🥋 Sensei v1.0.0 — AI Agent Qualification Engine",
      "",
      "Loading suite: QA Engineer...",
      "Connecting to agent... ✓",
      "",
      "━━━ Layer 1: Task Execution ━━━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ test-case-generation",
      "  Sending task... done (3.2s)",
      "  Scoring KPIs:",
      "    Edge Case Coverage ........... 4.8/5 ✅",
      "    Test Clarity ................. 4.5/5 ✅",
      "    Boundary Conditions .......... 4.3/5 ✅",
      "    Reproducibility .............. 4.7/5 ✅",
      "  Score: 92.4",
      "",
      "▶ bug-report-quality",
      "  Sending task... done (2.7s)",
      "  Scoring KPIs:",
      "    Steps to Reproduce ........... 4.9/5 ✅",
      "    Severity Classification ...... 4.2/5 ✅",
      "    Environment Details .......... 4.6/5 ✅",
      "  Score: 86.9",
      "",
      "━━━ Layer 2: Reasoning ━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ explain-test-strategy",
      '  Q: "Why prioritize these test cases?"',
      '  A: "Risk-based prioritization focuses on..."',
      "  Strategic Justification ........ 4.1/5 ✅",
      "  Risk Assessment ................ 3.9/5 ⚠️",
      "  Score: 78.5",
      "",
      "━━━ Layer 3: Self-Improvement ━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ improve-after-review",
      '  Feedback: "Missing negative test cases"',
      "  Re-running task... done (3.4s)",
      "  Coverage Expansion ............. 4.6/5 ✅",
      "  Learning Application ........... 4.2/5 ✅",
      "  Score: 87.0",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "OVERALL: 86.2 / 100 — 🥈 Silver Badge",
      "",
      "Execution:        92.4  █████████████░",
      "Reasoning:        78.5  ████████░░░░░░",
      "Self-Improvement: 87.0  ████████████░░",
      "",
      "Report saved: ./reports/qa-evaluation-2026-03-15.html",
    ],
  },
  {
    key: "content",
    label: "Content Writer",
    command: "sensei test --suite content --agent https://my-agent.ai/api",
    suiteName: "Content Writer",
    lines: [
      "",
      "🥋 Sensei v1.0.0 — AI Agent Qualification Engine",
      "",
      "Loading suite: Content Writer...",
      "Connecting to agent... ✓",
      "",
      "━━━ Layer 1: Task Execution ━━━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ blog-post-creation",
      "  Sending task... done (5.1s)",
      "  Scoring KPIs:",
      "    SEO Optimization ............. 4.3/5 ✅",
      "    Readability (Flesch) .......... 72/100 ✅",
      "    Brand Voice Alignment ........ 4.6/5 ✅",
      "    Structure & Flow ............. 4.4/5 ✅",
      "    Word Count ................... 1,247 words ✅",
      "  Score: 88.6",
      "",
      "▶ social-media-copy",
      "  Sending task... done (1.9s)",
      "  Scoring KPIs:",
      "    Hook Strength ................ 4.7/5 ✅",
      "    CTA Clarity .................. 4.5/5 ✅",
      "    Platform Fit ................. 4.2/5 ✅",
      "  Score: 85.4",
      "",
      "━━━ Layer 2: Reasoning ━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ explain-editorial-choices",
      '  Q: "Why this headline approach?"',
      '  A: "Data shows curiosity gaps drive 2.3x..."',
      "  Creative Reasoning ............. 4.5/5 ✅",
      "  Audience Understanding ......... 4.3/5 ✅",
      "  Score: 86.0",
      "",
      "━━━ Layer 3: Self-Improvement ━━━━━━━━━━━━━━━━━━━",
      "",
      "▶ improve-after-editorial",
      '  Feedback: "More conversational, less corporate"',
      "  Re-running task... done (4.3s)",
      "  Voice Adaptation ............... 4.8/5 ✅",
      "  Improvement Delta .............. 4.5/5 ✅",
      "  Score: 92.0",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "OVERALL: 88.1 / 100 — 🥈 Silver Badge",
      "",
      "Execution:        88.6  ████████████░░",
      "Reasoning:        86.0  ███████████░░░",
      "Self-Improvement: 92.0  █████████████░",
      "",
      "Report saved: ./reports/content-evaluation-2026-03-15.html",
    ],
  },
];

/* ─── Scroll Observer Hook ──────────────────────────────────────────── */

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const children = el.querySelectorAll(".fade-up");
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ─── Terminal Demo Component ───────────────────────────────────────── */

function TerminalDemo() {
  const [selectedSuite, setSelectedSuite] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoPlayed = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const runDemo = useCallback(
    (suiteIndex: number) => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }

      const demo = DEMOS[suiteIndex];
      setDisplayedLines([`$ ${demo.command}`]);
      setIsRunning(true);
      setShowCursor(true);

      let lineIndex = 0;

      const addLine = () => {
        if (lineIndex >= demo.lines.length) {
          setIsRunning(false);
          return;
        }

        const line = demo.lines[lineIndex];
        setDisplayedLines((prev) => [...prev, line]);
        lineIndex++;

        // Scroll to bottom
        if (terminalRef.current) {
          requestAnimationFrame(() => {
            if (terminalRef.current) {
              terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
          });
        }

        // Variable delay based on content
        let delay = 40;
        if (line.includes("Score:") || line.includes("OVERALL:")) delay = 300;
        else if (line.includes("✅") || line.includes("⚠️")) delay = 80;
        else if (line.includes("━━━")) delay = 200;
        else if (line.includes("████")) delay = 150;
        else if (line === "") delay = 60;
        else if (line.includes("done (")) delay = 120;
        else if (line.includes("Report saved")) delay = 100;

        animationRef.current = setTimeout(addLine, delay);
      };

      animationRef.current = setTimeout(addLine, 500);
    },
    []
  );

  // Auto-play on scroll into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAutoPlayed.current) {
          hasAutoPlayed.current = true;
          runDemo(0);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [runDemo]);

  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  const handleSuiteChange = (index: number) => {
    setSelectedSuite(index);
    runDemo(index);
  };

  return (
    <div ref={containerRef}>
      {/* Suite selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DEMOS.map((demo, i) => (
          <button
            key={demo.key}
            onClick={() => handleSuiteChange(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
              selectedSuite === i
                ? "bg-[#d4a574] text-[#0a0a0a]"
                : "bg-[#1a1a1a] text-[#e8e4df]/70 hover:bg-[#252525] hover:text-[#e8e4df]"
            }`}
          >
            {demo.label}
          </button>
        ))}
      </div>

      {/* Terminal window */}
      <div className="rounded-xl overflow-hidden border border-[#ffffff08] shadow-2xl">
        {/* Title bar */}
        <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-3 text-xs text-[#e8e4df]/40 font-mono">
            sensei — evaluation
          </span>
        </div>

        {/* Terminal body */}
        <div
          ref={terminalRef}
          className="bg-[#0f0f0f] p-5 font-mono text-sm leading-relaxed h-[480px] overflow-y-auto terminal-scroll"
        >
          {displayedLines.map((line, i) => (
            <div key={i} className="min-h-[1.4em]">
              {colorize(line)}
            </div>
          ))}
          {(isRunning || showCursor) && (
            <span className="terminal-cursor text-[#d4a574]">▋</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Colorize terminal output lines */
function colorize(line: string) {
  if (line.startsWith("$"))
    return (
      <span>
        <span className="text-[#4ade80]">$</span>
        <span className="text-[#e8e4df]">{line.slice(1)}</span>
      </span>
    );
  if (line.includes("OVERALL:"))
    return <span className="text-[#d4a574] font-bold">{line}</span>;
  if (line.includes("━━━") && line.includes("Layer"))
    return <span className="text-[#d4a574]">{line}</span>;
  if (line.includes("━━━"))
    return <span className="text-[#d4a574]/60">{line}</span>;
  if (line.includes("Score:") && !line.includes("Scoring"))
    return <span className="text-[#d4a574] font-semibold">{line}</span>;
  if (line.includes("✅"))
    return (
      <span>
        <span className="text-[#e8e4df]/60">{line.replace("✅", "")}</span>
        <span className="text-[#4ade80]">✅</span>
      </span>
    );
  if (line.includes("⚠️"))
    return (
      <span>
        <span className="text-[#e8e4df]/60">{line.replace("⚠️", "")}</span>
        <span className="text-yellow-400">⚠️</span>
      </span>
    );
  if (line.includes("████"))
    return <span className="text-[#4ade80]/80">{line}</span>;
  if (line.startsWith("▶"))
    return <span className="text-[#e8e4df] font-semibold">{line}</span>;
  if (line.includes("✓"))
    return (
      <span className="text-[#e8e4df]/60">
        {line.replace("✓", "")}
        <span className="text-[#4ade80]">✓</span>
      </span>
    );
  if (line.includes("🥋"))
    return <span className="text-[#d4a574] font-bold">{line}</span>;
  if (line.includes("Badge"))
    return <span className="text-[#d4a574] font-bold">{line}</span>;
  if (line.includes("Report saved"))
    return <span className="text-[#e8e4df]/40">{line}</span>;
  return <span className="text-[#e8e4df]/60">{line}</span>;
}

/* ─── Test Suites Data ──────────────────────────────────────────────── */

const SUITES = [
  {
    icon: "📞",
    name: "SDR",
    scenarios: 12,
    desc: "Cold outreach, email personalization, call analysis, and pipeline qualification",
  },
  {
    icon: "🎧",
    name: "Support",
    scenarios: 15,
    desc: "Ticket resolution, multi-turn conversations, escalation handling, CSAT optimization",
  },
  {
    icon: "✍️",
    name: "Content Writer",
    scenarios: 10,
    desc: "Blog posts, social copy, SEO optimization, brand voice consistency",
  },
  {
    icon: "🧪",
    name: "QA Engineer",
    scenarios: 14,
    desc: "Test case generation, bug reporting, regression analysis, coverage assessment",
  },
  {
    icon: "📊",
    name: "Data Analyst",
    scenarios: 11,
    desc: "SQL generation, insight extraction, visualization recommendations, anomaly detection",
  },
  {
    icon: "💻",
    name: "Developer",
    scenarios: 16,
    desc: "Code generation, refactoring, PR review, documentation, debugging",
  },
];

/* ─── Main Page Component ───────────────────────────────────────────── */

export default function Home() {
  const pillarsRef = useScrollReveal();
  const demoRef = useScrollReveal();
  const flowRef = useScrollReveal();
  const suitesRef = useScrollReveal();
  const codeRef = useScrollReveal();

  return (
    <main className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="hero-gradient relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-2">
              <span className="mr-3">🥋</span>
              <span className="badge-shimmer">Sensei</span>
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-[#e8e4df]/70 mb-4 font-light tracking-wide">
            The open-source qualification engine for AI agents
          </p>

          <p className="text-base sm:text-lg text-[#e8e4df]/50 mb-12 max-w-2xl mx-auto">
            Test. Evaluate. Certify.
            <br />
            Before you hire an agent, ask the Sensei.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/nymeria-ai/sensei"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-[#d4a574] text-[#0a0a0a] rounded-lg font-semibold text-sm tracking-wide hover:bg-[#c9956b] transition-colors duration-300"
            >
              View on GitHub
            </a>
            <a
              href="https://github.com/nymeria-ai/sensei#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 border border-[#e8e4df]/20 rounded-lg font-semibold text-sm tracking-wide text-[#e8e4df]/80 hover:border-[#d4a574]/50 hover:text-[#d4a574] transition-all duration-300"
            >
              Read the Docs
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-5 h-5 text-[#e8e4df]/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* ── Three Pillars ────────────────────────────────────────── */}
      <section ref={pillarsRef} className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="fade-up text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Three-Layer Evaluation
            </h2>
            <p className="text-[#e8e4df]/50 max-w-xl mx-auto">
              Every agent is tested across three dimensions. No shortcuts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                img: "/images/gi-execution.png",
                title: "Task Execution",
                question: "Can the agent do the job?",
                desc: "Measure real performance against domain-specific KPIs. Each task is scored on concrete, quantifiable metrics — not vibes.",
                delay: "fade-up-delay-1",
              },
              {
                img: "/images/gi-reasoning.png",
                title: "Reasoning",
                question: "Can it explain its decisions?",
                desc: "Probe the agent\u2019s thought process. Great execution means nothing if the agent can\u2019t articulate why it made a choice.",
                delay: "fade-up-delay-2",
              },
              {
                img: "/images/gi-improvement.png",
                title: "Self-Improvement",
                question: "Can it learn from feedback?",
                desc: "Give the agent feedback and watch it adapt. The best agents don\u2019t just perform \u2014 they evolve.",
                delay: "fade-up-delay-3",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className={`fade-up ${pillar.delay} group p-8 rounded-2xl bg-[#ffffff04] border border-[#ffffff08] hover:border-[#d4a574]/20 transition-all duration-500`}
              >
                <div className="mb-5 h-32 flex items-center justify-center">
                  <img
                    src={pillar.img}
                    alt={pillar.title}
                    className="h-32 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{pillar.title}</h3>
                <p className="text-[#d4a574] text-sm font-medium mb-4">
                  {pillar.question}
                </p>
                <p className="text-[#e8e4df]/50 text-sm leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Demo ────────────────────────────────────────────── */}
      <section ref={demoRef} className="py-32 px-6 bg-[#ffffff02]">
        <div className="max-w-4xl mx-auto">
          <div className="fade-up text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              See It In Action
            </h2>
            <p className="text-[#e8e4df]/50 max-w-xl mx-auto">
              Watch Sensei evaluate an agent in real-time. Pick a suite and see
              how the three layers unfold.
            </p>
          </div>

          <div className="fade-up fade-up-delay-1">
            <TerminalDemo />
          </div>
        </div>
      </section>

      {/* ── Evaluation Flow ──────────────────────────────────────── */}
      <section ref={flowRef} className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="fade-up text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-[#e8e4df]/50 max-w-xl mx-auto">
              A simple, structured pipeline from agent to verdict.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="fade-up fade-up-delay-1">
            {/* Desktop flow */}
            <div className="hidden md:flex items-center justify-between gap-3">
              {/* Agent */}
              <FlowNode icon="🤖" label="Your Agent" sublabel="HTTP / SDK" />
              <FlowArrow className="flow-pulse" />
              {/* Sensei */}
              <FlowNode
                icon="🥋"
                label="Sensei"
                sublabel="Engine"
                accent
              />
              <FlowArrow className="flow-pulse-1" />
              {/* Layers */}
              <div className="flex flex-col gap-2">
                <div className="px-4 py-2 rounded-lg bg-[#ffffff06] border border-[#ffffff08] text-center text-xs">
                  <span className="mr-1">🎯</span> Task
                </div>
                <div className="px-4 py-2 rounded-lg bg-[#ffffff06] border border-[#ffffff08] text-center text-xs">
                  <span className="mr-1">🧠</span> Reasoning
                </div>
                <div className="px-4 py-2 rounded-lg bg-[#ffffff06] border border-[#ffffff08] text-center text-xs">
                  <span className="mr-1">📈</span> Growth
                </div>
              </div>
              <FlowArrow className="flow-pulse-2" />
              {/* Score */}
              <FlowNode icon="📊" label="Score" sublabel="0–100" />
              <FlowArrow className="flow-pulse-3" />
              {/* Badge */}
              <FlowNode icon="🏅" label="Badge" sublabel="Decision" />
            </div>

            {/* Mobile flow — vertical */}
            <div className="flex md:hidden flex-col items-center gap-3">
              <FlowNode icon="🤖" label="Your Agent" sublabel="HTTP / SDK" />
              <FlowArrowVertical />
              <FlowNode
                icon="🥋"
                label="Sensei"
                sublabel="Engine"
                accent
              />
              <FlowArrowVertical />
              <div className="flex gap-2">
                <div className="px-3 py-2 rounded-lg bg-[#ffffff06] border border-[#ffffff08] text-xs">
                  🎯 Task
                </div>
                <div className="px-3 py-2 rounded-lg bg-[#ffffff06] border border-[#ffffff08] text-xs">
                  🧠 Reason
                </div>
                <div className="px-3 py-2 rounded-lg bg-[#ffffff06] border border-[#ffffff08] text-xs">
                  📈 Growth
                </div>
              </div>
              <FlowArrowVertical />
              <FlowNode icon="📊" label="Score" sublabel="0–100" />
              <FlowArrowVertical />
              <FlowNode icon="🏅" label="Badge" sublabel="Decision" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Test Suites ──────────────────────────────────────────── */}
      <section ref={suitesRef} className="py-32 px-6 bg-[#ffffff02]">
        <div className="max-w-6xl mx-auto">
          <div className="fade-up text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built-In Test Suites
            </h2>
            <p className="text-[#e8e4df]/50 max-w-xl mx-auto">
              Battle-tested evaluation suites for the most common agent roles.
              Create your own in minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUITES.map((suite, i) => (
              <div
                key={suite.name}
                className={`fade-up fade-up-delay-${Math.min(i + 1, 5)} group p-6 rounded-xl bg-[#ffffff04] border border-[#ffffff08] hover:border-[#d4a574]/20 transition-all duration-500`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{suite.icon}</span>
                  <span className="text-xs text-[#e8e4df]/30 font-mono">
                    {suite.scenarios} scenarios
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{suite.name}</h3>
                <p className="text-[#e8e4df]/40 text-sm leading-relaxed">
                  {suite.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Code Example ─────────────────────────────────────────── */}
      <section ref={codeRef} className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="fade-up text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Five Lines to Qualify
            </h2>
            <p className="text-[#e8e4df]/50 max-w-xl mx-auto">
              Integrate Sensei into your pipeline with a single function call.
            </p>
          </div>

          <div className="fade-up fade-up-delay-1">
            <div className="rounded-xl overflow-hidden border border-[#ffffff08]">
              <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-xs text-[#e8e4df]/30 font-mono">
                  evaluate.ts
                </span>
              </div>
              <div className="bg-[#0f0f0f] p-6 font-mono text-sm leading-loose overflow-x-auto">
                <div>
                  <span className="text-[#c792ea]">import</span>
                  <span className="text-[#e8e4df]">{" { "}</span>
                  <span className="text-[#ffcb6b]">SenseiEngine</span>
                  <span className="text-[#e8e4df]">{", "}</span>
                  <span className="text-[#ffcb6b]">HttpAdapter</span>
                  <span className="text-[#e8e4df]">{" } "}</span>
                  <span className="text-[#c792ea]">from</span>
                  <span className="text-[#c3e88d]">
                    {" '"}@sensei/engine{"'"}
                  </span>
                  <span className="text-[#e8e4df]">;</span>
                </div>
                <div className="h-4" />
                <div>
                  <span className="text-[#c792ea]">const</span>
                  <span className="text-[#e8e4df]"> result </span>
                  <span className="text-[#89ddff]">=</span>
                  <span className="text-[#c792ea]"> await</span>
                  <span className="text-[#82aaff]"> engine</span>
                  <span className="text-[#e8e4df]">.</span>
                  <span className="text-[#82aaff]">run</span>
                  <span className="text-[#e8e4df]">{"({"}</span>
                </div>
                <div className="pl-6">
                  <span className="text-[#e8e4df]">suite: </span>
                  <span className="text-[#c3e88d]">{"'sdr'"}</span>
                  <span className="text-[#e8e4df]">,</span>
                </div>
                <div className="pl-6">
                  <span className="text-[#e8e4df]">adapter: </span>
                  <span className="text-[#c792ea]">new</span>
                  <span className="text-[#ffcb6b]"> HttpAdapter</span>
                  <span className="text-[#e8e4df]">{"({ "}</span>
                  <span className="text-[#e8e4df]">url: </span>
                  <span className="text-[#c3e88d]">
                    {"'https://my-agent.ai/api'"}
                  </span>
                  <span className="text-[#e8e4df]">{" }),"};</span>
                </div>
                <div>
                  <span className="text-[#e8e4df]">{"});"}</span>
                </div>
                <div className="h-4" />
                <div>
                  <span className="text-[#546e7a]">
                    {"// result.scores.overall → 87.3"}
                  </span>
                </div>
                <div>
                  <span className="text-[#546e7a]">
                    {"// result.badge         → \"silver\""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="py-16 px-6 border-t border-[#ffffff08]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-2xl mb-4">🥋</div>
          <p className="text-[#e8e4df]/40 text-sm mb-6">
            Built for the AI agent ecosystem
          </p>
          <div className="flex justify-center gap-6 text-sm text-[#e8e4df]/30">
            <a
              href="https://github.com/nymeria-ai/sensei"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#d4a574] transition-colors"
            >
              GitHub
            </a>
            <span>·</span>
            <span>MIT License</span>
            <span>·</span>
            <a
              href="https://github.com/nymeria-ai/sensei#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#d4a574] transition-colors"
            >
              Documentation
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ─── Flow Diagram Components ───────────────────────────────────────── */

function FlowNode({
  icon,
  label,
  sublabel,
  accent,
}: {
  icon: string;
  label: string;
  sublabel: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 px-5 py-4 rounded-xl border ${
        accent
          ? "bg-[#d4a574]/10 border-[#d4a574]/30"
          : "bg-[#ffffff06] border-[#ffffff08]"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span
        className={`text-xs font-semibold ${accent ? "text-[#d4a574]" : ""}`}
      >
        {label}
      </span>
      <span className="text-[10px] text-[#e8e4df]/30">{sublabel}</span>
    </div>
  );
}

function FlowArrow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-8 h-px bg-gradient-to-r from-[#d4a574]/40 to-[#d4a574]/60" />
      <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-[#d4a574]/60" />
    </div>
  );
}

function FlowArrowVertical() {
  return (
    <div className="flex flex-col items-center flow-pulse">
      <div className="h-6 w-px bg-gradient-to-b from-[#d4a574]/40 to-[#d4a574]/60" />
      <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#d4a574]/60" />
    </div>
  );
}
