/**
 * Cerberus Live Studio — Waitlist Worker
 * Handles POST /api/waitlist
 * Stores signups in D1 database, sends email notification via Resend (optional)
 *
 * Environment variables needed (set in Cloudflare Workers dashboard):
 *   DB         — D1 database binding (required)
 *   RESEND_KEY — Resend API key (optional, for email notifications)
 *   NOTIFY_TO  — Email to notify on new signup, e.g. mad.tinkers.music.productions@gmail.com (optional)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://cerberuslive.studio',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const VALID_ROLES = ['artist', 'venue', 'fan', 'managed'];

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/waitlist' && request.method === 'POST') {
      return handleWaitlist(request, env);
    }

    return new Response('Not found', { status: 404 });
  }
};

async function handleWaitlist(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const { email, role, turnstileToken } = body;

  // Turnstile validation
  const turnstileValid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, request);
  if (!turnstileValid) {
    return jsonResponse({ error: 'Bot verification failed' }, 403);
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return jsonResponse({ error: 'Valid email required' }, 400);
  }

  if (!role || !VALID_ROLES.includes(role)) {
    return jsonResponse({ error: 'Valid role required' }, 400);
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    await env.DB.prepare(
      'INSERT INTO waitlist (email, role, created_at) VALUES (?, ?, ?)'
    ).bind(cleanEmail, role, new Date().toISOString()).run();
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return jsonResponse({ message: 'Already registered' }, 409);
    }
    console.error('DB error:', err.message);
    return jsonResponse({ error: 'Database error' }, 500);
  }

  if (env.RESEND_KEY && env.NOTIFY_TO) {
    await sendNotification(env, cleanEmail, role).catch(e =>
      console.error('Notification failed:', e.message)
    );
  }

  return jsonResponse({ message: 'Registered successfully' }, 200);
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
  const roleLabels = {
    artist: 'Artist',
    venue: 'Venue / Promoter',
    fan: 'Fan / Listener',
    managed: 'Managed Artist (high value lead)'
  };

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Cerberus Live Studio <noreply@cerberuslive.studio>',
      to: env.NOTIFY_TO,
      subject: `New waitlist signup — ${roleLabels[role] || role}`,
      html: `
        <p><strong>New signup on Cerberus Live Studio</strong></p>
        <p>Email: <strong>${email}</strong></p>
        <p>Role: <strong>${roleLabels[role] || role}</strong></p>
        <p>Time: ${new Date().toUTCString()}</p>
      `
    })
  });
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}
