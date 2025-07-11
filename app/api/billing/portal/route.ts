import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { auth } from '@/app/(auth)/auth';
import { getStripeSubscription } from '@/db/queries';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { stripeCustomerId } = await getStripeSubscription(session.user.id);
  if (!stripeCustomerId) return NextResponse.json({ url: null, message: 'No subscription to manage.' }, { status: 200 });
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
  });
  return NextResponse.json({ url: portalSession.url });
} 