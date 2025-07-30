//app/api/oauth/[service]/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { service: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { service } = params;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (!nextAuthUrl) {
    console.error("NEXTAUTH_URL environment variable is not set.");
    return new Response("Server configuration error", { status: 500 });
  }

  // Ensure NEXTAUTH_URL doesn't have trailing slash
  const baseUrl = nextAuthUrl.replace(/\/$/, '');
  const redirectUri = `${baseUrl}/api/oauth/${service}/callback`;
  
  // Generate secure state parameter
  const state = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  let authorizationUrl = "";
  let clientId: string | undefined;
  let scope: string | undefined;

  switch (service) {
    case "google":
      clientId = process.env.GOOGLE_CLIENT_ID;
      // Updated scopes for Google OAuth 2.0
      scope = "openid email profile";
      if (!clientId) {
        console.error("GOOGLE_CLIENT_ID environment variable is not set.");
        return new Response("Google OAuth configuration error", { status: 500 });
      }
      
      const googleParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        access_type: "offline",
        prompt: "consent",
        state: state,
        include_granted_scopes: "true"
      });
      
      authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?${googleParams.toString()}`;
      break;

    case "github":
      clientId = process.env.GITHUB_CLIENT_ID;
      // Updated scopes for GitHub
      scope = "user:email";
      if (!clientId) {
        console.error("GITHUB_CLIENT_ID environment variable is not set.");
        return new Response("GitHub OAuth configuration error", { status: 500 });
      }
      
      const githubParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
        state: state,
        allow_signup: "true"
      });
      
      authorizationUrl = `https://github.com/login/oauth/authorize?${githubParams.toString()}`;
      break;

    case "slack":
      clientId = process.env.SLACK_CLIENT_ID;
      // Updated scopes for Slack OAuth 2.0
      scope = "users:read users:read.email";
      if (!clientId) {
        console.error("SLACK_CLIENT_ID environment variable is not set.");
        return new Response("Slack OAuth configuration error", { status: 500 });
      }
      
      const slackParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
        state: state,
        user_scope: "identity.basic,identity.email"
      });
      
      authorizationUrl = `https://slack.com/oauth/v2/authorize?${slackParams.toString()}`;
      break;

    default:
      return new Response("Unsupported OAuth service", { status: 400 });
  }

  console.log(`OAuth ${service} redirect URI:`, redirectUri);
  console.log(`OAuth ${service} authorization URL:`, authorizationUrl);

  const response = NextResponse.redirect(authorizationUrl);
  
  // Set state cookie with proper security settings
  response.cookies.set(`oauth_state_${service}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: `/api/oauth/${service}/callback`,
  });

  return response;
}