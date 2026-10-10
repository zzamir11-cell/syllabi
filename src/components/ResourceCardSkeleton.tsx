'use client';

import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Skeleton } from '@astryxdesign/core/Skeleton';

export function ResourceCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <Card
      padding={3}
      elevation="none"
      style={{
        backgroundColor: 'var(--color-background-surface)',
        borderRadius: 'var(--radius-container)',
        border: '1px solid var(--color-border)',
        height: '100%',
        minHeight: 220,
      }}
    >
      <VStack gap={3} justify="between" style={{ height: '100%' }}>
        <VStack gap={2}>
          {/* Top category & exam board badges */}
          <HStack justify="between" vAlign="center">
            <Skeleton width={95} height={22} radius="rounded" index={index} />
            <HStack gap={1}>
              <Skeleton width={55} height={22} radius="rounded" index={index + 1} />
              <Skeleton width={45} height={22} radius="rounded" index={index + 2} />
            </HStack>
          </HStack>

          {/* Subject indicator */}
          <Skeleton width={110} height={14} radius={1} index={index + 3} />

          {/* Title lines */}
          <VStack gap={1.5} style={{ marginTop: 'var(--spacing-1)' }}>
            <Skeleton width="92%" height={18} radius={2} index={index + 4} />
            <Skeleton width="68%" height={18} radius={2} index={index + 5} />
          </VStack>

          {/* Description lines */}
          <VStack gap={1} style={{ marginTop: 'var(--spacing-1)' }}>
            <Skeleton width="100%" height={13} radius={1} index={index + 6} />
            <Skeleton width="85%" height={13} radius={1} index={index + 7} />
          </VStack>

          {/* Academic spec tags */}
          <HStack gap={1.5} style={{ marginTop: 'var(--spacing-1)' }}>
            <Skeleton width={60} height={20} radius="rounded" index={index + 8} />
            <Skeleton width={45} height={20} radius="rounded" index={index + 9} />
          </HStack>
        </VStack>

        {/* Footer info: author, stats, and action buttons */}
        <VStack gap={2} style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-2)' }}>
          <HStack justify="between" vAlign="center">
            <Skeleton width={80} height={14} radius={1} index={index + 10} />
            <Skeleton width={50} height={14} radius={1} index={index + 11} />
          </HStack>
          <HStack justify="between" vAlign="center">
            <HStack gap={1.5}>
              <Skeleton width={55} height={28} radius={2} index={index + 12} />
              <Skeleton width={50} height={28} radius={2} index={index + 13} />
            </HStack>
            <Skeleton width={60} height={14} radius={1} index={index + 14} />
          </HStack>
        </VStack>
      </VStack>
    </Card>
  );
}

export function ResourceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ResourceCardSkeleton key={i} index={i * 2} />
      ))}
    </>
  );
}
