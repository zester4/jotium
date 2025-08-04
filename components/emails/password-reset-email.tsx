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
        <Head />
        <Preview>Reset your Jotium password - expires in 1 hour</Preview>
        <Body style={main}>
          <Container style={container}>
            {/* Header */}
            <Section style={headerSection}>
              <Img
                src="https://jotium.vercel.app/images/jotium.png"
                width="120"
                height="40"
                alt="Jotium"
                style={logo}
              />
              <div style={securityBadge}>
                <span style={lockIcon}>🔒</span>
                <span style={securityText}>Password Reset Request</span>
              </div>
            </Section>
  
            {/* Hero */}
            <Section style={heroSection}>
              <Heading style={heroHeading}>Hi {fullName},</Heading>
              <Text style={heroText}>
                We received a request to reset your Jotium account password.
                Click the secure button below to create a new password.
              </Text>
            </Section>
  
            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button style={resetButton} href={finalResetUrl}>
                <span style={buttonIcon}>🔑</span>
                Reset My Password
              </Button>
              <Text style={expiryText}>
                ⏰ This link expires in <strong>1 hour</strong> for your security
              </Text>
            </Section>
  
            {/* Alternative Link */}
            <Section style={linkSection}>
              <Text style={linkInstructions}>
                If the button doesn&apost work, copy and paste this link:
              </Text>
              <div style={linkContainer}>
                <Text style={linkText}>{finalResetUrl}</Text>
              </div>
            </Section>
  
            {/* Security Info */}
            <Section style={securityInfoSection}>
              <div style={securityCard}>
                <div style={securityHeader}>
                  <span style={shieldIcon}>🛡️</span>
                  <Text style={securityTitle}>Security Details</Text>
                </div>
                <div style={securityDetails}>
                  <div style={securityRow}>
                    <span style={securityLabel}>Browser:</span>
                    <span style={securityValue}>{userAgent}</span>
                  </div>
                  <div style={securityRow}>
                    <span style={securityLabel}>IP Address:</span>
                    <span style={securityValue}>{ipAddress}</span>
                  </div>
                  <div style={securityRow}>
                    <span style={securityLabel}>Time:</span>
                    <span style={securityValue}>{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Section>
  
            {/* Warning */}
            <Section style={warningSection}>
              <div style={warningCard}>
                <div style={warningHeader}>
                  <span style={warningIconStyle}>⚠️</span>
                  <Text style={warningTitle}>Didn&apost request this?</Text>
                </div>
                <Text style={warningText}>
                  If you didn&apost request a password reset, you can safely ignore this email. 
                  Your password will remain unchanged. If you&aposre concerned about your account security,{' '}
                  <Link href={`${baseUrl}/support`} style={supportLink}>
                    contact our support team
                  </Link>.
                </Text>
              </div>
            </Section>
  
            <Hr style={divider} />
  
            {/* Footer */}
            <Section style={footerSection}>
              <Text style={footerText}>
                This security email was sent to your registered email address.
              </Text>
              <Text style={footerNote}>
                Questions? Our AI-powered support is available 24/7 at{' '}
                <Link href={`${baseUrl}/support`} style={footerLink}>
                  support
                </Link>
              </Text>
              <Text style={copyright}>
                © 2025 Jotium. Securing your AI-powered workspace.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default PasswordResetEmail;
  
  // Styles
  const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue","Inter",sans-serif',
    margin: '0',
    padding: '0',
  };
  
  const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    maxWidth: '600px',
    width: '100%',
    padding: '20px',
  };
  
  const headerSection = {
    textAlign: 'center' as const,
    padding: '30px 0',
    borderBottom: '1px solid #f0f0f0',
    marginBottom: '30px',
  };
  
  const logo = {
    marginBottom: '20px',
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
    marginBottom: '40px',
  };
  
  const heroHeading = {
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 20px 0',
    lineHeight: '1.2',
  };
  
  const heroText = {
    color: '#666666',
    fontSize: '16px',
    margin: '0',
    lineHeight: '1.5',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
  };
  
  const ctaSection = {
    textAlign: 'center' as const,
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
    gap: '10px',
    padding: '16px 30px',
    boxShadow: '0 8px 20px rgba(220, 53, 69, 0.3)',
    border: 'none',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
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
    marginBottom: '40px',
  };
  
  const linkInstructions = {
    color: '#666666',
    fontSize: '14px',
    margin: '0 0 15px 0',
  };
  
  const linkContainer = {
    background: '#f8f9fa',
    border: '1px solid #e5e5e5',
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
    marginBottom: '30px',
  };
  
  const securityCard = {
    background: 'rgba(255, 193, 7, 0.1)',
    border: '1px solid rgba(255, 193, 7, 0.3)',
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
    color: '#856404',
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
    color: '#856404',
    fontWeight: '600',
  };
  
  const securityValue = {
    color: '#856404',
    fontFamily: 'monospace',
    fontSize: '12px',
    wordBreak: 'break-all' as const,
  };
  
  const warningSection = {
    marginBottom: '40px',
  };
  
  const warningCard = {
    background: 'rgba(220, 53, 69, 0.05)',
    border: '1px solid rgba(220, 53, 69, 0.2)',
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
    color: '#721c24',
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
    borderColor: '#e5e5e5',
    margin: '40px 0 30px 0',
  };
  
  const footerSection = {
    textAlign: 'center' as const,
  };
  
  const footerText = {
    color: '#666666',
    fontSize: '14px',
    margin: '0 0 15px 0',
  };
  
  const footerNote = {
    color: '#666666',
    fontSize: '12px',
    margin: '0 0 15px 0',
  };
  
  const footerLink = {
    color: '#20d4d4',
    textDecoration: 'underline',
    fontWeight: '500',
  };
  
  const copyright = {
    color: '#999999',
    fontSize: '11px',
    margin: '0',
    fontStyle: 'italic' as const,
  };
