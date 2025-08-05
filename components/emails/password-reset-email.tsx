// emails/password-reset-email.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
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

  return (
    <Html>
      <Head>
        <style>{`
          @media (prefers-color-scheme: dark) {
            .dark-bg { background-color: #1a1a1a !important; }
            .dark-card { background-color: #2d2d2d !important; border-color: #404040 !important; }
            .dark-text { color: #ffffff !important; }
            .dark-text-secondary { color: #a0a0a0 !important; }
            .dark-border { border-color: #404040 !important; }
            .dark-warning-bg { background-color: rgba(220, 53, 69, 0.15) !important; }
            .dark-warning-border { border-color: rgba(220, 53, 69, 0.4) !important; }
            .dark-security-bg { background-color: rgba(255, 193, 7, 0.15) !important; }
            .dark-security-border { border-color: rgba(255, 193, 7, 0.4) !important; }
            .dark-link-bg { background-color: #333333 !important; border-color: #555555 !important; }
          }
          @media (prefers-color-scheme: light) {
            .light-bg { background-color: #ffffff !important; }
            .light-card { background-color: #f8f9fa !important; border-color: #e9ecef !important; }
            .light-text { color: #212529 !important; }
            .light-text-secondary { color: #6c757d !important; }
            .light-border { border-color: #dee2e6 !important; }
            .light-warning-bg { background-color: rgba(220, 53, 69, 0.05) !important; }
            .light-warning-border { border-color: rgba(220, 53, 69, 0.2) !important; }
            .light-security-bg { background-color: rgba(255, 193, 7, 0.1) !important; }
            .light-security-border { border-color: rgba(255, 193, 7, 0.3) !important; }
            .light-link-bg { background-color: #f8f9fa !important; border-color: #e5e5e5 !important; }
          }
          @media only screen and (max-width: 600px) {
            .mobile-container { width: 100% !important; padding: 10px !important; }
            .mobile-section { padding: 20px 15px !important; }
            .mobile-hero { padding: 30px 20px !important; }
            .mobile-text { font-size: 16px !important; }
            .mobile-title { font-size: 24px !important; }
            .mobile-button { width: 100% !important; padding: 15px 20px !important; }
            .mobile-security-row { flex-direction: column !important; align-items: flex-start !important; }
            .mobile-link-container { margin: 0 !important; }
            .mobile-card { padding: 15px !important; }
          }
        `}</style>
      </Head>
      <Preview>Reset your Jotium password - expires in 1 hour</Preview>
      <Body style={main} className="dark-bg light-bg">
        <Container style={container} className="mobile-container dark-card light-card">
          {/* Header */}
          <Section style={headerSection} className="mobile-section dark-border light-border">
            <Img
              src={`${baseUrl}/images/jotium.png`}
              width="170"
              alt="Jotium"
              style={logo}
            />
            <div style={securityBadge}>
              <span style={lockIcon}>🔒</span>
              <span style={securityText}>Password Reset Request</span>
            </div>
          </Section>

          {/* Hero */}
          <Section style={heroSection} className="mobile-section">
            <Heading style={heroHeading} className="mobile-title dark-text light-text">Hi {fullName},</Heading>
            <Text style={heroText} className="mobile-text dark-text-secondary light-text-secondary">
              We received a request to reset your Jotium account password.
              Click the secure button below to create a new password.
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={ctaSection} className="mobile-section">
            <Button style={resetButton} href={finalResetUrl} className="mobile-button">
              <span style={buttonIcon}>🔑</span>
              Reset My Password
            </Button>
            <Text style={expiryText} className="dark-text-secondary light-text-secondary">
              ⏰ This link expires in <strong>1 hour</strong> for your security
            </Text>
          </Section>

          {/* Alternative Link */}
          <Section style={linkSection} className="mobile-section">
            <Text style={linkInstructions} className="dark-text-secondary light-text-secondary">
              If the button does not work, copy and paste this link:
            </Text>
            <div style={linkContainer} className="mobile-link-container dark-link-bg light-link-bg dark-border light-border">
              <Text style={linkText}>{finalResetUrl}</Text>
            </div>
          </Section>

          {/* Security Info */}
          <Section style={securityInfoSection} className="mobile-section">
            <div style={securityCard} className="mobile-card dark-security-bg light-security-bg dark-security-border light-security-border">
              <div style={securityHeader}>
                <span style={shieldIcon}>🛡️</span>
                <Text style={securityTitle} className="dark-text light-text">Security Details</Text>
              </div>
              <div style={securityDetails}>
                <div style={securityRow} className="mobile-security-row">
                  <span style={securityLabel} className="dark-text light-text">Browser: </span>
                  <span style={securityValue} className="dark-text-secondary light-text-secondary">{userAgent}</span>
                </div>
                <div style={securityRow} className="mobile-security-row">
                  <span style={securityLabel} className="dark-text light-text">IP Address: </span>
                  <span style={securityValue} className="dark-text-secondary light-text-secondary">{ipAddress}</span>
                </div>
                <div style={securityRow} className="mobile-security-row">
                  <span style={securityLabel} className="dark-text light-text">Time: </span>
                  <span style={securityValue} className="dark-text-secondary light-text-secondary">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Section>

          {/* Warning */}
          <Section style={warningSection} className="mobile-section">
            <div style={warningCard} className="mobile-card dark-warning-bg light-warning-bg dark-warning-border light-warning-border">
              <div style={warningHeader}>
                <span style={warningIconStyle}>⚠️</span>
                <Text style={warningTitle}>Was this you?</Text>
              </div>
              <Text style={warningText} className="dark-text-secondary light-text-secondary">
                If you did not request a password reset, you can safely ignore this email. 
                Your password will remain unchanged. If you are concerned about your account security,{' '}
                <Link href={`${baseUrl}/support`} style={supportLink}>
                  contact our support team
                </Link>.
              </Text>
            </div>
          </Section>

          <Hr style={divider} className="dark-border light-border" />

          {/* Footer */}
          <Section style={footerSection} className="mobile-section">
            <Text style={footerText} className="dark-text-secondary light-text-secondary">
              This security email was sent to your registered email address.
            </Text>
            <Text style={footerNote} className="dark-text-secondary light-text-secondary">
              Questions? Our AI-powered support is available 24/7 at{' '}
              <Link href={`${baseUrl}/support`} style={footerLink}>
                support
              </Link>
            </Text>
            <Text style={copyright} className="dark-text-secondary light-text-secondary">
              © 2025 Jotium. Securing your AI-powered workspace.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

// Styles - Updated for responsive and theme support
const main = {
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue","Inter",sans-serif',
  margin: '0',
  padding: '20px 0',
  minHeight: '100vh',
};

const container = {
  margin: '0 auto',
  maxWidth: '600px',
  width: '100%',
  padding: '0',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const headerSection = {
  textAlign: 'center' as const,
  padding: '40px 20px',
  borderBottom: '1px solid transparent',
  marginBottom: '0',
};

const logo = {
  margin: '0 auto',
  marginBottom: '20px',
  maxWidth: '100%',
  height: 'auto',
};

const securityBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(220, 53, 69, 0.1)',
  border: '1px solid rgba(220, 53, 69, 0.3)',
  borderRadius: '20px',
  padding: '8px 16px',
};

const lockIcon = {
  fontSize: '14px',
};

const securityText = {
  color: '#dc3545',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0',
};

const heroSection = {
  textAlign: 'center' as const,
  padding: '0 20px',
  marginBottom: '40px',
};

const heroHeading = {
  fontSize: '26px',
  fontWeight: '700',
  margin: '0 0 20px 0',
  lineHeight: '1.2',
};

const heroText = {
  fontSize: '16px',
  margin: '0',
  lineHeight: '1.5',
  maxWidth: '400px',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const ctaSection = {
  textAlign: 'center' as const,
  padding: '0 20px',
  marginBottom: '40px',
};

const resetButton = {
  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
  borderRadius: '25px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  padding: '16px 30px',
  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
  border: 'none',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  minWidth: '200px',
};

const buttonIcon = {
  fontSize: '16px',
};

const expiryText = {
  color: '#dc3545',
  fontSize: '14px',
  margin: '20px 0 0 0',
  fontWeight: '500',
};

const linkSection = {
  textAlign: 'center' as const,
  padding: '0 20px',
  marginBottom: '40px',
};

const linkInstructions = {
  fontSize: '14px',
  margin: '0 0 15px 0',
};

const linkContainer = {
  border: '1px solid transparent',
  borderRadius: '8px',
  padding: '15px',
  margin: '0 20px',
};

const linkText = {
  color: '#20d4d4',
  fontSize: '12px',
  margin: '0',
  wordBreak: 'break-all' as const,
  fontFamily: 'monospace',
};

const securityInfoSection = {
  padding: '0 20px',
  marginBottom: '30px',
};

const securityCard = {
  border: '1px solid transparent',
  borderRadius: '12px',
  padding: '20px',
};

const securityHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '15px',
};

const shieldIcon = {
  fontSize: '18px',
};

const securityTitle = {
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const securityDetails = {
  fontSize: '14px',
};

const securityRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
  flexWrap: 'wrap' as const,
  gap: '10px',
};

const securityLabel = {
  fontWeight: '600',
};

const securityValue = {
  fontFamily: 'monospace',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
};

const warningSection = {
  padding: '0 20px',
  marginBottom: '40px',
};

const warningCard = {
  border: '1px solid transparent',
  borderRadius: '12px',
  padding: '20px',
};

const warningHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '12px',
};

const warningIconStyle = {
  fontSize: '18px',
};

const warningTitle = {
  color: '#dc3545',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const warningText = {
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.5',
};

const supportLink = {
  color: '#20d4d4',
  textDecoration: 'underline',
  fontWeight: '600',
};

const divider = {
  margin: '40px 20px 30px',
  opacity: '0.3',
};

const footerSection = {
  textAlign: 'center' as const,
  padding: '0 20px 40px',
};

const footerText = {
  fontSize: '14px',
  margin: '0 0 15px 0',
};

const footerNote = {
  fontSize: '12px',
  margin: '0 0 15px 0',
};

const footerLink = {
  color: '#20d4d4',
  textDecoration: 'underline',
  fontWeight: '500',
};

const copyright = {
  fontSize: '11px',
  margin: '0',
  fontStyle: 'italic' as const,
  opacity: '0.8',
};
