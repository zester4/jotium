import NextAuth from "next-auth";

import { authConfig } from "@/app/(auth)/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    // Exclude static assets and the Stripe webhook
    "/((?!api/pricing/webhook|_next/static|_next/image|favicon.ico|static).*)",
    "/",
    "/chat/:path*",
    "/account/:path*",
    "/pricing/:path*",
    "/notifications/:path*",
    "/api/:path*",
  ],
};
