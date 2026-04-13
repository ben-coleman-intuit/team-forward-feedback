I need you to help me build an anonymous leadership feedback survey. Walk me through each step one at a time — I'm not technical, so please tell me exactly what to click and where.

Here's what I need:

MY NAME: [REPLACE WITH YOUR FIRST NAME]

WHAT I WANT:
1. An anonymous survey page I can share with my team where they rate me on leadership dimensions (1–10 scale). No names or emails collected.
2. A private dashboard page only I open, showing my average scores, score distributions as histograms, and any free-text responses.
3. Both pages hosted for free on GitHub Pages.
4. Results stored in Supabase (free tier, no server needed).

SURVEY CATEGORIES (9 total, each rated 1–10 via clickable number boxes, nothing pre-selected, rows can be left blank):
1. Prioritization & Focus — Helps the team focus on what matters most
2. Recognition & Appreciation — Acknowledges contributions and celebrates wins
3. Performance Management — Sets clear expectations and gives honest, timely feedback
4. Removing Blockers — Proactively clears obstacles so the team can move fast
5. Career Growth & Development — Invests in your growth and creates development opportunities
6. Communication & Transparency — Shares context openly, listens, keeps the team informed
7. Decision-Making — Makes timely, well-reasoned decisions and explains the 'why'
8. Strategic Vision — Provides clear direction and connects work to the bigger picture
9. Availability & Accessibility — Makes time for you when you need it

Plus one optional free-text box: "What's one thing [my name] could do differently to be a more effective leader?"

DESIGN SPECS:
- Dark theme (zinc/slate palette), modern clean UI
- Survey: clickable 1–10 number boxes per category (not sliders). Selected state = black text on white box (neutral, no color bias). Click again to deselect.
- Scale hint under each row: "1 = strongly disagree" ... "10 = strongly agree"
- Dashboard: overall score + per-category averages use a color scale (1=red, 5=grey, 10=green). Vertical histogram bars also use this color scale. No password needed.
- Submit stores ratings as a JSON object in a `ratings` jsonb column, plus optional `free_text` and auto `submitted_at` timestamp.
- Use Supabase JS client via ES module import from esm.sh.

TECH DETAILS (for the AI, not for me):
- Create a GitHub repo with a `docs/` folder
- `docs/survey/` = the public survey page (index.html, app.js, styles.css)
- `docs/dashboard/` = the private dashboard page (index.html, app.js, styles.css)
- Supabase table: `leadership_responses` with columns: id (uuid), ratings (jsonb), free_text (text), submitted_at (timestamptz)
- RLS enabled with anon insert + select policies
- GitHub Pages deployed from `main` branch, `/docs` folder

STEPS TO WALK ME THROUGH (one at a time, wait for me to say "next"):
1. Help me create a Supabase account and project
2. Help me run the SQL to create the table
3. Help me copy my Supabase URL and anon key
4. Build the survey and dashboard code in my repo
5. Help me set up GitHub Pages
6. Test it together — submit a test, check the dashboard, delete the test row

Please start with step 1 only.
