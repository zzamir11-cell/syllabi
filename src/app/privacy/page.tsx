'use client';

import React from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Card } from '@astryxdesign/core/Card';
import { Divider } from '@astryxdesign/core/Divider';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--spacing-8) var(--spacing-4)' }}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={1} style={{ fontSize: '2.25rem', letterSpacing: '-0.02em' }}>
            Privacy Policy
          </Heading>
          <Text type="supporting" color="secondary">
            Last updated: October 4, 2026. Designed in compliance with the UK GDPR and Data Protection Act 2018.
          </Text>
        </VStack>

        <Card padding={6} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)', lineHeight: 1.7 }}>
          <VStack gap={6}>
            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                1. Data Protection Overview & Principles
              </Heading>
              <Text type="body" color="secondary">
                At Syllabi, we believe student privacy is fundamental. We collect only the minimum data necessary to operate a resource-sharing platform. We do not sell student data, we do not require real names, and we do not profile students for behavioral advertising.
              </Text>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                2. Information We Collect
              </Heading>
              <ul style={{ paddingLeft: 24, margin: '8px 0', color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                <li><strong>Account Data:</strong> Username (pseudonym), email address, and hashed authentication credentials.</li>
                <li><strong>Academic Profile (Optional):</strong> Qualification (e.g. GCSE or A-Level), exam boards, subjects studied, target grades, and bio.</li>
                <li><strong>User-Generated Content:</strong> Academic notes, revision guides, mind maps, essay plans, and document metadata uploaded by you.</li>
                <li><strong>Engagement Records:</strong> Saved resource bookmarks, public/private collections, ratings, and download logs.</li>
                <li><strong>Technical & Security Telemetry:</strong> Anonymized IP hashes (for rate-limiting download abuse and view manipulation prevention) and essential session cookies.</li>
              </ul>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                3. Legal Bases for Processing (UK / EU GDPR)
              </Heading>
              <Text type="body" color="secondary">
                We process your personal data under the following legal bases:
              </Text>
              <ul style={{ paddingLeft: 24, margin: '8px 0', color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                <li><strong>Performance of a Contract:</strong> Providing authentication, resource saving, document hosting, and platform functionality.</li>
                <li><strong>Legitimate Interests:</strong> Preventing fraud, detecting copyright infringement, rate-limiting downloads, and maintaining server security.</li>
                <li><strong>Consent:</strong> Non-essential analytics and performance measurement cookies (which you can manage via our Cookie Preference center).</li>
              </ul>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                4. Third-Party Service Providers
              </Heading>
              <Text type="body" color="secondary">
                We partner with trusted infrastructure providers that adhere to rigorous data security standards:
              </Text>
              <ul style={{ paddingLeft: 24, margin: '8px 0', color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                <li><strong>Supabase Inc.:</strong> Cloud PostgreSQL database, user authentication, and secure encrypted file storage.</li>
                <li><strong>Vercel Inc.:</strong> Application edge hosting and content delivery network (CDN).</li>
              </ul>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                5. Minor Safety & Children&apos;s Privacy
              </Heading>
              <Text type="body" color="secondary">
                Because many GCSE and A-Level students are between 14 and 18 years of age, Syllabi is designed specifically to protect minors:
              </Text>
              <ul style={{ paddingLeft: 24, margin: '8px 0', color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                <li>We do not publish email addresses or real names.</li>
                <li>Direct messaging between students is disabled by default to prevent unwanted contact.</li>
                <li>No exact location data, home address, or school names are collected or displayed.</li>
                <li>Users under 13 must not create an account without parental or guardian consent where required by local law.</li>
              </ul>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                6. Your Rights & Account Deletion
              </Heading>
              <Text type="body" color="secondary">
                Under applicable data protection laws (including UK GDPR), you have the right to access, rectify, port, or erase your personal data. You can delete your resources or request full account deletion at any time by contacting privacy@syllabi.app.
              </Text>
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </div>
  );
}

