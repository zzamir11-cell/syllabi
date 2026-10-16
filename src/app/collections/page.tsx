'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSyllabi } from '@/lib/store';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Token } from '@astryxdesign/core/Token';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Selector } from '@astryxdesign/core/Selector';

export default function CollectionsPage() {
  const { collections, createCollection } = useSyllabi();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('public');

  const handleCreate = () => {
    if (!title.trim()) return;
    createCollection(title.trim(), description.trim(), visibility);
    setTitle('');
    setDescription('');
    setCreateModalOpen(false);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-6) var(--spacing-4)' }}>
      <VStack gap={6}>
        <HStack justify="between" vAlign="center" wrap="wrap" gap={3}>
          <VStack gap={1}>
            <Heading level={1} style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
              Student Collections
            </Heading>
            <Text type="body" color="secondary" size="sm">
              Curated topic revision sets and study lists organized by students.
            </Text>
          </VStack>

          <Button
            variant="primary"
            size="sm"
            label="+ New Collection"
            onClick={() => setCreateModalOpen(true)}
          />
        </HStack>

        <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
          {collections.map((col) => (
            <ClickableCard
              key={col.id}
              label={`View ${col.title}`}
              href={`/collections/${col.id}`}
              padding={5}
              elevation="low"
            >
              <VStack gap={3}>
                <HStack justify="between" vAlign="start">
                  <VStack gap={0.5}>
                    <Text type="body" weight="bold" size="lg">
                      {col.title}
                    </Text>
                    <Text type="supporting" color="secondary" size="xsm">
                      Curated by @{col.username}
                    </Text>
                  </VStack>
                  <Token label={col.visibility} size="sm" />
                </HStack>

                <Text
                  type="supporting"
                  color="secondary"
                  size="sm"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {col.description}
                </Text>

                <HStack justify="between" vAlign="center" style={{ marginTop: 'var(--spacing-2)' }}>
                  <Text type="supporting" size="xsm" color="secondary">
                    <strong>{col.resourcesCount}</strong> resources included
                  </Text>
                  <Button variant="ghost" size="sm" label="View Collection →" />
                </HStack>
              </VStack>
            </ClickableCard>
          ))}
        </Grid>
      </VStack>

      {/* Create Collection Dialog */}
      {createModalOpen && (
        <Dialog
          isOpen={createModalOpen}
          onOpenChange={(open) => !open && setCreateModalOpen(false)}
          width={540}
        >
          <DialogHeader
            title="Create New Collection"
            subtitle="Group study resources together for focused exam preparation."
          />
          <VStack gap={4} padding={4}>
            <VStack gap={1}>
              <Text type="label" weight="medium">
                Collection Title *
              </Text>
              <TextInput
                label="Collection Title"
                isLabelHidden
                placeholder="e.g. My GCSE Chemistry Revision Vault"
                value={title}
                onChange={setTitle}
                size="md"
              />
            </VStack>

            <VStack gap={1}>
              <Text type="label" weight="medium">
                Description
              </Text>
              <TextArea
                label="Description"
                isLabelHidden
                placeholder="What subjects or exam papers is this collection targeted at?"
                value={description}
                onChange={setDescription}
                rows={3}
              />
            </VStack>

            <VStack gap={1}>
              <Text type="label" weight="medium">
                Visibility
              </Text>
              <Selector
                label="Visibility"
                value={visibility}
                onChange={(v) => setVisibility(v as 'public' | 'private' | 'unlisted')}
                size="md"
                options={[
                  { value: 'public', label: 'Public (visible to all students & search)' },
                  { value: 'unlisted', label: 'Unlisted (only accessible via direct link)' },
                  { value: 'private', label: 'Private (only visible to you)' },
                ]}
              />
            </VStack>

            <HStack gap={3} justify="end">
              <Button variant="secondary" label="Cancel" onClick={() => setCreateModalOpen(false)} />
              <Button
                variant="primary"
                label="Create Collection"
                isDisabled={!title.trim()}
                onClick={handleCreate}
              />
            </HStack>
          </VStack>
        </Dialog>
      )}
    </div>
  );
}

