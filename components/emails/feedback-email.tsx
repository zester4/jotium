import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Tailwind,
  pixelBasedPreset,
} from "@react-email/components";
import * as React from "react";

interface FeedbackEmailProps {
  name: string;
  email: string;
  feedbackText: string;
  sentiment: "positive" | "neutral" | "negative" | null;
  timestamp: string;
}

const FeedbackEmail = ({
  name,
  email,
  feedbackText,
  sentiment,
  timestamp,
}: FeedbackEmailProps) => {
  const sentimentEmoji =
    sentiment === "positive" ? "😊 Positive" : sentiment === "neutral" ? "😐 Neutral" : sentiment === "negative" ? "😞 Negative" : "N/A";

  return (
    <Html>
      <Head />
      <Preview>New Feedback Received from {name}</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: "#f59e0b",
                brandDark: "#d97706",
                offwhite: "#fffbeb",
                accent: "#fef3c7",
              },
              spacing: {
                0: "0px",
                20: "20px",
                45: "45px",
              },
            },
          },
        }}
      >
        <Body className="bg-offwhite font-sans text-base">
          <Container className="text-center">
            <Heading className="my-0 text-center leading-8 text-4xl font-bold text-brand">Jotium</Heading>
            <Text className="text-lg text-gray-600">New Feedback Received</Text>
          </Container>

          <Container className="bg-white p-45 rounded-lg shadow-sm">
            <Section>
              <Text className="text-2xl font-bold my-0 mb-4 text-brand">New Feedback Received!</Text>
              <Hr className="border-gray-200 my-5" />
              <Text className="text-base leading-6 text-left text-gray-600">
                A new feedback submission has been received for Jotium.
              </Text>
              <Text className="text-base leading-6 text-left text-gray-600">
                <strong>Name:</strong> {name}
              </Text>
              <Text className="text-base leading-6 text-left text-gray-600">
                <strong>Email:</strong> {email}
              </Text>
              <Text className="text-base leading-6 text-left text-gray-600">
                <strong>Sentiment:</strong> {sentimentEmoji}
              </Text>
              <Text className="text-base leading-6 text-left text-gray-600">
                <strong>Feedback:</strong>
              </Text>
              <Text className="text-sm leading-5 bg-accent p-4 rounded-md border border-gray-200 whitespace-pre-wrap break-words">{feedbackText}</Text>
              <Text className="text-base leading-6 text-left text-gray-600">
                <strong>Submitted On:</strong> {timestamp}
              </Text>
              <Hr className="border-gray-200 my-5" />
              <Text className="text-gray-400 text-sm text-center mt-5">
                This email was sent automatically from your Jotium application.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default FeedbackEmail;
