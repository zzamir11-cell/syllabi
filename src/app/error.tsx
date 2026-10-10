'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Center } from '@astryxdesign/core/Center';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <Center padding={8} style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <Card padding={6} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
          <VStack gap={4} hAlign="center">
            <VStack gap={1}>
              <Heading level={1} style={{ fontSize: '1.75rem' }}>
                Something went wrong
              </Heading>
              <Text type="body" color="secondary">
                We encountered an unexpected issue while loading this page.
              </Text>
            </VStack>
            <HStack gap={3} justify="center">
              <Button variant="primary" label="Try Again" onClick={() => reset()} />
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" label="Go Home" />
              </Link>
            </HStack>
          </VStack>
        </Card>
      </div>
    </Center>
  );
}

