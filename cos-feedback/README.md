# COS peer feedback (static + Supabase)

Static HTML in this folder is served at:

`https://<github-username>.github.io/<repo-name>/cos-feedback/`

when **GitHub Pages** uses the **root** of the `main` branch (`/`). If your repo is set to publish only from `/docs`, either switch Pages to **/ (root)** in **Settings → Pages**, or copy this folder under `docs/cos-feedback` instead.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. **SQL Editor** → run `supabase/schema.sql` (creates `responses`, enables **RLS**, adds anon `insert` / `select` policies).
3. **Project Settings → API**: copy **Project URL** and **anon public** key.

## Local configuration

```bash
cd cos-feedback
cp .env.example .env
# Edit .env with your URL and anon key
```

Mirror those values into the `<script>` block at the top of `index.html` (replace `REPLACE_WITH_*`). Static hosts do not load `.env` at runtime.

## Security note

The **anon key** is expected to appear in browser JavaScript. Protection is **Row Level Security** on the database — keep RLS **on** for `public.responses` and adjust policies if you need stricter rules than “anyone with the link can read/write”.

## Deploy

Commit and push `cos-feedback/` to `main`. After Pages rebuilds, open the `/cos-feedback/` URL and submit a test row; confirm it appears in **Supabase → Table Editor → responses**.
