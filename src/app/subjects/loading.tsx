'use client';

import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Skeleton } from '@astryxdesign/core/Skeleton';

export default function SubjectsLoading() {
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
        <VStack gap={2}>
          <Skeleton width={140} height={16} radius="rounded" index={1} />
          <Skeleton width={320} height={32} radius={2} index={2} />
          <Skeleton width={440} height={18} radius={1} index={3} />
        </VStack>

        {/* Filter Pills Skeleton */}
        <HStack gap={2}>
          <Skeleton width={100} height={32} radius="rounded" index={4} />
          <Skeleton width={80} height={32} radius="rounded" index={5} />
          <Skeleton width={90} height={32} radius="rounded" index={6} />
        </HStack>

        {/* Subjects Grid Skeleton */}
        <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
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
                  <Skeleton width={120} height={20} radius={2} index={i * 3 + 7} />
                  <Skeleton width={60} height={18} radius="rounded" index={i * 3 + 8} />
                </HStack>
                <Skeleton width="85%" height={14} radius={1} index={i * 3 + 9} />
                <HStack gap={2} style={{ marginTop: 'var(--spacing-1)' }}>
                  <Skeleton width={50} height={18} radius="rounded" index={i * 3 + 10} />
                  <Skeleton width={50} height={18} radius="rounded" index={i * 3 + 11} />
                </HStack>
              </VStack>
            </Card>
          ))}
        </Grid>
      </VStack>
    </div>
  );
}
