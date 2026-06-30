# Cerberus — Business Model & Revenue (plan)

**Date:** 2026-06-30. Planning doc, captures the revenue model decided across the 2026-06-30 design
session. Companion to docs/LIVE-TIERS-AND-PRICING.md (which holds the live/social/events feature
spec). Numbers are starting frameworks; final pricing is the operator's call.

## Subscription tiers
| Tier | What | Price |
|---|---|---|
| Free | profile + dossier, free media via self-host agent, 1 live window 10 min/week (25 viewers) | $0 |
| Self-managed + | more live: 90 min/week budget (split freely), 50 viewers, 1 Mbps cap | $29.99/mo |
| Managed | Cerberus manages, promotes, books, produces showcases | hybrid: small retainer + commission |

Live infra cost is a rounding error against price (worst case ~$7/mo for self-managed+); price on
value and labor, not Cloudflare cost. See LIVE-TIERS-AND-PRICING.md for the cost math.

## Managed fee = hybrid (chosen)
A flat retainer alone scares broke artists; pure commission means working for $0 in slow months.
**Hybrid wins:** a modest monthly retainer covers the operator's guaranteed time, and the booking
commission keeps the upside tied to the artist's success.
- Build the retainer from cost, not vibes: `retainer = (mgmt hours/mo x rate) + infra (~$10-15) + margin`.
  Managed is a service price, so operator labor dominates; infra is negligible.
- Commission stays as already modeled: **artist 17.5%, venue 12.5%** per booking.
- Consider a one-time onboarding/setup fee and a minimum commitment term (e.g. 3 months) so setup
  work is not lost to a fast churn.

## Promote fees (menu)
Included for managed; a-la-carte for self-managed:
- Featured placement (home / discovery): flat per period or per slot.
- Event/show promotion (email blast + push + social): flat per event or a % of ticket sales.
- Boosted discovery listing.
- Showcase slot: a slot fee or a cut of that show's tickets.

## Showcase / event economics (worked example)
Comedy showcase, 10 acts (9 from open call + 1 headliner), PPV $9.99. The growth lever is a
**performer affiliate link** per act, so the lineup promotes the show (each comedian brings their own
audience). Open-mic-heavy bills should lean free / pay-what-you-want + tips; headliner-driven bills
can hard-gate at $9.99.

Example, 200 tickets @ $9.99:
- Gross $1,998, minus Stripe (~2.9% + $0.30/ticket ~ $118), minus Stream Live delivery (~$15) =
  ~$1,865 distributable.

Recommended split (affiliate-weighted):
| Who | Share | ~$ |
|---|---|---|
| Cerberus (produce + promote + infra + time) | 30% | ~$560 |
| Headliner | 25% | ~$466 |
| Performer pool (split by tickets each drove via their link) | 45% | ~$839 |

Simpler flat alternative: Cerberus 40% / Headliner 30% / 9 open-mikers split 30% evenly (~$62 each
at this volume). Layer **tips/boosts** on top (comedy crowds tip; ~80% performer / 20% platform).
Payouts via Stripe Connect (Phase 6) for multi-party; manual early on.

### Audition funnel (free)
Open call on the calendar -> artists book a free 3-min audition slot -> live auditions -> operator
picks ~10 -> event page shows the clickable lineup. Keep auditions FREE (pay-to-audition is predatory
and shrinks the funnel). Managed artists get priority / reserved slots; open slots release to others
after. Full flow in LIVE-TIERS-AND-PRICING.md.

## Full revenue board
1. Subscriptions (Free / Self-managed+ / Managed retainer).
2. Booking commission (artist 17.5% + venue 12.5%).
3. Promote / featured-placement fees.
4. Ticketing / PPV cut (% + per-ticket) via Stripe (Phase 6).
5. Tips / boosts during live (platform cut).
6. Paid R2 always-on hosting tier (Creator Vault).
7. Live cap upsells (more minutes / viewers / HD).
8. Showcase sponsorships (brands).
9. Analytics / press-kit add-ons.
10. Venue-side: featured venue, volume plans.

## Margin-eaters to price in (the "what am I missing")
- **Stripe fees ~2.9% + $0.30** on every sub/ticket/booking; commissions and ticket cuts must clear
  this before margin.
- **Refunds / chargebacks** on tickets: policy + a small reserve.
- **Sales tax** on tickets/subs by buyer jurisdiction.
- **Free-tier drift**: free users still cost a little (SFU minutes, email); the weekly caps keep it
  near $0, so enforce them.
- **Showcase production cost**: Stream delivery + operator time; covered by the managed fee / ticket cut.
- **Onboarding fee + minimum term** for managed.
- **Annual plan option** for cashflow + retention.
- **Commission basis**: define gross vs net, and that both artist % and venue % apply per booking.
- **Performer agreements + recording consent** before any show (rights to record / stream / clip,
  plus the split terms in writing).
