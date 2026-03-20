import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getBeltRank } from "@/lib/belt-ranks";

// GET /api/marketplace/suites — list suites
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "rating";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  // Build count query
  let countQuery = supabaseAdmin.from("suites").select("*", { count: "exact", head: true });
  if (q) {
    countQuery = countQuery.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }
  if (category) {
    countQuery = countQuery.eq("category", category);
  }
  const { count: total } = await countQuery;

  // Build data query with publisher join
  let query = supabaseAdmin
    .from("suites")
    .select("*, users!publisher_id(name, avatar_url, github_username)");

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }

  if (sort === "downloads") {
    query = query.order("download_count", { ascending: false });
  } else if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("avg_rating", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data: rows, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const suites = (rows ?? []).map((row) => {
    const publisher = row.users as { name: string; avatar_url: string; github_username: string } | null;
    return {
      ...row,
      users: undefined,
      publisher_name: publisher?.name ?? null,
      publisher_avatar: publisher?.avatar_url ?? null,
      publisher_github: publisher?.github_username ?? null,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags ?? []),
      belt: getBeltRank(row.avg_rating as number),
    };
  });

  return NextResponse.json({
    suites,
    total: total ?? 0,
    page,
    limit,
    totalPages: Math.ceil((total ?? 0) / limit),
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

  // Check slug uniqueness
  const { data: existing } = await supabaseAdmin
    .from("suites")
    .select("id")
    .eq("slug", slug)
    .single();

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

  const { error } = await supabaseAdmin.from("suites").insert({
    id,
    slug,
    name,
    description: description || null,
    category: category || "general",
    yaml_content,
    publisher_id: session.user.id,
    repo_url: repo_url || null,
    image_url: categoryImages[category] || "/images/gi-execution.png",
    tags: tags ? JSON.stringify(tags) : "[]",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id, slug }, { status: 201 });
}
