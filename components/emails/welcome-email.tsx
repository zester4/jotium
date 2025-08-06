// emails/welcome-email.tsx
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

interface WelcomeEmailProps {
  to: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const WelcomeEmail = ({
  to,
  firstName = 'there',
  lastName = '',
  plan = 'Free',
}: WelcomeEmailProps) => {
  const fullName = `${firstName} ${lastName}`.trim() || firstName;

  const features = [
    {
      id: 1,
      description: (
        <li className="mb-20" key={1}>
          <strong>🤖 AI Assistant.</strong> Smart Agent that anticipates your needs and helps you accomplish tasks effortlessly.
        </li>
      ),
    },
    {
      id: 2,
      description: (
        <li className="mb-20" key={2}>
          <strong>🔗 Seamless Integration.</strong> Connect with 50+ tools you already use. 
          <Link className="text-amber-600 underline ml-1">Explore integrations</Link>.
        </li>
      ),
    },
    {
      id: 3,
      description: (
        <li className="mb-20" key={3}>
          <strong>⚡ Lightning Fast.</strong> Execute complex tasks in seconds, not hours. 
          <Link className="text-amber-600 underline ml-1">See what is possible</Link>.
        </li>
      ),
    },
    {
      id: 4,
      description: (
        <li className="mb-20" key={4}>
          <strong>📋 Current Plan: {plan}.</strong> You are all set to start transforming your productivity. 
          {plan === 'Free' && (
            <Link className="text-amber-600 underline ml-1">Upgrade for more features</Link>
          )}.
        </li>
      ),
    },
  ];

  const quickLinks = [
    { title: 'Get Support', href: `${baseUrl}/support` },
    { title: 'Read the Docs', href: `${baseUrl}/docs` },
    { title: 'Join Community', href: `${baseUrl}/community` },
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
        <Preview>🚀 Welcome to Jotium - Your AI-powered workspace awaits!</Preview>
        <Body className="bg-offwhite font-sans text-base">
          <Container className="text-center">
            <Img
              src={`${baseUrl}/images/jotium.png`}
              width="170"
              // height="68"
              alt="Jotium"
              className="mx-auto my-20"
            />
            <div className="inline-flex items-center gap-2 bg-brand rounded-full px-5 py-2 mb-6">
              <span className="text-white text-sm font-bold tracking-wide">✨ WELCOME ABOARD</span>
            </div>
          </Container>

          <Container className="bg-white p-45 rounded-lg shadow-sm">
            <Heading className="my-0 text-center leading-8 text-2xl">
              Welcome to the future, {fullName}! 🚀
            </Heading>

            <Section>
              <Row>
                <Text className="text-base text-gray-600 text-center">
                  You have just joined thousands of users who are transforming their productivity 
                  with AI-powered assistance. Your journey to effortless automation starts now.
                </Text>

                <Text className="text-base font-semibold">Here is what you get with Jotium:</Text>
              </Row>
            </Section>

            <ul className="list-none pl-0">{features?.map(({ description }) => description)}</ul>

            <Section className="text-center my-8">
              <Button 
                className="rounded-full bg-brand px-8 py-4 text-white font-bold text-lg shadow-lg"
                href={`${baseUrl}/dashboard`}
              >
                🎯 Talk to Jotium
              </Button>
              <Text className="text-sm text-gray-500 mt-3">
                Start your first tasks in under 2 minutes
              </Text>
            </Section>

            {/* Upgrade Section - Only for Free plan */}
            {plan === 'Free' && (
              <Section className="bg-accent rounded-lg p-6 my-8">
                <div className="text-center">
                  <Text className="text-xl font-bold mb-2">👑 Ready to unlock your full potential?</Text>
                  <Text className="text-base text-gray-700 mb-4">
                    Upgrade now and get <strong>20% off your first month!</strong>
                  </Text>
                </div>
                
                <Row className="gap-4">
                  <Column className="bg-white rounded-lg p-4 border border-gray-200">
                    <Text className="font-bold text-lg mb-2">Pro</Text>
                    <Text className="text-2xl font-bold mb-3">
                      $12.99<span className="text-sm text-gray-500">/mo</span>
                    </Text>
                    <Text className="text-sm text-gray-600 mb-1">✓ 50 messages per day</Text>
                    <Text className="text-sm text-gray-600 mb-1">✓ Smarter Agentic responses</Text>
                    <Text className="text-sm text-gray-600 mb-1">✓ Unlimited chat history</Text>
                    <Text className="text-sm text-gray-600 mb-3">✓ Priority support</Text>
                    <Button 
                      className="w-full rounded-lg bg-brand text-white py-2 px-4 text-sm font-semibold"
                      href={`${baseUrl}/pricing?plan=pro`}
                    >
                      Choose Pro
                    </Button>
                  </Column>
                  
                  <Column className="bg-brand rounded-lg p-4 text-white relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white text-brandDark px-3 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </div>
                    <Text className="font-bold text-lg mb-2 text-white">Advanced</Text>
                    <Text className="text-2xl font-bold mb-3 text-white">
                      $30.99<span className="text-sm opacity-80">/mo</span>
                    </Text>
                    <Text className="text-sm mb-1 opacity-90">✓ Unlimited messages per day</Text>
                    <Text className="text-sm mb-1 opacity-90">✓ Everything in Pro</Text>
                    <Text className="text-sm mb-1 opacity-90">✓ Most advanced Agentic reasoning</Text>
                    <Text className="text-sm mb-3 opacity-90">✓ Custom AI workflows</Text>
                    <Button 
                      className="w-full rounded-lg bg-white text-brandDark py-2 px-4 text-sm font-bold shadow-sm"
                      href={`${baseUrl}/pricing?plan=advanced`}
                    >
                      Choose Advanced
                    </Button>
                  </Column>
                </Row>
              </Section>
            )}

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
                🤝 Questions? Our AI-powered support team is here to help 24/7
              </Text>
              <Row>
                <Column className="px-20 text-right">
                  <Link className="text-gray-500 text-sm">Unsubscribe</Link>
                </Column>
                <Column className="text-left">
                  <Link className="text-gray-500 text-sm">Manage Preferences</Link>
                </Column>
              </Row>
            </Section>
            <Text className="mb-45 text-center text-gray-400 text-sm">
              © 2025 Jotium. Empowering productivity through AI.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;