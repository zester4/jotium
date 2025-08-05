// scripts/test-email.ts
// Run with: npx tsx scripts/test-email.ts
// Make sure to install tsx: npm install -g tsx

import 'dotenv/config'; // Load environment variables
import * as readline from 'readline';

import { 
    sendWelcomeEmail, 
    sendSubscriptionReceiptEmail, 
    sendPasswordResetEmail,
    generateResetToken
  } from '../email-utils';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
  
async function testEmails() {
    console.log('🧪 Testing email sending...\n');

    const testEmail = 'bajahev587@foboxs.com'; // Change this to your email for testing

    const menu = () => {
        console.log('Choose an email to send:');
        console.log('1. Welcome Email');
        console.log('2. Subscription Receipt Email');
        console.log('3. Password Reset Email');
        console.log('4. Exit');
    };

    const sendEmailChoice = async (choice: string) => {
        try {
            switch (choice) {
                case '1':
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
                    break;
                case '2':
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
                    break;
                case '3':
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
                    break;
                case '4':
                    console.log('👋 Exiting...');
                    rl.close();
                    return;
                default:
                    console.log('Invalid choice. Please try again.');
                    break;
            }
        } catch (error) {
            console.error('❌ Email sending failed:', error);
        }

        if (choice !== '4') {
            promptForChoice();
        }
    };

    const promptForChoice = () => {
        menu();
        rl.question('Enter your choice: ', (choice) => {
            sendEmailChoice(choice);
        });
    };

    promptForChoice();
}
  
// Run the test
testEmails();
