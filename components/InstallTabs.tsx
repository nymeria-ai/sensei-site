"use client";

import { useState } from "react";

export function InstallTabs({ slug }: { slug: string }) {
  const [tab, setTab] = useState<"cli" | "npx" | "curl">("cli");
  const [copied, setCopied] = useState(false);

  const commands = {
    cli: `sensei install ${slug}`,
    npx: `npx @mondaycom/sensei-cli install ${slug}`,
    curl: `curl -o suite.yaml https://sensei.sh/api/marketplace/suites/${slug}/download`,
  };

  const copy = () => {
    navigator.clipboard.writeText(commands[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {(["cli", "npx", "curl"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setCopied(false); }}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              tab === t
                ? "bg-[#d4a574] text-[#0a0a0a]"
                : "bg-white/5 text-[#e8e4df]/50 hover:text-[#e8e4df] hover:bg-white/10"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Command */}
      <div className="relative group">
        <div className="bg-[#0f0f0f] rounded-lg p-4 font-mono text-sm text-[#e8e4df]/80 border border-white/5 overflow-x-auto">
          <span className="text-[#4ade80]">$</span> {commands[tab]}
        </div>
        <button
          onClick={copy}
          className="absolute top-2 right-2 px-2.5 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[#e8e4df]/50 hover:text-[#e8e4df] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Download YAML button */}
      <a
        href={`/api/marketplace/suites/${slug}/download`}
        download
        className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-[#e8e4df]/60 hover:text-[#d4a574] hover:border-[#d4a574]/30 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download YAML
      </a>
    </div>
  );
}
