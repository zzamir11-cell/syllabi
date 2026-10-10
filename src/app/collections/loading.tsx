'use client';

import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Skeleton } from '@astryxdesign/core/Skeleton';

export default function CollectionsLoading() {
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
            <Skeleton width={280} height={32} radius={2} index={2} />
            <Skeleton width={420} height={18} radius={1} index={3} />
          </VStack>
          <Skeleton width={140} height={40} radius={2} index={4} />
        </HStack>

        {/* Collections Grid Skeleton */}
        <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              padding={4}
              elevation="none"
              style={{
                backgroundColor: 'var(--color-background-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-container)',
                minHeight: 200,
              }}
            >
              <VStack gap={3} justify="between" style={{ height: '100%' }}>
                <VStack gap={2}>
                  <HStack justify="between" vAlign="center">
                    <Skeleton width={80} height={20} radius="rounded" index={i * 3 + 5} />
                    <Skeleton width={50} height={20} radius="rounded" index={i * 3 + 6} />
                  </HStack>
                  <Skeleton width="90%" height={20} radius={2} index={i * 3 + 7} />
                  <Skeleton width="75%" height={14} radius={1} index={i * 3 + 8} />
                </VStack>
                <HStack justify="between" vAlign="center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-2)' }}>
                  <Skeleton width={70} height={14} radius={1} index={i * 3 + 9} />
                  <Skeleton width={60} height={14} radius={1} index={i * 3 + 10} />
                </HStack>
              </VStack>
            </Card>
          ))}
        </Grid>
      </VStack>
    </div>
  );
}
