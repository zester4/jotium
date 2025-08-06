// emails/password-reset-email.tsx
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

interface PasswordResetEmailProps {
  to: string;
  firstName?: string;
  lastName?: string;
  resetToken?: string;
  resetUrl?: string;
  userAgent?: string;
  ipAddress?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const PasswordResetEmail = ({
  to,
  firstName = 'there',
  lastName = '',
  resetToken = 'sample_token',
  resetUrl,
  userAgent = 'Unknown browser',
  ipAddress = 'Unknown IP',
}: PasswordResetEmailProps) => {
  const fullName = `${firstName} ${lastName}`.trim() || firstName;
  const finalResetUrl = resetUrl || `${baseUrl}/reset-password?token=${resetToken}`;

  const securityDetails = [
    {
      id: 1,
      description: (
        <div className="flex justify-between items-center py-1" key={1}>
          <Text className="text-sm font-semibold">Browser:</Text>
          <Text className="text-sm text-gray-600 font-mono text-right max-w-xs truncate">{userAgent}</Text>
        </div>
      ),
    },
    {
      id: 2,
      description: (
        <div className="flex justify-between items-center py-1" key={2}>
          <Text className="text-sm font-semibold">IP Address:</Text>
          <Text className="text-sm text-gray-600 font-mono">{ipAddress}</Text>
        </div>
      ),
    },
    {
      id: 3,
      description: (
        <div className="flex justify-between items-center py-1" key={3}>
          <Text className="text-sm font-semibold">Time:</Text>
          <Text className="text-sm text-gray-600 font-mono">{new Date().toLocaleString()}</Text>
        </div>
      ),
    },
  ];

  const quickLinks = [
    { title: 'Get Support', href: `${baseUrl}/support` },
    { title: 'Security Guide', href: `${baseUrl}/security` },
    { title: 'Account Settings', href: `${baseUrl}/account` },
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
                danger: '#ef4444', // red-500
                dangerDark: '#dc2626', // red-600
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
        <Preview>Reset your Jotium password - expires in 1 hour</Preview>
        <Body className="bg-offwhite font-sans text-base">
          <Container className="text-center">
            <Img
              src={`${baseUrl}/images/jotium.png`}
              width="170"
              // height="68"
              alt="Jotium"
              className="mx-auto my-20"
            />
            <div className="inline-flex items-center gap-2 bg-red-100 border border-red-300 rounded-full px-5 py-2 mb-6">
              <span className="text-red-600 text-sm font-bold tracking-wide">🔒 PASSWORD RESET REQUEST</span>
            </div>
          </Container>

          <Container className="bg-white p-45 rounded-lg shadow-sm">
            <Heading className="my-0 text-center leading-8 text-2xl">
              Hi {fullName},
            </Heading>

            <Section>
              <Text className="text-base text-gray-600 text-center mb-8 max-w-md mx-auto">
                We received a request to reset your Jotium account password.
                Click the secure button below to create a new password.
              </Text>
            </Section>

            {/* Reset Button */}
            <Section className="text-center mb-8">
              <Button 
                className="rounded-full bg-danger px-8 py-4 text-white font-bold text-sm uppercase tracking-wide shadow-lg"
                href={finalResetUrl}
              >
                🔑 Reset My Password
              </Button>
              <Text className="text-sm text-red-600 font-medium mt-4">
                ⏰ This link expires in <strong>1 hour</strong> for your security
              </Text>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-8">
              <Text className="text-sm text-gray-600 text-center mb-3">
                If the button does not work, copy and paste this link:
              </Text>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mx-4">
                <Text className="text-xs font-mono text-amber-600 break-all m-0">
                  {finalResetUrl}
                </Text>
              </div>
            </Section>

            {/* Security Details */}
            <Section className="mb-8">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🛡️</span>
                  <Text className="text-lg font-semibold m-0">Security Details</Text>
                </div>
                <div>
                  {securityDetails?.map(({ description }) => description)}
                </div>
              </div>
            </Section>

            {/* Warning */}
            <Section className="mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⚠️</span>
                  <Text className="text-lg font-semibold text-red-600 m-0">Was this you?</Text>
                </div>
                <Text className="text-sm text-gray-700 leading-relaxed m-0">
                  If you did not request a password reset, you can safely ignore this email. 
                  Your password will remain unchanged. If you are concerned about your account security,{' '}
                  <Link href={`${baseUrl}/support`} className="text-amber-600 underline font-medium">
                    contact our support team
                  </Link>.
                </Text>
              </div>
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
                This security email was sent to your registered email address.
              </Text>
              <Text className="text-center text-gray-500 text-sm mb-4">
                Questions? Our AI-powered support is available 24/7 at{' '}
                <Link href={`${baseUrl}/support`} className="text-amber-600 underline">
                  support
                </Link>
              </Text>
              <Row>
                <Column className="px-20 text-right">
                  <Link className="text-gray-500 text-sm">Security Settings</Link>
                </Column>
                <Column className="text-left">
                  <Link className="text-gray-500 text-sm">Account Help</Link>
                </Column>
              </Row>
            </Section>
            <Text className="mb-45 text-center text-gray-400 text-sm">
              © 2025 Jotium. Securing your AI-powered workspace.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PasswordResetEmail;