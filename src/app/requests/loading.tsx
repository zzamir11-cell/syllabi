'use client';

import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Skeleton } from '@astryxdesign/core/Skeleton';

export default function RequestsLoading() {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 'var(--spacing-6) var(--spacing-4)',
        width: '100%',
      }}
    >
      <VStack gap={6}>
        {/* Header Skeleton */}
        <HStack justify="between" vAlign="center" wrap="wrap" gap={3}>
          <VStack gap={2}>
            <Skeleton width={140} height={16} radius="rounded" index={1} />
            <Skeleton width={300} height={32} radius={2} index={2} />
            <Skeleton width={440} height={18} radius={1} index={3} />
          </VStack>
          <Skeleton width={140} height={40} radius={2} index={4} />
        </HStack>

        {/* Filter Buttons Skeleton */}
        <HStack gap={2}>
          <Skeleton width={80} height={32} radius={2} index={5} />
          <Skeleton width={80} height={32} radius={2} index={6} />
          <Skeleton width={80} height={32} radius={2} index={7} />
        </HStack>

        {/* Request Cards Skeleton */}
        <VStack gap={3}>
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              padding={4}
              elevation="none"
              style={{
                backgroundColor: 'var(--color-background-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-container)',
              }}
            >
              <VStack gap={3}>
                <HStack justify="between" vAlign="center">
                  <HStack gap={2} vAlign="center">
                    <Skeleton width={70} height={22} radius="rounded" index={i * 4 + 8} />
                    <Skeleton width={60} height={22} radius="rounded" index={i * 4 + 9} />
                    <Skeleton width={90} height={22} radius="rounded" index={i * 4 + 10} />
                  </HStack>
                  <Skeleton width={80} height={20} radius="rounded" index={i * 4 + 11} />
                </HStack>
                <Skeleton width="70%" height={22} radius={2} index={i * 4 + 12} />
                <Skeleton width="90%" height={16} radius={1} index={i * 4 + 13} />
                <HStack justify="between" vAlign="center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-2)' }}>
                  <Skeleton width={120} height={14} radius={1} index={i * 4 + 14} />
                  <Skeleton width={110} height={30} radius={2} index={i * 4 + 15} />
                </HStack>
              </VStack>
            </Card>
          ))}
        </VStack>
      </VStack>
    </div>
  );
}
