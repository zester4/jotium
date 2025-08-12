import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Hr,
} from '@react-email/components';
import { pixelBasedPreset } from '@react-email/components';
import * as React from 'react';

interface ContactEmailProps {
  name: string;
  email: string;
  message: string;
}

export const ContactEmail: React.FC<Readonly<ContactEmailProps>> = ({ name, email, message }) => (
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
      <Preview>New Contact Form Submission from {name}</Preview>
      <Body className="bg-offwhite font-sans text-base">
        <Container className="text-center">
          <Heading className="my-0 text-center leading-8 text-4xl font-bold text-brand">Jotium</Heading>
          <Text className="text-lg text-gray-600">New Contact Form Submission</Text>
        </Container>

        <Container className="bg-white p-45 rounded-lg shadow-sm">
          <Heading className="my-0 text-center leading-8 text-2xl">
            Message Details:
          </Heading>
          <Section className="text-base text-gray-600">
            <Text>
              <strong>Name:</strong> {name}
            </Text>
            <Text>
              <strong>Email:</strong> {email}
            </Text>
          </Section>
          <Hr className="border-gray-300 my-6" />
          <Heading className="my-0 text-center leading-8 text-2xl">
            Message:
          </Heading>
          <Text className="text-base text-gray-600">
            {message}
          </Text>
        </Container>

        <Container className="mt-20">
          <Section>
            <Text className="text-center text-gray-600 mb-4">
              🤝 Questions? Our AI-powered support team is here to help 24/7
            </Text>
          </Section>
          <Text className="mb-45 text-center text-gray-400 text-sm">
            © 2025 Jotium. Empowering productivity through AI.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default ContactEmail;
