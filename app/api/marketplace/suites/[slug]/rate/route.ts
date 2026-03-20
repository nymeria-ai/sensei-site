import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, recalculateSuiteRating } from "@/lib/db";
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

  const { data: suite } = await supabaseAdmin
    .from("suites")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!suite) {
    return NextResponse.json({ error: "Suite not found" }, { status: 404 });
  }

  const body = await request.json();
  const score = body.score;

  if (!score || score < 1 || score > 10 || !Number.isInteger(score)) {
    return NextResponse.json({ error: "Score must be an integer between 1 and 10" }, { status: 400 });
  }

  // Upsert rating
  const { data: existing } = await supabaseAdmin
    .from("ratings")
    .select("id")
    .eq("suite_id", suite.id)
    .eq("user_id", session.user.id)
    .single();

  if (existing) {
    await supabaseAdmin
      .from("ratings")
      .update({ score, created_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    const id = crypto.randomUUID();
    await supabaseAdmin.from("ratings").insert({
      id,
      suite_id: suite.id,
      user_id: session.user.id,
      score,
    });
  }

  await recalculateSuiteRating(suite.id);

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

  const { data: suite } = await supabaseAdmin
    .from("suites")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!suite) {
    return NextResponse.json({ error: "Suite not found" }, { status: 404 });
  }

  await supabaseAdmin
    .from("ratings")
    .delete()
    .eq("suite_id", suite.id)
    .eq("user_id", session.user.id);

  await recalculateSuiteRating(suite.id);

  return NextResponse.json({ success: true });
}
