'use client';

import React from 'react';
import Link from 'next/link';
import { SyllabiLogo } from '@/components/SyllabiLogo';
import { Center } from '@astryxdesign/core/Center';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';

export default function NotFound() {
  return (
    <Center padding={8} style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <Card padding={6} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
          <VStack gap={4} hAlign="center">
            <SyllabiLogo size="lg" />
            <VStack gap={1}>
              <Heading level={1} style={{ fontSize: '2rem' }}>
                404 — Page Not Found
              </Heading>
              <Text type="body" color="secondary">
                The study guide, collection, or student profile you requested doesn&apos;t exist or may have been renamed.
              </Text>
            </VStack>
            <HStack gap={3} justify="center">
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" label="Go Home" />
              </Link>
              <Link href="/explore" style={{ textDecoration: 'none' }}>
                <Button variant="primary" label="Browse Resources" />
              </Link>
            </HStack>
          </VStack>
        </Card>
      </div>
    </Center>
  );
}

