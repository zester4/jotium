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
  const invoices = await stripe.invoices.list({ customer: stripeCustomerId, limit: 20 });
  return NextResponse.json({ invoices: invoices.data });
} 