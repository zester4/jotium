// app/api/email/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, EmailType } from '@/lib/email-utils';

interface BaseEmailData {
  to: string;
  type: EmailType;
}

interface WelcomeEmailData extends BaseEmailData {
  type: 'welcome';
  firstName?: string;
  lastName?: string;
  plan?: string;
}

interface SubscriptionReceiptEmailData extends BaseEmailData {
  type: 'subscription-receipt';
  firstName?: string;
  lastName?: string;
  plan?: string;
  amount?: string;
  currency?: string;
  subscriptionId?: string;
  invoiceId?: string;
  billingDate?: string;
  nextBillingDate?: string;
  paymentMethod?: string;
}

interface PasswordResetEmailData extends BaseEmailData {
  type: 'password-reset';
  firstName?: string;
  lastName?: string;
  resetToken?: string;
  resetUrl?: string;
}

type EmailData = WelcomeEmailData | SubscriptionReceiptEmailData | PasswordResetEmailData;

export async function POST(req: NextRequest) {
  try {
    // Ensure RESEND_API_KEY is set before proceeding
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service is not configured. RESEND_API_KEY is missing.' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: EmailData = await req.json();
    
    // Validate required fields
    if (!body.to || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: to, type' },
        { status: 400 }
      );
    }

    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Get user agent and IP for security emails
    const userAgent = req.headers.get('user-agent') || 'Unknown browser';
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'Unknown IP';

    // Prepare data with additional context
    const emailData = {
      ...body,
      userAgent,
      ipAddress,
    };

    // Use the direct email service
    const result = await sendEmail({
      to: body.to,
      type: body.type,
      data: emailData,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: result.emailId,
      message: result.message || `${body.type} email sent successfully`,
    });

  } catch (error: any) {
    console.error('Email API error:', error);
    
    // Handle specific error types
    if (error.name === 'ResendError' || error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Email service configuration error: Invalid or missing API key.' },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing (optional - remove in production)
export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: 'Email API is working',
    availableTypes: ['welcome', 'subscription-receipt', 'password-reset'],
    example: {
      welcome: {
        to: 'user@example.com',
        type: 'welcome',
        firstName: 'John',
        lastName: 'Doe',
        plan: 'Pro'
      },
      'subscription-receipt': {
        to: 'user@example.com',
        type: 'subscription-receipt',
        firstName: 'John',
        lastName: 'Doe',
        plan: 'Pro',
        amount: '29.99',
        currency: 'USD',
        subscriptionId: 'sub_1234567890',
        invoiceId: 'in_1234567890',
        billingDate: '2025-01-15',
        nextBillingDate: '2025-02-15',
        paymentMethod: '•••• 4242'
      },
      'password-reset': {
        to: 'user@example.com',
        type: 'password-reset',
        firstName: 'John',
        lastName: 'Doe',
        resetToken: 'reset_token_here',
        resetUrl: 'https://yourapp.com/reset-password?token=reset_token_here'
      }
    }
  });
}
