import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface FeedbackEmailProps {
  feedbackText: string;
  sentiment: "positive" | "neutral" | "negative" | null;
  timestamp: string;
}

const FeedbackEmail = ({
  feedbackText,
  sentiment,
  timestamp,
}: FeedbackEmailProps) => {
  const sentimentEmoji =
    sentiment === "positive" ? "😊 Positive" : sentiment === "neutral" ? "😐 Neutral" : sentiment === "negative" ? "😞 Negative" : "N/A";

  return (
    <Html>
      <Head />
      <Preview>New Feedback Received</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>New Feedback Received!</Text>
            <Hr style={hr} />
            <Text style={paragraph}>
              A new feedback submission has been received for Jotium.
            </Text>
            <Text style={paragraph}>
              <strong>Sentiment:</strong> {sentimentEmoji}
            </Text>
            <Text style={paragraph}>
              <strong>Feedback:</strong>
            </Text>
            <Text style={feedbackTextarea}>{feedbackText}</Text>
            <Text style={paragraph}>
              <strong>Submitted On:</strong> {timestamp}
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              This email was sent automatically from your Jotium application.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default FeedbackEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
  marginBottom: "15px",
  color: "#333",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  color: "#555",
};

const feedbackTextarea = {
  fontSize: "14px",
  lineHeight: "20px",
  backgroundColor: "#f0f0f0",
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ddd",
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-word" as const,
};

const footer = {
  color: "#888",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "20px",
};
