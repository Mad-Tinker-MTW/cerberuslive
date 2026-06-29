import { headers } from "next/headers";

// The admin control deck lives on its own hostname so the admin surface is
// invisible on the public origin. The session cookie is host-scoped, so an
// admin session on the control deck is isolated from the public site.
const CONTROL_DECK_HOST = (
  process.env.NEXT_PUBLIC_CONTROLDECK_HOST || "controldeck.cerberuslive.studio"
).toLowerCase();

/** True when `host` (a raw Host header, possibly with :port) is the control deck. */
export function hostIsControlDeck(host: string | null | undefined): boolean {
  if (!host) return false;
  const h = host.split(":")[0].toLowerCase();
  if (h === CONTROL_DECK_HOST) return true;
  // Dev convenience: localhost reaches the control deck outside production so the
  // admin flow is testable with `next dev`. Production keys strictly off the host.
  if (
    process.env.NODE_ENV !== "production" &&
    (h === "localhost" || h === "127.0.0.1")
  ) {
    return true;
  }
  return false;
}

/** Server-side: is the current request on the control deck host? */
export async function isControlDeckRequest(): Promise<boolean> {
  return hostIsControlDeck((await headers()).get("host"));
}
