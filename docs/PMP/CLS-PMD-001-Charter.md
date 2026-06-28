# Project Charter
**Cerberus Live Studio**
Document ID: CLS-PMD-001
Version: 1.0
Date: 2026-06-28
Project Manager: Francisco De La Paz

---

## Project Overview

Cerberus Live Studio is a commercial software product developed by Mad Tinker's Workshop (MTW) under 4Kings Enterprises. It is a creator platform for underground artists, DJs, and performers: a professional identity and booking layer rather than a streaming service or social network. The platform unifies three functions, profile, media, and booking, around a defining architectural bet: artists self-host their own media through a Cloudflare Tunnel, and the platform stores only the directory, the social graph, and the booking layer.

The product is being built ground up as a six-phase platform. Phase 0, the waitlist, is live at cerberuslive.studio, capturing signups by role while the platform is constructed. On reaching traction it is positioned for acquisition.

---

## Business Need

Underground artists have no infrastructure of their own. Streaming services pay fractions of a cent and treat artists as inventory. Social media owns the audience and rents it back through an algorithm. Booking happens in DMs with no calendar, no contract, and no record. The artist who is too independent for a label and too serious for a single shared link has nowhere professional that is actually theirs. Cerberus Live Studio addresses this gap with an artist-owned media model and a professional booking layer, plus an optional managed-agent service that turns MTW into the artist's booking representation.

---

## Objectives

1. Keep the Phase 0 waitlist live and converting signups while the platform is built
2. Deliver the Phase 1 MVP (auth, artist profiles, public pages, discovery feed) so artists are live, shareable, and discoverable
3. Ship the self-hosted media vault and Electron artist agent (Phase 2) so artists serve their own catalog with one click
4. Stand up the Live Room, venue listings, and the full booking layer (Phases 3 and 4)
5. Launch Cerberus Managed and turn revenue on via Stripe (Phases 5 and 6)
6. Reach acquisition readiness: 500 or more active artist profiles, recurring MRR, and a live booking pipeline after Phase 4

---

## Scope

### In Scope
- Phase 0 waitlist capture (live)
- Authentication and account roles (artist, fan, venue, admin)
- Artist profile creation and public artist pages
- Fan accounts and follows
- Genre and geographic discovery feeds
- Self-hosted media vault via cloudflared tunnel
- Electron artist agent (Windows first)
- Admin-hosted R2 media tier
- Live Room streaming with manual approval and time caps
- Venue profiles and territory claims
- Booking calendar, request flow, and messaging
- Cerberus Managed contracts, commission tracking, and showcase tools
- Stripe billing and artist analytics
- Documentation suite (SPEC, CHANGELOG, ROADMAP, BUGS, VISION) and PMP suite

### Out of Scope
- Becoming a storage-first streaming service (architecture is deliberately storage-light)
- Real-time copyright scanning of live streams (industry-standard report-and-takedown instead)
- Native mobile applications (web-first; the only desktop client is the artist agent)
- Label or distribution services
- Mac build of the artist agent before the Windows build ships

---

## Deliverables

| Deliverable | Target |
|---|---|
| Phase 0: Waitlist live and verified | Complete (2026-06-28) |
| Phase 1: MVP Platform | Planned |
| Phase 2: Media Vault | Planned |
| Phase 3: Live Room and Venues | Planned |
| Phase 4: Booking Layer | Planned |
| Phase 5: Cerberus Managed | Planned |
| Phase 6: Monetization and Growth | Planned |

---

## Milestones

| Milestone | Date |
|---|---|
| Platform planning and ULTRAPLAN authored | 2026-06-28 |
| Waitlist IaC relaunch, deployed and verified live | 2026-06-28 |
| PMP and documentation suite generated | 2026-06-28 |
| Phase 1 MVP complete | Planned |
| Phase 2 Media Vault complete | Planned |
| Phase 4 complete, acquisition-ready | Planned |
| Phase 6 complete, revenue on | Planned |

---

## Budget Summary

| Category | Amount |
|---|---|
| Labor (36.5 hrs to date at $85/hr) | $3,102.50 |
| Tools and hosting (Cloudflare, domain) | < $50 |
| **Total to date** | **~$3,150** |

Labor is logged across all roles at $85/hr. Future phases will add labor as work packages are completed and recorded in the WBS Actual Hours Log.

---

## Roles

Francisco De La Paz performs every role on this project. Work is logged per role at $85/hr.

| Role | Holder |
|---|---|
| Project Sponsor | Francisco De La Paz |
| Project Manager | Francisco De La Paz |
| Lead Developer | Francisco De La Paz |
| Solutions Architect | Francisco De La Paz |
| End User | Francisco De La Paz |
| QA Engineer | Francisco De La Paz |
| Deployment Engineer | Francisco De La Paz |

Entity: 4Kings Enterprises.

---

## Risks (Summary)

| Risk | Level |
|---|---|
| Artist PC offline kills self-hosted stream | High |
| Residential upload speeds cause buffering | High |
| Artist agent too complex for non-technical users | High |
| Low artist adoption | High |
| Adult content on live streams | Medium |
| Showcase costs exceed the 20% door split | Medium |
| Copyright claim on admin-hosted files | Low |

---

## Authorization

Project authorized under 4Kings Enterprises operational budget.
Project Sponsor and Project Manager: Francisco De La Paz
Date: 2026-06-28
