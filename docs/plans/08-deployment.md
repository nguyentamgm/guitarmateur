# Plan 08 — CI & Deployment (GitHub → Vercel → guitarmateur.com)

## Goals

Every merge to `main` automatically deploys production to **https://guitarmateur.com**. No
staging, no manual release steps, no secrets in CI, $0/month. Executed at **M1** (deploy the
walking skeleton first; all later milestones ship continuously on top).

Facts: domain **guitarmateur.com** registered at **Namecheap** (owner: nguyentam.gm@gmail.com);
hosting on **Vercel Hobby** (free tier — fine for a static SPA at hobby traffic).

## Architecture

```
PR → GitHub Actions (lint, typecheck, test, build)     ← merge gate
   → Vercel preview deployment (automatic; free bonus, not a required gate)
merge to main → Vercel production build & deploy → guitarmateur.com
```

Vercel's Git integration does the deploying — CI never touches deploy tokens.

## Steps

### 1. GitHub repository
1. Create and push: `gh repo create guitarmateur --public --source . --push` (public or private
   both work on Hobby).
2. Branch protection on `main` requiring the CI check: nice-to-have for a solo project; direct
   pushes to `main` also deploy, which is acceptable here.

### 2. CI — `.github/workflows/ci.yml`

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

No E2E stage by design (plan 00): the engines carry the correctness load in unit tests; UI is
verified with the manual checklists in plan 05.

### 3. Vercel project
1. Import the GitHub repo (dashboard → Add New → Project; grant the Vercel GitHub App access).
2. Preset **Vite** (auto-detected): build `npm run build`, output `dist`. No env vars — the app
   has none by design.
3. Production branch `main` (default). Pushes to `main` deploy production; PRs get preview URLs.
4. `vercel.json` in the repo:

```json
{
  "cleanUrls": true,
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

(Single route — no SPA rewrite needed. If routing ever lands, add
`"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`.)

### 4. Domain — guitarmateur.com (manual, needs the user's Vercel + Namecheap dashboards)

1. Vercel project → Settings → Domains: add `guitarmateur.com` (primary) and
   `www.guitarmateur.com` (308 redirect → apex).
2. Namecheap → Domain List → guitarmateur.com → **Advanced DNS**: delete the default parking
   records; add exactly the records the Vercel Domains page displays — typically an `A` record on
   `@` (use the IP Vercel shows; they have newer ranges than the historical `76.76.21.21`) and
   `CNAME www → cname.vercel-dns.com`. Keep Namecheap BasicDNS nameservers (record-based setup;
   no nameserver delegation needed).
3. Wait for propagation (minutes–1h). Vercel auto-issues the Let's Encrypt cert once records
   verify; status is visible on the Domains page.

### 5. Verification checklist
- [ ] `https://guitarmateur.com` serves the app with a valid cert.
- [ ] `www.` and both `http://` variants redirect to the apex HTTPS URL.
- [ ] Trivial PR: CI runs, preview URL appears; merge: production updates automatically.
- [ ] `dist/assets/*` responses carry the immutable cache header; `/` does not.

## Operations

- **Rollback**: Vercel dashboard → Deployments → "Promote to Production" on any previous
  deployment (or `vercel rollback`). That's the whole release process.
- **Costs**: $0 (Vercel Hobby + GitHub Free + already-owned domain). Watch nothing; Hobby limits
  are far above hobby traffic.
- **Secrets**: none anywhere. If that ever changes, prefer Vercel env vars over GitHub secrets.
- **Monitoring**: Vercel's deploy emails/dashboard. No uptime/analytics tooling in scope.

## Acceptance criteria

- [ ] M1: skeleton live on guitarmateur.com; merge-to-main → production with zero manual steps.
- [ ] CI blocks broken PRs (lint/type/test/build).
- [ ] Domain, redirects, HTTPS all verified per the checklist.
