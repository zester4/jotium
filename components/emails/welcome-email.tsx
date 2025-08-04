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
        <Head />
        <Preview>🚀 Welcome to Jotium - Your AI-powered workspace awaits!</Preview>
        <Body style={main}>
          <Container style={container}>
            {/* Header */}
            <Section style={headerSection}>
              <Img
                src="https://jotium.vercel.app/images/jotium.png"
                width="140"
                height="46"
                alt="Jotium"
                style={logo}
              />
              <div style={welcomeBadge}>
                <span style={sparkleIcon}>✨</span>
                <span style={welcomeText}>Welcome Aboard</span>
              </div>
            </Section>
  
            {/* Hero */}
            <Section style={heroSection}>
              <div style={heroCard}>
                <Heading style={heroHeading}>
                  Welcome to the future, {fullName}! 🚀
                </Heading>
                <Text style={heroText}>
                  You&aposve just joined thousands of users who are transforming their productivity 
                  with AI-powered assistance. Your journey to effortless automation starts now.
                </Text>
                <div style={currentPlanBadge}>
                  <span style={planIcon}>📋</span>
                  <span style={planText}>Current Plan: <strong>{plan}</strong></span>
                </div>
              </div>
            </Section>
  
            {/* Quick Start CTA */}
            <Section style={ctaSection}>
              <Button style={primaryButton} href={`${baseUrl}/dashboard`}>
                <span style={buttonIcon}>🎯</span>
                Talk to Jotium
              </Button>
              <Text style={ctaSubtext}>
                Start your first tasks in under 2 minutes
              </Text>
            </Section>
  
            {/* Feature Cards */}
            <Section style={featuresSection}>
              <Text style={featuresTitle}>🎁 What you get with Jotium:</Text>
              
              <div style={featureGrid}>
                <div style={featureCard}>
                  <div style={featureIcon}>🤖</div>
                  <Text style={featureCardTitle}>AI Assistant</Text>
                  <Text style={featureCardText}>
                    Smart Agent that anticipates your needs
                  </Text>
                </div>
                
                <div style={featureCard}>
                  <div style={featureIcon}>🔗</div>
                  <Text style={featureCardTitle}>Seamless Integration</Text>
                  <Text style={featureCardText}>
                    Connect with 50+ tools you already use
                  </Text>
                </div>
                
                <div style={featureCard}>
                  <div style={featureIcon}>⚡</div>
                  <Text style={featureCardTitle}>Lightning Fast</Text>
                  <Text style={featureCardText}>
                    Execute complex tasks in seconds, not hours
                  </Text>
                </div>
              </div>
            </Section>
  
            {/* Upgrade Incentive - Only show for Free plan */}
            {plan === 'Free' && (
              <Section style={upgradeSection}>
                <div style={upgradeCard}>
                  <div style={upgradeHeader}>
                    <span style={crownIcon}>👑</span>
                    <Text style={upgradeTitle}>Ready to unlock your full potential?</Text>
                  </div>
                  
                  <Text style={upgradeSubtitle}>
                    Upgrade now and get <strong>20% off your first month!</strong>
                  </Text>
                  
                  <div style={plansContainer}>
                    <div style={planCard}>
                      <div style={planCardHeader}>
                        <Text style={planName}>Pro</Text>
                        <Text style={planPrice}>$19<span style={planPeriod}>/mo</span></Text>
                      </div>
                      <div style={planFeatures}>
                        <Text style={planFeature}>✓ Unlimited AI requests</Text>
                        <Text style={planFeature}>✓ Advanced integrations</Text>
                        <Text style={planFeature}>✓ Priority support</Text>
                      </div>
                      <Button style={planButton} href={`${baseUrl}/upgrade?plan=pro`}>
                        Choose Pro
                      </Button>
                    </div>
                    
                    <div style={planCardAdvanced}>
                      <div style={popularBadge}>
                        <span style={popularText}>MOST POPULAR</span>
                      </div>
                      <div style={planCardHeader}>
                        <Text style={planNameAdvanced}>Advanced</Text>
                        <Text style={planPriceAdvanced}>$39<span style={planPeriod}>/mo</span></Text>
                      </div>
                      <div style={planFeatures}>
                        <Text style={planFeatureAdvanced}>✓ Everything in Pro</Text>
                        <Text style={planFeatureAdvanced}>✓ Custom AI Multi-tasks</Text>
                        <Text style={planFeatureAdvanced}>✓ Team collaboration</Text>
                        <Text style={planFeatureAdvanced}>✓ Analytics dashboard</Text>
                      </div>
                      <Button style={planButtonAdvanced} href={`${baseUrl}/upgrade?plan=advanced`}>
                        Choose Advanced
                      </Button>
                    </div>
                  </div>
                  
                  <Text style={upgradeFooter}>
                    🎯 <strong>Limited time:</strong> Use code <span style={promoCode}>WELCOME50</span> at checkout
                  </Text>
                </div>
              </Section>
            )}
  
            {/* Next Steps */}
            <Section style={stepsSection}>
              <div style={stepsCard}>
                <Text style={stepsTitle}>🎯 Your next steps:</Text>
                <div style={stepsList}>
                  <div style={stepItem}>
                    <span style={stepNumber}>1</span>
                    <div style={stepContent}>
                      <Text style={stepTitle}>Complete your profile</Text>
                      <Text style={stepDescription}>Help our AI understand your preferences</Text>
                    </div>
                  </div>
                  <div style={stepItem}>
                    <span style={stepNumber}>2</span>
                    <div style={stepContent}>
                      <Text style={stepTitle}>Connect your tools</Text>
                      <Text style={stepDescription}>Link your favorite apps by adding your api in the settings</Text>
                    </div>
                  </div>
                  <div style={stepItem}>
                    <span style={stepNumber}>3</span>
                    <div style={stepContent}>
                      <Text style={stepTitle}>Handle your first task</Text>
                      <Text style={stepDescription}>Watch the magic happen in real-time</Text>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
  
            <Hr style={divider} />
  
            {/* Footer */}
            <Section style={footerSection}>
              <Text style={footerText}>
                🤝 Questions? Our AI-powered support team is here to help 24/7
              </Text>
              <div style={footerLinks}>
                <Link href={`${baseUrl}/support`} style={footerLink}>Support Center</Link>
                <span style={footerSeparator}>•</span>
                <Link href={`${baseUrl}/docs`} style={footerLink}>Documentation</Link>
                <span style={footerSeparator}>•</span>
                <Link href={`${baseUrl}/community`} style={footerLink}>Community</Link>
              </div>
              <Text style={copyright}>
                © 2025 Jotium. Empowering productivity through AI.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default WelcomeEmail;
  
  // Styles
  const main = {
    backgroundColor: '#f8fafc',
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
    padding: '40px 0 30px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderRadius: '16px 16px 0 0',
    marginBottom: '0',
  };
  
  const logo = {
    marginBottom: '24px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
  };
  
  const welcomeBadge = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #20d4d4 0%, #1ab8b8 100%)',
    border: '1px solid rgba(32, 212, 212, 0.3)',
    borderRadius: '25px',
    padding: '10px 20px',
    boxShadow: '0 4px 12px rgba(32, 212, 212, 0.3)',
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
    padding: '0 0 40px',
  };
  
  const heroCard = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '40px 30px',
    textAlign: 'center' as const,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5)',
    position: 'relative' as const,
  };
  
  const heroHeading = {
    color: '#1a202c',
    fontSize: '32px',
    fontWeight: '800',
    margin: '0 0 20px 0',
    lineHeight: '1.2',
    background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };
  
  const heroText = {
    color: '#4a5568',
    fontSize: '17px',
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
    background: 'rgba(113, 128, 150, 0.1)',
    border: '1px solid rgba(113, 128, 150, 0.2)',
    borderRadius: '20px',
    padding: '10px 18px',
  };
  
  const planIcon = {
    fontSize: '16px',
  };
  
  const planText = {
    color: '#2d3748',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
  };
  
  const ctaSection = {
    textAlign: 'center' as const,
    marginBottom: '50px',
  };
  
  const primaryButton = {
    background: 'linear-gradient(135deg, #20d4d4 0%, #1ab8b8 100%)',
    borderRadius: '30px',
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px 36px',
    boxShadow: '0 12px 24px rgba(32, 212, 212, 0.4), 0 4px 8px rgba(0,0,0,0.1)',
    border: 'none',
    textTransform: 'none' as const,
    letterSpacing: '0.3px',
    transform: 'translateY(0)',
    transition: 'all 0.2s ease',
  };
  
  const buttonIcon = {
    fontSize: '18px',
  };
  
  const ctaSubtext = {
    color: '#718096',
    fontSize: '14px',
    margin: '16px 0 0 0',
    fontWeight: '500',
  };
  
  const featuresSection = {
    marginBottom: '50px',
  };
  
  const featuresTitle = {
    color: '#2d3748',
    fontSize: '20px',
    fontWeight: '700',
    textAlign: 'center' as const,
    margin: '0 0 30px 0',
  };
  
  const featureGrid = {
    display: 'flex',
    gap: '20px',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
  };
  
  const featureCard = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px 20px',
    textAlign: 'center' as const,
    flex: '1',
    minWidth: '160px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transform: 'translateY(0)',
    transition: 'transform 0.2s ease',
  };
  
  const featureIcon = {
    fontSize: '32px',
    marginBottom: '12px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
  };
  
  const featureCardTitle = {
    color: '#2d3748',
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  };
  
  const featureCardText = {
    color: '#718096',
    fontSize: '13px',
    margin: '0',
    lineHeight: '1.4',
  };
  
  const upgradeSection = {
    marginBottom: '50px',
  };
  
  const upgradeCard = {
    background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
    borderRadius: '20px',
    padding: '40px 30px',
    textAlign: 'center' as const,
    boxShadow: '0 20px 40px rgba(26, 32, 44, 0.3)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
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
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '800',
    margin: '0',
    lineHeight: '1.3',
  };
  
  const upgradeSubtitle = {
    color: '#cbd5e0',
    fontSize: '16px',
    margin: '0 0 35px 0',
    fontWeight: '500',
  };
  
  const plansContainer = {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap' as const,
  };
  
  const planCard = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '24px 20px',
    minWidth: '200px',
    flex: '1',
    maxWidth: '240px',
  };
  
  const planCardAdvanced = {
    background: 'linear-gradient(135deg, #20d4d4 0%, #1ab8b8 100%)',
    border: '2px solid #ffffff',
    borderRadius: '16px',
    padding: '24px 20px',
    minWidth: '200px',
    flex: '1',
    maxWidth: '240px',
    position: 'relative' as const,
    boxShadow: '0 12px 24px rgba(32, 212, 212, 0.4)',
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
    marginBottom: '20px',
  };
  
  const planName = {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  };
  
  const planNameAdvanced = {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  };
  
  const planPrice = {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '800',
    margin: '0',
  };
  
  const planPriceAdvanced = {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '800',
    margin: '0',
  };
  
  const planPeriod = {
    fontSize: '14px',
    fontWeight: '500',
    opacity: '0.8',
  };
  
  const planFeatures = {
    marginBottom: '24px',
  };
  
  const planFeature = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '13px',
    margin: '8px 0',
    textAlign: 'left' as const,
  };
  
  const planFeatureAdvanced = {
    color: '#ffffff',
    fontSize: '13px',
    margin: '8px 0',
    textAlign: 'left' as const,
    fontWeight: '500',
  };
  
  const planButton = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'block',
    padding: '12px 20px',
    textAlign: 'center' as const,
  };
  
  const planButtonAdvanced = {
    background: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    color: '#1ab8b8',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'block',
    padding: '12px 20px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  };
  
  const upgradeFooter = {
    color: '#e2e8f0',
    fontSize: '14px',
    margin: '0',
    fontWeight: '500',
  };
  
  const promoCode = {
    background: 'rgba(32, 212, 212, 0.2)',
    border: '1px solid rgba(32, 212, 212, 0.4)',
    borderRadius: '6px',
    padding: '4px 8px',
    fontFamily: 'monospace',
    fontSize: '13px',
    fontWeight: '700',
    color: '#20d4d4',
  };
  
  const stepsSection = {
    marginBottom: '50px',
  };
  
  const stepsCard = {
    background: 'rgba(113, 128, 150, 0.05)',
    border: '1px solid rgba(113, 128, 150, 0.1)',
    borderRadius: '16px',
    padding: '32px 28px',
  };
  
  const stepsTitle = {
    color: '#2d3748',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 24px 0',
    textAlign: 'center' as const,
  };
  
  const stepsList = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  };
  
  const stepItem = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  };
  
  const stepNumber = {
    background: 'linear-gradient(135deg, #20d4d4 0%, #1ab8b8 100%)',
    color: '#ffffff',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: '0',
    boxShadow: '0 4px 8px rgba(32, 212, 212, 0.3)',
  };
  
  const stepContent = {
    flex: '1',
  };
  
  const stepTitle = {
    color: '#2d3748',
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 0 6px 0',
  };
  
  const stepDescription = {
    color: '#718096',
    fontSize: '14px',
    margin: '0',
    lineHeight: '1.5',
  };
  
  const divider = {
    borderColor: '#e2e8f0',
    margin: '50px 0 40px 0',
  };
  
  const footerSection = {
    textAlign: 'center' as const,
  };
  
  const footerText = {
    color: '#718096',
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
    color: '#cbd5e0',
    fontSize: '12px',
  };
  
  const copyright = {
    color: '#a0aec0',
    fontSize: '12px',
    margin: '0',
    fontStyle: 'italic' as const,
  };
