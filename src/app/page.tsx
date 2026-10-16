'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyllabi } from '@/lib/store';
import { INITIAL_SUBJECTS } from '@/lib/data';
import { ResourceCard } from '@/components/ResourceCard';
import { getSubjectTokenColor } from '@/lib/academicColors';
import { formatSavesCount } from '@/lib/formatters';
import { Section } from '@astryxdesign/core/Section';
import { VStack, HStack, StackItem } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Card } from '@astryxdesign/core/Card';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Token } from '@astryxdesign/core/Token';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Avatar } from '@astryxdesign/core/Avatar';

export default function HomePage() {
  const router = useRouter();
  const { resources, academicActivity, isResourceSaved, toggleSaveResource } = useSyllabi();
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (quickQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(quickQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  const featuredResource = useMemo(
    () => resources.find((r) => r.isFeatured) || resources[0],
    [resources]
  );

  const popularResources = useMemo(
    () =>
      [...resources]
        .sort((a, b) => b.savesCount - a.savesCount)
        .slice(0, 4),
    [resources]
  );

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of resources) {
      const key = r.subjectName.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [resources]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-5) var(--spacing-4)' }}>
      <VStack gap={6}>
        {/* Compact Editorial Hero */}
        <Section
          padding={6}
          style={{
            backgroundColor: 'var(--color-background-surface)',
            borderRadius: 'var(--radius-container)',
            border: '1px solid var(--color-border)',
          }}
        >
          <VStack gap={4} hAlign="center" style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
            <HStack gap={1.5} vAlign="center">
              <StatusDot variant="success" label="Active community" />
              <Text type="supporting" color="secondary" size="xsm">
                Independent Student Academic Resource Platform
              </Text>
            </HStack>

            <Heading
              level={1}
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 2.75rem)',
                lineHeight: 1.15,
                letterSpacing: '-0.035em',
              }}
            >
              Study resources, made by students.
            </Heading>

            <Text type="body" color="secondary" size="base" style={{ maxWidth: 620, lineHeight: 1.6 }}>
              Discover revision notes, mind maps, formula sheets, and essay plans created by students studying your exact qualification and exam specification.
            </Text>

            {/* Quick Search Bar */}
            <form onSubmit={handleQuickSearch} style={{ width: '100%', maxWidth: 580 }}>
              <HStack gap={2} width="100%">
                <StackItem size="fill">
                  <TextInput
                    label="Search resources"
                    isLabelHidden
                    placeholder="Search e.g. AQA GCSE Chemistry Electrolysis, Edexcel Biology, or OCR Calculus..."
                    value={quickQuery}
                    onChange={setQuickQuery}
                    size="md"
                  />
                </StackItem>
                <Button
                  size="md"
                  variant="primary"
                  label="Search"
                  onClick={() => handleQuickSearch()}
                />
              </HStack>
            </form>

            {/* Subject Shortcuts with Astryx tokens */}
            <HStack gap={1.5} wrap="wrap" justify="center" vAlign="center">
              <Text type="supporting" size="xsm" color="secondary">
                Curriculum shortcuts:
              </Text>
              {INITIAL_SUBJECTS.slice(0, 6).map((sub) => (
                <Link
                  key={sub.id}
                  href={`/explore?subject=${sub.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Token
                    color={getSubjectTokenColor(sub.name)}
                    label={sub.name}
                    size="sm"
                  />
                </Link>
              ))}
            </HStack>
          </VStack>
        </Section>

        {/* FEATURED RESOURCE SPOTLIGHT (Requirement 45) */}
        {featuredResource && (
          <VStack gap={2}>
            <Text type="supporting" color="secondary" size="xsm" weight="semibold">
              FEATURED ACADEMIC SPOTLIGHT
            </Text>

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
                <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Token color="blue" label="TOP RATED" size="sm" />
                    <Token
                      color={getSubjectTokenColor(featuredResource.subjectName)}
                      label={featuredResource.resourceType}
                      size="sm"
                    />
                    <Token label={`${featuredResource.qualificationName} · ${featuredResource.examBoardName}`} size="sm" />
                    <Token label={featuredResource.subjectName} size="sm" />
                  </HStack>

                  <Text type="supporting" color="secondary" size="sm">
                    {featuredResource.pageCount} pages ({featuredResource.fileType.toUpperCase()})
                  </Text>
                </HStack>

                <Heading level={2} style={{ fontSize: '1.35rem', lineHeight: 1.3 }}>
                  {featuredResource.title}
                </Heading>

                <Text type="body" color="secondary" size="sm" style={{ lineHeight: 1.6 }}>
                  {featuredResource.description}
                </Text>

                <HStack justify="between" vAlign="center" wrap="wrap" gap={3} style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-3)' }}>
                  <HStack gap={3} vAlign="center">
                    <Text type="supporting" color="secondary" size="sm">
                      by <strong>@{featuredResource.creatorUsername}</strong>
                    </Text>
                    <Text type="supporting" color="secondary" size="sm">
                      {formatSavesCount(featuredResource.savesCount)}
                    </Text>
                  </HStack>

                  <HStack gap={2}>
                    <Button
                      size="sm"
                      variant={isResourceSaved(featuredResource.id) ? 'secondary' : 'ghost'}
                      label={isResourceSaved(featuredResource.id) ? 'Saved' : 'Save'}
                      onClick={() => toggleSaveResource(featuredResource.id)}
                    />
                    <Link href={`/resource/${featuredResource.slug}`} style={{ textDecoration: 'none' }}>
                      <Button size="sm" variant="primary" label="Open Resource →" />
                    </Link>
                  </HStack>
                </HStack>
              </VStack>
            </Card>
          </VStack>
        )}

        {/* STUDENT-MADE ACADEMIC RESOURCES (Requirements 22 & 23) */}
        <VStack gap={3}>
          <HStack justify="between" vAlign="center">
            <VStack gap={0.5}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                Student-made resources
              </Heading>
              <Text type="supporting" color="secondary" size="sm">
                Notes, mind maps, and formula guides created by students
              </Text>
            </VStack>
            <Link href="/explore" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" label="View all library →" />
            </Link>
          </HStack>

          {popularResources.length > 0 ? (
            <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
              {popularResources.map((res) => (
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
                  No published resources yet
                </Heading>
                <Text type="body" color="secondary" size="sm" style={{ maxWidth: 460 }}>
                  Be the first student to upload revision notes, mind maps, or formula sheets to the academic repository.
                </Text>
                <Link href="/upload" style={{ textDecoration: 'none' }}>
                  <Button size="md" variant="primary" label="Upload Revision Material" />
                </Link>
              </VStack>
            </Card>
          )}
        </VStack>

        {/* VISUAL SUBJECT BROWSING (Requirement 21) */}
        <VStack gap={3}>
          <HStack justify="between" vAlign="center">
            <VStack gap={0.5}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                Browse by subject
              </Heading>
              <Text type="supporting" color="secondary" size="sm">
                Explore topic collections categorized by academic field
              </Text>
            </VStack>
            <Link href="/explore" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" label="All subjects →" />
            </Link>
          </HStack>

          <Grid columns={{ minWidth: 200, repeat: 'fit' }} gap={3}>
            {INITIAL_SUBJECTS.slice(0, 6).map((sub) => {
              const subjectCount = subjectCounts[sub.name.toLowerCase()] || 0;

              return (
                <ClickableCard
                  key={sub.id}
                  label={`Explore ${sub.name}`}
                  href={`/explore?subject=${sub.slug}`}
                  padding={3}
                  elevation="none"
                  style={{
                    backgroundColor: 'var(--color-background-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-container)',
                  }}
                >
                  <VStack gap={1.5}>
                    <HStack justify="between" vAlign="center">
                      <Token
                        color={getSubjectTokenColor(sub.name)}
                        label={sub.name}
                        size="sm"
                      />
                      <Text type="supporting" color="secondary" size="xsm">
                        {subjectCount} {subjectCount === 1 ? 'doc' : 'docs'}
                      </Text>
                    </HStack>

                    <Text type="supporting" color="secondary" size="xsm">
                      {sub.category}
                    </Text>
                  </VStack>
                </ClickableCard>
              );
            })}
          </Grid>
        </VStack>

        {/* Academic Activity Feed Section */}
        <VStack gap={3}>
          <HStack justify="between" vAlign="center">
            <VStack gap={0.5}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                Recent academic contributions
              </Heading>
              <Text type="supporting" color="secondary" size="sm">
                Live study uploads and request fulfillments across the platform
              </Text>
            </VStack>
            <Link href="/your-subjects" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" label="Your spec feed →" />
            </Link>
          </HStack>

          <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
            {academicActivity.slice(0, 4).map((act) => (
              <Card
                key={act.id}
                padding={3}
                elevation="none"
                style={{
                  backgroundColor: 'var(--color-background-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <VStack gap={1.5} justify="between" height="100%">
                  <VStack gap={0.5}>
                    <HStack justify="between" vAlign="center">
                      <HStack gap={1} vAlign="center">
                        <Avatar size="xsm" name={act.username} />
                        <Link
                          href={`/creator/${act.username}`}
                          style={{
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          @{act.username}
                        </Link>
                      </HStack>
                      <Text type="supporting" color="secondary" size="xsm">
                        {act.timestamp}
                      </Text>
                    </HStack>
                    <Text type="supporting" size="xsm" color="secondary">
                      {act.action}
                    </Text>
                    <Text type="body" weight="medium" size="sm" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {act.targetTitle}
                    </Text>
                  </VStack>

                  {act.targetSlug && (
                    <HStack justify="end">
                      <Link href={`/resource/${act.targetSlug}`} style={{ textDecoration: 'none' }}>
                        <Button size="sm" variant="ghost" label="Open resource →" />
                      </Link>
                    </HStack>
                  )}
                </VStack>
              </Card>
            ))}
          </Grid>
        </VStack>
      </VStack>
    </div>
  );
}
