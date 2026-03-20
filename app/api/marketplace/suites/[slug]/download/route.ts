import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/marketplace/suites/[slug]/download — returns YAML content
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getDb();

  const row = db.prepare("SELECT id, yaml_content, name FROM suites WHERE slug = ?").get(slug) as
    | { id: string; yaml_content: string; name: string }
    | undefined;

  if (!row) {
    return NextResponse.json({ error: "Suite not found" }, { status: 404 });
  }

  // Increment download count
  db.prepare("UPDATE suites SET download_count = download_count + 1 WHERE id = ?").run(row.id);

  // Track download
  const downloadId = crypto.randomUUID();
  db.prepare("INSERT INTO downloads (id, suite_id, method) VALUES (?, ?, 'yaml')").run(downloadId, row.id);

  return new NextResponse(row.yaml_content, {
    headers: {
      "Content-Type": "text/yaml",
      "Content-Disposition": `attachment; filename="${slug}.yaml"`,
    },
  });
}
