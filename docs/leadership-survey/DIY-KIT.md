# Leadership feedback survey — DIY kit

Create your own anonymous leadership feedback survey in ~15 minutes. No coding experience needed — just Cursor (or any AI coding assistant), a free Supabase account, and a GitHub account.

---

## What you get

- **Survey page** — anonymous, 1–10 ratings on 9 leadership dimensions, optional free text
- **Dashboard page** — your eyes only, shows average scores, histograms, and free-text responses
- **Your own database** — no one else can see your results

---

## Step 1: Create your Supabase project (5 min)

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New project** → pick a name, set a password, choose a region → **Create**.
3. Once ready, go to **SQL Editor** → **New query** → paste this and click **Run**:

```sql
create table if not exists public.leadership_responses (
  id uuid primary key default gen_random_uuid(),
  ratings jsonb not null default '{}'::jsonb,
  free_text text,
  submitted_at timestamptz not null default now()
);

create index if not exists leadership_responses_submitted_at_idx
  on public.leadership_responses (submitted_at desc);

alter table public.leadership_responses enable row level security;

create policy "leadership_insert_anon"
  on public.leadership_responses
  for insert to anon
  with check (true);

create policy "leadership_select_anon"
  on public.leadership_responses
  for select to anon
  using (true);
```

4. Go to **Settings → API Keys** and copy your **Project URL**.
5. Go to **Settings → Data API** and copy your **anon public key**.

Keep both values handy.

---

## Step 2: Generate your survey (5 min)

Open Cursor and paste this prompt. **Replace the three placeholders** before sending:

---

> Create a leadership feedback survey hosted on GitHub Pages with these specs:
>
> **My name:** YOUR_FIRST_NAME
> **Supabase URL:** YOUR_SUPABASE_URL
> **Supabase anon key:** YOUR_ANON_KEY
>
> Create a new GitHub repo called `leadership-feedback` with a `docs/` folder containing two pages:
>
> **Page 1: `docs/survey/index.html`** (share this link with your team)
> - Title: "[Your name]'s Leadership Feedback Survey — FY26"
> - Subtitle: "I would love to hear how I'm doing on any or all of the dimensions below"
> - Mark it as "completely anonymous — no names or emails are collected"
> - 9 categories, each with clickable 1–10 number boxes (nothing pre-selected, click to select, click again to deselect, rows can be left blank):
>   1. Prioritization & Focus — Helps the team focus on what matters most
>   2. Recognition & Appreciation — Acknowledges contributions and celebrates wins
>   3. Performance Management — Sets clear expectations and gives honest, timely feedback
>   4. Removing Blockers — Proactively clears obstacles so the team can move fast
>   5. Career Growth & Development — Invests in your growth and creates development opportunities
>   6. Communication & Transparency — Shares context openly, listens, keeps the team informed
>   7. Decision-Making — Makes timely, well-reasoned decisions and explains the 'why'
>   8. Strategic Vision — Provides clear direction and connects work to the bigger picture
>   9. Availability & Accessibility — Makes time for you when you need it
> - Optional free text: "What's one thing [your name] could do differently to be a more effective leader?"
> - Submit button: "Submit anonymous feedback"
> - On submit, insert into Supabase table `leadership_responses` with columns: `ratings` (jsonb of category scores), `free_text`, `submitted_at`
> - Use Supabase JS client via `import { createClient } from "https://esm.sh/@supabase/supabase-js@2"` (ES module)
> - Dark theme (zinc/slate palette), modern clean UI
>
> **Page 2: `docs/dashboard/index.html`** (keep this link private)
> - Title: "Leadership feedback — Dashboard"
> - No password gate — loads results immediately
> - Fetch all rows from `leadership_responses` ordered by `submitted_at desc`
> - Show: overall leadership score (average of all category averages), per-category average + vertical histogram (1–10 columns), all free-text responses
> - Color scale: 1 = red, 5 = grey, 10 = green — applied to histogram bars, category averages, and overall score
> - Selected box style on survey should be neutral (black on white) to avoid biasing respondents
>
> Set up GitHub Pages from `docs/` folder on `main` branch. Commit and push.

---

## Step 3: Enable GitHub Pages (2 min)

1. Go to your repo on GitHub → **Settings → Pages**
2. Source: **Deploy from a branch** → Branch: **main** → Folder: **/docs** → **Save**
3. Wait ~1 minute for the build

Your links:
- **Survey:** `https://YOUR-USERNAME.github.io/leadership-feedback/survey/`
- **Dashboard:** `https://YOUR-USERNAME.github.io/leadership-feedback/dashboard/`

---

## Step 4: Test and share

1. Open the survey link, submit a test response
2. Open the dashboard link, confirm the response appears
3. Delete the test row in Supabase → **Table Editor → leadership_responses** → select row → delete
4. Share only the **survey** link with your team

---

## FAQ

**Can others see my results?**
No. Your Supabase project is yours alone. The dashboard reads from your database, not anyone else's.

**Is the anon key safe to put in browser code?**
Yes — Supabase anon keys are designed for browser use. Security comes from Row Level Security (RLS) policies on the table, which the SQL above enables.

**Can I customize the categories?**
Yes — edit the `CATEGORIES` array in `docs/survey/app.js`. The dashboard reads category keys from the `ratings` JSON, so update both files if you rename keys.

**Can I change the free-text question?**
Yes — search for "one thing" in `docs/survey/app.js` and change the text.
