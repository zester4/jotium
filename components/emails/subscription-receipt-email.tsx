// emails/subscription-receipt-email.tsx
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
            .dark-receipt-bg { background-color: #333333 !important; border-color: #555555 !important; }
            .dark-features-bg { background-color: rgba(32, 212, 212, 0.15) !important; border-color: rgba(32, 212, 212, 0.4) !important; }
          }
          @media (prefers-color-scheme: light) {
            .light-bg { background-color: #ffffff !important; }
            .light-card { background-color: #f8f9fa !important; border-color: #e9ecef !important; }
            .light-text { color: #212529 !important; }
            .light-text-secondary { color: #6c757d !important; }
            .light-border { border-color: #dee2e6 !important; }
            .light-receipt-bg { background-color: #fafafa !important; border-color: #e5e5e5 !important; }
            .light-features-bg { background-color: rgba(32, 212, 212, 0.05) !important; border-color: rgba(32, 212, 212, 0.2) !important; }
          }
          @media only screen and (max-width: 600px) {
            .mobile-container { width: 100% !important; padding: 10px !important; }
            .mobile-section { padding: 20px 15px !important; }
            .mobile-hero { padding: 30px 20px !important; }
            .mobile-text { font-size: 16px !important; }
            .mobile-title { font-size: 24px !important; }
            .mobile-button { width: 100% !important; padding: 15px 20px !important; }
            .mobile-receipt-card { padding: 15px !important; }
            .mobile-detail-row { flex-direction: column !important; align-items: flex-start !important; gap: 5px !important; }
            .mobile-amount { font-size: 28px !important; }
            .mobile-features-card { padding: 20px !important; }
          }
        `}</style>
      </Head>
      <Preview>Payment confirmed: {currencySymbol}{amount} for Jotium {plan}</Preview>
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
            <div style={receiptBadge}>
              <span style={receiptIcon}>✅</span>
              <span style={receiptText}>Payment Confirmed</span>
            </div>
          </Section>

          {/* Hero */}
          <Section style={heroSection} className="mobile-section">
            <Heading style={heroHeading} className="mobile-title dark-text light-text">Thank you, {fullName}!</Heading>
            <Text style={heroText} className="mobile-text dark-text-secondary light-text-secondary">
              Your {plan} plan payment has been processed successfully.
            </Text>
          </Section>

          {/* Receipt Details */}
          <Section style={receiptSection} className="mobile-section">
            <div style={receiptCard} className="dark-receipt-bg light-receipt-bg dark-border light-border">
              <div style={receiptHeader}>
                <Text style={receiptTitle}>Payment Receipt</Text>
                <Text style={amountDisplay} className="mobile-amount">{currencySymbol}{amount}</Text>
              </div>
              
              <div style={receiptDetails} className="mobile-receipt-card">
                <div style={detailRow} className="mobile-detail-row">
                  <Text style={detailLabel} className="dark-text-secondary light-text-secondary">Plan </Text>
                  <Text style={detailValue} className="dark-text light-text">Jotium {plan}</Text>
                </div>
                <div style={detailRow} className="mobile-detail-row">
                  <Text style={detailLabel} className="dark-text-secondary light-text-secondary">Payment Method </Text>
                  <Text style={detailValue} className="dark-text light-text">{paymentMethod}</Text>
                </div>
                <div style={detailRow} className="mobile-detail-row">
                  <Text style={detailLabel} className="dark-text-secondary light-text-secondary">Billing Date </Text>
                  <Text style={detailValue} className="dark-text light-text">{billingDate}</Text>
                </div>
                <div style={detailRow} className="mobile-detail-row">
                  <Text style={detailLabel} className="dark-text-secondary light-text-secondary">Next Billing </Text>
                  <Text style={detailValue} className="dark-text light-text">{nextBillingDate}</Text>
                </div>
                
                <Hr style={receiptDivider} className="dark-border light-border" />
                
                <div style={detailRow} className="mobile-detail-row">
                  <Text style={invoiceLabel}>Invoice ID </Text>
                  <Text style={invoiceValue} className="dark-text light-text">{invoiceId}</Text>
                </div>
              </div>
            </div>
          </Section>

          {/* Plan Features */}
          <Section style={featuresSection} className="mobile-section">
            <div style={featuresCard} className="mobile-features-card dark-features-bg light-features-bg dark-border light-border">
              <Text style={featuresTitle} className="dark-text light-text">Your {plan} Plan Includes:</Text>
              <div style={featuresList}>
                {getPlanFeatures(plan).map((feature, index) => (
                  <div key={index} style={featureItem}>
                    <span style={featureCheck}>✓</span>
                    <span style={featureText} className="dark-text light-text">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* CTA */}
          <Section style={ctaSection} className="mobile-section">
            <Button style={ctaButton} href={`${baseUrl}/`} className="mobile-button">
              Access Dashboard
            </Button>
            <Text style={ctaSubtext} className="dark-text-secondary light-text-secondary">
              <Link href={`${baseUrl}/billing`} style={billingLink}>
                View billing details
              </Link>
            </Text>
          </Section>

          <Hr style={footerDivider} className="dark-border light-border" />

          {/* Footer */}
          <Section style={footerSection} className="mobile-section">
            <Text style={footerText} className="dark-text-secondary light-text-secondary">
              Questions about your subscription?{' '}
              <Link href={`${baseUrl}/support`} style={supportLink}>
                Contact support
              </Link>
            </Text>
            <Text style={subscriptionIdStyle} className="dark-text-secondary light-text-secondary">
              Subscription ID: {subscriptionId}
            </Text>
            <Text style={copyright} className="dark-text-secondary light-text-secondary">
              © 2025 Jotium. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SubscriptionReceiptEmail;

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

const receiptBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(32,212,212,0.1)',
  border: '1px solid rgba(32,212,212,0.3)',
  borderRadius: '20px',
  padding: '8px 16px',
};

const receiptIcon = {
  fontSize: '14px',
};

const receiptText = {
  color: '#20d4d4',
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
  margin: '0 0 15px 0',
  lineHeight: '1.2',
};

const heroText = {
  fontSize: '16px',
  margin: '0',
  lineHeight: '1.5',
};

const receiptSection = {
  padding: '0 20px',
  marginBottom: '30px',
};

const receiptCard = {
  border: '1px solid transparent',
  borderRadius: '12px',
  overflow: 'hidden',
};

const receiptHeader = {
  background: 'linear-gradient(135deg, #20d4d4 0%, #1aa8a8 100%)',
  padding: '20px',
  textAlign: 'center' as const,
};

const receiptTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const amountDisplay = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '800',
  margin: '0',
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

const receiptDetails = {
  padding: '25px',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
};

const detailLabel = {
  fontSize: '14px',
  margin: '0',
  fontWeight: '500',
};

const detailValue = {
  fontSize: '14px',
  margin: '0',
  fontWeight: '600',
};

const receiptDivider = {
  margin: '20px 0 15px 0',
  opacity: '0.3',
};

const invoiceLabel = {
  color: '#20d4d4',
  fontSize: '12px',
  margin: '0',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const invoiceValue = {
  fontSize: '12px',
  margin: '0',
  fontWeight: '600',
  fontFamily: 'monospace',
};

const featuresSection = {
  padding: '0 20px',
  marginBottom: '40px',
};

const featuresCard = {
  border: '1px solid transparent',
  borderRadius: '12px',
  padding: '25px',
};

const featuresTitle = {
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 20px 0',
};

const featuresList = {
  margin: '0',
};

const featureItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '10px',
};

const featureCheck = {
  color: '#20d4d4',
  fontSize: '14px',
  fontWeight: '700',
};

const featureText = {
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.4',
};

const ctaSection = {
  textAlign: 'center' as const,
  padding: '0 20px',
  marginBottom: '40px',
};

const ctaButton = {
  background: 'linear-gradient(135deg, #20d4d4 0%, #1aa8a8 100%)',
  borderRadius: '25px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  padding: '14px 30px',
  boxShadow: '0 4px 12px rgba(32,212,212,0.3)',
  border: 'none',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  display: 'inline-block',
  minWidth: '180px',
};

const ctaSubtext = {
  fontSize: '12px',
  margin: '15px 0 0 0',
};

const billingLink = {
  color: '#20d4d4',
  textDecoration: 'underline',
  fontWeight: '500',
};

const footerDivider = {
  margin: '40px 20px 30px',
  opacity: '0.3',
};

const footerSection = {
  textAlign: 'center' as const,
  padding: '0 20px 40px',
};

const footerText = {
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 15px 0',
};

const supportLink = {
  color: '#20d4d4',
  textDecoration: 'underline',
  fontWeight: '500',
};

const subscriptionIdStyle = {
  fontSize: '11px',
  margin: '0 0 15px 0',
  fontFamily: 'monospace',
  opacity: '0.8',
};

const copyright = {
  fontSize: '11px',
  margin: '0',
  fontStyle: 'italic' as const,
  opacity: '0.8',
};
