"use client";

import { ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from '@/components/ui/button';

const PrivacyPolicyPage = () => {
  const router = useRouter();

  return (
    <main className="max-w-3xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <Button
        variant="outline"
        size="sm"
        className="my-4 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Introduction</h2>
      <p>
        Welcome to Jotium (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We are dedicated to protecting your privacy and ensuring transparency about how your information is handled. This Privacy Policy describes in detail the types of information we collect, how we use and protect it, your rights, and how you can exercise those rights. By using Jotium, you agree to the practices described in this policy.
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
      <ul className="list-disc pl-6">
        <li><b>Personal Information:</b> Includes your name, email address, account credentials, profile photo, and any other identifiers you provide during registration or use of our services.</li>
        <li><b>Usage Data:</b> Information about how you interact with Jotium, such as device and browser type, IP address, access times, pages viewed, referring URLs, and diagnostic logs. We may use cookies and similar technologies to collect this data.</li>
        <li><b>Content Data:</b> Any content you submit, upload, or generate on Jotium, including chat history, files, documents, images, and tool usage data.</li>
        <li><b>Third-Party Data:</b> Information obtained from integrations you authorize (e.g., Slack, GitHub, ClickUp), including profile data, messages, files, and activity logs, as permitted by your settings with those services.</li>
        <li><b>Payment Information:</b> If you make purchases, we may collect payment details via our payment processors. We do not store full credit card numbers on our servers.</li>
      </ul>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">How We Use Your Information</h2>
      <ul className="list-disc pl-6">
        <li>To provide, operate, and maintain Jotium and its features.</li>
        <li>To authenticate users and manage accounts securely.</li>
        <li>To personalize your experience and deliver relevant content and features.</li>
        <li>To analyze usage trends, monitor performance, and improve our platform.</li>
        <li>To communicate with you regarding support, updates, security alerts, and marketing (with your consent).</li>
        <li>To process transactions and manage billing.</li>
        <li>To enforce our Terms of Service and protect the rights, property, or safety of Jotium, our users, or others.</li>
        <li>To comply with legal obligations and respond to lawful requests from authorities.</li>
      </ul>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Legal Bases for Processing (GDPR)</h2>
      <p>
        If you are located in the European Economic Area (EEA), we process your personal data under the following legal bases: your consent, performance of a contract, compliance with legal obligations, and our legitimate interests (such as improving our services and ensuring security).
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Data Sharing and Disclosure</h2>
      <ul className="list-disc pl-6">
        <li><b>Service Providers:</b> We may share your data with trusted vendors who assist us in operating Jotium, such as cloud hosting, analytics, customer support, and payment processing. These providers are contractually obligated to protect your data and use it only for specified purposes.</li>
        <li><b>Third-Party Integrations:</b> Data is shared with third-party services (e.g., Slack, GitHub) only when you explicitly authorize such integrations. You control what is shared and can revoke access at any time.</li>
        <li><b>Legal Requirements:</b> We may disclose your information if required by law, regulation, legal process, or governmental request, or to protect the rights, property, or safety of Jotium, our users, or others.</li>
        <li><b>Business Transfers:</b> In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control.
        </li>
      </ul>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Data Retention</h2>
      <p>
        We retain your personal data only as long as necessary to fulfill the purposes described in this policy, comply with our legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your data, subject to certain exceptions (e.g., legal requirements).
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Your Rights and Choices</h2>
      <ul className="list-disc pl-6">
        <li>Request access to, correction of, or deletion of your personal data.</li>
        <li>Request data portability in a structured, machine-readable format.</li>
        <li>Object to or restrict certain processing of your data.</li>
        <li>Opt out of marketing communications at any time.</li>
        <li>Withdraw consent for integrations or specific data uses.</li>
        <li>Lodge a complaint with a data protection authority if you believe your rights have been violated.</li>
      </ul>
      <p>
        To exercise your rights, please contact us using the information below. We may need to verify your identity before fulfilling your request.
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Security</h2>
      <p>
        We implement industry-standard security measures to protect your data, including encryption in transit and at rest, access controls, regular security audits, and employee training. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">International Data Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, such as Standard Contractual Clauses or other lawful mechanisms, to protect your data when transferred internationally.
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Children’s Privacy</h2>
      <p>
        Jotium is not intended for children under 13 (or 16 where applicable). We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will take steps to delete such information promptly.
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of significant changes by email, in-app notice, or other appropriate means. Please review this policy periodically for updates.
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
      <p>
        If you have questions, requests, or concerns regarding this Privacy Policy or our data practices, please contact us at <a href="mailto:support@jotium.com" className="text-blue-600 underline">support@jotium.com</a>.
      </p>
    </section>
  </main>
  );
};

export default PrivacyPolicyPage;
