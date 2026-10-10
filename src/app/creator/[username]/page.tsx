'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useSyllabi } from '@/lib/store';
import { INITIAL_CREATORS } from '@/lib/data';
import { ResourceCard } from '@/components/ResourceCard';
import { ShareCardModal } from '@/components/ShareCardModal';
import { formatSavesCount, formatViewsCount } from '@/lib/formatters';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Token } from '@astryxdesign/core/Token';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { EmptyState } from '@astryxdesign/core/EmptyState';

interface CreatorPageProps {
  params: Promise<{ username: string }>;
}

export default function CreatorProfilePage({ params }: CreatorPageProps) {
  const resolvedParams = use(params);
  const {
    resources,
    collections,
    currentUser,
    followingUsernames,
    toggleFollowUser,
    connections,
    sendConnectionRequest,
    removeConnection,
    academicActivity,
    uploadUserAvatar,
  } = useSyllabi();

  const [activeTab, setActiveTab] = useState<'resources' | 'collections' | 'activity' | 'connections'>('resources');
  const [profileShareOpen, setProfileShareOpen] = useState(false);

  const creator = INITIAL_CREATORS.find(
    (c) => c.username.toLowerCase() === resolvedParams.username.toLowerCase()
  ) || (currentUser && currentUser.username.toLowerCase() === resolvedParams.username.toLowerCase() ? currentUser : null);

  const isSelf = currentUser && currentUser.username.toLowerCase() === resolvedParams.username.toLowerCase();
  const isFollowing = followingUsernames.includes(resolvedParams.username);
  const connectionState = connections.find((c) => c.username.toLowerCase() === resolvedParams.username.toLowerCase());

  const creatorResources = resources.filter(
    (r) => r.creatorUsername.toLowerCase() === resolvedParams.username.toLowerCase()
  );

  const creatorCollections = collections.filter(
    (c) => c.username.toLowerCase() === resolvedParams.username.toLowerCase()
  );

  const creatorActivity = academicActivity.filter(
    (a) => a.username.toLowerCase() === resolvedParams.username.toLowerCase()
  );

  if (!creator) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <VStack gap={4}>
          <Heading level={2}>Creator Profile Not Found</Heading>
          <Text type="body" color="secondary">
            The student creator @{resolvedParams.username} does not exist or may have made their profile private.
          </Text>
          <HStack justify="center">
            <Link href="/explore" style={{ textDecoration: 'none' }}>
              <Button variant="primary" label="Back to Explore" />
            </Link>
          </HStack>
        </VStack>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-5) var(--spacing-4)' }}>
      <VStack gap={6}>
        {/* Creator Profile Header Card */}
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
            <HStack justify="between" vAlign="start" wrap="wrap" gap={4}>
              <HStack gap={4} vAlign="start">
                {/* Profile Avatar (Image or Initials Fallback) */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-background-muted)',
                      border: '1.5px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      color: 'var(--color-text-primary)',
                      overflow: 'hidden',
                    }}
                  >
                    {creator.avatarUrl ? (
                      <img
                        src={creator.avatarUrl}
                        alt={`@${creator.username}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      creator.username.charAt(0).toUpperCase()
                    )}
                  </div>

                  {isSelf && (
                    <label
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-on-accent)',
                        borderRadius: 'var(--radius-full)',
                        padding: '3px 7px',
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px var(--color-shadow)',
                      }}
                    >
                      Photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await uploadUserAvatar(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <VStack gap={1}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Heading level={1} style={{ fontSize: '1.375rem', letterSpacing: '-0.02em' }}>
                      @{creator.username}
                    </Heading>
                    <StatusDot variant="success" label="Verified student" />
                    {creator.reputationTitle && (
                      <Token label={creator.reputationTitle} size="sm" />
                    )}
                  </HStack>

                  <Text type="supporting" color="secondary" size="sm">
                    {creator.qualification} · {creator.examBoard || 'AQA'} {creator.targetGrades ? `· Target: ${creator.targetGrades}` : ''}
                  </Text>

                  <Text type="body" size="sm" style={{ maxWidth: 640, marginTop: 2 }}>
                    {creator.bio}
                  </Text>
                </VStack>
              </HStack>

              {/* Action Buttons */}
              <HStack gap={2} wrap="wrap">
                <Button
                  size="sm"
                  variant="secondary"
                  label="Share Profile"
                  onClick={() => setProfileShareOpen(true)}
                />

                {!isSelf && (
                  <>
                    <Button
                      size="sm"
                      variant={isFollowing ? 'secondary' : 'primary'}
                      label={isFollowing ? 'Following' : 'Follow'}
                      onClick={() => toggleFollowUser(creator.username)}
                    />

                    {connectionState ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        label={connectionState.status === 'connected' ? 'Connected' : 'Request Sent'}
                        onClick={() => removeConnection(creator.username)}
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        label="Connect"
                        onClick={() => sendConnectionRequest(creator.username)}
                      />
                    )}
                  </>
                )}
              </HStack>
            </HStack>

            {/* Academic Credential & Honest Metrics (Zero-Safe) */}
            <HStack
              gap={5}
              vAlign="center"
              wrap="wrap"
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: 'var(--spacing-3)',
              }}
            >
              <VStack gap={0.5}>
                <Text type="body" weight="bold">
                  {creatorResources.length}
                </Text>
                <Text type="supporting" color="secondary" size="xsm">
                  Resources Shared
                </Text>
              </VStack>

              <VStack gap={0.5}>
                <Text type="body" weight="bold">
                  {formatViewsCount(creator.totalViews)}
                </Text>
                <Text type="supporting" color="secondary" size="xsm">
                  Total Views
                </Text>
              </VStack>

              <VStack gap={0.5}>
                <Text type="body" weight="bold">
                  {formatSavesCount(creator.totalSaves)}
                </Text>
                <Text type="supporting" color="secondary" size="xsm">
                  Student Saves
                </Text>
              </VStack>

              <VStack gap={0.5}>
                <HStack gap={1} wrap="wrap">
                  {creator.subjects.map((sub) => (
                    <Token key={sub} label={sub} size="sm" />
                  ))}
                </HStack>
                <Text type="supporting" color="secondary" size="xsm">
                  Active Subjects
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Card>

        {/* Tab Navigation */}
        <HStack gap={1.5} vAlign="center" wrap="wrap">
          <Button
            size="sm"
            variant={activeTab === 'resources' ? 'primary' : 'ghost'}
            label={`Resources (${creatorResources.length})`}
            onClick={() => setActiveTab('resources')}
          />
          <Button
            size="sm"
            variant={activeTab === 'collections' ? 'primary' : 'ghost'}
            label={`Collections (${creatorCollections.length})`}
            onClick={() => setActiveTab('collections')}
          />
          <Button
            size="sm"
            variant={activeTab === 'activity' ? 'primary' : 'ghost'}
            label="Academic Activity"
            onClick={() => setActiveTab('activity')}
          />
          <Button
            size="sm"
            variant={activeTab === 'connections' ? 'primary' : 'ghost'}
            label="Connections"
            onClick={() => setActiveTab('connections')}
          />
        </HStack>

        {/* Tab 1: Resources Portfolio */}
        {activeTab === 'resources' && (
          <VStack gap={4}>
            {isSelf && (
              <HStack justify="between" vAlign="center">
                <Text type="body" weight="semibold">
                  Your Published Work ({creatorResources.length})
                </Text>
                <Link href="/upload" style={{ textDecoration: 'none' }}>
                  <Button size="sm" variant="primary" label="+ Upload Resource" />
                </Link>
              </HStack>
            )}

            {creatorResources.length > 0 ? (
              <Grid columns={{ minWidth: 270, repeat: 'fit' }} gap={4}>
                {creatorResources.map((res) => (
                  <ResourceCard key={res.id} resource={res} />
                ))}
              </Grid>
            ) : (
              <Card padding={6} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <VStack gap={3} hAlign="center">
                  <Heading level={3} style={{ fontSize: '1.125rem' }}>
                    {isSelf ? 'You haven’t uploaded any resources yet' : `@${creator.username} has not shared resources yet`}
                  </Heading>
                  <Text type="body" color="secondary" size="sm" style={{ maxWidth: 460 }}>
                    {isSelf
                      ? 'Share your original revision notes, mind maps, or formula sheets to build your verified academic portfolio.'
                      : 'When they publish study materials, they will appear here in their visual academic portfolio.'}
                  </Text>
                  {isSelf && (
                    <Link href="/upload" style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="sm" label="Upload Your First Resource" />
                    </Link>
                  )}
                </VStack>
              </Card>
            )}
          </VStack>
        )}

        {/* Tab 2: Collections */}
        {activeTab === 'collections' && (
          <VStack gap={4}>
            {creatorCollections.length > 0 ? (
              <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
                {creatorCollections.map((col) => (
                  <Card key={col.id} padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
                    <VStack gap={2}>
                      <Text type="body" weight="semibold">
                        {col.title}
                      </Text>
                      <Text type="supporting" color="secondary" size="sm">
                        {col.description}
                      </Text>
                      <HStack justify="between" vAlign="center" style={{ marginTop: 'var(--spacing-2)' }}>
                        <Token label={`${col.resourcesCount} resources`} size="sm" />
                        <Link href={`/collections/${col.id}`} style={{ textDecoration: 'none' }}>
                          <Button size="sm" variant="secondary" label="Open Stack →" />
                        </Link>
                      </HStack>
                    </VStack>
                  </Card>
                ))}
              </Grid>
            ) : (
              <Card padding={6} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <EmptyState
                  title="No collections created"
                  description={`@${creator.username} has not assembled any public revision stacks.`}
                />
              </Card>
            )}
          </VStack>
        )}

        {/* Tab 3: Academic Activity */}
        {activeTab === 'activity' && (
          <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
            <VStack gap={3}>
              <Text type="body" weight="semibold">
                Recent Contributions & Study Milestones
              </Text>
              {creatorActivity.length > 0 ? (
                <VStack gap={2}>
                  {creatorActivity.map((act) => (
                    <Card key={act.id} padding={3} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)', border: '1px solid var(--color-border)' }}>
                      <HStack justify="between" vAlign="center">
                        <VStack gap={0.5}>
                          <Text type="body" size="sm">
                            <strong>@{act.username}</strong> {act.action}{' '}
                            <em>{act.targetTitle}</em>
                          </Text>
                          <Text type="supporting" color="secondary" size="xsm">
                            {act.timestamp}
                          </Text>
                        </VStack>
                        {act.targetSlug && (
                          <Link href={`/resource/${act.targetSlug}`} style={{ textDecoration: 'none' }}>
                            <Button size="sm" variant="ghost" label="View →" />
                          </Link>
                        )}
                      </HStack>
                    </Card>
                  ))}
                </VStack>
              ) : (
                <Text type="supporting" color="secondary">
                  No recent activity logged for this creator.
                </Text>
              )}
            </VStack>
          </Card>
        )}

        {/* Tab 4: Connections */}
        {activeTab === 'connections' && (
          <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
            <VStack gap={3}>
              <Text type="body" weight="semibold">
                Study Peers & Connections
              </Text>
              <Text type="supporting" color="secondary" size="sm">
                Students collaborating on the same syllabus and revision tracks.
              </Text>
              <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
                {INITIAL_CREATORS.filter((c) => c.username !== creator.username).slice(0, 3).map((peer) => (
                  <Card key={peer.id} padding={3} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)', border: '1px solid var(--color-border)' }}>
                    <HStack justify="between" vAlign="center">
                      <VStack gap={0.5}>
                        <Link href={`/creator/${peer.username}`} style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          @{peer.username}
                        </Link>
                        <Text type="supporting" color="secondary" size="xsm">
                          {peer.qualification} · {peer.examBoard}
                        </Text>
                      </VStack>
                      <Link href={`/creator/${peer.username}`} style={{ textDecoration: 'none' }}>
                        <Button size="sm" variant="ghost" label="Profile" />
                      </Link>
                    </HStack>
                  </Card>
                ))}
              </Grid>
            </VStack>
          </Card>
        )}
      </VStack>

      {/* Profile Share Card Modal */}
      <ShareCardModal
        profile={creator}
        isOpen={profileShareOpen}
        onClose={() => setProfileShareOpen(false)}
        defaultStyle="study_achievement"
      />
    </div>
  );
}
