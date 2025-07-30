import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { deleteOAuthConnection } from "@/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: { service: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { service } = params;

  try {
    await deleteOAuthConnection({ userId: session.user.id, service });

    // Optionally, revoke token with the OAuth provider
    // This would involve another API call to the provider's revocation endpoint
    // For example, for Google: https://oauth2.googleapis.com/revoke?token={access_token}

    revalidatePath("/account");
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/account?oauth_disconnected=true`);
  } catch (error) {
    console.error(`Failed to disconnect OAuth for ${service}:`, error);
    return new Response("Failed to disconnect OAuth", { status: 500 });
  }
}
