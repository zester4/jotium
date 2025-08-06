// emails/subscription-receipt-email.tsx
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  pixelBasedPreset,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface SubscriptionReceiptEmailProps {
  to: string;
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

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const SubscriptionReceiptEmail = ({
  to,
  firstName = 'there',
  lastName = '',
  plan = 'Pro',
  amount = '29.99',
  currency = 'USD',
  subscriptionId = 'sub_xxx',
  invoiceId = 'inv_xxx',
  billingDate = new Date().toLocaleDateString(),
  nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  paymentMethod = '•••• 4242',
}: SubscriptionReceiptEmailProps) => {
  const fullName = `${firstName} ${lastName}`.trim() || firstName;
  const currencySymbol = currency === 'USD' ? '$' : currency;

  const getPlanFeatures = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'pro':
        return [
          '50 messages per day',
          'Smarter, more helpful Agentic responses',
          'Everything in Free',
          'Unlimited chat history',
          'Priority support',
          'Early access to new features',
          'Advanced integrations',
          'Basic code generation',
          'Agent thoughts and reasoning enabled',
        ];
      case 'advanced':
        return [
          '100 messages per day',
          'Everything in Pro',
          'Most advanced Agentic reasoning and agentic features',
          'Advanced code generation',
          'Custom AI workflows',
          'Team collaboration tools',
          'Dedicated support',
        ];
      default:
        return ['Basic AI responses', 'Limited features'];
    }
  };

  const receiptDetails = [
    {
      id: 1,
      description: (
        <div className="flex justify-between items-center py-2 border-b border-amber-100" key={1}>
          <Text className="text-sm text-gray-600 font-medium">Plan</Text>
          <Text className="text-sm font-semibold">Jotium {plan}</Text>
        </div>
      ),
    },
    {
      id: 2,
      description: (
        <div className="flex justify-between items-center py-2 border-b border-amber-100" key={2}>
          <Text className="text-sm text-gray-600 font-medium">Payment Method</Text>
          <Text className="text-sm font-semibold">{paymentMethod}</Text>
        </div>
      ),
    },
    {
      id: 3,
      description: (
        <div className="flex justify-between items-center py-2 border-b border-amber-100" key={3}>
          <Text className="text-sm text-gray-600 font-medium">Billing Date</Text>
          <Text className="text-sm font-semibold">{billingDate}</Text>
        </div>
      ),
    },
    {
      id: 4,
      description: (
        <div className="flex justify-between items-center py-2 border-b border-amber-100" key={4}>
          <Text className="text-sm text-gray-600 font-medium">Next Billing</Text>
          <Text className="text-sm font-semibold">{nextBillingDate}</Text>
        </div>
      ),
    },
    {
      id: 5,
      description: (
        <div className="flex justify-between items-center py-2 mt-4" key={5}>
          <Text className="text-xs text-amber-600 font-bold uppercase tracking-wide">Invoice ID</Text>
          <Text className="text-xs font-mono font-semibold">{invoiceId}</Text>
        </div>
      ),
    },
  ];

  const quickLinks = [
    { title: 'View Billing', href: `${baseUrl}/billing` },
    { title: 'Get Support', href: `${baseUrl}/support` },
    { title: 'Download Invoice', href: `${baseUrl}/invoice/${invoiceId}` },
  ];

  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: '#f59e0b', // amber-500
                brandDark: '#d97706', // amber-600
                offwhite: '#fffbeb', // amber-50
                accent: '#fef3c7', // amber-100
              },
              spacing: {
                0: '0px',
                20: '20px',
                45: '45px',
              },
            },
          },
        }}
      >
        <Preview>Payment confirmed: {currencySymbol}{amount} for Jotium {plan}</Preview>
        <Body className="bg-offwhite font-sans text-base">
          <Container className="text-center">
            <Img
              src={`${baseUrl}/images/jotium.png`}
              width="170"
              // height="68"
              alt="Jotium"
              className="mx-auto my-20"
            />
            <div className="inline-flex items-center gap-2 bg-green-500 rounded-full px-5 py-2 mb-6">
              <span className="text-white text-sm font-bold tracking-wide">✅ PAYMENT CONFIRMED</span>
            </div>
          </Container>

          <Container className="bg-white p-45 rounded-lg shadow-sm">
            <Heading className="my-0 text-center leading-8 text-2xl">
              Thank you, {fullName}!
            </Heading>

            <Section>
              <Text className="text-base text-gray-600 text-center mb-8">
                Your {plan} plan payment has been processed successfully.
              </Text>
            </Section>

            {/* Receipt Card */}
            <Section className="mb-8">
              <div className="bg-brand rounded-t-lg p-6 text-center">
                <Text className="text-white text-sm font-semibold uppercase tracking-wide mb-2">Payment Receipt</Text>
                <Text className="text-white text-4xl font-bold">{currencySymbol}{amount}</Text>
              </div>
              <div className="bg-gray-50 rounded-b-lg p-6 border border-gray-200">
                {receiptDetails?.map(({ description }) => description)}
              </div>
            </Section>

            {/* Plan Features */}
            <Section className="mb-8">
              <div className="bg-accent rounded-lg p-6 border border-amber-200">
                <Text className="text-lg font-semibold mb-4">Your {plan} Plan Includes:</Text>
                <div>
                  {getPlanFeatures(plan).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 mb-2">
                      <span className="text-brand font-bold text-sm mt-0.5">✓</span>
                      <Text className="text-sm text-gray-700 m-0">{feature}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* CTA */}
            <Section className="text-center mb-8">
              <Button 
                className="rounded-full bg-brand px-8 py-4 text-white font-bold text-sm uppercase tracking-wide shadow-lg"
                href={`${baseUrl}/`}
              >
                Access Jotium
              </Button>
            </Section>

            {/* Quick Links */}
            <Section className="mt-45">
              <Row>
                {quickLinks?.map((link) => (
                  <Column key={link.title}>
                    <Link
                      className="font-bold text-black underline"
                      href={link.href}
                    >
                      {link.title}
                    </Link>{' '}
                    <span className="text-amber-500">→</span>
                  </Column>
                ))}
              </Row>
            </Section>
          </Container>

          <Container className="mt-20">
            <Section>
              <Text className="text-center text-gray-600 mb-4">
                Questions about your subscription? <Link href={`${baseUrl}/support`} className="text-brand underline font-medium">Contact support</Link>
              </Text>
              <Text className="text-center text-gray-400 text-xs font-mono mb-4">
                Subscription ID: {subscriptionId}
              </Text>
              <Row>
                <Column className="px-20 text-right">
                  <Link className="text-gray-500 text-sm">Unsubscribe</Link>
                </Column>
                <Column className="text-left">
                  <Link className="text-gray-500 text-sm">Manage Subscription</Link>
                </Column>
              </Row>
            </Section>
            <Text className="mb-45 text-center text-gray-400 text-sm">
              © 2025 Jotium. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SubscriptionReceiptEmail;