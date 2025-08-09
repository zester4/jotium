import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { auth } from '@/app/(auth)/auth';
import { getStripeSubscription } from '@/db/queries';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { stripeCustomerId } = await getStripeSubscription(session.user.id);
  if (!stripeCustomerId) return NextResponse.json({ invoices: [] }, { status: 200 });
  try {
    const invoices = await stripe.invoices.list({ customer: stripeCustomerId, limit: 20 });
    return NextResponse.json({ invoices: invoices.data });
  } catch (err) {
    // Fallback: list from payment intents if invoices API fails
    try {
      const paymentIntents = await stripe.paymentIntents.list({ customer: stripeCustomerId, limit: 20 });
      const fallbackInvoices = paymentIntents.data.map((pi: any) => ({
        id: pi.id,
        created: Math.floor(pi.created),
        amount_paid: pi.amount_received,
        status: pi.status,
        invoice_pdf: null,
      }));
      return NextResponse.json({ invoices: fallbackInvoices });
    } catch {
      return NextResponse.json({ invoices: [] }, { status: 200 });
    }
  }
} 