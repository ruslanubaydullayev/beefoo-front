# BeeFoo Frontend

Nuxt 4 website for the BeeFoo visual identity database.

## Stack

- Nuxt 4
- Vue 3
- Server-side rendering for SEO

## Setup

Requires **Node.js 22+** (see `.nvmrc`).

```bash
cd beefoo-front
nvm use
pnpm install
cp .env.example .env
pnpm dev
```

Open http://localhost:3000

## Pages

| Path | Purpose |
|------|---------|
| `/` | Homepage |
| `/brands` | Browse + filter |
| `/brand/:slug` | Brand detail (SEO page) |
| `/category/:slug` | Category landing |
| `/search` | Search |
| `/sitemap.xml` | Proxied sitemap |

The frontend consumes the FastAPI backend as an external client via `NUXT_PUBLIC_API_BASE`.
