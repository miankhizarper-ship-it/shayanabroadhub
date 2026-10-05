# Shayan Abroad Hub

Premium personal consulting brand + knowledge hub. React (Vite) SPA with an
Express API running as Vercel Serverless Functions, MongoDB Atlas for data,
Cloudinary for media.

## Deploy to Vercel

### 1. Provision external services

- **MongoDB Atlas** — create a free M0 cluster, a database user, and allow
  network access from Vercel (`0.0.0.0/0` or Vercel's outbound IPs).
- **Cloudinary** — note the Cloud name, API key and API secret.

### 2. Import the project

Push this folder to GitHub and import it at vercel.com, or run
`npx vercel` / `vercel --prod` from the project root.

Vercel auto-detects the settings from `vercel.json`:

- Framework: **Vite** (`vite build` → `dist`)
- `/api/*` → serverless Express (`api/index.js`)
- Everything else → SPA rewrite to `index.html`
- `/sitemap.xml` and `/robots.txt` → generated server-side from the database

### 3. Set environment variables

Vercel → Project → Settings → Environment Variables (Production + Preview):

| Variable | Required | Value |
|---|---|---|
| `MONGODB_URI` | yes | Atlas connection string (`mongodb+srv://…`) |
| `JWT_SECRET` | yes | Long random string — `openssl rand -base64 48` (min 32 chars) |
| `JWT_EXPIRES_IN` | – | Defaults to `7d` |
| `CLIENT_URL` | yes | Your final URL, e.g. `https://shayanabroadhub.vercel.app` (comma-separate extra domains) |
| `VITE_SITE_URL` | yes | Same value as `CLIENT_URL` (used at build time by the frontend) |
| `CLOUDINARY_CLOUD_NAME` | for uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | for uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | for uploads | Cloudinary API secret — **server-side only** |
| `NODE_ENV` | – | Vercel sets `production` automatically |

Missing `MONGODB_URI` / `JWT_SECRET` do not crash the deployment — the API
stays up and fails safe with 503s while announcing the problem in function
logs.

### 4. Create the first admin

Run once from your machine, pointed at the production database:

```bash
export MONGODB_URI="mongodb+srv://…"
export ADMIN_NAME="Shayan"
export ADMIN_EMAIL="you@example.com"
export ADMIN_PASSWORD="a-long-random-password"
export ALLOW_ADMIN_SEED=true     # required, prevents accidental seeding
npm install
npm run seed:admin
```

Then sign in at `https://<your-domain>/admin/login` and add your real
content — services, blogs, gallery, downloads and page copy/imagery.
The site ships with **no demo content and no stock photos**: empty
sections stay hidden (or show branded tiles) until you publish.

### 5. Verify the deployment

- `https://<your-domain>/api/health` → `{"ok":true}`
- `/`, `/about`, `/blogs`, `/services`, `/gallery`, `/contact`, `/downloads`
- Direct navigation to `/blogs/<any-slug>` and `/admin/login` (SPA rewrite)
- `/sitemap.xml`, `/robots.txt`

> **If `/api/*` answers 404 after a redeploy:** make sure the deployed
> `vercel.json` contains the `/api/(.*)` → `/api/index` rewrite (it does
> in this repository) and that the deployment was built by Vercel
> (Git import or CLI) — drag-and-drop uploads of the zip do not build
> serverless functions.

## Local development

Requires **Node 22.9+** (the npm scripts load `.env` via the native
`--env-file-if-exists` flag — no dotenv needed).

```bash
npm install
cp .env.example .env    # then fill in your values
npm run dev             # frontend on :3000 (Vite reads .env itself)
npm run dev:server      # API on :3001 in a second terminal
```

**Two ways to get a database for `dev:server`:**

1. **MongoDB Atlas (recommended — you need it for Vercel anyway).**
   Set `MONGODB_URI` in `.env` to your Atlas connection string. The dev
   server detects it and connects to the real database instead of
   downloading a local binary. Seed your admin with `npm run seed:admin`
   after setting `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in `.env`.

2. **Zero-config memory mode.** Leave `MONGODB_URI` unset and the dev
   server boots an in-memory MongoDB with **empty content** (no demo
   data) plus a throwaway admin login printed to the console. This
   downloads a MongoDB binary once — if the download fails an MD5
   check (antivirus/proxy interference on Windows), exclude the download
   cache from your antivirus or use option 1.

`npm run seed:admin` reads `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
from `.env`; in `NODE_ENV=production` it additionally requires
`ALLOW_ADMIN_SEED=true`.
