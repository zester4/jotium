import NextAuth from "next-auth";

import { authConfig } from "@/app/(auth)/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/",
    "/chat/:path*",
    "/account/:path*",
    "/pricing/:path*",
    "/notifications/:path*",
    "/api/:path*",
  ],
};
