# Deploying Team FORWARD Feedback (internal)

This app is a **Next.js 15** (App Router) service with **PostgreSQL** and optional **SMTP** for submitter confirmation messages. Treat all stored data as **sensitive** (PII and performance feedback).

## Prerequisites

- Node.js 20+ (or the version your platform supports for Next.js 15).
- A **PostgreSQL** instance reachable only from your app tier (VPC, internal subnet, or approved managed DB).
- Secrets via **environment variables** or your platform’s secret store — **never** commit real values to git.

## Configuration

1. Copy `.env.example` to `.env` locally (or set the same keys in your host’s secret manager).
2. Set `DATABASE_URL` to your Postgres connection string (include `?schema=public` if you use non-default schema).
3. Set `SESSION_SECRET` to a long random string (32+ characters).
4. Set `ADMIN_PASSWORD_BCRYPT` to a bcrypt hash of the admin password (cost factor 12 is a reasonable default). Example:

   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-secure-password', 12))"
   ```

5. Configure **SMTP** (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) with your approved internal relay or provider. If `SMTP_HOST` is empty, the app **does not send mail**; in development it logs the message instead.

6. **Team roster:** Prefer editing the shared Google Sheet (see below), exporting CSV, and running **`npm run team:import -- ./path/to/export.csv`** to regenerate **`config/team.json`**. Alternatively edit **`config/team.json`** by hand. Edit **`config/intuit-values.json`** with the official Intuit values strings from HR/comms.

### Roster via Google Sheet

1. Open the spreadsheet **Team FORWARD — Roster (import to app)** in Google Drive (create one with columns `id`, `displayName`, `operatingLevel`, `skill_1` … `skill_5`, or import **`config/team-import-template.csv`** into a new sheet).
2. **One row per teammate.** `id` = lowercase slug (e.g. `jane-doe`). **`operatingLevel`** is the short level label shown under “Rate each skill” (e.g. `Senior`, `Staff`). Put the five rating titles in `skill_1` … `skill_5`. Rows whose first column starts with `#` are ignored (notes/instructions).
3. **File → Download → Comma-separated values (.csv).**
4. From the project root: **`npm run team:import -- ./Downloads/Roster.csv`** (use your actual path). This overwrites **`config/team.json`**.

## Database schema

Apply migrations after setting `DATABASE_URL`:

```bash
npx prisma migrate deploy
```

For a new database from scratch (e.g. first deploy):

```bash
npx prisma migrate dev
```

(Use `migrate deploy` in CI/production; `migrate dev` is for local iteration.)

## Build and run

```bash
npm ci
npx prisma generate
npm run build
npm start
```

Run behind **HTTPS** (corporate load balancer, ingress TLS, or reverse proxy). Restrict **admin** routes (`/admin`, `/api/admin/*`) at the network layer if your security team requires defense in depth (e.g. allowlist VPN or admin SSO in front of the app — this template uses password + signed cookie).

## GitHub Pages + Formspree (static, no database)

For a **simple public URL** without running Node or Postgres: use the **`docs/`** folder in this repo. It is a **static** form that POSTs submissions to **[Formspree](https://formspree.io)** (`docs/app.js` contains your form endpoint).

1. **Sync roster** from `config/` into `docs/` whenever you change teammates or Intuit values:  
   `npm run docs:sync`
2. In the GitHub repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch **main**, folder **`/docs`**, Save.
3. After a minute, the site is at **`https://<user>.github.io/<repo>/`** (unless you use a custom domain).

**First Formspree submission:** check your inbox to **activate** the form if Formspree asks. Submissions appear in Formspree’s dashboard and in email — **not** in the Next.js admin UI or Postgres.

## Shareable URL (hosted Postgres required)

**GitHub alone does not run this app.** It holds your code. You still need a **host** that runs Node/Next.js and a **PostgreSQL** database. Typical flow: **push the repo to GitHub**, then connect that repo to a host (below). You do **not** need a Vercel account if you use something else.

| Approach | Notes |
|----------|--------|
| **Railway** / **Render** / **Netlify** | Sign up (often **“Continue with GitHub”**), **New project → Deploy from GitHub repo**, add `DATABASE_URL` and other env vars, get a URL like `*.railway.app` or `*.onrender.com`. |
| **Vercel** | Optional; you can sign up with **GitHub** so it’s the same login. Import repo from GitHub. |
| **GitHub Actions** | Can build and deploy to the above targets, but you still configure the target service and secrets. |

### Deploying via Vercel (optional)

Use this when you want a **public HTTPS link** (e.g. `https://your-app.vercel.app`). You can sign up at [vercel.com](https://vercel.com) with **Continue with GitHub** — no separate Vercel-only password required.

1. **Postgres** — Create a database your app can reach from the internet (e.g. [Neon](https://neon.tech) free tier). Copy the **connection string** (often called “pooled” or “transaction” URL; include `?sslmode=require` if the provider requires it).

2. **Apply migrations** once against that database (from your laptop, with the repo):

   ```bash
   cd team-forward-feedback
   export DATABASE_URL="postgresql://..."   # paste Neon (or other) URL
   npx prisma migrate deploy
   ```

3. **Vercel account** — Sign up at [vercel.com](https://vercel.com). In the project directory, run **`npx vercel login`** (or open the device link the CLI prints) and complete sign-in in the browser.

4. **Deploy** — From the repo root:

   ```bash
   npx vercel deploy --prod
   ```

   Or connect the GitHub repo in the Vercel dashboard (**Add New → Project → Import**) and turn on **Production** deploys on push.

5. **Environment variables** — In the Vercel project: **Settings → Environment Variables**. Add at least (same meanings as `.env.example`):

   | Name | Notes |
   |------|--------|
   | `DATABASE_URL` | Same URL you used for `migrate deploy` |
   | `SESSION_SECRET` | 32+ random characters |
   | `ADMIN_PASSWORD_BCRYPT` | Bcrypt hash of the admin password |
   | `SMTP_*` | Optional; omit `SMTP_HOST` if you do not want email yet |

   Redeploy after saving env vars (**Deployments → … → Redeploy**).

6. **Security** — A public URL means anyone can open the **feedback form**. `/admin` is password-protected but still on the public host; use a **strong** admin password, and follow your org’s rules for PII. Vercel **Deployment Protection** (password / SSO) can restrict who can load the site at all.

## Operational notes

- **Backups:** Include the feedback database in your standard Postgres backup and retention policy.
- **Rotation:** Rotate `SESSION_SECRET` and `ADMIN_PASSWORD_BCRYPT` on a schedule; re-login is required after rotation.
- **Health:** `GET /api/health` returns JSON `{ "ok": true }` for load balancer probes.

## Approved internal hosting (recommended for work data)

Use **internal** infrastructure when feedback is **company business** or contains **PII / performance-related** content. **Do not** put production data on public SaaS unless **security and legal** have explicitly approved it.

### Before you deploy

1. **Confirm** with your org’s **security / compliance / architecture** channel (or equivalent) that hosting location, data classification, and retention are acceptable.
2. **Choose** an approved pattern from your catalog: internal **Kubernetes** (EKS/AKS/GKE/OpenShift), **internal PaaS**, **VM** in a private subnet, or **serverless** only if your org supports Node there.
3. **PostgreSQL** must live on an **approved** managed service or cluster DB: private endpoint, **least-privilege** DB user, **TLS** to the DB if required, **backups** per policy.

### Network and access

- **No public internet** for the app or DB unless policy allows. Prefer **VPN**, **Zero Trust**, or **corporate-only** DNS (e.g. `https://team-forward-feedback.corp.example.com`).
- Terminate **HTTPS** at your **load balancer / ingress** (corp-signed or ACME internal). The Node process can speak HTTP on localhost; TLS is at the edge.
- Optional **defense in depth**: IP allowlist or **SSO** in front of **`/admin`** (and optionally the whole app) — this repo only implements **password + cookie** for admin; your platform can add **OAuth2/SAML** at the proxy.

### Secrets and configuration

- Inject **`DATABASE_URL`**, **`SESSION_SECRET`**, **`ADMIN_PASSWORD_BCRYPT`**, and **`SMTP_*`** from your **secret manager** or **vault** (not from git). Same keys as `.env.example`.
- **`NODE_ENV=production`** for runtime.
- Keep **`config/team.json`** and **`config/intuit-values.json`** in the **deploy artifact** (build them into the image or sync from your pipeline); they are not secrets but **do** contain team structure.

### Database migrations

Run **once per environment** from a trusted runner (CI job or admin laptop with access):

```bash
export DATABASE_URL="postgresql://..."   # internal URL
npx prisma migrate deploy
```

Use the **same** `DATABASE_URL` the app will use at runtime.

### Run the app (typical VM or bare Node)

On a **Linux** host in a private network (after `npm ci`, `npx prisma generate`, `npm run build`):

```bash
NODE_ENV=production npm start
```

Bind to an internal interface or `127.0.0.1` and point your **reverse proxy** at `http://127.0.0.1:3000` (or the port you configure). Use **systemd**, **supervisor**, or your platform’s **process manager** so the app restarts on failure.

Probe **`GET /api/health`** from the load balancer.

### Run in containers (if your org standardizes on Docker/Kubernetes)

- Build a **production** image that includes the **standalone** Next output or a full `node_modules` + `.next` layout per your platform’s Node guidelines.
- Copy **`prisma`** schema and run **`prisma migrate deploy`** as an **init job** or **CI step** before new pods take traffic.
- Mount secrets as env vars; do not bake secrets into the image.

### SMTP

Use an **approved internal relay** or **authenticated** submission service allowed by **mail security**. Set **`SMTP_*`** env vars. If email is not approved yet, leave **`SMTP_HOST`** empty — the app still saves submissions; confirmation email is skipped (see `src/lib/email.ts`).

### Internal-only hosting (summary)

Place the service only on **approved** platforms and networks. Do **not** expose the **database** or **admin** capabilities to the public internet without **explicit** controls (WAF, SSO, allowlists) signed off by your org.
