'use client';

import React from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { ResourceCardSkeleton } from '@/components/ResourceCardSkeleton';

export default function Loading() {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 'var(--spacing-8) var(--spacing-4)',
        width: '100%',
      }}
    >
      <VStack gap={8}>
        {/* Hero Section Skeleton */}
        <VStack gap={4} align="center" style={{ textAlign: 'center', padding: 'var(--spacing-6) 0' }}>
          <Skeleton width={180} height={24} radius="rounded" index={1} />
          <Skeleton width="60%" height={38} radius={2} index={2} />
          <Skeleton width="45%" height={20} radius={1} index={3} />
          <div style={{ width: '100%', maxWidth: 640, marginTop: 'var(--spacing-2)' }}>
            <Skeleton width="100%" height={48} radius="rounded" index={4} />
          </div>
        </VStack>

        {/* Resources Grid Skeleton */}
        <VStack gap={4}>
          <HStack justify="between" vAlign="center">
            <Skeleton width={160} height={24} radius={1} index={5} />
            <Skeleton width={100} height={20} radius="rounded" index={6} />
          </HStack>

          <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ResourceCardSkeleton key={i} index={i * 3 + 7} />
            ))}
          </Grid>
        </VStack>
      </VStack>
    </div>
  );
}
