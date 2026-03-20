import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/public operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper: upsert user on login
export async function upsertUser(user: {
  provider: string;
  provider_id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  github_username?: string | null;
}): Promise<{ id: string }> {
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('provider', user.provider)
    .eq('provider_id', user.provider_id)
    .single();

  if (existing) {
    await supabaseAdmin
      .from('users')
      .update({
        email: user.email ?? null,
        name: user.name ?? null,
        avatar_url: user.avatar_url ?? null,
        github_username: user.github_username ?? null,
      })
      .eq('id', existing.id);
    return { id: existing.id };
  }

  const id = crypto.randomUUID();
  await supabaseAdmin.from('users').insert({
    id,
    provider: user.provider,
    provider_id: user.provider_id,
    email: user.email ?? null,
    name: user.name ?? null,
    avatar_url: user.avatar_url ?? null,
    github_username: user.github_username ?? null,
  });
  return { id };
}

// Helper: recalculate suite rating stats
export async function recalculateSuiteRating(suiteId: string) {
  const { data: ratings } = await supabaseAdmin
    .from('ratings')
    .select('score')
    .eq('suite_id', suiteId);

  const count = ratings?.length ?? 0;
  const avg = count > 0
    ? ratings!.reduce((sum, r) => sum + r.score, 0) / count
    : 0;

  const avgRating = Math.round(avg * 10) / 10;
  const { getBeltRank } = require('./belt-ranks');
  const belt = getBeltRank(avgRating);
  const beltKey = belt.name.split(' ')[0].toLowerCase();

  await supabaseAdmin
    .from('suites')
    .update({
      avg_rating: avgRating,
      rating_count: count,
      belt_rank: beltKey,
      updated_at: new Date().toISOString(),
    })
    .eq('id', suiteId);
}
