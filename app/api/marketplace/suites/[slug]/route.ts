import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getBeltRank } from "@/lib/belt-ranks";

// GET /api/marketplace/suites/[slug] — suite detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getDb();

  const row = db
    .prepare(
      `SELECT s.*, u.name as publisher_name, u.avatar_url as publisher_avatar, u.github_username as publisher_github
       FROM suites s
       LEFT JOIN users u ON s.publisher_id = u.id
       WHERE s.slug = ?`
    )
    .get(slug) as Record<string, unknown> | undefined;

  if (!row) {
    return NextResponse.json({ error: "Suite not found" }, { status: 404 });
  }

  // Get rating distribution
  const distribution = db
    .prepare(
      "SELECT score, COUNT(*) as count FROM ratings WHERE suite_id = ? GROUP BY score ORDER BY score"
    )
    .all(row.id as string) as { score: number; count: number }[];

  const suite = {
    ...row,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
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
  const db = getDb();
  const existing = db.prepare("SELECT * FROM suites WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;

  if (!existing) {
    return NextResponse.json({ error: "Suite not found" }, { status: 404 });
  }

  if (existing.publisher_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, category, tags, yaml_content, repo_url } = body;

  db.prepare(
    `UPDATE suites SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      category = COALESCE(?, category),
      yaml_content = COALESCE(?, yaml_content),
      repo_url = COALESCE(?, repo_url),
      tags = COALESCE(?, tags),
      updated_at = datetime('now')
     WHERE slug = ?`
  ).run(
    name || null,
    description || null,
    category || null,
    yaml_content || null,
    repo_url || null,
    tags ? JSON.stringify(tags) : null,
    slug
  );

  return NextResponse.json({ success: true });
}
