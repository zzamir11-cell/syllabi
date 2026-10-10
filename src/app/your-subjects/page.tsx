'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyllabi } from '@/lib/store';
import { ResourceCard } from '@/components/ResourceCard';
import { ResourceGridSkeleton } from '@/components/ResourceCardSkeleton';
import { getSubjectColor, getQualificationBadgeStyle } from '@/lib/academicColors';
import { Section } from '@astryxdesign/core/Section';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Token } from '@astryxdesign/core/Token';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Card } from '@astryxdesign/core/Card';
import { EmptyState } from '@astryxdesign/core/EmptyState';

export default function YourSubjectsPage() {
  const router = useRouter();
  const { currentUser, resources, requests } = useSyllabi();

  const userSubjects = currentUser?.subjects || ['Chemistry', 'Biology', 'Physics', 'Mathematics'];
  const [selectedSubject, setSelectedSubject] = useState(userSubjects[0] || 'Chemistry');
  const [isSwitchingSubject, setIsSwitchingSubject] = useState(false);

  const handleSelectSubject = (subj: string) => {
    setIsSwitchingSubject(true);
    setSelectedSubject(subj);
    setTimeout(() => setIsSwitchingSubject(false), 240);
  };

  const qualification = currentUser?.qualification || 'GCSE';
  const examBoard = currentUser?.examBoard || 'AQA';
  const currentSubColor = getSubjectColor(selectedSubject);
  const qualBadge = getQualificationBadgeStyle(qualification);

  // Filter resources matching current user's exact specification & selected subject
  const subjectResources = resources.filter(
    (r) =>
      r.status !== 'removed' &&
      r.subjectName.toLowerCase() === selectedSubject.toLowerCase()
  );

  const topResources = [...subjectResources]
    .sort((a, b) => b.savesCount - a.savesCount)
    .slice(0, 4);

  const latestResources = [...subjectResources]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Filter requests student can fulfill for this subject
  const fulfillableRequests = requests.filter(
    (req) =>
      req.status === 'open' &&
      req.subjectName.toLowerCase() === selectedSubject.toLowerCase()
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-5) var(--spacing-4)' }}>
      <VStack gap={6}>
        {/* Header: Academic Spec Overview */}
        <Section
          padding={4}
          style={{
            backgroundColor: 'var(--color-background-surface)',
            borderRadius: 'var(--radius-container)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <HStack justify="between" vAlign="center" wrap="wrap" gap={3}>
            <VStack gap={1}>
              <HStack gap={2} vAlign="center">
                <Heading level={1} style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                  Your Academic Specification
                </Heading>
                <StatusDot variant="success" label="Active Spec" />
              </HStack>
              <Text type="supporting" color="secondary" size="sm">
                Curated study resources, peer requests, and revision tracks matching your current courses.
              </Text>
            </VStack>

            <HStack gap={2} vAlign="center">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: qualBadge.bg,
                  color: qualBadge.text,
                  border: `1px solid ${qualBadge.border}`,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                {qualification}
              </span>
              <Token label={examBoard} size="md" />
              <Link href={`/upload?prefillQualification=${encodeURIComponent(qualification)}&prefillBoard=${encodeURIComponent(examBoard)}&prefillSubject=${encodeURIComponent(selectedSubject)}`} style={{ textDecoration: 'none' }}>
                <Button size="sm" variant="primary" label={`Upload for ${selectedSubject}`} />
              </Link>
            </HStack>
          </HStack>
        </Section>

        {/* Subject Switcher Row */}
        <VStack gap={2}>
          <HStack justify="between" vAlign="center">
            <Text type="label" weight="medium">
              Select Subject Track
            </Text>
            <Text type="supporting" color="secondary" size="xsm">
              Currently viewing {selectedSubject}
            </Text>
          </HStack>
          <HStack gap={2} wrap="wrap">
            {userSubjects.map((sub) => {
              const isSelected = sub.toLowerCase() === selectedSubject.toLowerCase();
              return (
                <Button
                  key={sub}
                  size="md"
                  variant={isSelected ? 'primary' : 'secondary'}
                  label={sub}
                  onClick={() => handleSelectSubject(sub)}
                />
              );
            })}
          </HStack>
        </VStack>

        {/* Fulfillable Requests Banner */}
        {fulfillableRequests.length > 0 && (
          <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)', border: '1px solid var(--color-border)' }}>
            <VStack gap={3}>
              <HStack justify="between" vAlign="center">
                <VStack gap={0.5}>
                  <Text type="body" weight="semibold">
                    Requests You Can Help With ({fulfillableRequests.length})
                  </Text>
                  <Text type="supporting" color="secondary" size="xsm">
                    Students studying {qualification} {examBoard} {selectedSubject} are looking for these notes:
                  </Text>
                </VStack>
                <Link href="/requests" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="sm" label="View all requests →" />
                </Link>
              </HStack>

              <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={3}>
                {fulfillableRequests.slice(0, 3).map((req) => (
                  <Card key={req.id} padding={3} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
                    <VStack gap={2}>
                      <HStack justify="between" vAlign="start">
                        <Text type="body" weight="semibold" size="sm">
                          {req.title}
                        </Text>
                        <Token label={req.topicName || 'General'} size="sm" />
                      </HStack>
                      <Text type="supporting" color="secondary" size="xsm" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {req.description}
                      </Text>
                      <HStack justify="end">
                        <Link
                          href={`/upload?prefillQualification=${encodeURIComponent(qualification)}&prefillBoard=${encodeURIComponent(examBoard)}&prefillSubject=${encodeURIComponent(selectedSubject)}&prefillTopic=${encodeURIComponent(req.topicName || '')}&prefillTitle=${encodeURIComponent(req.title)}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Button size="sm" variant="secondary" label="I can help →" />
                        </Link>
                      </HStack>
                    </VStack>
                  </Card>
                ))}
              </Grid>
            </VStack>
          </Card>
        )}

        {/* Most Saved Resources in this spec */}
        <VStack gap={3}>
          <HStack justify="between" vAlign="center">
            <VStack gap={0.5}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                Top Saved {selectedSubject} Resources
              </Heading>
              <Text type="supporting" color="secondary" size="sm">
                Highest community engagement across {qualification} {examBoard} students
              </Text>
            </VStack>

            <Link href={`/explore?qualification=${qualification.toLowerCase()}&board=${examBoard.toLowerCase()}&subject=${selectedSubject.toLowerCase()}`} style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" label="Explore all →" />
            </Link>
          </HStack>

          {isSwitchingSubject ? (
            <Grid columns={{ minWidth: 270, repeat: 'fit' }} gap={4}>
              <ResourceGridSkeleton count={4} />
            </Grid>
          ) : topResources.length > 0 ? (
            <Grid columns={{ minWidth: 270, repeat: 'fit' }} gap={4}>
              {topResources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </Grid>
          ) : (
            <Card padding={6} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <VStack gap={3} hAlign="center">
                <Text type="body" color="secondary">
                  No resources uploaded for {selectedSubject} yet.
                </Text>
                <Link
                  href={`/upload?prefillQualification=${encodeURIComponent(qualification)}&prefillBoard=${encodeURIComponent(examBoard)}&prefillSubject=${encodeURIComponent(selectedSubject)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="primary" size="sm" label={`Be the first to upload for ${selectedSubject}`} />
                </Link>
              </VStack>
            </Card>
          )}
        </VStack>

        {/* Latest Uploads in this spec */}
        <VStack gap={3}>
          <HStack justify="between" vAlign="center">
            <VStack gap={0.5}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                Recently Shared
              </Heading>
              <Text type="supporting" color="secondary" size="sm">
                Fresh study materials uploaded by students this week
              </Text>
            </VStack>
          </HStack>

          {isSwitchingSubject ? (
            <Grid columns={{ minWidth: 270, repeat: 'fit' }} gap={4}>
              <ResourceGridSkeleton count={4} />
            </Grid>
          ) : latestResources.length > 0 ? (
            <Grid columns={{ minWidth: 270, repeat: 'fit' }} gap={4}>
              {latestResources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </Grid>
          ) : (
            <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
              <Text type="supporting" color="secondary">
                No recent uploads in this topic.
              </Text>
            </Card>
          )}
        </VStack>
      </VStack>
    </div>
  );
}
