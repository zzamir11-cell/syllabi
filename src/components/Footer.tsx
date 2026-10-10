'use client';

import React from 'react';
import Link from 'next/link';
import { SyllabiLogo } from './SyllabiLogo';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Divider } from '@astryxdesign/core/Divider';

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-background-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--spacing-8) var(--spacing-4)',
        marginTop: 'var(--spacing-12)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <VStack gap={6}>
          <HStack gap={6} justify="between" vAlign="start" wrap="wrap">
            <VStack gap={2} style={{ maxWidth: 380 }}>
              <SyllabiLogo size="md" />
              <Text type="body" color="secondary" size="sm">
                Study resources, made by students. Discover notes, revision guides, mind maps, and essay frameworks created by students studying the same subjects as you.
              </Text>
            </VStack>

            {/* Links Columns */}
            <HStack gap={8} wrap="wrap">
              {/* Product */}
              <VStack gap={2}>
                <Text type="label" weight="semibold">
                  Platform
                </Text>
                <Link href="/explore" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Explore Resources
                </Link>
                <Link href="/subjects" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Browse Subjects
                </Link>
                <Link href="/collections" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Student Collections
                </Link>
                <Link href="/requests" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Resource Requests
                </Link>
                <Link href="/upload" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Upload a Resource
                </Link>
              </VStack>

              {/* Safety & Honor */}
              <VStack gap={2}>
                <Text type="label" weight="semibold">
                  Safety & Integrity
                </Text>
                <Link href="/safety" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Student Safety
                </Link>
                <Link href="/community-guidelines" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Honor & Guidelines
                </Link>
                <Link href="/copyright" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Copyright & Takedown
                </Link>
                <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Moderation Console
                </Link>
              </VStack>

              {/* Legal */}
              <VStack gap={2}>
                <Text type="label" weight="semibold">
                  Legal & Privacy
                </Text>
                <Link href="/terms" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Terms of Service
                </Link>
                <Link href="/privacy" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Privacy Policy
                </Link>
                <Link href="/cookies" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Cookie Policy
                </Link>
                <Link href="/contact" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Contact & Support
                </Link>
              </VStack>
            </HStack>
          </HStack>

          <Divider />

          {/* Educational Disclaimer (Section 23 & 56) */}
          <VStack gap={2}>
            <Text type="supporting" color="secondary" size="xsm">
              <strong>Educational Disclaimer:</strong> Resources hosted on Syllabi are student-created study materials uploaded by independent contributors. Syllabi does not guarantee that user-submitted resources are accurate, complete, current, or aligned with an official examination specification. Syllabi is an independent platform and is not affiliated with, endorsed by, or approved by AQA, Pearson Edexcel, OCR, WJEC Eduqas, CCEA, Cambridge International, or any other examination board.
            </Text>
            <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
              <Text type="supporting" color="secondary" size="xsm">
                © {new Date().getFullYear()} Syllabi. All rights reserved.
              </Text>
              <Text type="supporting" color="secondary" size="xsm">
                Academic resource community for students.
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </div>
    </footer>
  );
}

