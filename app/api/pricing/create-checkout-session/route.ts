import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { auth } from '@/app/(auth)/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });

const priceIds: Record<'Pro' | 'Advanced', Record<'monthly' | 'yearly', string>> = {
  Pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  },
  Advanced: {
    monthly: process.env.STRIPE_ADVANCED_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_ADVANCED_YEARLY_PRICE_ID!,
  },
};

const validPlans = ['Pro', 'Advanced'] as const;
const validBillingCycles = ['monthly', 'yearly'] as const;
type Plan = typeof validPlans[number];
type BillingCycle = typeof validBillingCycles[number];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { plan, billingCycle } = await req.json();
    if (!plan || !billingCycle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!validPlans.includes(plan) || !validBillingCycles.includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid plan or billing cycle' }, { status: 400 });
    }
    const typedPlan = plan as Plan;
    const typedBillingCycle = billingCycle as BillingCycle;
    const priceId = priceIds[typedPlan][typedBillingCycle];
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: session.user.email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=1`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        userId: session.user.id,
      },
    });
    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 