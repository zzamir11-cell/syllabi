'use client';

import React from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Card } from '@astryxdesign/core/Card';
import { Divider } from '@astryxdesign/core/Divider';

export default function SafetyPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--spacing-8) var(--spacing-4)' }}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={1} style={{ fontSize: '2.25rem', letterSpacing: '-0.02em' }}>
            Student Safety & Online Protection
          </Heading>
          <Text type="supporting" color="secondary">
            Our framework for minor privacy, content moderation, and UK Online Safety standards.
          </Text>
        </VStack>

        <Card padding={6} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)', lineHeight: 1.7 }}>
          <VStack gap={6}>
            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                1. Safety by Design for Teenagers
              </Heading>
              <Text type="body" color="secondary">
                Syllabi is intentionally built as an academic library rather than an open social network. By eliminating vanity metrics, unmoderated direct messaging, and invasive user profiling, we create a calm, focused environment free from social pressures.
              </Text>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                2. UK Online Safety Framework
              </Heading>
              <Text type="body" color="secondary">
                In line with the UK Online Safety Act and age-appropriate design principles, Syllabi employs proactive safeguards:
              </Text>
              <ul style={{ paddingLeft: 24, margin: '8px 0', color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                <li><strong>No Public Private Data:</strong> Student email addresses, real names, and location information are never exposed in client payloads or public URLs.</li>
                <li><strong>Clear Report Actions:</strong> Every resource, profile, and request includes a prominent 1-click reporting dialog.</li>
                <li><strong>Human Moderation Queue:</strong> Flagged content is evaluated by human moderators who can remove files and ban accounts instantly.</li>
                <li><strong>Safe File Handling:</strong> Uploaded resources are stored safely in isolated buckets and previewed in sandboxed readers to prevent executable code execution.</li>
              </ul>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                3. Escalation & Law Enforcement Inquiries
              </Heading>
              <Text type="body" color="secondary">
                Any threats to student safety, child exploitation material, or severe harm are reported immediately to the appropriate authorities, including CEOP and UK law enforcement.
              </Text>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                4. Advice for Parents and Educators
              </Heading>
              <Text type="body" color="secondary">
                Parents and teachers with questions regarding student accounts or safety policies may reach our safety officer at: <strong>safety@syllabi.app</strong>.
              </Text>
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </div>
  );
}

