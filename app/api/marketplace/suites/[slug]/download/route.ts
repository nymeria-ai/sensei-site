import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";

// GET /api/marketplace/suites/[slug]/download — returns YAML content
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: row, error } = await supabaseAdmin
    .from("suites")
    .select("id, yaml_content, name, download_count")
    .eq("slug", slug)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "Suite not found" }, { status: 404 });
  }

  // Increment download count
  await supabaseAdmin
    .from("suites")
    .update({ download_count: (row as Record<string, unknown>).download_count as number + 1 })
    .eq("id", row.id);

  // Track download
  const downloadId = crypto.randomUUID();
  await supabaseAdmin.from("downloads").insert({
    id: downloadId,
    suite_id: row.id,
    method: "yaml",
  });

  return new NextResponse(row.yaml_content, {
    headers: {
      "Content-Type": "text/yaml",
      "Content-Disposition": `attachment; filename="${slug}.yaml"`,
    },
  });
}
