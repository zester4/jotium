import { NextRequest } from "next/server";

import { sendEmail } from "@/lib/email-utils";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    await sendEmail({
      to: "shopseyy@gmail.com",
      type: "contact",
      data: {
        name,
        email,
        message,
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Failed to send message: ${errorMessage}`, { status: 500 });
  }
}
