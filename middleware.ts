import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/app/(auth)/auth.config";

export default NextAuth(authConfig).auth((req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-next-pathname", req.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/email/send (Email sending endpoint)
     * - api/pricing/webhook (Stripe webhook)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/email/send|api/pricing/webhook|_next/static|_next/image|favicon.ico).*)",
  ],
};
