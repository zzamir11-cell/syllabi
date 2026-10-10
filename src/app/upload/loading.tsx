'use client';

import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Skeleton } from '@astryxdesign/core/Skeleton';

export default function UploadLoading() {
  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: 'var(--spacing-8) var(--spacing-4)',
        width: '100%',
      }}
    >
      <VStack gap={6}>
        {/* Header Skeleton */}
        <VStack gap={2}>
          <Skeleton width={140} height={16} radius="rounded" index={1} />
          <Skeleton width={320} height={32} radius={2} index={2} />
          <Skeleton width={480} height={18} radius={1} index={3} />
        </VStack>

        {/* Steps Skeleton */}
        <HStack gap={2}>
          <Skeleton width={110} height={32} radius="rounded" index={4} />
          <Skeleton width={110} height={32} radius="rounded" index={5} />
          <Skeleton width={110} height={32} radius="rounded" index={6} />
        </HStack>

        {/* Form Card Skeleton */}
        <Card
          padding={6}
          elevation="none"
          style={{
            backgroundColor: 'var(--color-background-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-container)',
          }}
        >
          <VStack gap={5}>
            <VStack gap={2}>
              <Skeleton width={120} height={16} radius={1} index={7} />
              <Skeleton width="100%" height={40} radius={2} index={8} />
            </VStack>

            <VStack gap={2}>
              <Skeleton width={140} height={16} radius={1} index={9} />
              <Skeleton width="100%" height={80} radius={2} index={10} />
            </VStack>

            <HStack gap={4} wrap="wrap">
              <VStack gap={2} style={{ flex: 1, minWidth: 200 }}>
                <Skeleton width={100} height={16} radius={1} index={11} />
                <Skeleton width="100%" height={38} radius={2} index={12} />
              </VStack>
              <VStack gap={2} style={{ flex: 1, minWidth: 200 }}>
                <Skeleton width={100} height={16} radius={1} index={13} />
                <Skeleton width="100%" height={38} radius={2} index={14} />
              </VStack>
            </HStack>

            {/* Dropzone skeleton */}
            <div
              style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-element)',
                padding: 'var(--spacing-8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Skeleton width={56} height={56} radius="rounded" index={15} />
              <Skeleton width={200} height={18} radius={1} index={16} />
              <Skeleton width={160} height={14} radius={1} index={17} />
            </div>

            <HStack justify="end" gap={3}>
              <Skeleton width={100} height={38} radius={2} index={18} />
            </HStack>
          </VStack>
        </Card>
      </VStack>
    </div>
  );
}
