"use client";

import { ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from '@/components/ui/button';

const TermsOfServicePage = () => {
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
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Acceptance of Terms</h2>
      <p>
        By accessing or using Jotium, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these Terms, do not use Jotium.
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Description of Service</h2>
      <p>
        Jotium is an AI assistant platform that provides productivity, automation, and research capabilities through a conversational interface and user authorized integrations. The Service is intended for users who are at least 13 years old or 16 where applicable and have the legal capacity to enter into binding agreements.
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">User Accounts</h2>
      <ul className="list-disc pl-6">
        <li>You must provide accurate, current, and complete information during registration and keep your account information updated.</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
        <li>Notify us immediately of any unauthorized use or security breach of your account.</li>
        <li>We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, abusive, or unlawful activity.</li>
      </ul>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Acceptable Use</h2>
      <ul className="list-disc pl-6">
        <li>Do not use Jotium for any unlawful, harmful, or abusive purpose, including but not limited to harassment, spamming, or distributing malware.</li>
        <li>Do not attempt to gain unauthorized access to any part of the Service, other accounts, or computer systems.</li>
        <li>Do not reverse engineer, decompile, or attempt to extract the source code of Jotium.</li>
        <li>Do not use the Service for high-risk activities where failure could result in harm or damage.</li>
        <li>Do not infringe on the intellectual property or privacy rights of others.</li>
      </ul>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">User Content</h2>
      <ul className="list-disc pl-6">
        <li>You retain ownership of all content you submit, upload, or generate through Jotium.</li>
        <li>By using the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, process, store, display, and transmit your content as necessary to operate and improve Jotium.</li>
        <li>You are solely responsible for the legality, reliability, and appropriateness of your content.</li>
        <li>We reserve the right to remove or restrict content that violates these Terms or applicable law.</li>
      </ul>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Third-Party Services</h2>
      <ul className="list-disc pl-6">
        <li>Jotium may integrate with third party services at your request. Your use of these integrations is subject to the terms and privacy policies of those third parties.</li>
        <li>We are not responsible for the content, functionality, or security of third-party services.</li>
        <li>Any data shared with third-party services is at your discretion and risk.</li>
      </ul>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Intellectual Property</h2>
      <ul className="list-disc pl-6">
        <li>All rights, title, and interest in Jotium, including its software, design, trademarks, and content (excluding user content), are owned by us or our licensors.</li>
        <li>You may not copy, modify, distribute, sell, or lease any part of Jotium without our prior written consent.</li>
        <li>Any feedback or suggestions you provide may be used by us without obligation or compensation to you.</li>
      </ul>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Termination</h2>
      <ul className="list-disc pl-6">
        <li>We may suspend or terminate your access to Jotium at any time, with or without notice, for conduct that we believe violates these Terms or is otherwise harmful to the Service or users.</li>
        <li>You may terminate your account at any time by contacting support or using available account deletion features.</li>
        <li>Upon termination, your right to use Jotium will immediately cease, but certain provisions (e.g., intellectual property, disclaimers, limitation of liability) will survive.</li>
      </ul>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Disclaimers and Limitation of Liability</h2>
      <ul className="list-disc pl-6">
        <li>Jotium is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied.</li>
        <li>We do not guarantee that the Service will be uninterrupted, error-free, or secure.</li>
        <li>To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of Jotium.</li>
        <li>Our total liability for any claim related to the Service will not exceed the amount you paid us (if any) in the past 12 months.</li>
      </ul>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless Jotium, its affiliates, officers, employees, and agents from any claims, damages, liabilities, costs, or expenses arising from your use of the Service or violation of these Terms.
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Modifications to Service or Terms</h2>
      <p>
        We reserve the right to modify or discontinue Jotium or these Terms at any time. We will notify you of significant changes by email, in app notice, or other appropriate means. Continued use of the Service after changes constitutes acceptance of the updated Terms.
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Governing Law and Dispute Resolution</h2>
      <p>
        These Terms are governed by the laws of your jurisdiction. Any disputes arising from these Terms or your use of Jotium will be resolved through binding arbitration or courts, as applicable, in accordance with local law.
      </p>
    </section>
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
      <p>
        For questions, legal notices, or support, please contact us at <a href="mailto:support@jotium.com" className="text-blue-600 underline">support@jotium.com</a>.
      </p>
    </section>
  </main>
  );
};

export default TermsOfServicePage;
