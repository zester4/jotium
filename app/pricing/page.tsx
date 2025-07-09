"use client";
import { Check } from 'lucide-react'
import React, { useState } from 'react'
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn, generateUUID } from '@/lib/utils'

const plans = [
  {
    name: 'Free',
    price: {
      monthly: 0,
      yearly: 0,
    },
    originalPrice: {
      monthly: 0,
      yearly: 0,
    },
    description: 'For individuals and small teams just getting started.',
    features: [
      'Basic AI chat',
      'Limited chat history',
      'Community support',
      'Basic integrations',
    ],
    cta: 'Start for Free',
  },
  {
    name: 'Pro',
    price: {
      monthly: 12.99,
      yearly: 124.70, // 12.99 * 12 * 0.85
    },
    originalPrice: {
        monthly: 19.99,
        yearly: 239.88,
      },
    description: 'For growing teams that need more power and support.',
    features: [
      'Everything in Free',
      'Unlimited chat history',
      'Priority support',
      'Early access to new features',
      'Advanced integrations',
      'Basic code generation',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Advanced',
    price: {
      monthly: 30.99,
      yearly: 297.50, // 30.99 * 12 * 0.85
    },
    originalPrice: {
        monthly: 41.32,
        yearly: 495.84,
      },
    description: 'For professionals who need advanced AI capabilities.',
    features: [
      'Everything in Pro',
      'Advanced code generation',
      'Custom AI models',
      'Team collaboration tools',
      'Dedicated support',
    ],
    cta: 'Get Advanced',
  },
  {
    name: 'Team',
    price: {
      monthly: 35,
      yearly: 357, // 35 * 12 * 0.85
    },
    originalPrice: {
        monthly: 35,
        yearly: 420,
      },
    description: 'For large organizations with custom needs.',
    features: [
      'Everything in Advanced',
      'Admin dashboard',
      'SAML SSO',
      'On-premise deployment',
      '24/7 priority support',
    ],
    cta: 'Choose Team',
  },
]

const allFeatures = [
    { label: "Basic AI chat", free: true, pro: true, advanced: true, team: true },
    { label: "Limited chat history", free: true, pro: false, advanced: false, team: false },
    { label: "Unlimited chat history", free: false, pro: true, advanced: true, team: true },
    { label: "Community support", free: true, pro: false, advanced: false, team: false },
    { label: "Priority support", free: false, pro: true, advanced: false, team: false },
    { label: "Dedicated support", free: false, pro: false, advanced: true, team: false },
    { label: "24/7 priority support", free: false, pro: false, advanced: false, team: true },
    { label: "Basic integrations", free: true, pro: false, advanced: false, team: false },
    { label: "Advanced integrations", free: false, pro: true, advanced: true, team: true },
    { label: "Early access to new features", free: false, pro: true, advanced: true, team: true },
    { label: "Basic code generation", free: false, pro: true, advanced: false, team: false },
    { label: "Advanced code generation", free: false, pro: false, advanced: true, team: true },
    { label: "Custom AI models", free: false, pro: false, advanced: true, team: true },
    { label: "Team collaboration tools", free: false, pro: false, advanced: true, team: true },
    { label: "Admin dashboard", free: false, pro: false, advanced: false, team: true },
    { label: "SAML SSO", free: false, pro: false, advanced: false, team: true },
    { label: "On-premise deployment", free: false, pro: false, advanced: false, team: true },
  ];

  const faqs = [
    {
      q: "Can I try Pro for free?",
      a: "We offer a 7-day free trial for the Pro plan. No credit card required to start.",
    },
    {
      q: "Can I cancel or change plans anytime?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time from your account settings.",
    },
    {
      q: "What payment methods are accepted?",
      a: "We accept all major credit cards. For Enterprise, we also support invoicing.",
    },
    {
      q: "How does the team plan work?",
      a: "The team plan is designed for organizations and includes features for collaboration, administration, and security.",
    },
    {
        q: "What kind of agents can I build?",
        a: "You can build agents that integrate with a variety of services, including GitHub, Slack, and ClickUp, allowing you to automate tasks and workflows across different platforms.",
      },
      {
        q: "Can the agent book meetings?",
        a: "Yes, the agent can connect to your calendar and book meetings for you, helping you manage your schedule more efficiently.",
      },
      {
        q: "Is it possible to generate code with the agent?",
        a: "Our platform supports code generation, enabling you to create scripts, automate repetitive coding tasks, and accelerate your development process.",
      },
      {
        q: "How are integrations managed?",
        a: "Integrations are managed through a simple interface where you can connect to different services, configure settings, and monitor activity without needing to write any code.",
      },
  ];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-16">
      <Button
        variant="outline"
        size="sm"
        className="mb-4 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4">
            Flexible plans for every team
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8">
            Start for free, upgrade as you grow. No hidden fees. Cancel anytime.
          </p>
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-8 sm:mb-12">
            <Label htmlFor="billing-cycle" className={cn(billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}>
              Monthly
            </Label>
            <Switch
              id="billing-cycle"
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked: boolean) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <Label htmlFor="billing-cycle" className={cn(billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground')}>
              Yearly (Save 15%)
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'border rounded-lg p-6 flex flex-col',
                plan.popular ? 'border-primary shadow-lg' : 'border-border'
              )}
            >
              {plan.popular && (
                <div className="text-xs bg-primary text-primary-foreground font-semibold py-1 px-3 rounded-full self-start mb-4">
                  Most Popular
                </div>
              )}
              <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
              <p className="text-muted-foreground mb-6 h-12">{plan.description}</p>
              <div className="mb-6">
                <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold">
                    ${plan.price[billingCycle]}
                    </span>
                    {plan.originalPrice[billingCycle] > plan.price[billingCycle] && (
                        <span className="text-muted-foreground line-through ml-2">
                        ${plan.originalPrice[billingCycle]}
                        </span>
                    )}
                </div>
                <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              <Button
                className={cn(
                  'w-full',
                  plan.popular ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                )}
              >
                {plan.cta}
              </Button>
              <ul className="mt-8 space-y-4 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="size-4 text-primary mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="max-w-5xl mx-auto px-0 sm:px-4 mt-12 sm:mt-16 overflow-x-auto">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Feature Comparison</h3>
            <div className="w-full overflow-x-auto">
                <table className="min-w-[500px] sm:min-w-full border-collapse rounded-xl overflow-hidden text-xs sm:text-sm">
                <thead>
                    <tr className="bg-background text-foreground">
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-bold">Features</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-bold">Free</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-bold">Pro</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-bold">Advanced</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 font-bold">Team</th>
                    </tr>
                </thead>
                <tbody>
                    {allFeatures.map((f) => (
                    <tr key={f.label} className="border-b border-zinc-200 dark:border-zinc-700">
                        <td className="py-2 px-4 font-medium text-zinc-700 dark:text-zinc-200">{f.label}</td>
                        {["free", "pro", "advanced", "team"].map((plan) => (
                        <td key={plan} className="py-2 px-4 text-center">
                            {typeof f[plan as keyof typeof f] === "boolean"
                            ? f[plan as keyof typeof f]
                                ? <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                                : <span className="text-zinc-400">—</span>
                            : <span>{f[plan as keyof typeof f]}</span>}
                        </td>
                        ))}
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </section>

        <section className="max-w-3xl mx-auto px-2 sm:px-4 mt-12 sm:mt-16">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Frequently Asked Questions</h3>
            <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
                <details key={i} className="rounded-lg p-4 group bg-background text-foreground border border-border">
                <summary className="font-semibold cursor-pointer group-open:text-primary transition">{faq.q}</summary>
                <div className="mt-2 text-foreground/80">{faq.a}</div>
                </details>
            ))}
            </div>
        </section>
      </div>
    </div>
  )
}
