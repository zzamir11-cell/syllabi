'use client';

import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { ResourceCardSkeleton } from '@/components/ResourceCardSkeleton';

export default function YourSubjectsLoading() {
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

        {/* Subjects horizontal selector skeleton */}
        <HStack gap={2} wrap="wrap">
          <Skeleton width={130} height={38} radius="rounded" index={4} />
          <Skeleton width={120} height={38} radius="rounded" index={5} />
          <Skeleton width={140} height={38} radius="rounded" index={6} />
          <Skeleton width={110} height={38} radius="rounded" index={7} />
        </HStack>

        {/* Subject Overview Banner Skeleton */}
        <Card
          padding={4}
          elevation="none"
          style={{
            backgroundColor: 'var(--color-background-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-container)',
          }}
        >
          <VStack gap={2}>
            <Skeleton width={180} height={24} radius={2} index={8} />
            <Skeleton width="60%" height={16} radius={1} index={9} />
          </VStack>
        </Card>

        {/* Resources Grid Skeleton */}
        <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ResourceCardSkeleton key={i} index={i * 3 + 10} />
          ))}
        </Grid>
      </VStack>
    </div>
  );
}
