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
            '50 daily AI messages',
            'Agentic reasoning & automation',
            'All tool integrations',
            'Project understanding',
            'Priority support'
          ];
        case 'advanced':
          return [
            'Unlimited AI messages',
            'Deep reasoning capabilities',
            'Advanced automations',
            'All Pro features',
            'Premium support'
          ];
        default:
          return ['Basic AI responses', 'Limited features'];
      }
    };
  
    return (
      <Html>
        <Head />
        <Preview>Payment confirmed: {currencySymbol}{amount} for Jotium {plan}</Preview>
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
              <div style={receiptBadge}>
                <span style={receiptIcon}>✅</span>
                <span style={receiptText}>Payment Confirmed</span>
              </div>
            </Section>
  
            {/* Hero */}
            <Section style={heroSection}>
              <Heading style={heroHeading}>Thank you, {fullName}!</Heading>
              <Text style={heroText}>
                Your {plan} plan payment has been processed successfully.
              </Text>
            </Section>
  
            {/* Receipt Details */}
            <Section style={receiptSection}>
              <div style={receiptCard}>
                <div style={receiptHeader}>
                  <Text style={receiptTitle}>Payment Receipt</Text>
                  <Text style={amountDisplay}>{currencySymbol}{amount}</Text>
                </div>
                
                <div style={receiptDetails}>
                  <div style={detailRow}>
                    <Text style={detailLabel}>Plan</Text>
                    <Text style={detailValue}>Jotium {plan}</Text>
                  </div>
                  <div style={detailRow}>
                    <Text style={detailLabel}>Payment Method</Text>
                    <Text style={detailValue}>{paymentMethod}</Text>
                  </div>
                  <div style={detailRow}>
                    <Text style={detailLabel}>Billing Date</Text>
                    <Text style={detailValue}>{billingDate}</Text>
                  </div>
                  <div style={detailRow}>
                    <Text style={detailLabel}>Next Billing</Text>
                    <Text style={detailValue}>{nextBillingDate}</Text>
                  </div>
                  
                  <Hr style={receiptDivider} />
                  
                  <div style={detailRow}>
                    <Text style={invoiceLabel}>Invoice ID</Text>
                    <Text style={invoiceValue}>{invoiceId}</Text>
                  </div>
                </div>
              </div>
            </Section>
  
            {/* Plan Features */}
            <Section style={featuresSection}>
              <div style={featuresCard}>
                <Text style={featuresTitle}>Your {plan} Plan Includes:</Text>
                <div style={featuresList}>
                  {getPlanFeatures(plan).map((feature, index) => (
                    <div key={index} style={featureItem}>
                      <span style={featureCheck}>✓</span>
                      <span style={featureText}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
  
            {/* CTA */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={`${baseUrl}`}>
                Access Jotuim
              </Button>
              <Text style={ctaSubtext}>
                <Link href={`${baseUrl}/billing`} style={billingLink}>
                  View billing details
                </Link>
              </Text>
            </Section>
  
            <Hr style={footerDivider} />
  
            {/* Footer */}
            <Section style={footerSection}>
              <Text style={footerText}>
                Questions about your subscription?{' '}
                <Link href={`${baseUrl}/support`} style={supportLink}>
                  Contact support
                </Link>
              </Text>
              <Text style={subscriptionIdStyle}>
                Subscription ID: {subscriptionId}
              </Text>
              <Text style={copyright}>
                © 2025 Jotium. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default SubscriptionReceiptEmail;
  
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
    marginBottom: '40px',
  };
  
  const heroHeading = {
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 15px 0',
    lineHeight: '1.2',
  };
  
  const heroText = {
    color: '#666666',
    fontSize: '16px',
    margin: '0',
    lineHeight: '1.5',
  };
  
  const receiptSection = {
    marginBottom: '30px',
  };
  
  const receiptCard = {
    background: '#fafafa',
    border: '1px solid #e5e5e5',
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
    color: '#666666',
    fontSize: '14px',
    margin: '0',
    fontWeight: '500',
  };
  
  const detailValue = {
    color: '#1a1a1a',
    fontSize: '14px',
    margin: '0',
    fontWeight: '600',
  };
  
  const receiptDivider = {
    borderColor: '#e5e5e5',
    margin: '20px 0 15px 0',
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
    color: '#1a1a1a',
    fontSize: '12px',
    margin: '0',
    fontWeight: '600',
    fontFamily: 'monospace',
  };
  
  const featuresSection = {
    marginBottom: '40px',
  };
  
  const featuresCard = {
    background: 'rgba(32,212,212,0.05)',
    border: '1px solid rgba(32,212,212,0.2)',
    borderRadius: '12px',
    padding: '25px',
  };
  
  const featuresTitle = {
    color: '#1a1a1a',
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
    color: '#1a1a1a',
    fontSize: '14px',
    margin: '0',
    lineHeight: '1.4',
  };
  
  const ctaSection = {
    textAlign: 'center' as const,
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
  };
  
  const ctaSubtext = {
    color: '#666666',
    fontSize: '12px',
    margin: '15px 0 0 0',
  };
  
  const billingLink = {
    color: '#20d4d4',
    textDecoration: 'underline',
    fontWeight: '500',
  };
  
  const footerDivider = {
    borderColor: '#e5e5e5',
    margin: '40px 0 30px 0',
  };
  
  const footerSection = {
    textAlign: 'center' as const,
  };
  
  const footerText = {
    color: '#666666',
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
    color: '#999999',
    fontSize: '11px',
    margin: '0 0 15px 0',
    fontFamily: 'monospace',
  };
  
  const copyright = {
    color: '#999999',
    fontSize: '11px',
    margin: '0',
    fontStyle: 'italic' as const,
  };
