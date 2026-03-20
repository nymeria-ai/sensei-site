import { NextRequest, NextResponse } from "next/server";
import { getDb, recalculateSuiteRating } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/marketplace/suites/[slug]/rate — rate a suite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const db = getDb();
  const suite = db.prepare("SELECT id FROM suites WHERE slug = ?").get(slug) as { id: string } | undefined;

  if (!suite) {
    return NextResponse.json({ error: "Suite not found" }, { status: 404 });
  }

  const body = await request.json();
  const score = body.score;

  if (!score || score < 1 || score > 10 || !Number.isInteger(score)) {
    return NextResponse.json({ error: "Score must be an integer between 1 and 10" }, { status: 400 });
  }

  // Upsert rating
  const existing = db
    .prepare("SELECT id FROM ratings WHERE suite_id = ? AND user_id = ?")
    .get(suite.id, session.user.id) as { id: string } | undefined;

  if (existing) {
    db.prepare("UPDATE ratings SET score = ?, created_at = datetime('now') WHERE id = ?").run(score, existing.id);
  } else {
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO ratings (id, suite_id, user_id, score) VALUES (?, ?, ?, ?)").run(
      id,
      suite.id,
      session.user.id,
      score
    );
  }

  recalculateSuiteRating(suite.id);

  return NextResponse.json({ success: true });
}

// DELETE /api/marketplace/suites/[slug]/rate — remove own rating
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const db = getDb();
  const suite = db.prepare("SELECT id FROM suites WHERE slug = ?").get(slug) as { id: string } | undefined;

  if (!suite) {
    return NextResponse.json({ error: "Suite not found" }, { status: 404 });
  }

  db.prepare("DELETE FROM ratings WHERE suite_id = ? AND user_id = ?").run(suite.id, session.user.id);

  recalculateSuiteRating(suite.id);

  return NextResponse.json({ success: true });
}
