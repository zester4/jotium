// emails/welcome-email.tsx
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
          }
          @media (prefers-color-scheme: light) {
            .light-bg { background-color: #ffffff !important; }
            .light-card { background-color: #f8f9fa !important; border-color: #e9ecef !important; }
            .light-text { color: #212529 !important; }
            .light-text-secondary { color: #6c757d !important; }
            .light-border { border-color: #dee2e6 !important; }
          }
          @media only screen and (max-width: 600px) {
            .mobile-container { width: 100% !important; padding: 10px !important; }
            .mobile-section { padding: 20px 15px !important; }
            .mobile-hero { padding: 30px 20px !important; }
            .mobile-text { font-size: 16px !important; }
            .mobile-title { font-size: 24px !important; }
            .mobile-button { width: 100% !important; padding: 15px 20px !important; }
            .mobile-feature-grid { flex-direction: column !important; }
            .mobile-feature-card { margin-bottom: 15px !important; }
            .mobile-plans { flex-direction: column !important; }
            .mobile-plan-card { margin-bottom: 20px !important; max-width: 100% !important; }
          }
        `}</style>
      </Head>
      <Preview>🚀 Welcome to Jotium - Your AI-powered workspace awaits!</Preview>
      <Body style={main} className="dark-bg light-bg">
        <Container style={container} className="mobile-container dark-card light-card">
          {/* Header */}
          <Section style={headerSection} className="mobile-section">
            <Img
              src={`${baseUrl}/images/jotium.png`}
              width="170"
              alt="Jotium"
              style={logo}
            />
            <div style={welcomeBadge}>
              <span style={sparkleIcon}>✨</span>
              <span style={welcomeText}>Welcome Aboard</span>
            </div>
          </Section>

          {/* Hero */}
          <Section style={heroSection} className="mobile-section">
            <div style={heroCard} className="mobile-hero dark-card light-card">
              <Heading style={heroHeading} className="mobile-title dark-text light-text">
                Welcome to the future, {fullName}! 🚀
              </Heading>
              <Text style={heroText} className="mobile-text dark-text-secondary light-text-secondary">
                You have just joined thousands of users who are transforming their productivity 
                with AI-powered assistance. Your journey to effortless automation starts now.
              </Text>
              <div style={currentPlanBadge} className="dark-border light-border">
                <span style={planIcon}>📋</span>
                <span style={planText} className="dark-text light-text">Current Plan: <strong>{plan}</strong></span>
              </div>
            </div>
          </Section>

          {/* Quick Start CTA */}
          <Section style={ctaSection} className="mobile-section">
            <Button style={primaryButton} href={`${baseUrl}/dashboard`} className="mobile-button">
              <span style={buttonIcon}>🎯</span>
              Talk to Jotium
            </Button>
            <Text style={ctaSubtext} className="dark-text-secondary light-text-secondary">
              Start your first tasks in under 2 minutes
            </Text>
          </Section>

          {/* Feature Cards */}
          <Section style={featuresSection} className="mobile-section">
            <Text style={featuresTitle} className="dark-text light-text">🎁 What you get with Jotium:</Text>
            
            <div style={featureGrid} className="mobile-feature-grid">
              <div style={featureCard} className="mobile-feature-card dark-card light-card dark-border light-border">
                <div style={featureIcon}>🤖</div>
                <Text style={featureCardTitle} className="dark-text light-text">AI Assistant</Text>
                <Text style={featureCardText} className="dark-text-secondary light-text-secondary">
                  Smart Agent that anticipates your needs
                </Text>
              </div>
              
              <div style={featureCard} className="mobile-feature-card dark-card light-card dark-border light-border">
                <div style={featureIcon}>🔗</div>
                <Text style={featureCardTitle} className="dark-text light-text">Seamless Integration</Text>
                <Text style={featureCardText} className="dark-text-secondary light-text-secondary">
                  Connect with 50+ tools you already use
                </Text>
              </div>
              
              <div style={featureCard} className="mobile-feature-card dark-card light-card dark-border light-border">
                <div style={featureIcon}>⚡</div>
                <Text style={featureCardTitle} className="dark-text light-text">Lightning Fast</Text>
                <Text style={featureCardText} className="dark-text-secondary light-text-secondary">
                  Execute complex tasks in seconds, not hours
                </Text>
              </div>
            </div>
          </Section>

          {/* Upgrade Incentive - Only show for Free plan */}
          {plan === 'Free' && (
            <Section style={upgradeSection} className="mobile-section">
              <div style={upgradeCard} className="dark-card light-card dark-border light-border">
                <div style={upgradeHeader}>
                  <span style={crownIcon}>👑</span>
                  <Text style={upgradeTitle} className="dark-text light-text">Ready to unlock your full potential?</Text>
                </div>
                
                <Text style={upgradeSubtitle} className="dark-text-secondary light-text-secondary">
                  Upgrade now and get <strong>20% off your first month!</strong>
                </Text>
                
                <div style={plansContainer} className="mobile-plans">
                  <div style={planCard} className="mobile-plan-card dark-card light-card dark-border light-border">
                    <div style={planCardHeader}>
                      <Text style={planName} className="dark-text light-text">Pro</Text>
                      <Text style={planPrice} className="dark-text light-text">$12.99<span style={planPeriod}>/mo</span></Text>
                    </div>
                    <div style={planFeatures}>
                      <Text style={planFeature} className="dark-text-secondary light-text-secondary">✓ 50 messages per day</Text>
                      <Text style={planFeature} className="dark-text-secondary light-text-secondary">✓ Smarter, more helpful Agentic responses</Text>
                      <Text style={planFeature} className="dark-text-secondary light-text-secondary">✓ Unlimited chat history</Text>
                      <Text style={planFeature} className="dark-text-secondary light-text-secondary">✓ Priority support</Text>
                    </div>
                    <Button style={planButton} href={`${baseUrl}/pricing?plan=pro`}>
                      Choose Pro
                    </Button>
                  </div>
                  
                  <div style={planCardAdvanced} className="mobile-plan-card">
                    <div style={popularBadge}>
                      <span style={popularText}>MOST POPULAR</span>
                    </div>
                    <div style={planCardHeader}>
                      <Text style={planNameAdvanced}>Advanced</Text>
                      <Text style={planPriceAdvanced}>$30.99<span style={planPeriod}>/mo</span></Text>
                    </div>
                    <div style={planFeatures}>
                      <Text style={planFeatureAdvanced}>✓ Unlimited messages per day</Text>
                      <Text style={planFeatureAdvanced}>✓ Everything in Pro</Text>
                      <Text style={planFeatureAdvanced}>✓ Most advanced Agentic reasoning</Text>
                      <Text style={planFeatureAdvanced}>✓ Custom AI workflows</Text>
                    </div>
                    <Button style={planButtonAdvanced} href={`${baseUrl}/pricing?plan=advanced`}>
                      Choose Advanced
                    </Button>
                  </div>
                </div>
                
              </div>
            </Section>
          )}

          <Hr style={divider} className="dark-border light-border" />

          {/* Footer */}
          <Section style={footerSection} className="mobile-section">
            <Text style={footerText} className="dark-text-secondary light-text-secondary">
              🤝 Questions? Our AI-powered support team is here to help 24/7
            </Text>
            <div style={footerLinks}>
              <Link href={`${baseUrl}/support`} style={footerLink}>Support Center</Link>
              <span style={footerSeparator} className="dark-text-secondary light-text-secondary">•</span>
              <Link href={`${baseUrl}/docs`} style={footerLink}>Documentation</Link>
              <span style={footerSeparator} className="dark-text-secondary light-text-secondary">•</span>
              <Link href={`${baseUrl}/community`} style={footerLink}>Community</Link>
            </div>
            <Text style={copyright} className="dark-text-secondary light-text-secondary">
              © 2025 Jotium. Empowering productivity through AI.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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
  marginBottom: '0',
};

const logo = {
  margin: '0 auto',
  marginBottom: '24px',
  maxWidth: '100%',
  height: 'auto',
};

const welcomeBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'linear-gradient(135deg, #20d4d4 0%, #1ab8b8 100%)',
  borderRadius: '25px',
  padding: '10px 20px',
  boxShadow: '0 2px 8px rgba(32, 212, 212, 0.3)',
};

const sparkleIcon = {
  fontSize: '16px',
};

const welcomeText = {
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.8px',
  margin: '0',
};

const heroSection = {
  padding: '0 20px 40px',
};

const heroCard = {
  border: '1px solid transparent',
  borderRadius: '16px',
  padding: '40px 30px',
  textAlign: 'center' as const,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const heroHeading = {
  fontSize: '28px',
  fontWeight: '800',
  margin: '0 0 20px 0',
  lineHeight: '1.2',
};

const heroText = {
  fontSize: '16px',
  margin: '0 0 25px 0',
  lineHeight: '1.6',
  maxWidth: '480px',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const currentPlanBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid transparent',
  borderRadius: '20px',
  padding: '10px 18px',
};

const planIcon = {
  fontSize: '16px',
};

const planText = {
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  padding: '0 20px',
  marginBottom: '50px',
};

const primaryButton = {
  background: 'linear-gradient(135deg, #20d4d4 0%, #1ab8b8 100%)',
  borderRadius: '30px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '16px 32px',
  boxShadow: '0 4px 12px rgba(32, 212, 212, 0.3)',
  border: 'none',
  textTransform: 'none' as const,
  letterSpacing: '0.3px',
  minWidth: '200px',
};

const buttonIcon = {
  fontSize: '18px',
};

const ctaSubtext = {
  fontSize: '14px',
  margin: '16px 0 0 0',
  fontWeight: '500',
};

const featuresSection = {
  padding: '0 20px',
  marginBottom: '50px',
};

const featuresTitle = {
  fontSize: '20px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 30px 0',
};

const featureGrid = {
  display: 'flex',
  gap: '15px',
  justifyContent: 'space-between',
  flexWrap: 'wrap' as const,
};

const featureCard = {
  border: '1px solid transparent',
  borderRadius: '12px',
  padding: '20px 16px',
  textAlign: 'center' as const,
  flex: '1',
  minWidth: '150px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const featureIcon = {
  fontSize: '28px',
  marginBottom: '12px',
};

const featureCardTitle = {
  fontSize: '15px',
  fontWeight: '700',
  margin: '0 0 8px 0',
};

const featureCardText = {
  fontSize: '13px',
  margin: '0',
  lineHeight: '1.4',
};

const upgradeSection = {
  padding: '0 20px',
  marginBottom: '50px',
};

const upgradeCard = {
  border: '1px solid transparent',
  borderRadius: '16px',
  padding: '30px 20px',
  textAlign: 'center' as const,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const upgradeHeader = {
  marginBottom: '20px',
};

const crownIcon = {
  fontSize: '24px',
  marginBottom: '10px',
  display: 'block',
};

const upgradeTitle = {
  fontSize: '22px',
  fontWeight: '800',
  margin: '0',
  lineHeight: '1.3',
};

const upgradeSubtitle = {
  fontSize: '16px',
  margin: '0 0 30px 0',
  fontWeight: '500',
};

const plansContainer = {
  display: 'flex',
  gap: '20px',
  justifyContent: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap' as const,
};

const planCard = {
  border: '1px solid transparent',
  borderRadius: '12px',
  padding: '20px 16px',
  minWidth: '180px',
  flex: '1',
  maxWidth: '220px',
};

const planCardAdvanced = {
  background: 'linear-gradient(135deg, #20d4d4 0%, #1ab8b8 100%)',
  border: '2px solid #ffffff',
  borderRadius: '12px',
  padding: '20px 16px',
  minWidth: '180px',
  flex: '1',
  maxWidth: '220px',
  position: 'relative' as const,
  boxShadow: '0 4px 12px rgba(32, 212, 212, 0.3)',
};

const popularBadge = {
  position: 'absolute' as const,
  top: '-10px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: '#ffffff',
  borderRadius: '12px',
  padding: '6px 12px',
};

const popularText = {
  color: '#1ab8b8',
  fontSize: '10px',
  fontWeight: '800',
  letterSpacing: '0.5px',
};

const planCardHeader = {
  marginBottom: '16px',
};

const planName = {
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 8px 0',
};

const planNameAdvanced = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 8px 0',
};

const planPrice = {
  fontSize: '24px',
  fontWeight: '800',
  margin: '0',
};

const planPriceAdvanced = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '800',
  margin: '0',
};

const planPeriod = {
  fontSize: '14px',
  fontWeight: '500',
  opacity: '0.8',
};

const planFeatures = {
  marginBottom: '20px',
};

const planFeature = {
  fontSize: '12px',
  margin: '6px 0',
  textAlign: 'left' as const,
};

const planFeatureAdvanced = {
  color: '#ffffff',
  fontSize: '12px',
  margin: '6px 0',
  textAlign: 'left' as const,
  fontWeight: '500',
};

const planButton = {
  background: '#20d4d4',
  border: '1px solid #20d4d4',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'block',
  padding: '12px 16px',
  textAlign: 'center' as const,
};

const planButtonAdvanced = {
  background: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  color: '#1ab8b8',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  display: 'block',
  padding: '12px 16px',
  textAlign: 'center' as const,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const divider = {
  margin: '40px 20px',
  opacity: '0.3',
};

const footerSection = {
  textAlign: 'center' as const,
  padding: '0 20px 40px',
};

const footerText = {
  fontSize: '14px',
  margin: '0 0 20px 0',
  fontWeight: '500',
};

const footerLinks = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '20px',
  flexWrap: 'wrap' as const,
};

const footerLink = {
  color: '#20d4d4',
  textDecoration: 'underline',
  fontSize: '13px',
  fontWeight: '600',
};

const footerSeparator = {
  fontSize: '12px',
};

const copyright = {
  fontSize: '12px',
  margin: '0',
  fontStyle: 'italic' as const,
  opacity: '0.8',
};