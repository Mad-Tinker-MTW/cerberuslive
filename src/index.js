/**
 * Cerberus Live Studio — Worker
 * Serves the static landing page (via ASSETS) and handles POST /api/waitlist.
 *
 * Bindings (wrangler.jsonc):
 *   ASSETS  — static assets from ./public
 *   DB      — D1 database (waitlist table)
 * Secret (bunx wrangler secret put TURNSTILE_SECRET):
 *   TURNSTILE_SECRET — Cloudflare Turnstile secret key (REQUIRED)
 * Optional vars (signup email notification):
 *   RESEND_KEY, NOTIFY_TO
 */

const VALID_ROLES = ['artist', 'venue', 'fan', 'managed'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/waitlist') {
      if (request.method === 'POST') return handleWaitlist(request, env);
      return json({ error: 'Method not allowed' }, 405);
    }

    // Everything else: serve the static site.
    return env.ASSETS.fetch(request);
  },
};

async function handleWaitlist(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { email, role, turnstileToken } = body;

  if (!(await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, request))) {
    return json({ error: 'Bot verification failed' }, 403);
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return json({ error: 'Valid email required' }, 400);
  }
  if (!role || !VALID_ROLES.includes(role)) {
    return json({ error: 'Valid role required' }, 400);
  }

  const cleanEmail = email.trim().toLowerCase();
  try {
    await env.DB.prepare(
      'INSERT INTO waitlist (email, role, created_at) VALUES (?, ?, ?)'
    ).bind(cleanEmail, role, new Date().toISOString()).run();
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return json({ message: 'Already registered' }, 409);
    }
    console.error('DB error:', err.message);
    return json({ error: 'Database error' }, 500);
  }

  if (env.RESEND_KEY && env.NOTIFY_TO) {
    await sendNotification(env, cleanEmail, role).catch((e) =>
      console.error('Notification failed:', e.message)
    );
  }

  return json({ message: 'Registered successfully' }, 200);
}

async function verifyTurnstile(token, secret, request) {
  if (!token || !secret) return false;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json();
  return data.success === true;
}

async function sendNotification(env, email, role) {
  const labels = {
    artist: 'Artist',
    venue: 'Venue / Promoter',
    fan: 'Fan / Listener',
    managed: 'Managed Artist (high value lead)',
  };
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Cerberus Live Studio <noreply@cerberuslive.studio>',
      to: env.NOTIFY_TO,
      subject: `New waitlist signup: ${labels[role] || role}`,
      html: `<p><strong>New signup on Cerberus Live Studio</strong></p>
        <p>Email: <strong>${email}</strong></p>
        <p>Role: <strong>${labels[role] || role}</strong></p>
        <p>Time: ${new Date().toUTCString()}</p>`,
    }),
  });
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
