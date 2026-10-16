'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSyllabi } from '@/lib/store';
import { ResourceCard } from '@/components/ResourceCard';
import { getSubjectTokenColor } from '@/lib/academicColors';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Token } from '@astryxdesign/core/Token';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Divider } from '@astryxdesign/core/Divider';

export default function ProfilePage() {
  const { currentUser, resources, isResourceSaved, collections } = useSyllabi();
  const [activeTab, setActiveTab] = useState<'uploads' | 'saved' | 'collections'>('uploads');

  // Filter user's own items with memoization
  const userResources = useMemo(() => {
    if (!currentUser) return [];
    const lowerUsername = currentUser.username.toLowerCase();
    return resources.filter(
      (r) =>
        r.creatorId === currentUser.id ||
        r.creatorUsername.toLowerCase() === lowerUsername
    );
  }, [resources, currentUser]);

  const savedResources = useMemo(
    () => resources.filter((r) => isResourceSaved(r.id)),
    [resources, isResourceSaved]
  );

  const userCollections = useMemo(() => {
    if (!currentUser) return [];
    const lowerUsername = currentUser.username.toLowerCase();
    return collections.filter(
      (c) => c.username.toLowerCase() === lowerUsername
    );
  }, [collections, currentUser]);

  if (!currentUser) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 var(--spacing-4)', textAlign: 'center' }}>
        <Card
          padding={6}
          elevation="low"
          style={{
            backgroundColor: 'var(--color-background-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-container)',
          }}
        >
          <VStack gap={4} hAlign="center">
            <Avatar size="lg" name="Guest" />
            <VStack gap={1} hAlign="center">
              <Heading level={2} style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                Sign in to view your profile
              </Heading>
              <Text type="body" color="secondary" size="base" style={{ maxWidth: 420 }}>
                Join Syllabi to organize your revision notes, publish study resources for your specification, and track your saves.
              </Text>
            </VStack>

            <HStack gap={2} justify="center">
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button size="md" variant="primary" label="Sign in" />
              </Link>
              <Link href="/signup" style={{ textDecoration: 'none' }}>
                <Button size="md" variant="secondary" label="Create account" />
              </Link>
            </HStack>
          </VStack>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-6) var(--spacing-4)' }}>
      <VStack gap={6}>
        {/* Profile Card Header */}
        <Card
          padding={6}
          elevation="none"
          style={{
            backgroundColor: 'var(--color-background-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-container)',
          }}
        >
          <VStack gap={4}>
            <HStack justify="between" vAlign="start" wrap="wrap" gap={4}>
              <HStack gap={3} vAlign="center">
                <Avatar
                  size="lg"
                  name={currentUser.fullName || currentUser.username}
                  src={currentUser.avatarUrl || undefined}
                />
                <VStack gap={0.5}>
                  <HStack gap={1.5} vAlign="center">
                    <Heading level={1} style={{ fontSize: '1.625rem', letterSpacing: '-0.02em' }}>
                      {currentUser.fullName || `@${currentUser.username}`}
                    </Heading>
                    <StatusDot variant="success" label="Active Student" />
                  </HStack>
                  <Text type="supporting" color="secondary" size="sm" weight="semibold">
                    @{currentUser.username}
                  </Text>
                </VStack>
              </HStack>

              <HStack gap={2}>
                <Link href="/settings" style={{ textDecoration: 'none' }}>
                  <Button size="sm" variant="secondary" label="Settings ⚙" />
                </Link>
                <Link href="/upload" style={{ textDecoration: 'none' }}>
                  <Button size="sm" variant="primary" label="+ Upload Resource" />
                </Link>
              </HStack>
            </HStack>

            {/* Academic Specifications & Badges */}
            <HStack gap={1.5} wrap="wrap" vAlign="center">
              <Token label={currentUser.qualification || 'GCSE'} size="sm" />
              {currentUser.examBoard && <Token label={currentUser.examBoard} size="sm" />}
              {currentUser.subjects &&
                currentUser.subjects.map((sub) => (
                  <Token
                    key={sub}
                    label={sub}
                    color={getSubjectTokenColor(sub)}
                    size="sm"
                  />
                ))}
            </HStack>

            {/* Bio */}
            {currentUser.bio && (
              <Text type="body" size="sm" style={{ lineHeight: 1.6, maxWidth: 760 }}>
                {currentUser.bio}
              </Text>
            )}

            <Divider />

            {/* Metrics */}
            <HStack gap={6} wrap="wrap" vAlign="center">
              <VStack gap={0.5}>
                <Text type="body" weight="bold" size="lg">
                  {userResources.length}
                </Text>
                <Text type="supporting" color="secondary" size="xsm">
                  Resources Shared
                </Text>
              </VStack>

              <VStack gap={0.5}>
                <Text type="body" weight="bold" size="lg">
                  {savedResources.length}
                </Text>
                <Text type="supporting" color="secondary" size="xsm">
                  Saved Bookmarks
                </Text>
              </VStack>

              <VStack gap={0.5}>
                <Text type="body" weight="bold" size="lg">
                  {userCollections.length}
                </Text>
                <Text type="supporting" color="secondary" size="xsm">
                  Collections Curated
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Card>

        {/* Profile Content Navigation Tabs */}
        <HStack gap={2} vAlign="center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-2)' }}>
          <Button
            size="sm"
            variant={activeTab === 'uploads' ? 'primary' : 'ghost'}
            label={`Your Uploads (${userResources.length})`}
            onClick={() => setActiveTab('uploads')}
          />
          <Button
            size="sm"
            variant={activeTab === 'saved' ? 'primary' : 'ghost'}
            label={`Saved Materials (${savedResources.length})`}
            onClick={() => setActiveTab('saved')}
          />
          <Button
            size="sm"
            variant={activeTab === 'collections' ? 'primary' : 'ghost'}
            label={`Collections (${userCollections.length})`}
            onClick={() => setActiveTab('collections')}
          />
        </HStack>

        {/* Tab 1: Uploads */}
        {activeTab === 'uploads' && (
          <div>
            {userResources.length > 0 ? (
              <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={3}>
                {userResources.map((res) => (
                  <ResourceCard key={res.id} resource={res} />
                ))}
              </Grid>
            ) : (
              <Card
                padding={6}
                elevation="none"
                style={{
                  backgroundColor: 'var(--color-background-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-container)',
                  textAlign: 'center',
                }}
              >
                <VStack gap={3} hAlign="center">
                  <Heading level={3} style={{ fontSize: '1.125rem' }}>
                    You haven&apos;t published any study resources yet
                  </Heading>
                  <Text type="body" color="secondary" size="sm" style={{ maxWidth: 440 }}>
                    Upload revision guides, topic mind maps, formula sheets, or essay plans to build your academic reputation.
                  </Text>
                  <Link href="/upload" style={{ textDecoration: 'none' }}>
                    <Button size="md" variant="primary" label="Upload Your First Resource" />
                  </Link>
                </VStack>
              </Card>
            )}
          </div>
        )}

        {/* Tab 2: Saved */}
        {activeTab === 'saved' && (
          <div>
            {savedResources.length > 0 ? (
              <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={3}>
                {savedResources.map((res) => (
                  <ResourceCard key={res.id} resource={res} />
                ))}
              </Grid>
            ) : (
              <Card
                padding={6}
                elevation="none"
                style={{
                  backgroundColor: 'var(--color-background-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-container)',
                  textAlign: 'center',
                }}
              >
                <VStack gap={3} hAlign="center">
                  <Heading level={3} style={{ fontSize: '1.125rem' }}>
                    No saved resources yet
                  </Heading>
                  <Text type="body" color="secondary" size="sm" style={{ maxWidth: 440 }}>
                    Explore the library and bookmark resources you want to review before exam season.
                  </Text>
                  <Link href="/explore" style={{ textDecoration: 'none' }}>
                    <Button size="md" variant="secondary" label="Explore Library" />
                  </Link>
                </VStack>
              </Card>
            )}
          </div>
        )}

        {/* Tab 3: Collections */}
        {activeTab === 'collections' && (
          <div>
            {userCollections.length > 0 ? (
              <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={3}>
                {userCollections.map((col) => (
                  <Card
                    key={col.id}
                    padding={4}
                    elevation="none"
                    style={{
                      backgroundColor: 'var(--color-background-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-container)',
                    }}
                  >
                    <VStack gap={2}>
                      <HStack justify="between" vAlign="center">
                        <Text type="body" weight="bold">
                          {col.title}
                        </Text>
                        <Token label={col.visibility} size="sm" />
                      </HStack>
                      <Text type="supporting" color="secondary" size="xsm">
                        {col.description || 'Curated study stack'}
                      </Text>
                      <HStack justify="end">
                        <Link href={`/collections/${col.id}`} style={{ textDecoration: 'none' }}>
                          <Button size="sm" variant="ghost" label="Open Collection →" />
                        </Link>
                      </HStack>
                    </VStack>
                  </Card>
                ))}
              </Grid>
            ) : (
              <Card
                padding={6}
                elevation="none"
                style={{
                  backgroundColor: 'var(--color-background-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-container)',
                  textAlign: 'center',
                }}
              >
                <VStack gap={3} hAlign="center">
                  <Heading level={3} style={{ fontSize: '1.125rem' }}>
                    No collections created
                  </Heading>
                  <Text type="body" color="secondary" size="sm" style={{ maxWidth: 440 }}>
                    Organize related topics and formula sheets into structured revision collections.
                  </Text>
                  <Link href="/collections" style={{ textDecoration: 'none' }}>
                    <Button size="md" variant="secondary" label="Go to Collections" />
                  </Link>
                </VStack>
              </Card>
            )}
          </div>
        )}
      </VStack>
    </div>
  );
}
