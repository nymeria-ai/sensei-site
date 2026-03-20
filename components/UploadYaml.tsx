"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function UploadYaml() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [yamlContent, setYamlContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".yaml") && !file.name.endsWith(".yml")) {
      setError("Please upload a .yaml or .yml file");
      return;
    }
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setYamlContent(content);

      // Try to parse name/description from YAML
      const nameMatch = content.match(/^name:\s*"?(.+?)"?\s*$/m);
      const descMatch = content.match(/^description:\s*>?\s*\n\s+(.+)/m);
      if (nameMatch) setName(nameMatch[1]);
      if (descMatch) setDescription(descMatch[1].trim());
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handlePublish = async () => {
    if (!yamlContent || !name) return;
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
          yaml_content: yamlContent,
          tags: [],
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
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-[#d4a574] bg-[#d4a574]/5"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".yaml,.yml"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
        <div className="text-3xl mb-3">📄</div>
        <p className="text-sm text-[#e8e4df]/60 mb-1">
          {fileName ? fileName : "Drop your YAML file here or click to browse"}
        </p>
        <p className="text-xs text-[#e8e4df]/30">.yaml or .yml files only</p>
      </div>

      {yamlContent && (
        <>
          {/* Metadata form */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Suite Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-[#e8e4df] text-sm focus:border-[#d4a574]/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0f0f0f] border border-white/10 text-[#e8e4df] text-sm focus:border-[#d4a574]/50 focus:outline-none resize-none"
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
          </div>

          {/* YAML Preview */}
          <div>
            <h4 className="text-sm font-medium text-[#e8e4df]/50 mb-2">Preview</h4>
            <pre className="bg-[#0f0f0f] rounded-lg p-4 font-mono text-xs text-[#e8e4df]/60 max-h-64 overflow-auto border border-white/10 leading-relaxed">
              {yamlContent}
            </pre>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handlePublish}
            disabled={publishing || !name}
            className="w-full py-2.5 text-sm font-semibold rounded-lg bg-[#d4a574] text-[#0a0a0a] hover:bg-[#c9956b] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {publishing ? "Publishing..." : "Publish Suite"}
          </button>
        </>
      )}
    </div>
  );
}
