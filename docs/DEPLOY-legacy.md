# Cerberus Live Studio — Deployment Guide

## What you have
- index.html     — landing page
- logo.png       — brand asset
- worker.js      — Cloudflare Worker (API endpoint)
- schema.sql     — D1 database schema
- wrangler.toml  — Worker config (create this last)

---

## Step 1 — Create the D1 database

1. Go to Cloudflare dashboard → Storage & Databases → D1
2. Click "Create database"
3. Name it: cerberus-waitlist
4. Once created, click on it → Console tab
5. Paste the entire contents of schema.sql and run it
6. Copy the Database ID (you'll need it in Step 3)

---

## Step 2 — Deploy the landing page (Cloudflare Pages)

1. Go to Cloudflare dashboard → Workers & Pages → Create
2. Choose "Pages" → "Upload assets"
3. Name the project: cerberuslive-studio
4. Upload these two files: index.html and logo.png
5. Deploy
6. Go to Custom Domains → add cerberuslive.studio
7. Follow the DNS instructions (your domain is already on Cloudflare so this is automatic)

---

## Step 3 — Deploy the Worker

1. Go to Cloudflare dashboard → Workers & Pages → Create
2. Choose "Worker" → "Hello World" starter
3. Name it: cerberus-waitlist-api
4. Replace all the code with the contents of worker.js
5. Save and deploy

### Bind D1 to the Worker
1. In the Worker settings → Integrations → D1 Database Bindings
2. Add binding:
   - Variable name: DB
   - Database: cerberus-waitlist (the one you created in Step 1)
3. Save

### Add the Turnstile secret (REQUIRED)
The waitlist form is gated by Cloudflare Turnstile. Without this secret the Worker
rejects every signup with "Bot verification failed" (HTTP 403).

In Worker settings → Variables and Secrets → add a Secret (encrypted, not a plain text var):
- TURNSTILE_SECRET = the secret key from the Turnstile widget "Cerberus Waitlist"
  (Cloudflare dashboard → Turnstile → the widget → Settings). This pairs with the
  data-sitekey in index.html (0x4AAAAAADsQP1trAOY39zz4). The widget allows
  cerberuslive.studio, localhost, and 127.0.0.1.

### Add environment variables (optional but recommended)
In Worker settings → Variables → Environment Variables:
- RESEND_KEY = your Resend API key (get free account at resend.com)
- NOTIFY_TO  = mad.tinkers.music.productions@gmail.com

---

## Step 4 — Connect Pages to Worker

1. Go to your Pages project (cerberuslive-studio)
2. Settings → Functions → Routes
3. Add route: /api/* → cerberus-waitlist-api Worker

This makes POST /api/waitlist on your Pages site call the Worker.

---

## Step 5 — Test it

Open cerberuslive.studio, pick a role, enter a test email, submit.
Then go to D1 → cerberus-waitlist → Console and run:
  SELECT * FROM waitlist;

You should see your entry.

---

## Viewing your waitlist anytime

D1 → cerberus-waitlist → Console

Useful queries:
  SELECT role, COUNT(*) as count FROM waitlist GROUP BY role;
  SELECT * FROM waitlist WHERE role = 'managed';
  SELECT * FROM waitlist ORDER BY created_at DESC LIMIT 50;

You can also export to CSV from the D1 dashboard.

---

## Resend setup (to get email pings on signups)

1. Go to resend.com → sign up free
2. Add domain: cerberuslive.studio (follow DNS instructions)
3. Create API key → copy it
4. Add as RESEND_KEY environment variable in Worker settings

Every new signup will ping mad.tinkers.music.productions@gmail.com
with the email and role of who just joined.
