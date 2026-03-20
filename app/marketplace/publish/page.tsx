"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { PublishWizard } from "@/components/PublishWizard";
import { UploadYaml } from "@/components/UploadYaml";

export default function PublishPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<"builder" | "upload" | "api">("builder");

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
              <span className="text-[#d4a574]">Publish</span>
            </nav>
          </div>
          <AuthButton />
        </div>
      </header>

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Publish a Suite</h1>
          <p className="text-[#e8e4df]/50 text-sm mb-8">
            Share your evaluation suite with the Sensei community.
          </p>

          {/* Auth gate */}
          {status === "loading" ? (
            <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
          ) : !session ? (
            <div className="rounded-xl bg-white/5 border border-white/10 p-12 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-xl font-bold mb-2">Sign in to publish</h2>
              <p className="text-[#e8e4df]/40 text-sm mb-6">
                You need to be signed in to publish suites to the marketplace.
              </p>
              <a
                href="/api/auth/signin"
                className="inline-block px-6 py-3 text-sm font-semibold rounded-lg bg-[#d4a574] text-[#0a0a0a] hover:bg-[#c9956b] transition-colors"
              >
                Sign in
              </a>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-1 mb-8 p-1 bg-white/5 rounded-lg w-fit">
                {[
                  { key: "builder" as const, label: "UI Builder" },
                  { key: "upload" as const, label: "Upload YAML" },
                  { key: "api" as const, label: "API / CLI" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-5 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                      tab === t.key
                        ? "bg-[#d4a574] text-[#0a0a0a]"
                        : "text-[#e8e4df]/50 hover:text-[#e8e4df]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {tab === "builder" && <PublishWizard />}
              {tab === "upload" && <UploadYaml />}
              {tab === "api" && (
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-bold mb-3">API Endpoint</h3>
                    <p className="text-sm text-[#e8e4df]/50 mb-4">
                      Publish suites programmatically using the REST API.
                    </p>
                    <div className="bg-[#0f0f0f] rounded-lg p-4 font-mono text-xs text-[#e8e4df]/70 border border-white/5 overflow-x-auto">
                      <div className="text-[#4ade80] mb-2"># Publish a suite via API</div>
                      <div>
                        curl -X POST https://sensei.sh/api/marketplace/suites \
                      </div>
                      <div className="pl-4">
                        -H &quot;Content-Type: application/json&quot; \
                      </div>
                      <div className="pl-4">
                        -H &quot;Authorization: Bearer YOUR_TOKEN&quot; \
                      </div>
                      <div className="pl-4">
                        -d &apos;{`{"name":"My Suite","description":"...","category":"dev","yaml_content":"...","tags":["tag1"]}`}&apos;
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-bold mb-3">CLI</h3>
                    <p className="text-sm text-[#e8e4df]/50 mb-4">
                      Use the Sensei CLI to publish directly from your terminal.
                    </p>
                    <div className="bg-[#0f0f0f] rounded-lg p-4 font-mono text-xs text-[#e8e4df]/70 border border-white/5 space-y-1">
                      <div className="text-[#4ade80]"># Install the CLI</div>
                      <div>npm install -g @mondaycom/sensei-cli</div>
                      <div className="h-2" />
                      <div className="text-[#4ade80]"># Login</div>
                      <div>sensei login</div>
                      <div className="h-2" />
                      <div className="text-[#4ade80]"># Publish a suite</div>
                      <div>sensei publish ./my-suite.yaml</div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-bold mb-3">Request Body</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-[#e8e4df]/40 border-b border-white/10">
                          <tr>
                            <th className="py-2 pr-4">Field</th>
                            <th className="py-2 pr-4">Type</th>
                            <th className="py-2 pr-4">Required</th>
                            <th className="py-2">Description</th>
                          </tr>
                        </thead>
                        <tbody className="text-[#e8e4df]/60">
                          <tr className="border-b border-white/5">
                            <td className="py-2 pr-4 font-mono text-xs text-[#d4a574]">name</td>
                            <td className="py-2 pr-4">string</td>
                            <td className="py-2 pr-4">Yes</td>
                            <td className="py-2">Suite display name</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2 pr-4 font-mono text-xs text-[#d4a574]">yaml_content</td>
                            <td className="py-2 pr-4">string</td>
                            <td className="py-2 pr-4">Yes</td>
                            <td className="py-2">Full YAML suite content</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2 pr-4 font-mono text-xs text-[#d4a574]">description</td>
                            <td className="py-2 pr-4">string</td>
                            <td className="py-2 pr-4">No</td>
                            <td className="py-2">Suite description</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2 pr-4 font-mono text-xs text-[#d4a574]">category</td>
                            <td className="py-2 pr-4">string</td>
                            <td className="py-2 pr-4">No</td>
                            <td className="py-2">sales, support, dev, content, fun, general</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs text-[#d4a574]">tags</td>
                            <td className="py-2 pr-4">string[]</td>
                            <td className="py-2 pr-4">No</td>
                            <td className="py-2">Array of tag strings</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
