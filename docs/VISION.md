# Cerberus Live Studio — Vision
**What this becomes at its ceiling**

---

## The Problem

Underground artists, DJs, and performers have no infrastructure of their own. The streaming services treat them as inventory and pay fractions of a cent. Social media owns their audience and rents it back through an algorithm. Booking happens in DMs and group chats that vanish, with no calendar, no contract, no record. The artist who is too independent for a label and too serious for a SoundCloud link has nowhere to stand that is actually theirs.

Cerberus Live Studio is built for that artist.

---

## The Product

A creator platform with three heads, one body. Not a streaming service, not social media, not a booking agency bolted to a feed. A professional identity and booking layer that puts the artist in control of their own infrastructure.

The core philosophy: **the artist owns the media, the platform owns the directory.**

An artist should be able to serve their own catalog from their own machine and still appear, discoverable and bookable, on a professional public page. They should never hand their masters to a platform that can demonetize them on a whim. The directory, the social graph, and the booking layer are the value the platform adds, not the storage.

---

## Self-Hosted Media: The Core Bet

Storage is the trap that every creator platform falls into. Hosting audio and video at scale is expensive, and the moment a platform pays for storage it starts policing what it stores, and the artist loses control.

Cerberus inverts it. Artists self-host their media through a Cloudflare Tunnel driven by a one-click desktop agent. The platform stores only the tunnel URL. A listener streams directly from the artist's machine. The artist keeps their files, their masters, and their copyright liability stays with them, not the platform.

For artists who want always-on availability without leaving a machine running, an optional admin-hosted tier serves from Cloudflare R2 at a transparent markup. The artist chooses the trade-off: control and cost, or convenience and a fee.

---

## The Artist Agent

The self-hosted bet only works if a non-technical artist can run it. The agent is the answer: an Electron desktop app, Windows first, that wraps cloudflared and an Express server behind two buttons. Start Serving My Music. Go Live. No terminal, no admin rights, no config files. Pick a folder, click Start, and the tunnel URL registers itself to the artist's public profile. It auto-reconnects when the tunnel drops and shows a single status: serving, offline, or live.

This is the piece that turns a clever architecture into something a DJ with a laptop can actually use.

---

## Cerberus Managed: The Agency Layer

The platform is the directory. Cerberus Managed is the service on top of it, where MTW acts as the artist's booking agent.

For $75 a month plus commission, a managed artist gets active pitching to venues, social promotion, negotiation and contract handling, calendar and booking management, priority placement in venue searches, and first right of refusal on showcase slots. The commission structure splits by who initiated: 17.5% when the artist hired the agent to find gigs, 12.5% when a venue came looking for talent and the placement was easy.

Showcases are the third revenue shape. The promoter covers costs first from the door, then splits the remainder, with managed artists weighted by draw. Open-platform performers buy in at a flat fee or a ticket minimum, and the ticket minimum is preferred because a performer who sells 30 tickets at $15 brings in more than a flat fee and proves their draw at the same time.

---

## Venues and Booking

The booking layer closes the loop. Venues list their space, capacity, available dates, and genre preferences for free. Artists publish an availability calendar and a booking request form. A venue finds an artist, sends a request, the artist accepts, declines, or counters, and a messaging thread tracks the whole negotiation. Book This Artist, Request a Live Set, and Invite to Venue become buttons instead of cold DMs.

Territory claims let a Booking Ready artist stake a primary, secondary, and tertiary market, and geographic discovery surfaces who is available where.

---

## Copyright Strategy

The architecture is also the legal strategy. Self-hosted files never touch the platform, so the platform stores a URL and carries no liability. Admin-hosted files carry an indemnity disclaimer on upload and a DMCA process, with Content ID scanning added in Phase 6. Live streams get a report button and a TOS, which is the industry standard since real-time scanning is not possible. Every layer of content moderation is covered by the terms of service and backed by manual Live Room approval, community reports, and account termination.

---

## As a Product

Cerberus Live Studio is a commercial platform under 4Kings Enterprises, built ground up by MTW. Free profiles and fan accounts seed the directory. The Creator Vault, Live Room, and Booking Ready tiers convert artists who want more. Cerberus Managed is the high-margin retainer. R2 storage is a passthrough with a margin. Showcase door percentages and open-platform performer fees layer on top.

The exit is acquisition. A buyer gets the codebase, a population of active artist profiles (target 500 or more), recurring monthly revenue, a live booking pipeline, and the brand and domain. The target range is $50k to $500k depending on traction, acquisition-ready after Phase 4.

---

## Principles

- The artist owns the media, the platform owns the directory
- Self-hosting first, cloud as a convenience tier
- Liability follows the files, not the URL
- One-click for the artist, even when the plumbing is complex
- The platform serves the booking, not the other way around
