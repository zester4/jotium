//app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createPasswordResetToken, getUser } from '@/db/queries';
import { sendPasswordResetEmail, generatePasswordResetUrl } from '@/lib/email-utils'; // ✅ Import direct functions

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

    // Generate reset URL
    const resetUrl = generatePasswordResetUrl(resetToken);

    // ✅ Send reset email using direct function call
    const emailResult = await sendPasswordResetEmail({
      to: email,
      firstName: user.firstName,
      lastName: user.lastName,
      resetToken: resetToken,
      resetUrl: resetUrl,
    });

    if (emailResult.success) {
      console.log('Password reset email sent successfully:', emailResult.emailId);
    } else {
      console.error('Failed to send password reset email:', emailResult.error);
      // Still return success to avoid revealing user existence
    }

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