import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getBeltRank } from "@/lib/belt-ranks";

// GET /api/marketplace/suites — list suites
export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = request.nextUrl;

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "rating";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  let where = "1=1";
  const params: unknown[] = [];

  if (q) {
    where += " AND (s.name LIKE ? OR s.description LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    where += " AND s.category = ?";
    params.push(category);
  }

  let orderBy = "s.avg_rating DESC";
  if (sort === "downloads") orderBy = "s.download_count DESC";
  else if (sort === "newest") orderBy = "s.created_at DESC";

  const countRow = db
    .prepare(`SELECT COUNT(*) as total FROM suites s WHERE ${where}`)
    .get(...params) as { total: number };

  const rows = db
    .prepare(
      `SELECT s.*, u.name as publisher_name, u.avatar_url as publisher_avatar, u.github_username as publisher_github
       FROM suites s
       LEFT JOIN users u ON s.publisher_id = u.id
       WHERE ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as Record<string, unknown>[];

  const suites = rows.map((row) => ({
    ...row,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
    belt: getBeltRank(row.avg_rating as number),
  }));

  return NextResponse.json({
    suites,
    total: countRow.total,
    page,
    limit,
    totalPages: Math.ceil(countRow.total / limit),
  });
}

// POST /api/marketplace/suites — publish new suite
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, category, tags, yaml_content, repo_url } = body;

  if (!name || !yaml_content) {
    return NextResponse.json({ error: "Name and yaml_content are required" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const db = getDb();

  // Check slug uniqueness
  const existing = db.prepare("SELECT id FROM suites WHERE slug = ?").get(slug);
  if (existing) {
    return NextResponse.json({ error: "A suite with this name already exists" }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const categoryImages: Record<string, string> = {
    sales: "/images/gi-execution.png",
    support: "/images/gi-reasoning.png",
    dev: "/images/gi-execution.png",
    content: "/images/gi-improvement.png",
    fun: "/images/gi-reasoning.png",
    general: "/images/gi-execution.png",
  };

  db.prepare(
    `INSERT INTO suites (id, slug, name, description, category, yaml_content, publisher_id, repo_url, image_url, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    slug,
    name,
    description || null,
    category || "general",
    yaml_content,
    session.user.id,
    repo_url || null,
    categoryImages[category] || "/images/gi-execution.png",
    tags ? JSON.stringify(tags) : "[]"
  );

  return NextResponse.json({ id, slug }, { status: 201 });
}
