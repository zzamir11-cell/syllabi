'use client';

import React from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Skeleton } from '@astryxdesign/core/Skeleton';

export default function ResourceDetailLoading() {
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
        {/* Breadcrumb Skeleton */}
        <HStack gap={2} vAlign="center">
          <Skeleton width={60} height={14} radius={1} index={1} />
          <Skeleton width={12} height={14} radius={1} index={2} />
          <Skeleton width={80} height={14} radius={1} index={3} />
          <Skeleton width={12} height={14} radius={1} index={4} />
          <Skeleton width={140} height={14} radius={1} index={5} />
        </HStack>

        {/* Title & Creator Header Skeleton */}
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Skeleton width={90} height={22} radius="rounded" index={6} />
            <Skeleton width={60} height={22} radius="rounded" index={7} />
            <Skeleton width={110} height={22} radius="rounded" index={8} />
          </HStack>
          <Skeleton width="80%" height={32} radius={2} index={9} />
          <Skeleton width="60%" height={24} radius={2} index={10} />
          <HStack gap={3} vAlign="center" style={{ marginTop: 'var(--spacing-1)' }}>
            <Skeleton width={120} height={16} radius={1} index={11} />
            <Skeleton width={80} height={16} radius={1} index={12} />
            <Skeleton width={90} height={16} radius={1} index={13} />
          </HStack>
        </VStack>

        {/* Main Content Layout (Viewer + Right Sidebar) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 340px',
            gap: 'var(--spacing-6)',
            alignItems: 'start',
          }}
        >
          {/* Main Document Viewer Skeleton */}
          <VStack gap={4}>
            <Card
              padding={4}
              elevation="none"
              style={{
                backgroundColor: 'var(--color-background-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-container)',
              }}
            >
              <VStack gap={4}>
                <HStack justify="between" vAlign="center">
                  <Skeleton width={140} height={20} radius={1} index={14} />
                  <HStack gap={2}>
                    <Skeleton width={60} height={28} radius={1} index={15} />
                    <Skeleton width={60} height={28} radius={1} index={16} />
                  </HStack>
                </HStack>

                {/* Simulated Document Preview Area */}
                <div
                  style={{
                    backgroundColor: 'var(--color-background-muted)',
                    borderRadius: 'var(--radius-element)',
                    padding: 'var(--spacing-8)',
                    minHeight: 460,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                  }}
                >
                  <Skeleton width="85%" height={20} radius={1} index={17} />
                  <Skeleton width="70%" height={16} radius={1} index={18} />
                  <Skeleton width="90%" height={14} radius={1} index={19} />
                  <Skeleton width="80%" height={14} radius={1} index={20} />
                  <Skeleton width="60%" height={14} radius={1} index={21} />
                  <div style={{ width: '80%', height: 120, marginTop: 16 }}>
                    <Skeleton width="100%" height={120} radius={2} index={22} />
                  </div>
                </div>
              </VStack>
            </Card>

            {/* Rating Box Skeleton */}
            <Card
              padding={4}
              elevation="none"
              style={{
                backgroundColor: 'var(--color-background-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-container)',
              }}
            >
              <VStack gap={3}>
                <Skeleton width={180} height={22} radius={1} index={23} />
                <Skeleton width="100%" height={16} radius={1} index={24} />
                <Skeleton width={160} height={36} radius={2} index={25} />
              </VStack>
            </Card>
          </VStack>

          {/* Right Sidebar Skeleton */}
          <VStack gap={4}>
            <Card
              padding={4}
              elevation="none"
              style={{
                backgroundColor: 'var(--color-background-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-container)',
              }}
            >
              <VStack gap={3}>
                <Skeleton width="100%" height={40} radius={2} index={26} />
                <Skeleton width="100%" height={36} radius={2} index={27} />
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-3)' }}>
                  <VStack gap={2}>
                    <Skeleton width="100%" height={16} radius={1} index={28} />
                    <Skeleton width="80%" height={16} radius={1} index={29} />
                    <Skeleton width="90%" height={16} radius={1} index={30} />
                  </VStack>
                </div>
              </VStack>
            </Card>

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
                <Skeleton width={120} height={18} radius={1} index={31} />
                <HStack gap={2} vAlign="center" style={{ marginTop: 'var(--spacing-2)' }}>
                  <Skeleton width={44} height={44} radius="rounded" index={32} />
                  <VStack gap={1}>
                    <Skeleton width={90} height={16} radius={1} index={33} />
                    <Skeleton width={60} height={12} radius={1} index={34} />
                  </VStack>
                </HStack>
              </VStack>
            </Card>
          </VStack>
        </div>
      </VStack>
    </div>
  );
}
