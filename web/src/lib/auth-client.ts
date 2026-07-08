"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient, usernameClient, twoFactorClient, adminClient } from "better-auth/client/plugins";

// baseURL defaults to the current origin, which is correct for both the preview
// worker and the production domain.
export const authClient = createAuthClient({
  plugins: [magicLinkClient(), usernameClient(), twoFactorClient(), adminClient()],
});

export const { signIn, signOut, useSession, twoFactor, admin } = authClient;
