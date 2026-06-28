import { toNextJsHandler } from "better-auth/next-js";
import { authFromContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Better Auth is built per-request (D1 binding lives in the Cloudflare context),
// so the handler is resolved inside each call rather than at module load.
export async function GET(req: Request) {
  return toNextJsHandler(authFromContext()).GET(req);
}

export async function POST(req: Request) {
  return toNextJsHandler(authFromContext()).POST(req);
}
