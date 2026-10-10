'use client';

import React from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { ResourceCardSkeleton } from '@/components/ResourceCardSkeleton';

export default function ExploreLoading() {
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
          <Skeleton width={120} height={16} radius="rounded" index={1} />
          <Skeleton width={320} height={32} radius={2} index={2} />
          <Skeleton width={480} height={18} radius={1} index={3} />
        </VStack>

        {/* Search Input Skeleton */}
        <Skeleton width="100%" height={44} radius={2} index={4} />

        {/* Filter Bar Skeleton */}
        <HStack gap={2} wrap="wrap" vAlign="center">
          <Skeleton width={110} height={34} radius={2} index={5} />
          <Skeleton width={110} height={34} radius={2} index={6} />
          <Skeleton width={130} height={34} radius={2} index={7} />
          <Skeleton width={120} height={34} radius={2} index={8} />
          <Skeleton width={120} height={34} radius={2} index={9} />
        </HStack>

        {/* Resource Grid Skeleton */}
        <VStack gap={4}>
          <HStack justify="between" vAlign="center">
            <Skeleton width={140} height={20} radius={1} index={10} />
            <Skeleton width={80} height={16} radius={1} index={11} />
          </HStack>

          <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ResourceCardSkeleton key={i} index={i * 3 + 12} />
            ))}
          </Grid>
        </VStack>
      </VStack>
    </div>
  );
}
