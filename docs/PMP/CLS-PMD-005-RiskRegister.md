# Risk Register
**Cerberus Live Studio**
Document ID: CLS-PMD-005
Version: 1.0
Date: 2026-06-28
Project Manager: Francisco De La Paz

---

## Risk Scale

**Probability:** Low (1) / Medium (2) / High (3)
**Impact:** Low (1) / Medium (2) / High (3)
**Score:** Probability x Impact (1-9)

---

## Risk Log

### R-001: Artist PC Offline Kills Self-Hosted Stream
**Category:** Technical
**Probability:** High (3)
**Impact:** High (3)
**Score:** 9

**Description:** The self-hosted media model serves audio and live streams directly from the artist's machine through a cloudflared tunnel. If the artist's PC sleeps, loses power, or drops its connection, the media and any active stream go dark with no fallback for self-hosted-only artists.

**Mitigation:** The admin-hosted R2 tier exists as an always-on fallback. The artist agent shows a clear status (serving, offline, live) and the UX warns when a profile's media is unreachable. The agent auto-reconnects when the tunnel drops.

**Contingency:** Promote R2 as the default for any artist whose uptime matters, and surface an offline badge on the public profile so listeners are not met with a broken player.

---

### R-002: Residential Upload Speeds Cause Buffering
**Category:** Technical
**Probability:** Medium (2)
**Impact:** High (3)
**Score:** 6

**Description:** Self-hosted streaming depends on the artist's residential upload bandwidth, which is typically a fraction of download. Multiple concurrent listeners or a live stream can saturate it and cause buffering or dropouts.

**Mitigation:** A 10-minute cap on the free live tier limits exposure, a quality selector lets listeners drop bitrate, and the R2 fallback tier removes the artist's pipe from the path entirely for those who need it.

**Contingency:** Default higher-traffic artists to R2, and consider a cached or relayed delivery layer in front of the tunnel if buffering proves common.

---

### R-003: Artist Agent Too Complex for Non-Technical Users
**Category:** Adoption
**Probability:** Medium (2)
**Impact:** High (3)
**Score:** 6

**Description:** The entire self-hosted bet collapses if a non-technical artist cannot run the agent. cloudflared and a local server are intimidating concepts, and any terminal step or config file will lose the target user.

**Mitigation:** The agent is an Electron app with zero terminal exposure: download, run, log in, pick a folder, click Start. The tunnel URL registers itself. No admin rights are required and the binary is bundled.

**Contingency:** If the agent still proves too complex in testing, lean harder on the R2 admin-hosted tier as the primary onboarding path and position the agent as an advanced option.

---

### R-004: Low Artist Adoption
**Category:** Market
**Probability:** Medium (2)
**Impact:** High (3)
**Score:** 6

**Description:** The platform is a directory, and a directory with few artists has no value. Without enough profiles, neither fans nor venues have a reason to come, and the acquisition target of 500 or more profiles slips out of reach.

**Mitigation:** The Phase 0 waitlist captures interest by role before launch. Cerberus Managed is the adoption hook: artists who want active booking representation join for the agency service and bring their profiles with them. Free profiles and free venue listings lower the barrier to entry.

**Contingency:** Run segmented email campaigns against the waitlist, seed the directory with managed artists first, and time public launch to coincide with a flagship showcase that gives early artists a reason to appear.

---

### R-005: Adult Content on Live Streams
**Category:** Compliance
**Probability:** Medium (2)
**Impact:** High (3)
**Score:** 6

**Description:** Live streams cannot be scanned in real time, so a performer could broadcast adult or prohibited content with no automated gate to stop it, exposing the platform to reputational and TOS-enforcement risk.

**Mitigation:** Live Room activation requires manual approval before an artist can go live. Every stream carries a report button. The content policy is explicit (no adult content, account termination) and backed by a three-strike process.

**Contingency:** Suspend or terminate offending accounts on report, and tighten manual approval criteria if violations cluster.

---

### R-006: Showcase Costs Exceed the 20% Door Split
**Category:** Financial
**Probability:** Medium (2)
**Impact:** Medium (2)
**Score:** 4

**Description:** In the showcase model the promoter's costs come out of the 20% door split first. If venue, production, or promotion costs run high relative to ticket sales, the promoter's margin disappears or goes negative.

**Mitigation:** Costs are covered first from the door before any split kicks in. Open-platform performers buy in at a flat $250 or a 25-ticket minimum, which floors the revenue. Local-business sponsorship can cover base costs before a single ticket sells.

**Contingency:** Prefer the ticket-minimum buy-in over the flat fee, secure sponsorship before committing to a venue, and cap controllable production spend per showcase.

---

### R-007: Copyright Claim on Admin-Hosted Files
**Category:** Legal
**Probability:** Low (1)
**Impact:** Medium (2)
**Score:** 2

**Description:** For the admin-hosted R2 tier the platform stores the file, so a copyright holder could file a claim against the platform rather than the artist.

**Mitigation:** Self-hosted files keep liability with the artist since the platform stores only the URL. Admin-hosted uploads carry an indemnity disclaimer, a DMCA process is in place, and Content ID scanning is added in Phase 6.

**Contingency:** Honor takedown requests promptly through the DMCA process, and terminate accounts that repeatedly upload infringing material under the three-strike policy.

---

## Risk Summary

| ID | Description | Score | Status |
|---|---|---|---|
| R-001 | Artist PC offline kills self-hosted stream | 9 | Active |
| R-002 | Residential upload speeds cause buffering | 6 | Active |
| R-003 | Artist agent too complex for non-technical users | 6 | Active |
| R-004 | Low artist adoption | 6 | Active |
| R-005 | Adult content on live streams | 6 | Active |
| R-006 | Showcase costs exceed the 20% door split | 4 | Monitored |
| R-007 | Copyright claim on admin-hosted files | 2 | Monitored |
