// app/api/email/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Import email templates
import { PasswordResetEmail } from '@/components/emails/password-reset-email';
import { SubscriptionReceiptEmail } from '@/components/emails/subscription-receipt-email';
import { WelcomeEmail } from '@/components/emails/welcome-email';

// Explicitly check for RESEND_API_KEY
if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set. Email sending will fail.');
  // Optionally, you could throw an error here or handle it more gracefully
  // For now, we\'ll let the Resend constructor handle it, but log it clearly.
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Define email types
export type EmailType = 'welcome' | 'subscription-receipt' | 'password-reset';

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
  userAgent?: string;
  ipAddress?: string;
}

type EmailData = WelcomeEmailData | SubscriptionReceiptEmailData | PasswordResetEmailData;

// Email configuration
const EMAIL_CONFIG = {
  from: `${process.env.COMPANY_NAME || 'Jotium'} <${process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com'}>`,
  replyTo: process.env.RESEND_REPLY_TO_EMAIL || 'support@yourdomain.com',
};

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

    let emailComponent;
    let subject: string;
    let templateData: any = {};

    // Prepare email based on type
    switch (body.type) {
      case 'welcome':
        const welcomeData = body as WelcomeEmailData;
        subject = `Welcome to Jotium!`;
        templateData = {
          firstName: welcomeData.firstName,
          lastName: welcomeData.lastName,
          plan: welcomeData.plan,
        };
        emailComponent = WelcomeEmail(templateData);
        break;

      case 'subscription-receipt':
        const receiptData = body as SubscriptionReceiptEmailData;
        const amount = receiptData.amount || '0.00';
        const currency = receiptData.currency || 'USD';
        const currencySymbol = currency === 'USD' ? '$' : currency;
        
        subject = `Payment Receipt - ${currencySymbol}${amount}`;
        templateData = {
          firstName: receiptData.firstName,
          lastName: receiptData.lastName,
          plan: receiptData.plan,
          amount: receiptData.amount,
          currency: receiptData.currency,
          subscriptionId: receiptData.subscriptionId,
          invoiceId: receiptData.invoiceId,
          billingDate: receiptData.billingDate,
          nextBillingDate: receiptData.nextBillingDate,
          paymentMethod: receiptData.paymentMethod,
        };
        emailComponent = SubscriptionReceiptEmail(templateData);
        break;

      case 'password-reset':
        const resetData = body as PasswordResetEmailData;
        subject = `Reset your password - Jotium`;
        templateData = {
          firstName: resetData.firstName,
          lastName: resetData.lastName,
          resetToken: resetData.resetToken,
          resetUrl: resetData.resetUrl,
          userAgent,
          ipAddress,
        };
        emailComponent = PasswordResetEmail(templateData);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    // Send email using Resend
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: body.to,
      replyTo: EMAIL_CONFIG.replyTo,
      subject,
      react: emailComponent,
      // Add tags for tracking
      tags: [
        { name: 'type', value: body.type },
        { name: 'environment', value: process.env.NODE_ENV || 'development' },
      ],
    });

    // Log successful send (optional)
    console.log(`Email sent successfully:`, {
      id: result.data?.id,
      type: body.type,
      to: body.to,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      emailId: result.data?.id,
      message: `${body.type} email sent successfully`,
    });

  } catch (error: any) {
    console.error('Email sending error:', error);
    
    // Handle Resend-specific errors
    // Check for Resend error type if available, or specific messages
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
