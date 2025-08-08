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
          <strong>🤖 Autonomous Task Management.</strong> Jotium understands your workflow and automatically manages tasks across all your platforms without constant guidance.
        </li>
      ),
    },
    {
      id: 2,
      description: (
        <li className="mb-20" key={2}>
          <strong>🤖 Predictive Intelligence.</strong> Learn your work patterns and predict your next steps, preparing everything you need before you even ask.
        </li>
      ),
    },
    {
      id: 3,
      description: (
        <li className="mb-20" key={3}>
          <strong>🤖 One Chat, All Tools.</strong> No more switching between apps. Manage Gmail, Calendar, project tools, and more through simple conversation.
        </li>
      ),
    },
    {
      id: 4,
      description: (
        <li className="mb-20" key={4}>
          <strong>🤖 Complex Task Automation.</strong> Say goodbye to repetitive workflows. Jotium handles complex multi-step processes across different platforms seamlessly.
        </li>
      ),
    },
    {
      id: 5,
      description: (
        <li className="mb-20" key={5}>
          <strong>📋 Current Plan: {plan}.</strong> You are all set to start transforming your productivity. 
          {plan === 'Free' && (
            <Link className="text-amber-600 underline ml-1">Upgrade for more features</Link>
          )}.
        </li>
      ),
    },
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
            <Heading className="my-0 text-center leading-8 text-4xl font-bold text-brand">Jotium</Heading>
            <Text className="text-lg text-gray-600">Your Autonomous AI Agent</Text>
            <div className="inline-flex items-center gap-2 bg-brand rounded-full px-5 py-2 mb-6">
              <span className="text-white text-sm font-bold tracking-wide">🚀 You are all set to start!</span>
            </div>
            <Text className="text-base text-gray-600">You have 5 messages per day to explore the capabilities of Jotium</Text>
          </Container>

          <Container className="bg-white p-45 rounded-lg shadow-sm">
            <Heading className="my-0 text-center leading-8 text-2xl">
              Welcome to the future, {fullName}! 🚀
            </Heading>

            <Section>
              <Text className="text-base text-gray-600 text-center">
                Jotium seamlessly integrates with all your favorite tools and platforms, understanding your work patterns to predict and execute your next steps autonomously.
              </Text>
            </Section>

            <Section className="text-center my-8">
              <Row>
                <Column>
                  <Text className="text-2xl">📧</Text>
                  <Text className="text-sm">Gmail</Text>
                </Column>
                <Column>
                  <Text className="text-2xl">📅</Text>
                  <Text className="text-sm">Google Calendar</Text>
                </Column>
                <Column>
                  <Text className="text-2xl">📋</Text>
                  <Text className="text-sm">Asana</Text>
                </Column>
                <Column>
                  <Text className="text-2xl">⚡</Text>
                  <Text className="text-sm">ClickUp</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text className="text-2xl">🔧</Text>
                  <Text className="text-sm">GitHub</Text>
                </Column>
                <Column>
                  <Text className="text-2xl">📊</Text>
                  <Text className="text-sm">Linear</Text>
                </Column>
                <Column>
                  <Text className="text-2xl">🗂️</Text>
                  <Text className="text-sm">Trello</Text>
                </Column>
                <Column>
                  <Text className="text-2xl">🗄️</Text>
                  <Text className="text-sm">Airtable</Text>
                </Column>
              </Row>
              <Text className="text-base font-bold">➕ And More!</Text>
            </Section>

            <ul className="list-none pl-0">{features?.map(({ description }) => description)}</ul>

            {/* Upgrade Section */}
            <Section className="bg-accent rounded-lg p-6 my-8">
              <div className="text-center">
                <Text className="text-xl font-bold mb-2">Upgrade to Pro</Text>
                <Text className="text-base text-gray-700 mb-4">
                  Recommended
                </Text>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <Text className="font-bold text-lg mb-2">Pro</Text>
                <Text className="text-2xl font-bold mb-3">
                  $12.99<span className="text-sm text-gray-500">/mo</span>
                </Text>
                <Text className="text-sm text-gray-600 mb-1">✓ 50 messages per day</Text>
                <Text className="text-sm text-gray-600 mb-1">✓ Smarter, more helpful Agentic responses</Text>
                <Text className="text-sm text-gray-600 mb-1">✓ Everything in Free</Text>
                <Text className="text-sm text-gray-600 mb-1">✓ Unlimited chat history</Text>
                <Text className="text-sm text-gray-600 mb-1">✓ Priority support</Text>
                <Text className="text-sm text-gray-600 mb-1">✓ Early access to new features</Text>
                <Text className="text-sm text-gray-600 mb-1">✓ Advanced integrations</Text>
                <Text className="text-sm text-gray-600 mb-1">✓ Code generation</Text>
                <Text className="text-sm text-gray-600 mb-3">✓ Agent thoughts and reasoning enabled</Text>
                <Button 
                  className="inline-block rounded-lg bg-brand text-white py-2 px-4 text-sm font-semibold"
                  href={`${baseUrl}/pricing?plan=pro`}
                >
                  Upgrade to Pro Now
                </Button>
              </div>
              <Text className="text-center text-base text-gray-700 mt-4">
                Ready to supercharge your productivity with autonomous AI?
              </Text>
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
