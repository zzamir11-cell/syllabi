'use client';

import React from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Card } from '@astryxdesign/core/Card';
import { Divider } from '@astryxdesign/core/Divider';

export default function CommunityGuidelinesPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--spacing-8) var(--spacing-4)' }}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={1} style={{ fontSize: '2.25rem', letterSpacing: '-0.02em' }}>
            Community Guidelines & Honor Code
          </Heading>
          <Text type="supporting" color="secondary">
            Standards for creating a trusted, supportive, and respectful student study environment.
          </Text>
        </VStack>

        <Card padding={6} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)', lineHeight: 1.7 }}>
          <VStack gap={6}>
            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                1. The Syllabi Honor Code
              </Heading>
              <Text type="body" color="secondary">
                Syllabi was built to help students collaborate ethically. When students create summaries, mind maps, and flashcards in their own words, everyone benefits. We hold our community to the highest standards of academic integrity.
              </Text>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                2. What to Share
              </Heading>
              <ul style={{ paddingLeft: 24, margin: '8px 0', color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                <li><strong>Original Revision Notes:</strong> Your handwritten or typed notes explaining concepts in your own phrasing.</li>
                <li><strong>Mind Maps & Concept Diagrams:</strong> Visual overviews of complex topics like biological cycles or chemical processes.</li>
                <li><strong>Formula & Definition Sheets:</strong> Condensed reference summaries of key equations and derivations.</li>
                <li><strong>Essay Frameworks & Plans:</strong> Analytical structures, thesis arguments, and historical context banks.</li>
              </ul>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                3. What Is Never Allowed
              </Heading>
              <ul style={{ paddingLeft: 24, margin: '8px 0', color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                <li>Live, active, or upcoming assessment papers or exam answers.</li>
                <li>Commercial textbook PDFs or copyrighted teacher slide decks.</li>
                <li>Hate speech, bullying, harassment, or personal insults in descriptions or comments.</li>
                <li>Commercial spam, cryptocurrency promotion, or external non-academic links.</li>
              </ul>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                4. Enforcement
              </Heading>
              <Text type="body" color="secondary">
                Our student and staff moderators review all reported materials. Violating these guidelines will lead to resource deletion and permanent suspension of platform access.
              </Text>
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </div>
  );
}

