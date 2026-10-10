'use client';

import React from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { ResourceCardSkeleton } from '@/components/ResourceCardSkeleton';

export default function SavedLoading() {
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
          <Skeleton width={260} height={32} radius={2} index={2} />
          <Skeleton width={380} height={18} radius={1} index={3} />
        </VStack>

        {/* Resources Grid Skeleton */}
        <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ResourceCardSkeleton key={i} index={i * 3 + 4} />
          ))}
        </Grid>
      </VStack>
    </div>
  );
}
