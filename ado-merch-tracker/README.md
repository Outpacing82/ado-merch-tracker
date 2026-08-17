# Ado Merch Tracker

Watches the official Ado shop (`ado-shop.com/collections/all-merch`) for new
products and restocks, and emails you when something changes. Built for
Vercel's free (Hobby) tier.

How it works: `GET /api/check` pulls the shop's public Shopify
`products.json` feed, diffs it against the last snapshot stored in Upstash
Redis, and emails you (via Resend) if anything is new or back in stock. A
small status page at `/` shows the last check.

**Important:** Vercel's Hobby plan only runs built-in Cron Jobs once a day,
which is too infrequent for restock alerts. So instead, a free external
pinger (cron-job.org) calls `/api/check` every 15–30 minutes. The app itself
does no polling on its own — it just responds when pinged.

## 1. Create the two free accounts

- **Upstash** (https://console.upstash.com) → create a Redis database →
  copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from the
  "REST API" section.
- **Resend** (https://resend.com) → create an API key. To start, you can
  send from `onboarding@resend.dev` with no setup; later you can verify your
  own domain for a nicer "from" address.

## 2. Deploy to Vercel

```bash
npm install -g vercel   # if you don't have it
cd ado-merch-tracker
vercel
```

Or push this folder to a GitHub repo and import it at vercel.com/new.

## 3. Set environment variables

In the Vercel project → Settings → Environment Variables, add everything
from `.env.example`:

| Variable | Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | from Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | from Upstash |
| `RESEND_API_KEY` | from Resend |
| `ALERT_EMAIL_TO` | the email you want alerts sent to |
| `ALERT_EMAIL_FROM` | `onboarding@resend.dev` to start |
| `CRON_SECRET` | make up a long random string |

Redeploy after adding them (Vercel → Deployments → ⋯ → Redeploy).

## 4. Set up the free external pinger

1. Go to https://cron-job.org and make a free account.
2. Create a new cron job:
   - URL: `https://YOUR-APP.vercel.app/api/check?secret=YOUR_CRON_SECRET`
   - Schedule: every 15 or 30 minutes
   - Method: GET
3. Save, then click "Run now" once to trigger the first check.

The first run just saves a baseline snapshot (no email, since everything is
"new" relative to nothing). From the second run onward, you'll get an email
whenever a product appears that wasn't there before, or a sold-out product
becomes available again.

## 5. Verify

Visit `https://YOUR-APP.vercel.app` — you should see the last check time and
a JSON summary once cron-job.org has hit `/api/check` at least once.

## Notes / limitations

- This only watches the "ALL MERCH" collection by default. To watch a
  different collection (e.g. a specific tour's merch), set
  `ADO_COLLECTION_PATH` to something like `/collections/crunchyroll-goods`.
  Run multiple deployments (or extend the code to loop over several
  collection paths) if you want more than one watched at once.
- "Restock" detection is based on Shopify's `available` flag per variant —
  if the store marks an item unavailable without technically selling out
  (e.g. taken down for editing), it can produce a false restock alert.
- Free tiers: Upstash (10k commands/day) and Resend (100 emails/day, 3,000/mo)
  are both far more than this needs at a 15–30 min polling interval.
