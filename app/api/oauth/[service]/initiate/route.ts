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
  console.log("DEBUG: NEXTAUTH_URL in initiate route:", nextAuthUrl); // Added for debugging
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
    case "gmail":
      clientId = process.env.GOOGLE_CLIENT_ID;
      // Updated scopes for Google OAuth 2.0
      scope = [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
      ].join(" ");
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
    
    case "x":
      clientId = process.env.X_CLIENT_ID;
      // Updated comprehensive scopes for X/Twitter API v2
      scope = [
        "tweet.read",           // Read tweets
        "tweet.write",          // Post, delete tweets
        "users.read",           // Read user profiles
        "follows.read",         // Read following/followers (needed for some user operations)
        "follows.write",        // Follow/unfollow users
        "like.read",            // Read likes
        "like.write",           // Like/unlike tweets  
        "list.read",            // Read lists (useful for advanced features)
        "space.read",           // Read Spaces (if you want to support this)
        "mute.read",            // Read muted accounts
        "mute.write",           // Mute/unmute accounts
        "block.read",           // Read blocked accounts
        "block.write",          // Block/unblock accounts
        "bookmark.read",        // Read bookmarks
        "bookmark.write",       // Add/remove bookmarks
        "offline.access"        // Refresh token capability
      ].join(" ");

      if (!clientId) {
        console.error("X_CLIENT_ID environment variable is not set.");
        return new Response("X OAuth configuration error", { status: 500 });
      }

      const xParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        state: state,
        code_challenge_method: "plain",
        code_challenge: "challenge"
      });

      authorizationUrl = `https://x.com/i/oauth2/authorize?${xParams.toString()}`;
      break;

    default:
      return new Response("Unsupported OAuth service", { status: 400 });
  }

  console.log(`OAuth ${service} redirect URI:`, redirectUri);
  console.log(`OAuth ${service} authorization URL:`, authorizationUrl);
  console.log(`OAuth ${service} scopes requested:`, scope);

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