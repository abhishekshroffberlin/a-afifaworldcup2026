# Anirudh & Abhishek World Cup HQ — Live API version

This version uses a Vercel serverless function at `/api/worldcup` to fetch FIFA World Cup data from football-data.org without exposing your API key in the browser.
Predictions are stored in Supabase through `/api/predictions`, so they are shared across browsers and devices.

## Setup

1. Sign up at https://www.football-data.org/ and copy your API token.
2. In Vercel, open your project.
3. Go to Settings → Environment Variables.
4. Add:

   FOOTBALL_DATA_API_TOKEN=your_token_here
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

5. In Supabase, open SQL Editor and run:

```sql
create table if not exists public.aa_wc_predictions (
  match_id integer primary key,
  picks jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.aa_wc_predictions enable row level security;
```

The Vercel API route uses your service role key on the server, so you do not need a public RLS policy for this private family app.

6. Replace your old `index.html` with this one.
7. Add the `api/worldcup.js` and `api/predictions.js` files to your project.
8. Commit and push to GitHub, or redeploy manually.

## Test

After deployment, open:

/api/worldcup?type=matches&season=2026
/api/predictions

If both return JSON, your live data and shared prediction routes work.
