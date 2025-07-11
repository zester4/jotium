//app/pricing/page.tsx

"use client";

import { Check, ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn, generateUUID } from '@/lib/utils';

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
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCheckout(plan: string) {
    setLoadingPlan(plan);
    setError(null);
    try {
      const res = await fetch('/api/pricing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start checkout.');
      }
    } catch (err) {
      setError('Failed to start checkout.');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-8 sm:pb-16">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <Button
          variant="outline"
          size="sm"
          className="my-4 flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        
        <div className="py-4 sm:py-8 lg:py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-3 md:mb-4 leading-tight">
              Flexible plans for every team
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-2 sm:px-4">
              Start for free, upgrade as you grow. No hidden fees. Cancel anytime.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-6 sm:mb-8 lg:mb-12">
              <Label 
                htmlFor="billing-cycle" 
                className={cn(
                  "text-sm sm:text-base transition-colors",
                  billingCycle === 'monthly' ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                Monthly
              </Label>
              <Switch
                id="billing-cycle"
                checked={billingCycle === 'yearly'}
                onCheckedChange={(checked: boolean) => setBillingCycle(checked ? 'yearly' : 'monthly')}
              />
              <Label 
                htmlFor="billing-cycle" 
                className={cn(
                  "text-sm sm:text-base transition-colors",
                  billingCycle === 'yearly' ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                Yearly 
                <span className="text-green-600 dark:text-green-400 font-semibold ml-1">
                  (Save 15%)
                </span>
              </Label>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    'border rounded-xl p-4 sm:p-6 flex flex-col relative transition-all duration-200 hover:shadow-lg w-full max-w-sm mx-auto',
                    plan.popular 
                      ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="text-xs bg-primary text-primary-foreground font-semibold py-1 px-3 rounded-full whitespace-nowrap">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h2>
                    <p className="text-sm sm:text-base text-muted-foreground min-h-10 sm:min-h-12 flex items-center justify-center px-2">
                      {plan.description}
                    </p>
                  </div>
                  
                  {/* Pricing */}
                  <div className="mb-6 text-center">
                    <div className="flex items-baseline justify-center mb-1">
                      <span className="text-3xl sm:text-4xl font-extrabold">
                        ${plan.price[billingCycle]}
                      </span>
                      {plan.originalPrice[billingCycle] > plan.price[billingCycle] && (
                        <span className="text-muted-foreground line-through ml-2 text-lg sm:text-xl">
                          ${plan.originalPrice[billingCycle]}
                        </span>
                      )}
                    </div>
                    <span className="text-sm sm:text-base text-muted-foreground">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  
                  {/* CTA Button */}
                  {plan.name === 'Free' ? (
                    <Button
                      className={cn(
                        'w-full mb-6 h-10 sm:h-11 text-sm sm:text-base transition-all duration-200',
                        'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                      onClick={() => router.push('/register')}
                    >
                      {plan.cta}
                    </Button>
                  ) : (
                    <Button
                      className={cn(
                        'w-full mb-6 h-10 sm:h-11 text-sm sm:text-base transition-all duration-200',
                        plan.popular 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                      disabled={loadingPlan === plan.name}
                      onClick={() => handleCheckout(plan.name)}
                    >
                      {loadingPlan === plan.name ? 'Redirecting...' : plan.cta}
                    </Button>
                  )}
                  {error && loadingPlan === plan.name && (
                    <div className="text-red-600 text-sm mt-2">{error}</div>
                  )}
                  
                  {/* Features List */}
                  <ul className="space-y-3 text-sm sm:text-base flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="size-4 sm:size-5 text-primary mr-2 sm:mr-3 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Comparison Table */}
          <section className="max-w-6xl mx-auto mt-12 sm:mt-16 lg:mt-20">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 text-center">
              Feature Comparison
            </h3>
            
            {/* Mobile: Card-based comparison */}
            <div className="lg:hidden space-y-4">
              {allFeatures.map((feature) => (
                <div key={feature.label} className="border rounded-lg p-4 bg-background">
                  <h4 className="font-semibold mb-3 text-sm sm:text-base">{feature.label}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    {["free", "pro", "advanced", "team"].map((plan) => (
                      <div key={plan} className="text-center">
                        <div className="text-xs sm:text-sm font-medium text-muted-foreground capitalize mb-1">
                          {plan}
                        </div>
                        <div className="text-lg sm:text-xl">
                          {typeof feature[plan as keyof typeof feature] === "boolean"
                            ? feature[plan as keyof typeof feature]
                              ? <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                              : <span className="text-zinc-400">—</span>
                            : <span className="text-sm">{feature[plan as keyof typeof feature]}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop: Traditional table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-4 font-bold text-left border-b">Features</th>
                    <th className="p-4 font-bold text-center border-b">Free</th>
                    <th className="p-4 font-bold text-center border-b">Pro</th>
                    <th className="p-4 font-bold text-center border-b">Advanced</th>
                    <th className="p-4 font-bold text-center border-b">Team</th>
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((f, index) => (
                    <tr key={f.label} className={cn("border-b", index % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                      <td className="p-4 font-medium">{f.label}</td>
                      {["free", "pro", "advanced", "team"].map((plan) => (
                        <td key={plan} className="p-4 text-center">
                          {typeof f[plan as keyof typeof f] === "boolean"
                            ? f[plan as keyof typeof f]
                              ? <span className="text-green-600 dark:text-green-400 font-bold text-lg">✓</span>
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

          {/* FAQ Section */}
          <section className="max-w-4xl mx-auto mt-12 sm:mt-16 lg:mt-20">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 text-center">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="rounded-lg p-4 sm:p-6 group bg-muted/30 border border-border transition-all duration-200 hover:bg-muted/50">
                  <summary className="font-semibold cursor-pointer group-open:text-primary transition-colors text-sm sm:text-base list-none">
                    <div className="flex items-center justify-between">
                      <span className="pr-4">{faq.q}</span>
                      <span className="text-xl group-open:rotate-45 transition-transform duration-200">+</span>
                    </div>
                  </summary>
                  <div className="mt-3 sm:mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}