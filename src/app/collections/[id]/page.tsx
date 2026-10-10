'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useSyllabi } from '@/lib/store';
import { ResourceCard } from '@/components/ResourceCard';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Token } from '@astryxdesign/core/Token';
import { EmptyState } from '@astryxdesign/core/EmptyState';

interface CollectionPageProps {
  params: Promise<{ id: string }>;
}

export default function CollectionDetailPage({ params }: CollectionPageProps) {
  const resolvedParams = use(params);
  const { collections, resources, showToast } = useSyllabi();

  const collection = collections.find((c) => c.id === resolvedParams.id);

  if (!collection) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <VStack gap={4}>
          <Heading level={2}>Collection Not Found</Heading>
          <Text type="body" color="secondary">
            This collection may have been removed or set to private by its owner.
          </Text>
          <HStack justify="center">
            <Link href="/collections" style={{ textDecoration: 'none' }}>
              <Button variant="primary" label="Back to Collections" />
            </Link>
          </HStack>
        </VStack>
      </div>
    );
  }

  // Find sample resources that fit this collection
  const collectionResources = resources.slice(0, Math.max(1, collection.resourcesCount));

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Collection share link copied to clipboard');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-6) var(--spacing-4)' }}>
      <VStack gap={6}>
        {/* Breadcrumb */}
        <HStack gap={2} vAlign="center">
          <Link href="/collections" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Collections
          </Link>
          <span style={{ color: 'var(--color-text-secondary)' }}>/</span>
          <Text type="supporting" color="secondary" size="sm">
            {collection.title}
          </Text>
        </HStack>

        {/* Collection Header Card */}
        <Card padding={6} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
          <VStack gap={4}>
            <HStack justify="between" vAlign="start" wrap="wrap" gap={3}>
              <VStack gap={1} style={{ maxWidth: 700 }}>
                <HStack gap={2} vAlign="center">
                  <Token label={collection.visibility.toUpperCase()} size="sm" />
                  <Text type="supporting" color="secondary" size="xsm">
                    Curated by{' '}
                    <Link
                      href={`/creator/${collection.username}`}
                      style={{ fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: 'none' }}
                    >
                      @{collection.username}
                    </Link>
                  </Text>
                </HStack>
                <Heading level={1} style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
                  {collection.title}
                </Heading>
                <Text type="body" color="secondary" size="base">
                  {collection.description}
                </Text>
              </VStack>

              <HStack gap={2}>
                <Button variant="secondary" size="sm" label="Copy Link" onClick={handleShare} />
              </HStack>
            </HStack>

            <HStack gap={4} vAlign="center">
              <Text type="supporting" size="xsm" color="secondary">
                <strong>{collectionResources.length}</strong> resources in collection
              </Text>
              <Text type="supporting" size="xsm" color="secondary">
                Created {new Date(collection.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
              </Text>
            </HStack>
          </VStack>
        </Card>

        {/* Resources Grid */}
        <VStack gap={4}>
          <Heading level={2} style={{ fontSize: '1.25rem' }}>
            Included Resources
          </Heading>

          {collectionResources.length > 0 ? (
            <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
              {collectionResources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </Grid>
          ) : (
            <EmptyState
              title="This collection is empty"
              description="Save resources from the explore page and add them to this collection."
            />
          )}
        </VStack>
      </VStack>
    </div>
  );
}
