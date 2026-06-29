# Cerberus Control Deck — Ultraplan

**Project:** cerberuslive.studio (admin surface)
**Owner:** Francisco De La Paz / Mad Tinker's Workshop
**Date:** 2026-06-29
**Status:** Planning. Current admin is a flat single-page console; this is the redesign.
**Host:** controldeck.cerberuslive.studio (own subdomain, behind Cloudflare Access, owner 2FA). See the
controldeck auth thread (host gating + owner login already scaffolded, additive).

Tier model is owned by ULTRAPLAN.md (Free Profile / Creator Vault / Live Room / Booking Ready /
Cerberus Managed). This doc plans the operator surface over that model, it does not redefine tiers.

---

## Principles

- **Roles and tiers first, data second.** The top level is who people are (managed artist, free artist,
  fan, venue), not raw object counts (no "Tracks / Plays / Waitlist" cards up top).
- **Smart, not scroll-central.** Tabs for the major sections, sortable tables inside, drill into an
  entity for its detail. No single endless page.
- **The owner is not a user.** Admin is one person (you). Do not list admins, do not count yourself in
  any user metric.
- **Everything about a person lives on that person.** Tracks, reviews, bookings, comments are shown on
  the artist or fan they belong to, not as separate top-level piles.
- **Operator, not just moderator.** The deck is where you run the business: promote tiers, contact
  users, handle problem reports, and (future) manage paid-tier features like scheduling.

---

## Information architecture (tabbed)

Tabs across the top, a metrics bar that stays visible:

1. **Overview** — metrics + the action queue (the "what needs me" screen).
2. **Managed** — Cerberus Managed artists. Richest tooling (this is the paying tier).
3. **Roster** — unmanaged artists (Free Profile / Creator Vault / Booking Ready). Sortable list.
4. **Fans** — fan accounts + their activity.
5. **Venues** — placeholder until venue features exist (see Honesty section).
6. **Inbox** — problem reports + outbound contact.

### Top metrics bar (Overview)

Two groups, both excluding admins/you:

- **People breakdown:** Managed artists · Free artists · Fans · Venues. (counts, click to jump to tab)
- **Action counts:** Reviews pending · Open bookings · Problem reports unread · Flagged artists
  (artists with 2+ negative reviews). Each is a shortcut into the exact items.

The action counts are the "needs attention" line from the earlier discussion, kept thin and linking
straight into the entities, so nothing gets buried but it is not its own data silo.

---

## Sections in detail

### Managed (Cerberus Managed artists)

A sortable table, one row per managed artist, with live per-artist metrics:

| Column | Source | Notes |
|---|---|---|
| Artist | artist_profiles.display_name | links to detail |
| Tracks | COUNT(tracks) | self-hosted + R2 |
| Plays | SUM(tracks.play_count) | |
| Followers | COUNT(follows) | |
| Reviews | COUNT(approved) + avg rating | flag if negatives |
| Bookings | COUNT(bookings) | open vs total |
| Agent | tunnel_url present | connected dot |
| Last active | derived (see Data) | |

Sortable by any column. Row click opens the artist detail (below).

### Roster (unmanaged artists)

Same table shape, lighter. Primary operator action here is **promote to Managed**. Sort by followers /
plays / reviews so you can spot who is worth upgrading or reaching out to.

### Fans

Fans need activity tracking set up (new work). Per fan:

| Metric | Source | Built? |
|---|---|---|
| Follows | follows table | yes |
| Reviews written | reviews table | yes |
| Comments | comments table | NO — new feature |
| Bookings made | bookings table | yes |
| Joined / last active | user.createdAt / activity | partial |

Fan detail shows their follows, reviews, comments, and bookings. This is also where "track their
activity" lives.

### Venues

Venue role exists, venue features do not (no venue page, events, or data). Shown as an empty/greyed
tab so the shape is visible, built out when venue features land.

### Inbox (support + contact)

- **Problem reports:** users contact you with issues. Needs an intake path (a support/contact form on
  the site that writes to a `support_messages` table) plus a queue here with read/resolved states and
  a reply (email via Resend).
- **Contact a user:** from any user, compose an email (Resend) without leaving the deck.

---

## Entity detail pages

Drill-in routes on the control deck (clean, linkable): `/admin/artist/[slug]`, `/admin/fan/[id]`,
`/admin/venue/[slug]` (future).

**Artist detail** gathers everything about one artist and replaces the old button-wall:
- Identity + dossier link + tier.
- **Their** tracks (plays, featured), bookings, reviews (including pending to approve here).
- Agent / streaming status.
- Controls in one labeled panel, not a row of cryptic buttons: Verification, Booking gate, Feature,
  Suspend, Delete, Tier (promote/demote).

**Fan detail:** follows, reviews, comments, bookings, role change, contact.

---

## Admin actions (operator toolkit)

| Action | Status | Notes |
|---|---|---|
| Change role (fan/artist/venue) | built | keep, move into entity detail |
| Verify / gate / feature / suspend / delete artist | built | relabel + move into artist detail |
| Approve / reject review | built | move under the artist it is about |
| **Promote/demote tier (regular ↔ Managed)** | NEW | the key operator lever; sets `tier`, unlocks paid features |
| **Contact a user** | NEW | compose email via Resend |
| **Problem-report inbox** | NEW | needs support form + `support_messages` table + reply |
| Export waitlist | REMOVE | waitlist retired |

---

## Status-field consolidation (carryover, must settle first)

An artist currently carries eight overlapping status/flag fields. Three mean "verified"
(`verified`, `signal_status`, `clearance`) and two mean "open for booking" (`gate_status`,
`availability_status`). Proposed clean set:

- **Verification:** keep `verified` (yes/no). Retire `signal_status` + `clearance` as stored state,
  fold into one display label derived from `verified`.
- **Booking:** `gate_status` (Open/Closed) is the control; `availability_status` becomes a display
  label derived from it, not a separately-set field.
- Keep `tier`, `suspended`, `featured` (distinct and clear).

OPEN: confirm which of the three "verified" fields is the keeper (recommended: `verified`).

---

## Data and schema additions (honesty: not yet built)

- `support_messages` (id, user_id, subject, body, status, created_at, admin_reply, replied_at) + a
  public contact/support form.
- `comments` (id, fan_user_id, target, body, created_at) for fan activity + display.
- **Last active / activity:** derive from Better Auth `session` rows, or add a lightweight activity
  signal. Decide cheap vs precise.
- Tier ladder: `tier` exists as free/managed; the fuller ULTRAPLAN ladder + the promote/demote action
  are new.

---

## Future-thinking: what a paid tier unlocks (and what the deck then manages)

Tiers from ULTRAPLAN, with the operator and artist surface each one implies:

- **Creator Vault:** self-host or R2 always-on hosting. Deck: storage usage, R2 tier toggle.
- **Booking Ready:** availability calendar, booking request form, territory claim. Deck: see/adjust a
  managed artist's availability, territory conflicts.
- **Live Room:** stream window, event schedule (10-min cap). Deck: scheduled streams, event calendar.
- **Cerberus Managed ($75/mo + commission):** full agent service, priority placement, active
  promotion, **scheduling** (availability + gig calendar + booking confirmation workflow), analytics,
  and commission/revenue tracking. Deck: this is the heavy section, where most future tooling lands.

So when someone moves to a paid tier, their new actions (scheduling, calendar, R2, promotion) appear
both on their own dashboard and as operator controls here. The control deck grows a "Managed tooling"
area per artist as those features get built. This plan reserves the Managed tab as the home for that.

---

## Build phases

- **A. Tabbed shell + Overview.** Tabs, metrics bar (role/tier breakdown, action counts), exclude
  admin, drop waitlist. Reuses existing data. Mostly a reorganization.
- **B. Sortable role/tier tables** (Managed, Roster, Fans) with per-entity metrics.
- **C. Entity detail pages** (artist, fan) with relocated + relabeled controls.
- **D. Tier promote/demote action** (regular ↔ Managed) + status-field consolidation migration.
- **E. Contact a user** (Resend) + **problem-report inbox** (support form + table + queue + reply).
- **F. Fan comments** feature + fan activity view.
- **G. Future:** scheduling + paid-tier tooling on the Managed tab.

---

## Open decisions

1. Tab set: Overview / Managed / Roster / Fans / Venues / Inbox. Good, or merge any?
2. Which "verified" field is the keeper (recommended: `verified`)?
3. Last-active: derive from sessions (cheap, approximate) or a real activity log (precise, more work)?
4. Problem reports: in-app support form writing to D1 (recommended), or just route to your email?
5. Build order: start at Phase A (the reorg you can see immediately), then B, agreed?
