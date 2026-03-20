import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getBeltRank } from "@/lib/belt-ranks";

// GET /api/marketplace/suites/[slug] — suite detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: row, error } = await supabaseAdmin
    .from("suites")
    .select("*, users!publisher_id(name, avatar_url, github_username)")
    .eq("slug", slug)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "Suite not found" }, { status: 404 });
  }

  // Get rating distribution
  const { data: ratings } = await supabaseAdmin
    .from("ratings")
    .select("score")
    .eq("suite_id", row.id);

  const distribution: { score: number; count: number }[] = [];
  if (ratings && ratings.length > 0) {
    const counts: Record<number, number> = {};
    for (const r of ratings) {
      counts[r.score] = (counts[r.score] || 0) + 1;
    }
    for (const [score, count] of Object.entries(counts)) {
      distribution.push({ score: Number(score), count });
    }
    distribution.sort((a, b) => a.score - b.score);
  }

  const publisher = row.users as { name: string; avatar_url: string; github_username: string } | null;
  const suite = {
    ...row,
    users: undefined,
    publisher_name: publisher?.name ?? null,
    publisher_avatar: publisher?.avatar_url ?? null,
    publisher_github: publisher?.github_username ?? null,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags ?? []),
    belt: getBeltRank(row.avg_rating as number),
    rating_distribution: distribution,
  };

  return NextResponse.json(suite);
}

// PUT /api/marketplace/suites/[slug] — update own suite
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const { data: existing } = await supabaseAdmin
    .from("suites")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Suite not found" }, { status: 404 });
  }

  if (existing.publisher_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, category, tags, yaml_content, repo_url } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) updates.name = name;
  if (description) updates.description = description;
  if (category) updates.category = category;
  if (yaml_content) updates.yaml_content = yaml_content;
  if (repo_url) updates.repo_url = repo_url;
  if (tags) updates.tags = JSON.stringify(tags);

  const { error } = await supabaseAdmin
    .from("suites")
    .update(updates)
    .eq("slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
