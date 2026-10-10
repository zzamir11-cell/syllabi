'use client';

import React from 'react';
import Link from 'next/link';
import { useSyllabi } from '@/lib/store';
import { ResourceCard } from '@/components/ResourceCard';
import { ResourceGridSkeleton } from '@/components/ResourceCardSkeleton';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Section } from '@astryxdesign/core/Section';
import { EmptyState } from '@astryxdesign/core/EmptyState';

export default function SavedResourcesPage() {
  const { resources, savedResourceIds } = useSyllabi();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const savedResources = resources.filter((r) => savedResourceIds.includes(r.id));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-6) var(--spacing-4)' }}>
      <VStack gap={6}>
        <HStack justify="between" vAlign="center" wrap="wrap" gap={3}>
          <VStack gap={1}>
            <Heading level={1} style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
              Saved Resources
            </Heading>
            <Text type="body" color="secondary" size="sm">
              Your personal academic library bookmarks for quick exam preparation.
            </Text>
          </VStack>

          <Link href="/collections" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm" label="View Collections →" />
          </Link>
        </HStack>

        {loading ? (
          <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
            <ResourceGridSkeleton count={3} />
          </Grid>
        ) : savedResources.length > 0 ? (
          <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
            {savedResources.map((res) => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </Grid>
        ) : (
          <Section padding={8} style={{ backgroundColor: 'var(--color-background-surface)', borderRadius: 'var(--radius-container)' }}>
            <EmptyState
              title="No saved resources yet"
              description="Save resources while you browse specifications and they will appear here in your personal study library."
            />
            <HStack justify="center" style={{ marginTop: 'var(--spacing-4)' }}>
              <Link href="/explore" style={{ textDecoration: 'none' }}>
                <Button variant="primary" label="Explore Resources" />
              </Link>
            </HStack>
          </Section>
        )}
      </VStack>
    </div>
  );
}

