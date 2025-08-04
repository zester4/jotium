import { Text } from '@react-email/components'; 
import { render } from '@react-email/render';
import * as React from 'react';

import { PasswordResetEmail } from '../../../components/emails/password-reset-email';
import { SubscriptionReceiptEmail } from '../../../components/emails/subscription-receipt-email';
import { WelcomeEmail } from '../../../components/emails/welcome-email';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template');

  let emailHtml = '';

  switch (template) {
    case 'welcome-email':
      emailHtml = await render(<WelcomeEmail to="john.doe@example.com" firstName="John" lastName="Doe" plan="Pro" />);
      break;
    case 'subscription-receipt-email':
      emailHtml = await render(<SubscriptionReceiptEmail to="john.doe@example.com" firstName="John" lastName="Doe" plan="Pro" amount="29.99" currency="USD" />);
      break;
    case 'password-reset-email':
      emailHtml = await render(<PasswordResetEmail to="john.doe@example.com" firstName="John" lastName="Doe" resetToken="12345" />);
      break;
    default:
      emailHtml = await render(<Text>Select an email template from the dropdown.</Text>);
  }

  return new Response(emailHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
