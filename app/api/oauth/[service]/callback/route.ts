//app/api/oauth/[service]/callback/route.ts

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { saveOAuthConnection } from "@/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: { service: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { service } = params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const storedState = request.cookies.get(`oauth_state_${service}`)?.value;

  // Handle OAuth errors
  if (error) {
    console.error(`OAuth ${service} error:`, error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
  }

  if (!code || !state || state !== storedState) {
    console.error(`OAuth ${service} state mismatch or missing code:`, { code: !!code, state, storedState });
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
  }

  // Ensure NEXTAUTH_URL doesn't have trailing slash
  const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, '');
  const redirectUri = `${baseUrl}/api/oauth/${service}/callback`;
  
  let tokenUrl = "";
  let clientId: string | undefined;
  let clientSecret: string | undefined;
  let userInfoUrl = "";
  let tokenRequestBody: URLSearchParams;
  let headers: HeadersInit = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  };

  switch (service) {
    case "gmail":
      clientId = process.env.GOOGLE_CLIENT_ID;
      clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      tokenUrl = "https://oauth2.googleapis.com/token";
      userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
      tokenRequestBody = new URLSearchParams({
        code: code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      break;

    case "github":
      clientId = process.env.GITHUB_CLIENT_ID;
      clientSecret = process.env.GITHUB_CLIENT_SECRET;
      tokenUrl = "https://github.com/login/oauth/access_token";
      userInfoUrl = "https://api.github.com/user";
      tokenRequestBody = new URLSearchParams({
        client_id: clientId || "",
        client_secret: clientSecret || "",
        code: code,
        redirect_uri: redirectUri,
      });
      headers["Accept"] = "application/json";
      break;

    case "slack":
      clientId = process.env.SLACK_CLIENT_ID;
      clientSecret = process.env.SLACK_CLIENT_SECRET;
      tokenUrl = "https://slack.com/api/oauth.v2.access";
      userInfoUrl = "https://slack.com/api/users.identity"; // Better endpoint for user info
      tokenRequestBody = new URLSearchParams({
        client_id: clientId || "",
        client_secret: clientSecret || "",
        code: code,
        redirect_uri: redirectUri,
      });
      break;

    default:
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
  }

  if (!clientId || !clientSecret) {
    console.error(`Missing client ID or secret for ${service}`);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
  }

  try {
    console.log(`Exchanging code for tokens with ${service}...`);
    console.log(`Token URL: ${tokenUrl}`);
    console.log(`Redirect URI: ${redirectUri}`);

    // Exchange code for tokens
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: headers,
      body: tokenRequestBody,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`Failed to get tokens for ${service}:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorText,
      });
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
    }

    const tokenData = await tokenResponse.json();
    console.log(`Token exchange successful for ${service}`);

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;
    const scope = tokenData.scope;

    if (!accessToken) {
      console.error(`No access token received for ${service}`);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
    }

    // Fetch user info
    let externalUserId: string = "";
    let externalUserName: string | undefined = undefined;

    if (service === "gmail") {
      const userRes = await fetch(userInfoUrl, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        },
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        externalUserId = userData.id;
        externalUserName = userData.email || userData.name;
      }
    } else if (service === "github") {
      const userRes = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Use Bearer instead of token
          "User-Agent": "OAuth-App",
          Accept: "application/vnd.github.v3+json"
        },
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        externalUserId = userData.id.toString();
        externalUserName = userData.email || userData.login;
      }
    } else if (service === "slack") {
      // Use the identity endpoint which works with user tokens
      const userRes = await fetch(userInfoUrl, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        },
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.ok) {
          externalUserId = userData.user?.id || tokenData.authed_user?.id;
          externalUserName = userData.user?.email || userData.user?.name || tokenData.authed_user?.id;
        }
      }
      
      // Fallback to team info if user info not available
      if (!externalUserId && tokenData.team?.id) {
        externalUserId = tokenData.team.id;
        externalUserName = tokenData.team.name;
      }
    }

    if (!externalUserId) {
      console.error(`Could not retrieve external user ID for ${service}`);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
    }

    // Save connection to DB
    await saveOAuthConnection({
      userId: session.user.id,
      service,
      accessToken,
      refreshToken,
      expiresAt: expiresAt || null,
      scope,
      externalUserId,
      externalUserName,
    });

    console.log(`OAuth connection saved for ${service}`);

    // Clear the state cookie
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_success=true`);
    response.cookies.delete(`oauth_state_${service}`);
    
    // Revalidate the account page
    revalidatePath("/account");

    return response;
  } catch (error) {
    console.error(`OAuth callback error for ${service}:`, error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_error=true`);
  }
}
