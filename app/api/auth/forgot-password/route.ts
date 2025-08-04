import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createPasswordResetToken, getUser } from '@/db/queries';

// Email sending function
async function sendEmail(emailData: any) {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
      
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to send reset email:', error);
    throw error;
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Check if user exists
    const users = await getUser(email);
    if (users.length === 0) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        message: 'If an account with that email exists, we sent a password reset email.',
      });
    }

    const user = users[0];

    // Create reset token
    const resetToken = await createPasswordResetToken(email);
    if (!resetToken) {
      throw new Error('Failed to create reset token');
    }

    // Send reset email
    await sendEmail({
      to: email,
      type: 'password-reset',
      firstName: user.firstName,
      lastName: user.lastName,
      resetToken: resetToken,
    });

    return NextResponse.json({
      message: 'If an account with that email exists, we sent a password reset email.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
