import NextAuth from "next-auth";

import { authConfig } from "@/app/(auth)/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/pricing/webhook (Stripe webhook)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/pricing/webhook|_next/static|_next/image|favicon.ico).*)',
  ],
};
