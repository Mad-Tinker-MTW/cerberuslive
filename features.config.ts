/**
 * Cerberus Live Studio — Feature Toggles
 * Flip these to true as each phase goes live.
 * Import this wherever you need to gate a feature.
 *
 * Usage:
 *   import { features } from '@/features.config'
 *   if (features.mediaVault) { ... }
 */

export const features = {

  // PHASE 1 — MVP Platform
  artistProfiles:       true,   // Artist profile creation and public pages
  fanAccounts:          true,   // Fan signup and follow system
  discoveryFeed:        true,   // Browse artists by genre
  adminDashboard:       true,   // Admin panel for signups and approvals
  waitlistInvites:      true,   // Convert waitlist emails to platform invites
  emailConfirmations:   false,  // Resend confirmation on waitlist signup (needs Resend setup)

  // PHASE 2 — Media Vault
  mediaVault:           false,  // Artist media upload and self-hosted serving
  artistAgent:          false,  // Electron agent download and tunnel registration
  trackPlayer:          false,  // Public audio player on artist profile
  r2Storage:            false,  // Admin-hosted R2 storage tier

  // PHASE 3 — Live Room + Venues
  liveRoom:             false,  // Live stream window on artist profile
  liveApproval:         false,  // Manual approval flow for Live Room activation
  eventScheduling:      false,  // Upcoming show schedule on profile
  liveFeed:             false,  // Central feed of who is live right now
  liveTimeExtension:    false,  // Paid extension beyond 10-minute cap
  venueProfiles:        false,  // Venue listing and discovery
  territoryClaims:      false,  // Artist territory claim system
  geographicFeed:       false,  // Discovery feed filtered by location

  // PHASE 4 — Booking Layer
  bookingCalendar:      false,  // Artist availability calendar
  bookingRequests:      false,  // Venue to artist booking request flow
  bookingMessaging:     false,  // Thread between venue and artist on booking
  bookThisArtist:       false,  // Public booking button on artist profile
  requestLiveSet:       false,  // Request a live set button
  inviteToVenue:        false,  // Invite to venue button
  venueDiscovery:       false,  // Venue dashboard for browsing artists

  // PHASE 5 — Cerberus Managed
  managedBadge:         false,  // Managed artist badge on profile
  managedContracts:     false,  // Contract creation and commission tracking
  showcaseTools:        false,  // Showcase creation and management
  openPerformerSlots:   false,  // Non-managed artist slot booking
  ticketMinimum:        false,  // Ticket minimum enforcement for open slots
  pressKitExport:       false,  // PDF press kit generation
  sponsorshipTracking:  false,  // Showcase sponsorship management

  // PHASE 6 — Monetization
  stripeBilling:        false,  // Paid tier subscriptions via Stripe
  r2Billing:            false,  // Usage-based R2 storage billing
  artistAnalytics:      false,  // Artist stats dashboard
  emailCampaigns:       false,  // Segmented waitlist email campaigns
  embedPlayer:          false,  // Embeddable player for external sites
  contentIdScanning:    false,  // Copyright scanning on admin-hosted files

} as const

export type FeatureKey = keyof typeof features

/**
 * Helper: check if a feature is enabled
 * Useful for conditional rendering in components
 *
 * Example:
 *   isEnabled('liveRoom') ? <LiveRoom /> : <ComingSoon />
 */
export function isEnabled(feature: FeatureKey): boolean {
  return features[feature]
}

/**
 * Helper: get all enabled features (for debugging or admin panel)
 */
export function enabledFeatures(): FeatureKey[] {
  return (Object.keys(features) as FeatureKey[]).filter(k => features[k])
}
