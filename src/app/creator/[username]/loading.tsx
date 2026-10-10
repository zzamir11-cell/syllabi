'use client';

import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { ResourceCardSkeleton } from '@/components/ResourceCardSkeleton';

export default function CreatorLoading() {
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
        {/* Profile Card Skeleton */}
        <Card
          padding={5}
          elevation="none"
          style={{
            backgroundColor: 'var(--color-background-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-container)',
          }}
        >
          <VStack gap={4}>
            <HStack gap={4} vAlign="start" wrap="wrap">
              <Skeleton width={88} height={88} radius="rounded" index={1} />
              <VStack gap={2} style={{ flex: 1, minWidth: 260 }}>
                <HStack gap={2} vAlign="center">
                  <Skeleton width={180} height={28} radius={2} index={2} />
                  <Skeleton width={90} height={20} radius="rounded" index={3} />
                </HStack>
                <Skeleton width={130} height={16} radius={1} index={4} />
                <Skeleton width="90%" height={16} radius={1} index={5} />
                <Skeleton width="60%" height={16} radius={1} index={6} />
              </VStack>
            </HStack>

            {/* Stats Row Skeleton */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-3)' }}>
              <Grid columns={{ minWidth: 140, repeat: 'fit' }} gap={3}>
                {[1, 2, 3, 4].map((i) => (
                  <Card
                    key={i}
                    padding={3}
                    elevation="none"
                    style={{
                      backgroundColor: 'var(--color-background-muted)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-element)',
                    }}
                  >
                    <VStack gap={1}>
                      <Skeleton width={50} height={24} radius={1} index={i + 7} />
                      <Skeleton width={70} height={12} radius={1} index={i + 11} />
                    </VStack>
                  </Card>
                ))}
              </Grid>
            </div>
          </VStack>
        </Card>

        {/* Tabs Skeleton */}
        <HStack gap={2}>
          <Skeleton width={120} height={36} radius={2} index={16} />
          <Skeleton width={120} height={36} radius={2} index={17} />
          <Skeleton width={120} height={36} radius={2} index={18} />
        </HStack>

        {/* Resources Grid Skeleton */}
        <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ResourceCardSkeleton key={i} index={i * 3 + 19} />
          ))}
        </Grid>
      </VStack>
    </div>
  );
}
