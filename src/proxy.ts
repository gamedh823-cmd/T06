import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed the middleware.ts file convention to proxy.ts — this
// is not middleware.ts, this is the whole story (see
// node_modules/next/dist/docs/.../proxy.md). It runs before every matched
// route and is what actually enforces "no session -> /login" (T07-C97) —
// nothing else in the app checks this on the way in.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
