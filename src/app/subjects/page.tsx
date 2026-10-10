'use client';

import React from 'react';
import Link from 'next/link';
import { INITIAL_SUBJECTS } from '@/lib/data';
import { useSyllabi } from '@/lib/store';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Token } from '@astryxdesign/core/Token';

export default function SubjectsPage() {
  const { resources } = useSyllabi();

  const categories = ['Sciences', 'Mathematics', 'Humanities', 'Arts & Technical'] as const;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-6) var(--spacing-4)' }}>
      <VStack gap={8}>
        <VStack gap={1}>
          <Heading level={1} style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
            Academic Subjects
          </Heading>
          <Text type="body" color="secondary" size="sm">
            Browse structured student revision resources by subject specification.
          </Text>
        </VStack>

        {categories.map((cat) => {
          const subjectsInCat = INITIAL_SUBJECTS.filter((s) => s.category === cat);
          if (subjectsInCat.length === 0) return null;

          return (
            <VStack key={cat} gap={4}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                {cat}
              </Heading>

              <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={4}>
                {subjectsInCat.map((sub) => {
                  const count = resources.filter((r) => r.subjectId === sub.id).length;
                  return (
                    <ClickableCard
                      key={sub.id}
                      label={`Browse ${sub.name} resources`}
                      href={`/explore?subject=${sub.slug}`}
                      padding={4}
                      elevation="low"
                    >
                      <VStack gap={3}>
                        <VStack gap={0.5}>
                          <Text type="body" weight="bold" size="lg">
                            {sub.name}
                          </Text>
                          <Text type="supporting" color="secondary" size="xsm">
                            {count} {count === 1 ? 'resource' : 'resources'} available
                          </Text>
                        </VStack>

                        <HStack gap={1.5} wrap="wrap">
                          <Token label="GCSE" size="sm" />
                          <Token label="A-Level" size="sm" />
                          <Token label="IGCSE" size="sm" />
                        </HStack>
                      </VStack>
                    </ClickableCard>
                  );
                })}
              </Grid>
            </VStack>
          );
        })}
      </VStack>
    </div>
  );
}

