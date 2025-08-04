// scripts/test-email.ts
// Run with: npx tsx scripts/test-email.ts
// Make sure to install tsx: npm install -g tsx

import 'dotenv/config'; // Load environment variables

import { 
    sendWelcomeEmail, 
    sendSubscriptionReceiptEmail, 
    sendPasswordResetEmail,
    generateResetToken
  } from '../email-utils';
  
  async function testEmails() {
    console.log('🧪 Testing email sending...\n');
  
    const testEmail = 'treffbour@gmail.com'; // Change this to your email for testing
    
    try {
      // Test Welcome Email
      console.log('📧 Sending welcome email...');
      const welcomeResult = await sendWelcomeEmail({
        to: testEmail,
        firstName: 'Brett',
        lastName: 'Strugis',
        plan: 'Pro',
      });
      console.log('Welcome email result:', welcomeResult);
      console.log('');
  
      // Test Subscription Receipt Email  
      console.log('📧 Sending subscription receipt email...');
      const receiptResult = await sendSubscriptionReceiptEmail({
        to: testEmail,
        firstName: 'John',
        lastName: 'Doe',
        plan: 'Pro',
        amount: '29.99',
        currency: 'USD',
        subscriptionId: 'sub_1234567890',
        invoiceId: 'in_1234567890',
        billingDate: new Date().toLocaleDateString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        paymentMethod: '•••• 4242',
      });
      console.log('Receipt email result:', receiptResult);
      console.log('');
  
      // Test Password Reset Email
      console.log('📧 Sending password reset email...');
      const resetToken = generateResetToken();
      const resetResult = await sendPasswordResetEmail({
        to: testEmail,
        firstName: 'John',
        lastName: 'Doe',
        resetToken,
      });
      console.log('Reset email result:', resetResult);
      console.log('');
  
      console.log('✅ Email testing completed!');
      
    } catch (error) {
      console.error('❌ Email testing failed:', error);
    }
  }
  
  // Run the test
  testEmails();
