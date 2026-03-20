# Migration Task: SQLite → Supabase

## CONTEXT
The marketplace was initially built with SQLite (better-sqlite3) which doesn't work on Vercel serverless.
We need to migrate to Supabase (PostgreSQL + REST API).

**Supabase project is already set up with tables and seeded data.**

## CREDENTIALS (use as env vars)
- NEXT_PUBLIC_SUPABASE_URL=https://zcroeqklldprcdjbmqtd.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjcm9lcWtsbGRwcmNkamJtcXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDMxMTksImV4cCI6MjA4OTU3OTExOX0.e9zbTyrRdp2kxgTNaP4ljxJFFVnRdMbiNjbMLp-YP94
- SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjcm9lcWtsbGRwcmNkamJtcXRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAwMzExOSwiZXhwIjoyMDg5NTc5MTE5fQ.SSXM-wvgLjfoYLEsuezBbhvf2sjTivWI7tNky8h0sFk

## YOUR TASK

### 1. Replace `lib/db.ts`
Remove ALL SQLite code. Replace with a Supabase client:

```typescript
// lib/db.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/public operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

### 2. Update ALL API routes to use Supabase instead of SQLite

Replace every `db.prepare(...)` call with equivalent Supabase queries:

**`app/api/marketplace/suites/route.ts`** (GET list + POST create):
- GET: `supabaseAdmin.from('suites').select('*').order(...).range(...)`
- POST: `supabaseAdmin.from('suites').insert({...}).select()`
- Support search: `.ilike('name', '%query%')` or `.or('name.ilike.%q%,description.ilike.%q%')`
- Support category filter: `.eq('category', cat)`
- Support sort: `.order('avg_rating' | 'download_count' | 'created_at', { ascending: false })`
- Support pagination: `.range(offset, offset + limit - 1)`

**`app/api/marketplace/suites/[slug]/route.ts`** (GET detail + PUT update):
- GET: `supabaseAdmin.from('suites').select('*, users!publisher_id(*)').eq('slug', slug).single()`
- PUT: `supabaseAdmin.from('suites').update({...}).eq('slug', slug).eq('publisher_id', userId)`

**`app/api/marketplace/suites/[slug]/download/route.ts`**:
- GET yaml + increment: `supabaseAdmin.from('suites').select('yaml_content, id').eq('slug', slug).single()`
- Then: `supabaseAdmin.rpc('increment_download', { suite_slug: slug })` OR just update download_count

**`app/api/marketplace/suites/[slug]/rate/route.ts`**:
- POST: upsert rating, then recalculate avg
- DELETE: delete rating, then recalculate avg
- Recalculate: query all ratings for suite, compute avg, update suites table

### 3. Update auth to work with Supabase
- Keep NextAuth.js for the OAuth flow (GitHub + Google)
- On login callback, upsert user to Supabase `users` table
- Store the Supabase user ID in the JWT/session

### 4. Update page components
- The marketplace pages currently fetch from `/api/marketplace/suites` — these should still work if the API routes are updated correctly.
- Make sure the seed data renders properly in the grid.

### 5. Remove SQLite dependencies
- Remove `better-sqlite3` and `@types/better-sqlite3` from package.json
- Remove `data/sensei-marketplace.db` if it exists
- Remove the `scripts/seed.ts` file (data is already seeded in Supabase)
- Remove `serverExternalPackages: ['better-sqlite3']` from next.config.ts

### 6. Create `.env.local` file
```
NEXT_PUBLIC_SUPABASE_URL=https://zcroeqklldprcdjbmqtd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjcm9lcWtsbGRwcmNkamJtcXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDMxMTksImV4cCI6MjA4OTU3OTExOX0.e9zbTyrRdp2kxgTNaP4ljxJFFVnRdMbiNjbMLp-YP94
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjcm9lcWtsbGRwcmNkamJtcXRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAwMzExOSwiZXhwIjoyMDg5NTc5MTE5fQ.SSXM-wvgLjfoYLEsuezBbhvf2sjTivWI7tNky8h0sFk
NEXTAUTH_SECRET=sensei-marketplace-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
```

### 7. Verify
- Run `npm run build` — must succeed with no errors
- The existing homepage must still work
- Marketplace routes should compile successfully

### IMPORTANT
- @supabase/supabase-js is ALREADY installed (we added it earlier)
- Do NOT break the existing `/api/sensei/*` routes (score, suites, auth) — those are the original engine API
- Only modify marketplace-related files
- Commit with message: "refactor: migrate marketplace from SQLite to Supabase"

When done, run:
openclaw system event --text "Done: Supabase migration complete. Replaced SQLite with Supabase client in all marketplace API routes. Removed better-sqlite3 dependency. Build passes clean." --mode now
