'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSyllabi } from '@/lib/store';
import {
  INITIAL_QUALIFICATIONS,
  INITIAL_EXAM_BOARDS,
  INITIAL_SUBJECTS,
} from '@/lib/data';
import { ResourceCard } from '@/components/ResourceCard';
import { ResourceGridSkeleton } from '@/components/ResourceCardSkeleton';
import { Resource, ResourceType } from '@/lib/types';
import { getSubjectColor, getQualificationBadgeStyle, getSubjectTokenColor } from '@/lib/academicColors';
import { formatSavesCount, formatRating } from '@/lib/formatters';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Token } from '@astryxdesign/core/Token';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';

const RESOURCE_TYPES: ResourceType[] = [
  'Revision notes',
  'Revision guides',
  'Mind maps',
  'Flashcards',
  'Topic summaries',
  'Formula sheets',
  'Essay plans',
  'Essay examples',
  'Coursework guidance',
  'Study checklists',
  'Diagrams',
  'Personal revision resources',
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'saves', label: 'Most saved' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'downloads', label: 'Most downloaded' },
];

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resources, recentSearches, addRecentSearch, clearRecentSearches, isResourceSaved, toggleSaveResource } = useSyllabi();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Read URL query params
  const paramQ = searchParams.get('q') || '';
  const paramQual = searchParams.get('qualification') || 'all';
  const paramBoard = searchParams.get('board') || 'all';
  const paramSubject = searchParams.get('subject') || 'all';
  const paramType = searchParams.get('type') || 'all';
  const paramSort = searchParams.get('sort') || 'relevance';

  const [query, setQuery] = useState(paramQ);
  const [debouncedQuery, setDebouncedQuery] = useState(paramQ);
  const [qualification, setQualification] = useState(paramQual);
  const [examBoard, setExamBoard] = useState(paramBoard);
  const [subject, setSubject] = useState(paramSubject);
  const [resourceType, setResourceType] = useState(paramType);
  const [sortOrder, setSortOrder] = useState(paramSort);

  // Filter dialog state
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Keyboard shortcut: "/" or "Cmd+K" focuses search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]') as HTMLInputElement | null;
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync state if URL changes externally
  useEffect(() => {
    setQuery(paramQ);
    setDebouncedQuery(paramQ);
    setQualification(paramQual);
    setExamBoard(paramBoard);
    setSubject(paramSubject);
    setResourceType(paramType);
    setSortOrder(paramSort);
  }, [paramQ, paramQual, paramBoard, paramSubject, paramType, paramSort]);

  // Debounce search with skeleton loading feedback
  useEffect(() => {
    setIsFiltering(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim().length > 2) {
        addRecentSearch(query.trim());
      }
      updateUrl(query, qualification, examBoard, subject, resourceType, sortOrder);
      setIsFiltering(false);
    }, 280);
    return () => clearTimeout(handler);
  }, [query]);

  const updateUrl = (
    q: string,
    qual: string,
    board: string,
    subj: string,
    type: string,
    sort: string
  ) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (qual !== 'all') p.set('qualification', qual);
    if (board !== 'all') p.set('board', board);
    if (subj !== 'all') p.set('subject', subj);
    if (type !== 'all') p.set('type', type);
    if (sort !== 'relevance') p.set('sort', sort);

    const qs = p.toString();
    router.replace(qs ? `/explore?${qs}` : '/explore');
  };

  const handleFilterChange = (
    newQual: string,
    newBoard: string,
    newSubj: string,
    newType: string,
    newSort: string
  ) => {
    setIsFiltering(true);
    setQualification(newQual);
    setExamBoard(newBoard);
    setSubject(newSubj);
    setResourceType(newType);
    setSortOrder(newSort);
    updateUrl(debouncedQuery, newQual, newBoard, newSubj, newType, newSort);
    setTimeout(() => setIsFiltering(false), 250);
  };

  const handleClearFilters = () => {
    setIsFiltering(true);
    setQuery('');
    setDebouncedQuery('');
    setQualification('all');
    setExamBoard('all');
    setSubject('all');
    setResourceType('all');
    setSortOrder('relevance');
    router.replace('/explore');
    setTimeout(() => setIsFiltering(false), 250);
  };

  // Filter & Sort logic
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (res.status === 'removed') return false;

      // Text query match
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description.toLowerCase().includes(q);
        const matchesTopic = res.topicName?.toLowerCase().includes(q);
        const matchesTags = res.tags.some((t) => t.toLowerCase().includes(q));
        const matchesSubject = res.subjectName.toLowerCase().includes(q);
        const matchesBoard = res.examBoardName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTopic && !matchesTags && !matchesSubject && !matchesBoard) {
          return false;
        }
      }

      // Qualification
      if (qualification !== 'all') {
        const qMatch =
          res.qualificationName.toLowerCase() === qualification.toLowerCase() ||
          res.qualificationId.toLowerCase().includes(qualification.toLowerCase());
        if (!qMatch) return false;
      }

      // Exam Board
      if (examBoard !== 'all') {
        const bMatch =
          res.examBoardName.toLowerCase() === examBoard.toLowerCase() ||
          res.examBoardId.toLowerCase().includes(examBoard.toLowerCase());
        if (!bMatch) return false;
      }

      // Subject
      if (subject !== 'all') {
        const sMatch =
          res.subjectName.toLowerCase() === subject.toLowerCase() ||
          res.subjectId.toLowerCase().includes(subject.toLowerCase());
        if (!sMatch) return false;
      }

      // Resource Type
      if (resourceType !== 'all') {
        if (res.resourceType.toLowerCase() !== resourceType.toLowerCase()) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'saves') return b.savesCount - a.savesCount;
      if (sortOrder === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOrder === 'downloads') return b.downloadsCount - a.downloadsCount;
      if (sortOrder === 'rating') return b.ratingAvg - a.ratingAvg;
      // Default: relevance (saves + ratings weighted)
      return (b.savesCount * 2 + b.ratingAvg) - (a.savesCount * 2 + a.ratingAvg);
    });
  }, [resources, debouncedQuery, qualification, examBoard, subject, resourceType, sortOrder]);

  // Featured Resource: Select highest-quality published resource or first match
  const featuredResource: Resource | undefined = useMemo(() => {
    if (filteredResources.length === 0) return undefined;
    return filteredResources.find((r) => r.isFeatured) || filteredResources[0];
  }, [filteredResources]);

  // Remaining resources after featured
  const regularResources = useMemo(() => {
    if (!featuredResource) return [];
    return filteredResources.filter((r) => r.id !== featuredResource.id);
  }, [filteredResources, featuredResource]);

  const activeFilterCount =
    (qualification !== 'all' ? 1 : 0) +
    (examBoard !== 'all' ? 1 : 0) +
    (subject !== 'all' ? 1 : 0) +
    (resourceType !== 'all' ? 1 : 0);

  const isFilteringActive = activeFilterCount > 0 || Boolean(debouncedQuery.trim());

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-5) var(--spacing-4)' }}>
      <VStack gap={5}>
        {/* Search Header */}
        <VStack gap={3}>
          <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
            <VStack gap={0.5}>
              <Heading level={1} style={{ fontSize: '1.625rem', letterSpacing: '-0.02em' }}>
                Academic Resource Library
              </Heading>
              <Text type="body" color="secondary" size="sm">
                Discover peer-created revision notes, formula sheets, and mind maps verified by students.
              </Text>
            </VStack>
          </HStack>

          {/* Major Search Bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <TextInput
              label="Search notes, mind maps, specs..."
              isLabelHidden
              placeholder="Search by topic, exam board, or concept (e.g. AQA Electrolysis, Edexcel Calculus) — Press / to focus"
              value={query}
              onChange={setQuery}
              size="lg"
            />
          </div>

          {/* Quick Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <HStack gap={1.5} vAlign="center" wrap="wrap">
              <Text type="supporting" color="secondary" size="xsm">
                Recent:
              </Text>
              {recentSearches.map((term) => (
                <Button
                  key={term}
                  size="sm"
                  variant="ghost"
                  label={term}
                  onClick={() => setQuery(term)}
                />
              ))}
              <Button
                size="sm"
                variant="ghost"
                label="Clear"
                onClick={clearRecentSearches}
              />
            </HStack>
          )}

          {/* Visual Subject Navigation Strip (Astryx Buttons with consistent radius) */}
          <HStack gap={2} vAlign="center" wrap="wrap" style={{ marginTop: 'var(--spacing-1)' }}>
            <Button
              size="sm"
              variant={subject === 'all' ? 'primary' : 'secondary'}
              label="All Subjects"
              onClick={() => handleFilterChange(qualification, examBoard, 'all', resourceType, sortOrder)}
            />

            {INITIAL_SUBJECTS.slice(0, 7).map((s) => {
              const isSelected = subject.toLowerCase() === s.name.toLowerCase() || subject.toLowerCase() === s.slug.toLowerCase();

              return (
                <Button
                  key={s.id}
                  size="sm"
                  variant={isSelected ? 'primary' : 'secondary'}
                  label={s.name}
                  onClick={() => handleFilterChange(qualification, examBoard, isSelected ? 'all' : s.slug, resourceType, sortOrder)}
                />
              );
            })}
          </HStack>

          {/* Refined Filter & Sort Bar (Requirements 9 & 10) */}
          <HStack justify="between" vAlign="center" wrap="wrap" gap={3} style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-3)' }}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Button
                variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
                size="sm"
                label={activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'All Filters'}
                onClick={() => setFilterModalOpen(true)}
              />

              {/* Active Filter Tags */}
              {qualification !== 'all' && (
                <Token
                  label={`${qualification.toUpperCase()} ×`}
                  size="sm"
                  onClick={() => handleFilterChange('all', examBoard, subject, resourceType, sortOrder)}
                />
              )}
              {examBoard !== 'all' && (
                <Token
                  label={`${examBoard.toUpperCase()} ×`}
                  size="sm"
                  onClick={() => handleFilterChange(qualification, 'all', subject, resourceType, sortOrder)}
                />
              )}
              {subject !== 'all' && (
                <Token
                  label={`${subject} ×`}
                  size="sm"
                  onClick={() => handleFilterChange(qualification, examBoard, 'all', resourceType, sortOrder)}
                />
              )}
              {resourceType !== 'all' && (
                <Token
                  label={`${resourceType} ×`}
                  size="sm"
                  onClick={() => handleFilterChange(qualification, examBoard, subject, 'all', sortOrder)}
                />
              )}

              {isFilteringActive && (
                <Button
                  size="sm"
                  variant="ghost"
                  label="Clear all"
                  onClick={handleClearFilters}
                />
              )}
            </HStack>

            {/* Sort Dropdown */}
            <div style={{ minWidth: 160 }}>
              <Selector
                label="Sort By"
                value={sortOrder}
                onChange={(val) => handleFilterChange(qualification, examBoard, subject, resourceType, String(val))}
                options={SORT_OPTIONS}
                size="sm"
              />
            </div>
          </HStack>
        </VStack>

        {/* FEATURED RESOURCE SPOTLIGHT (Requirements 11, 13 & 45) */}
        {featuredResource && !debouncedQuery && (
          <div style={{ width: '100%', marginBottom: 'var(--spacing-2)' }}>
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
                    <Token color="blue" label="FEATURED" size="sm" />
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
          </div>
        )}

        {/* SECTION HEADER: BROWSE ALL ACADEMIC RESOURCES */}
        <HStack justify="between" vAlign="center">
          <Text type="body" weight="semibold">
            {filteredResources.length}{' '}
            {filteredResources.length === 1 ? 'Academic Resource' : 'Academic Resources'} Available
          </Text>
          <Text type="supporting" color="secondary" size="xsm">
            Student-authored notes & guides
          </Text>
        </HStack>

        {/* MAIN VISUAL RESOURCE GRID (Requirements 16, 20 & 46) */}
        {isFiltering ? (
          <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
            <ResourceGridSkeleton count={6} />
          </Grid>
        ) : filteredResources.length > 0 ? (
          <Grid columns={{ minWidth: 260, repeat: 'fit' }} gap={3}>
            {filteredResources.map((res) => (
              <ResourceCard key={res.id} resource={res} elevation="none" />
            ))}
          </Grid>
        ) : (
          <Card
            padding={6}
            elevation="none"
            style={{
              backgroundColor: 'var(--color-background-surface)',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
            }}
          >
            <VStack gap={3} hAlign="center">
              <Heading level={3} style={{ fontSize: '1.125rem' }}>
                No resources match your current filters
              </Heading>
              <Text type="body" color="secondary" size="sm" style={{ maxWidth: 480 }}>
                Try selecting a broader subject or clearing active filters. You can also request this resource from other students!
              </Text>
              <HStack gap={2}>
                <Button variant="secondary" size="sm" label="Clear All Filters" onClick={handleClearFilters} />
                <Link href="/requests" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="sm" label="Post a Request" />
                </Link>
              </HStack>
            </VStack>
          </Card>
        )}
      </VStack>

      {/* REFINED FILTER MODAL / DRAWER (Requirement 10) */}
      <Dialog
        isOpen={filterModalOpen}
        onOpenChange={(open) => !open && setFilterModalOpen(false)}
        width={680}
      >
        <DialogHeader title="Filter Academic Resources" />
        <div style={{ padding: 'var(--spacing-4)' }}>
          <VStack gap={4}>
            <Text type="supporting" color="secondary" size="sm">
              Refine resources by qualification, examination board, academic subject, and document type.
            </Text>

            <Grid columns={{ minWidth: 180, repeat: 'fit' }} gap={3}>
              <Selector
                label="Qualification"
                value={qualification}
                onChange={(val) => handleFilterChange(String(val), examBoard, subject, resourceType, sortOrder)}
                options={[
                  { value: 'all', label: 'All Qualifications' },
                  ...INITIAL_QUALIFICATIONS.map((q) => ({ value: q.slug, label: q.name })),
                ]}
                size="sm"
              />

              <Selector
                label="Exam Board"
                value={examBoard}
                onChange={(val) => handleFilterChange(qualification, String(val), subject, resourceType, sortOrder)}
                options={[
                  { value: 'all', label: 'All Exam Boards' },
                  ...INITIAL_EXAM_BOARDS.map((b) => ({ value: b.slug, label: b.name })),
                ]}
                size="sm"
              />

              <Selector
                label="Subject"
                value={subject}
                onChange={(val) => handleFilterChange(qualification, examBoard, String(val), resourceType, sortOrder)}
                options={[
                  { value: 'all', label: 'All Subjects' },
                  ...INITIAL_SUBJECTS.map((s) => ({ value: s.slug, label: s.name })),
                ]}
                size="sm"
              />

              <Selector
                label="Resource Type"
                value={resourceType}
                onChange={(val) => handleFilterChange(qualification, examBoard, subject, String(val), sortOrder)}
                options={[
                  { value: 'all', label: 'All Resource Types' },
                  ...RESOURCE_TYPES.map((t) => ({ value: t, label: t })),
                ]}
                size="sm"
              />
            </Grid>

            <HStack justify="between" vAlign="center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-3)' }}>
              <Button
                variant="ghost"
                size="sm"
                label="Reset all filters"
                onClick={handleClearFilters}
              />

              <Button
                variant="primary"
                size="sm"
                label={`Show ${filteredResources.length} Resources`}
                onClick={() => setFilterModalOpen(false)}
              />
            </HStack>
          </VStack>
        </div>
      </Dialog>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading library...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
