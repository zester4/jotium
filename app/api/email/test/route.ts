// Create app/api/email/test/route.ts for testing

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET(req: NextRequest) {
  try {
    console.log('=== EMAIL TEST START ===');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'RESEND_API_KEY is not set',
        env: process.env.NODE_ENV
      });
    }

    // Try to initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Try a simple API call (this won't send an email, just test auth)
    try {
      // Test with domains.list() which is a simple API call
      const domains = await resend.domains.list();
      console.log('Resend API test successful');
      
      return NextResponse.json({
        status: 'success',
        message: 'Resend API key is valid and working',
        apiKeyPrefix: process.env.RESEND_API_KEY.substring(0, 5),
        env: process.env.NODE_ENV
      });
    } catch (apiError: any) {
      console.error('Resend API test failed:', apiError);
      return NextResponse.json({
        status: 'error',
        message: 'Resend API key is invalid or API call failed',
        error: apiError.message,
        apiKeyPrefix: process.env.RESEND_API_KEY.substring(0, 5),
        env: process.env.NODE_ENV
      }, { status: 401 });
    }

  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error in test endpoint',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Test with actual email sending
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { to } = await req.json();

    const result = await resend.emails.send({
      from: 'welcome@coverkit.tech', // Replace with your verified domain
      to: to || 'shopseyy@gmail.com',
      subject: 'Test Email from Vercel',
      html: '<p>This is a test email to verify the API is working.</p>'
    });

    return NextResponse.json({
      status: 'success',
      emailId: result.data?.id,
      message: 'Test email sent successfully'
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to send test email',
      error: error.message
    }, { status: 500 });
  }
}
