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
            {/* Task Execution — Gi in forward strike pose */}
            <div className="fade-up fade-up-delay-1 group p-8 rounded-2xl bg-[#ffffff04] border border-[#ffffff08] hover:border-[#d4a574]/20 transition-all duration-500">
              <div className="mb-5 w-20 h-20">
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/* Empty gi in forward punch stance — no body, just the uniform */}
                  {/* Collar opening (dark void where head would be) */}
                  <ellipse cx="55" cy="18" rx="8" ry="5" fill="#0a0a0a" opacity="0.6"/>

                  {/* Right lapel */}
                  <path d="M47 14 L42 18 L48 50 L55 50 L55 22 Z" fill="#e8e4df" opacity="0.9"/>
                  <path d="M47 14 L42 18 L48 50 L55 50 L55 22 Z" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>
                  {/* Left lapel */}
                  <path d="M63 14 L68 18 L62 50 L55 50 L55 22 Z" fill="#e8e4df" opacity="0.85"/>
                  <path d="M63 14 L68 18 L62 50 L55 50 L55 22 Z" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>

                  {/* Jacket body - slightly rotated for action pose */}
                  <path d="M42 18 L35 22 L33 58 L77 55 L75 22 L68 18" fill="#e8e4df" opacity="0.82"/>
                  <path d="M42 18 L35 22 L33 58 L77 55 L75 22 L68 18" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.2"/>
                  {/* Jacket seam line */}
                  <line x1="55" y1="50" x2="55" y2="57" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.2"/>

                  {/* Belt — obi */}
                  <path d="M33 52 L77 49 L77 55 L33 58 Z" fill="#d4a574" opacity="0.9"/>
                  {/* Belt knot */}
                  <path d="M52 50 Q55 48 58 50 L60 58 Q55 60 52 58 Z" fill="#c9956b" opacity="0.8"/>
                  {/* Belt tail hanging */}
                  <path d="M58 54 L65 62 L63 63 L57 56" fill="#d4a574" opacity="0.7"/>

                  {/* Right sleeve — extended forward (strike!) */}
                  <path d="M75 22 L82 24 L95 26 L96 34 L84 33 L77 35 L75 30" fill="#e8e4df" opacity="0.85"/>
                  <path d="M75 22 L82 24 L95 26 L96 34 L84 33 L77 35" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>
                  {/* Right sleeve opening (dark void) */}
                  <ellipse cx="96" cy="30" rx="2" ry="4" fill="#0a0a0a" opacity="0.5"/>

                  {/* Left sleeve — pulled back at hip */}
                  <path d="M35 22 L28 28 L25 40 L30 42 L32 32 L35 30" fill="#e8e4df" opacity="0.85"/>
                  <path d="M35 22 L28 28 L25 40 L30 42 L32 32" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>
                  {/* Left sleeve opening */}
                  <ellipse cx="27" cy="41" rx="3" ry="2" fill="#0a0a0a" opacity="0.5"/>

                  {/* Right pant leg — forward lunge */}
                  <path d="M55 56 L60 55 L70 82 L72 95 L64 96 L62 85 L55 62" fill="#e8e4df" opacity="0.75"/>
                  <path d="M72 95 L64 96" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>
                  {/* Right pant opening */}
                  <ellipse cx="68" cy="96" rx="4" ry="2" fill="#0a0a0a" opacity="0.4"/>

                  {/* Left pant leg — back stance */}
                  <path d="M33 58 L55 60 L50 68 L40 90 L36 98 L28 97 L32 88 L35 65" fill="#e8e4df" opacity="0.72"/>
                  <ellipse cx="32" cy="98" rx="4" ry="2" fill="#0a0a0a" opacity="0.4"/>

                  {/* Fabric fold details */}
                  <path d="M45 30 Q50 35 48 42" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.15" fill="none"/>
                  <path d="M65 30 Q60 35 62 42" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.15" fill="none"/>
                  <path d="M40 60 Q42 70 40 78" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.12" fill="none"/>
                  <path d="M65 58 Q67 68 68 76" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.12" fill="none"/>

                  {/* Motion lines */}
                  <line x1="100" y1="24" x2="108" y2="22" stroke="#d4a574" strokeWidth="1.5" opacity="0.35"/>
                  <line x1="100" y1="30" x2="108" y2="30" stroke="#d4a574" strokeWidth="1.5" opacity="0.35"/>
                  <line x1="100" y1="36" x2="108" y2="38" stroke="#d4a574" strokeWidth="1.5" opacity="0.35"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Task Execution</h3>
              <p className="text-[#d4a574] text-sm font-medium mb-4">Can the agent do the job?</p>
              <p className="text-[#e8e4df]/50 text-sm leading-relaxed">Measure real performance against domain-specific KPIs. Each task is scored on concrete, quantifiable metrics — not vibes.</p>
            </div>

            {/* Reasoning — Gi in seated meditation pose */}
            <div className="fade-up fade-up-delay-2 group p-8 rounded-2xl bg-[#ffffff04] border border-[#ffffff08] hover:border-[#d4a574]/20 transition-all duration-500">
              <div className="mb-5 w-20 h-20">
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/* Empty gi in seiza/meditation — seated, calm, contemplative */}
                  {/* Collar opening */}
                  <ellipse cx="60" cy="22" rx="8" ry="5" fill="#0a0a0a" opacity="0.6"/>

                  {/* Right lapel */}
                  <path d="M52 18 L47 22 L53 54 L60 54 L60 26 Z" fill="#e8e4df" opacity="0.9"/>
                  <path d="M52 18 L47 22 L53 54 L60 54 L60 26 Z" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>
                  {/* Left lapel */}
                  <path d="M68 18 L73 22 L67 54 L60 54 L60 26 Z" fill="#e8e4df" opacity="0.85"/>
                  <path d="M68 18 L73 22 L67 54 L60 54 L60 26 Z" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>

                  {/* Jacket body — straight, composed */}
                  <path d="M47 22 L40 26 L38 62 L82 62 L80 26 L73 22" fill="#e8e4df" opacity="0.82"/>
                  <path d="M47 22 L40 26 L38 62 L82 62 L80 26 L73 22" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.2"/>
                  {/* Center seam */}
                  <line x1="60" y1="54" x2="60" y2="62" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.2"/>

                  {/* Belt */}
                  <path d="M38 56 L82 56 L82 62 L38 62 Z" fill="#d4a574" opacity="0.9"/>
                  {/* Belt knot — centered, neat */}
                  <path d="M57 56 Q60 54 63 56 L64 62 Q60 64 56 62 Z" fill="#c9956b" opacity="0.8"/>
                  {/* Belt tails — hanging symmetrically */}
                  <path d="M56 59 L50 68 L52 69 L57 61" fill="#d4a574" opacity="0.65"/>
                  <path d="M64 59 L70 68 L68 69 L63 61" fill="#d4a574" opacity="0.65"/>

                  {/* Left sleeve — resting on knee, relaxed */}
                  <path d="M40 26 L32 32 L28 48 L24 56 L30 58 L34 50 L36 36 L40 32" fill="#e8e4df" opacity="0.85"/>
                  <path d="M28 48 L24 56 L30 58" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>
                  <ellipse cx="27" cy="57" rx="3" ry="2" fill="#0a0a0a" opacity="0.45"/>

                  {/* Right sleeve — resting on knee, relaxed */}
                  <path d="M80 26 L88 32 L92 48 L96 56 L90 58 L86 50 L84 36 L80 32" fill="#e8e4df" opacity="0.85"/>
                  <path d="M92 48 L96 56 L90 58" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>
                  <ellipse cx="93" cy="57" rx="3" ry="2" fill="#0a0a0a" opacity="0.45"/>

                  {/* Folded legs/pants — seiza sitting */}
                  <path d="M38 62 L35 70 L30 78 L90 78 L85 70 L82 62" fill="#e8e4df" opacity="0.72"/>
                  {/* Feet tucked under */}
                  <path d="M30 78 L28 84 L92 84 L90 78" fill="#e8e4df" opacity="0.6"/>
                  <path d="M30 78 L28 84 L92 84 L90 78" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.15"/>

                  {/* Fabric fold details */}
                  <path d="M50 34 Q55 40 53 48" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.15" fill="none"/>
                  <path d="M70 34 Q65 40 67 48" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.15" fill="none"/>
                  <path d="M45 68 Q50 72 55 70" stroke="#c5c0b8" strokeWidth="0.4" opacity="0.12" fill="none"/>
                  <path d="M65 68 Q70 72 75 70" stroke="#c5c0b8" strokeWidth="0.4" opacity="0.12" fill="none"/>

                  {/* Wisdom aura — subtle rings around collar */}
                  <circle cx="60" cy="22" r="14" stroke="#d4a574" strokeWidth="0.8" opacity="0.15" strokeDasharray="3 4"/>
                  <circle cx="60" cy="22" r="20" stroke="#d4a574" strokeWidth="0.5" opacity="0.08" strokeDasharray="2 5"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Reasoning</h3>
              <p className="text-[#d4a574] text-sm font-medium mb-4">Can it explain its decisions?</p>
              <p className="text-[#e8e4df]/50 text-sm leading-relaxed">Probe the agent&apos;s thought process. Great execution means nothing if the agent can&apos;t articulate why it made a choice.</p>
            </div>

            {/* Self-Improvement — Gi in upward rising kata */}
            <div className="fade-up fade-up-delay-3 group p-8 rounded-2xl bg-[#ffffff04] border border-[#ffffff08] hover:border-[#d4a574]/20 transition-all duration-500">
              <div className="mb-5 w-20 h-20">
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/* Empty gi in rising kata — arms up, wide stance, ascending */}
                  {/* Collar opening */}
                  <ellipse cx="60" cy="16" rx="8" ry="5" fill="#0a0a0a" opacity="0.6"/>

                  {/* Right lapel */}
                  <path d="M52 12 L47 16 L53 48 L60 48 L60 20 Z" fill="#e8e4df" opacity="0.9"/>
                  <path d="M52 12 L47 16 L53 48 L60 48 L60 20 Z" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>
                  {/* Left lapel */}
                  <path d="M68 12 L73 16 L67 48 L60 48 L60 20 Z" fill="#e8e4df" opacity="0.85"/>
                  <path d="M68 12 L73 16 L67 48 L60 48 L60 20 Z" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>

                  {/* Jacket body */}
                  <path d="M47 16 L40 20 L38 56 L82 56 L80 20 L73 16" fill="#e8e4df" opacity="0.82"/>
                  <path d="M47 16 L40 20 L38 56 L82 56 L80 20 L73 16" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.2"/>
                  <line x1="60" y1="48" x2="60" y2="56" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.2"/>

                  {/* Belt */}
                  <path d="M38 50 L82 50 L82 56 L38 56 Z" fill="#d4a574" opacity="0.9"/>
                  <path d="M57 50 Q60 48 63 50 L64 56 Q60 58 56 56 Z" fill="#c9956b" opacity="0.8"/>
                  <path d="M56 53 L48 62 L50 63 L57 55" fill="#d4a574" opacity="0.65"/>

                  {/* Left sleeve — raised high up */}
                  <path d="M40 20 L32 18 L22 10 L16 4 L12 6 L14 10 L20 16 L28 22 L36 24" fill="#e8e4df" opacity="0.85"/>
                  <path d="M22 10 L16 4 L12 6 L14 10" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>
                  {/* Left sleeve opening */}
                  <ellipse cx="13" cy="5" rx="2" ry="3" fill="#0a0a0a" opacity="0.45" transform="rotate(-30 13 5)"/>

                  {/* Right sleeve — raised high up */}
                  <path d="M80 20 L88 18 L98 10 L104 4 L108 6 L106 10 L100 16 L92 22 L84 24" fill="#e8e4df" opacity="0.85"/>
                  <path d="M98 10 L104 4 L108 6 L106 10" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.3"/>
                  <ellipse cx="107" cy="5" rx="2" ry="3" fill="#0a0a0a" opacity="0.45" transform="rotate(30 107 5)"/>

                  {/* Right pant leg — wide stance */}
                  <path d="M60 56 L82 56 L88 85 L92 100 L84 102 L80 88 L70 62" fill="#e8e4df" opacity="0.72"/>
                  <ellipse cx="88" cy="101" rx="4" ry="2" fill="#0a0a0a" opacity="0.4"/>

                  {/* Left pant leg — wide stance */}
                  <path d="M38 56 L60 56 L50 62 L40 88 L36 102 L28 100 L32 85 L38 62" fill="#e8e4df" opacity="0.72"/>
                  <ellipse cx="32" cy="101" rx="4" ry="2" fill="#0a0a0a" opacity="0.4"/>

                  {/* Fabric folds */}
                  <path d="M50 28 Q55 34 53 42" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.15" fill="none"/>
                  <path d="M70 28 Q65 34 67 42" stroke="#c5c0b8" strokeWidth="0.5" opacity="0.15" fill="none"/>
                  <path d="M42 65 Q44 75 42 82" stroke="#c5c0b8" strokeWidth="0.4" opacity="0.12" fill="none"/>
                  <path d="M78 65 Q80 75 82 82" stroke="#c5c0b8" strokeWidth="0.4" opacity="0.12" fill="none"/>

                  {/* Rising energy lines */}
                  <line x1="8" y1="8" x2="5" y2="0" stroke="#d4a574" strokeWidth="1" opacity="0.3"/>
                  <line x1="60" y1="10" x2="60" y2="2" stroke="#d4a574" strokeWidth="1" opacity="0.25"/>
                  <line x1="112" y1="8" x2="115" y2="0" stroke="#d4a574" strokeWidth="1" opacity="0.3"/>
                  {/* Small upward sparks */}
                  <circle cx="6" cy="1" r="1.5" fill="#d4a574" opacity="0.2"/>
                  <circle cx="60" cy="1" r="1.5" fill="#d4a574" opacity="0.15"/>
                  <circle cx="114" cy="1" r="1.5" fill="#d4a574" opacity="0.2"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Self-Improvement</h3>
              <p className="text-[#d4a574] text-sm font-medium mb-4">Can it learn from feedback?</p>
              <p className="text-[#e8e4df]/50 text-sm leading-relaxed">Give the agent feedback and watch it adapt. The best agents don&apos;t just perform — they evolve.</p>
            </div>
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
