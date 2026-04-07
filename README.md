# Mr. Camden

> The AI that won't kiss your behind.

A Next.js 14 app: an AI chatbot that gives brutally honest, no-BS answers. Tough-love mentor, not a troll. Powered by Claude.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Anthropic Claude API (`claude-sonnet-4-6`)
- Supabase auth + Postgres (credit tracking)
- Stripe Checkout (credit packs)
- Deployed on Vercel

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Visit http://localhost:3000.

## Manual setup checklist

### 1. Supabase

1. Create a new Supabase project at https://supabase.com
2. Open the SQL editor and run `supabase/schema.sql`
3. Copy these values into Vercel env vars:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project Settings → API → Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API → anon public)
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → service_role — keep secret)
4. Auth → Providers → Email: enable. Optionally disable email confirmation so signup works immediately.

### 2. Anthropic

1. Create a key at https://console.anthropic.com
2. Set `ANTHROPIC_API_KEY` in Vercel

### 3. Stripe

1. Create 3 one-time products in Stripe dashboard:
   - Small: $1 / 10 credits
   - Medium: $5 / 60 credits
   - Large: $10 / 150 credits
2. Copy each product's Price ID into Vercel:
   - `STRIPE_PRICE_SMALL`
   - `STRIPE_PRICE_MEDIUM`
   - `STRIPE_PRICE_LARGE`
3. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Create a webhook endpoint → `https://mrcamden.com/api/webhook`, event `checkout.session.completed`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

### 4. Vercel env vars

All of these must be set in Project Settings → Environment Variables (Production + Preview):

```
ANTHROPIC_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_SMALL
STRIPE_PRICE_MEDIUM
STRIPE_PRICE_LARGE
NEXT_PUBLIC_SITE_URL=https://mrcamden.com
```

After setting env vars, redeploy the project.

### 5. DNS (mrcamden.com)

Add to your registrar:

- `A` record for `@` → `76.76.21.21`
- `CNAME` record for `www` → `cname.vercel-dns.com`

(Vercel will show the exact records under Project → Settings → Domains — use those if they differ.)

## Routes

- `/` landing
- `/signup`, `/login`
- `/chat` — protected, main chat UI
- `/pricing` — credit packs
- `POST /api/chat` — Claude proxy, deducts credits
- `POST /api/checkout` — Stripe Checkout session
- `POST /api/webhook` — Stripe webhook to credit account
