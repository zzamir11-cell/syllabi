'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyllabi } from '@/lib/store';
import { ResourceCard } from '@/components/ResourceCard';
import { ShareCardModal } from '@/components/ShareCardModal';
import { ReportModal } from '@/components/ReportModal';
import { getSubjectColor, getSubjectTokenColor } from '@/lib/academicColors';
import { Section } from '@astryxdesign/core/Section';
import { VStack, HStack, StackItem } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Token } from '@astryxdesign/core/Token';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Divider } from '@astryxdesign/core/Divider';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { TextArea } from '@astryxdesign/core/TextArea';

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

export default function ResourceDetailPage({ params }: ResourcePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    resources,
    isResourceSaved,
    toggleSaveResource,
    recordView,
    recordDownload,
    addRating,
  } = useSyllabi();

  const resource = resources.find((r) => r.slug === resolvedParams.slug);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Preview reader state
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Rating submission form state
  const [helpfulScore, setHelpfulScore] = useState(5);
  const [clarityScore, setClarityScore] = useState(5);
  const [examFocusScore, setExamFocusScore] = useState(5);
  const [organizationScore, setOrganizationScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Record view on mount
  useEffect(() => {
    if (resource) {
      recordView(resource.id);
    }
  }, [resource?.id]);

  if (!resource) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <VStack gap={4}>
          <Heading level={2}>Resource Not Found</Heading>
          <Text type="body" color="secondary">
            The resource you are looking for may have been moved or removed by the author.
          </Text>
          <HStack justify="center" gap={3}>
            <Link href="/explore" style={{ textDecoration: 'none' }}>
              <Button variant="primary" label="Back to Explore" />
            </Link>
          </HStack>
        </VStack>
      </div>
    );
  }

  const saved = isResourceSaved(resource.id);

  const relatedResources = resources
    .filter((r) => r.id !== resource.id && (r.subjectId === resource.subjectId || r.qualificationId === resource.qualificationId))
    .slice(0, 3);

  const handleDownloadClick = () => {
    setIsDownloading(true);
    recordDownload(resource.id);
    setTimeout(() => {
      // Create an artificial safe blob download for testing
      const blob = new Blob(
        [
          `Syllabi Resource: ${resource.title}\nCreator: @${resource.creatorUsername}\nSpecification: ${resource.qualificationName} · ${resource.examBoardName} · ${resource.subjectName}\n\nDisclaimer: This is a student-created study resource from syllabi.app.`,
        ],
        { type: 'text/plain;charset=utf-8' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.fileName;
      a.click();
      URL.revokeObjectURL(url);
      setIsDownloading(false);
    }, 600);
  };

  const handleRatingSubmit = () => {
    setIsSubmittingRating(true);
    setTimeout(() => {
      const overall = (helpfulScore + clarityScore + examFocusScore + organizationScore) / 4;
      addRating({
        resourceId: resource.id,
        userId: 'current-user',
        username: 'student',
        helpfulScore,
        clarityScore,
        examFocusScore,
        organizationScore,
        overallScore: Number(overall.toFixed(2)),
        reviewText: reviewComment,
      });
      setIsSubmittingRating(false);
      setRateModalOpen(false);
    }, 350);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-6) var(--spacing-4)' }}>
      <VStack gap={8}>
        {/* Breadcrumb Navigation */}
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Home
          </Link>
          <span style={{ color: 'var(--color-text-secondary)' }}>/</span>
          <Link href="/explore" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Explore
          </Link>
          <span style={{ color: 'var(--color-text-secondary)' }}>/</span>
          <Link
            href={`/explore?subject=${resource.subjectName.toLowerCase()}`}
            style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}
          >
            {resource.subjectName}
          </Link>
          <span style={{ color: 'var(--color-text-secondary)' }}>/</span>
          <Text type="supporting" color="secondary" size="sm">
            {resource.title}
          </Text>
        </HStack>

        {/* Main Product Header Grid */}
        <Grid columns={{ minWidth: 320, repeat: 'fit' }} gap={8} align="start">
          {/* Left Column: Details, Description, Preview Reader */}
          <VStack gap={6}>
            <VStack gap={3}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Token
                  color={getSubjectTokenColor(resource.subjectName)}
                  label={resource.resourceType}
                  size="sm"
                />
                <Token label={resource.qualificationName} size="sm" />
                <Token label={resource.examBoardName} size="sm" />
                <Token label={resource.subjectName} size="sm" />
                {resource.topicName && <Token label={resource.topicName} size="sm" />}
              </HStack>

              <Heading level={1} style={{ fontSize: '2rem', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                {resource.title}
              </Heading>

              <HStack gap={3} vAlign="center" wrap="wrap">
                <HStack gap={1.5} vAlign="center">
                  <Text type="supporting" size="sm" color="secondary">
                    Created by
                  </Text>
                  <Link
                    href={`/creator/${resource.creatorUsername}`}
                    style={{
                      textDecoration: 'none',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      fontSize: '0.9375rem',
                    }}
                  >
                    @{resource.creatorUsername}
                  </Link>
                  {resource.creatorReputation && (
                    <StatusDot variant="success" label="Verified creator" />
                  )}
                </HStack>

                <Text type="supporting" color="secondary" size="sm">
                  • Published {new Date(resource.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>

                <Text type="supporting" color="secondary" size="sm">
                  • {resource.pageCount} pages ({resource.fileType.toUpperCase()})
                </Text>
              </HStack>
            </VStack>

            {/* Description */}
            <Card padding={5} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)' }}>
              <VStack gap={2}>
                <Text type="label" weight="semibold">
                  About this resource
                </Text>
                <Text type="body" style={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {resource.description}
                </Text>
                {resource.tags && resource.tags.length > 0 && (
                  <HStack gap={1.5} wrap="wrap" style={{ marginTop: 'var(--spacing-2)' }}>
                    {resource.tags.map((t) => (
                      <Token key={t} label={`#${t}`} size="sm" />
                    ))}
                  </HStack>
                )}
              </VStack>
            </Card>

            {/* Interactive Document Preview Reader */}
            <VStack gap={3}>
              <HStack justify="between" vAlign="center">
                <VStack gap={0.5}>
                  <Heading level={2} style={{ fontSize: '1.25rem' }}>
                    Document Preview
                  </Heading>
                  <Text type="supporting" color="secondary" size="xsm">
                    Safe read-only sandbox preview. Showing Page {currentPage} of {resource.pageCount}.
                  </Text>
                </VStack>

                <HStack gap={2} vAlign="center">
                  <Button
                    size="sm"
                    variant="secondary"
                    label="-"
                    onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
                  />
                  <Text type="supporting" size="xsm" color="secondary">
                    {zoomLevel}%
                  </Text>
                  <Button
                    size="sm"
                    variant="secondary"
                    label="+"
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                  />
                </HStack>
              </HStack>

              {/* Reader Surface */}
              <Card
                padding={0}
                elevation="low"
                style={{
                  backgroundColor: 'var(--color-background-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-container)',
                  overflow: 'hidden',
                }}
              >
                {/* Document Top Bar */}
                <div
                  style={{
                    backgroundColor: 'var(--color-background-surface)',
                    padding: 'var(--spacing-3) var(--spacing-4)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-2)',
                  }}
                >
                  <HStack gap={2} vAlign="center">
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: getSubjectColor(resource.subjectName).textToken,
                        backgroundColor: getSubjectColor(resource.subjectName).bgToken,
                        border: `1px solid ${getSubjectColor(resource.subjectName).borderToken}`,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-inner)',
                      }}
                    >
                      {resource.resourceType}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      label="◀ Previous"
                      isDisabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    />
                    <Text type="supporting" size="xsm">
                      Page {currentPage} / {resource.pageCount}
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      label="Next ▶"
                      isDisabled={currentPage >= (resource.previewPages?.length || 4)}
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(resource.previewPages?.length || 4, p + 1)
                        )
                      }
                    />
                  </HStack>

                  <Text type="supporting" color="secondary" size="xsm">
                    Protected Preview
                  </Text>
                </div>

                {/* Document Page Canvas Canvas/Paper Simulation */}
                <div
                  style={{
                    padding: 'var(--spacing-6)',
                    display: 'flex',
                    justifyContent: 'center',
                    minHeight: 460,
                    overflowX: 'auto',
                  }}
                >
                  <div
                    style={{
                      width: `${(620 * zoomLevel) / 100}px`,
                      backgroundColor: 'var(--color-background-surface)',
                      borderRadius: 'var(--radius-container)',
                      boxShadow: 'var(--shadow-elevation-1)',
                      padding: `${(40 * zoomLevel) / 100}px`,
                      fontFamily: 'Figtree, sans-serif',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)',
                      transition: 'width 0.15s ease',
                    }}
                  >
                    <VStack gap={4}>
                      {/* Document Page Header */}
                      <HStack justify="between" vAlign="center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                          {resource.qualificationName} {resource.examBoardName} • {resource.subjectName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          Page {currentPage}
                        </span>
                      </HStack>

                      {/* Document Page Body Simulated Content */}
                      <VStack gap={3}>
                        <Heading level={3} style={{ color: 'var(--color-text-primary)', fontSize: '1.25rem' }}>
                          {resource.previewPages && resource.previewPages[currentPage - 1]
                            ? resource.previewPages[currentPage - 1]
                            : `Section ${currentPage}: Detailed Specification Notes`}
                        </Heading>

                        <Text type="body" style={{ color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                          Key Concept Overview: In {resource.subjectName}, mastering the foundational theory is critical for scoring marks on both short explanation items and extended 6-mark responses. Ensure precise terminology is used as emphasized in the specification.
                        </Text>

                        {/* Diagram / Study Box simulation */}
                        <div
                          style={{
                            backgroundColor: 'var(--color-background-muted)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-element)',
                            padding: 16,
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          <div style={{ fontWeight: 'bold', marginBottom: 6, color: 'var(--color-text-primary)' }}>
                            [STUDY NOTE & EQUATION BOX]
                          </div>
                          <div>{`• Key Definition: Fundamental reaction mechanism & standard state conditions`}</div>
                          <div>{`• Formula: ΔH = Σ(Bond energies of reactants) - Σ(Bond energies of products)`}</div>
                          <div>{`• Common Student Trap: Check units before substituting values into the calculation.`}</div>
                        </div>

                        <Text type="supporting" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                          Examiner Tip: Candidates frequently lose marks on this topic by omitting state symbols or failing to balance charges. Practice worked examples under timed conditions.
                        </Text>
                      </VStack>
                    </VStack>
                  </div>
                </div>
              </Card>
            </VStack>

            {/* Prominent Community Rating & Contribution Card */}
            <Card
              padding={5}
              elevation="low"
              style={{
                backgroundColor: 'var(--color-warning-muted)',
                border: '2px solid var(--color-warning)',
                borderRadius: 'var(--radius-container)',
              }}
            >
              <VStack gap={3}>
                <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
                  <HStack gap={1.5} vAlign="center">
                    <span
                      style={{
                        backgroundColor: 'var(--color-warning)',
                        color: 'var(--color-on-warning)',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-inner)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Community Review
                    </span>
                    <Text type="body" weight="bold" size="base" style={{ color: 'var(--color-text-primary)' }}>
                      Help the Student Community
                    </Text>
                  </HStack>

                  <HStack gap={1} vAlign="center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRateModalOpen(true)}
                        style={{
                          cursor: 'pointer',
                          fontSize: '1.4rem',
                          color: star <= Math.round(resource.ratingAvg) ? '#F59E0B' : 'var(--color-border-emphasized)',
                          lineHeight: 1,
                        }}
                      >
                        ★
                      </span>
                    ))}
                    <Text type="supporting" size="sm" weight="bold" style={{ color: 'var(--color-text-primary)', marginLeft: 4 }}>
                      {resource.ratingAvg > 0 ? `${resource.ratingAvg.toFixed(1)} / 5.0` : 'Not yet rated'}
                    </Text>
                  </HStack>
                </HStack>

                <VStack gap={1.5}>
                  <Heading level={3} style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
                    Did you find these revision notes helpful?
                  </Heading>
                  <Text type="body" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.9375rem' }}>
                    Syllabi is built by students, for students. Rating this revision resource helps fellow peers find reliable, high-scoring notes for exams, and directly rewards original student creators with community reputation!
                  </Text>
                </VStack>

                <HStack gap={3} vAlign="center" wrap="wrap" style={{ marginTop: 'var(--spacing-1)' }}>
                  <Button
                    size="lg"
                    variant="primary"
                    label="Rate This Resource ★"
                    onClick={() => setRateModalOpen(true)}
                  />
                  <Text type="supporting" size="xsm" style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    Reviews take 10 seconds — evaluates clarity, helpfulness, organization, and exam focus.
                  </Text>
                </HStack>
              </VStack>
            </Card>

            {/* Educational Disclaimer Banner (Section 23 & 56) */}
            <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
              <VStack gap={1}>
                <HStack gap={1.5} vAlign="center">
                  <StatusDot variant="neutral" label="Independent" />
                  <Text type="body" weight="semibold" size="sm">
                    Student-Created Independent Resource
                  </Text>
                </HStack>
                <Text type="supporting" color="secondary" size="xsm">
                  This resource was created and uploaded by a fellow student. Syllabi is an independent platform and does not claim official exam board endorsement. Always consult your syllabus specification alongside peer revision notes.
                </Text>
              </VStack>
            </Card>
          </VStack>

          {/* Right Column: Sticky Action & Quality Card */}
          <div style={{ position: 'sticky', top: 80 }}>
            <VStack gap={4}>
              <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
                <VStack gap={3}>
                  {/* Primary Download & Save Actions */}
                  <VStack gap={2}>
                    <Button
                      size="lg"
                      variant="primary"
                      label={isDownloading ? 'Preparing Download...' : `Download ${resource.fileType.toUpperCase()} (${(resource.fileSize / 1000000).toFixed(1)} MB)`}
                      onClick={handleDownloadClick}
                      isDisabled={isDownloading}
                    />

                    <HStack gap={2}>
                      <StackItem size="fill">
                        <Button
                          size="md"
                          variant={saved ? 'primary' : 'secondary'}
                          label={isSaving ? 'Saving...' : (saved ? 'Saved in Library' : 'Save Resource')}
                          onClick={() => {
                            setIsSaving(true);
                            toggleSaveResource(resource.id);
                            setTimeout(() => setIsSaving(false), 300);
                          }}
                        />
                      </StackItem>
                      <Button
                        size="md"
                        variant="secondary"
                        label="Share Card"
                        onClick={() => setShareModalOpen(true)}
                      />
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Resource Engagement Metrics */}
                  <Grid columns={3} gap={2} style={{ textAlign: 'center' }}>
                    <VStack gap={0.5}>
                      <Text type="body" weight="bold">
                        {resource.viewsCount.toLocaleString()}
                      </Text>
                      <Text type="supporting" color="secondary" size="xsm">
                        Views
                      </Text>
                    </VStack>
                    <VStack gap={0.5}>
                      <Text type="body" weight="bold">
                        {resource.savesCount > 0 ? resource.savesCount.toLocaleString() : '0'}
                      </Text>
                      <Text type="supporting" color="secondary" size="xsm">
                        Saves
                      </Text>
                    </VStack>
                    <VStack gap={0.5}>
                      <Text type="body" weight="bold">
                        {resource.downloadsCount.toLocaleString()}
                      </Text>
                      <Text type="supporting" color="secondary" size="xsm">
                        Downloads
                      </Text>
                    </VStack>
                  </Grid>

                  <Divider />

                  {/* Quality Breakdown (Section 20) */}
                  <VStack gap={2}>
                    <HStack justify="between" vAlign="center">
                      <HStack gap={1.5} vAlign="center">
                        <Text type="body" weight="bold" size="base">
                          {resource.ratingCount > 0 ? `${resource.ratingAvg.toFixed(1)} / 5.0` : 'Unrated'}
                        </Text>
                        <Text type="supporting" color="secondary" size="xsm">
                          ({resource.ratingCount} reviews)
                        </Text>
                      </HStack>
                      <Button
                        size="sm"
                        variant="primary"
                        label="Rate Resource ★"
                        onClick={() => setRateModalOpen(true)}
                      />
                    </HStack>

                    <VStack gap={2}>
                      <VStack gap={1}>
                        <HStack justify="between">
                          <Text type="supporting" size="xsm">Helpful</Text>
                          <Text type="supporting" size="xsm" weight="semibold">{resource.qualityBreakdown.helpful}/5.0</Text>
                        </HStack>
                        <ProgressBar label="Helpful rating" isLabelHidden value={resource.qualityBreakdown.helpful * 20} max={100} />
                      </VStack>

                      <VStack gap={1}>
                        <HStack justify="between">
                          <Text type="supporting" size="xsm">Clarity</Text>
                          <Text type="supporting" size="xsm" weight="semibold">{resource.qualityBreakdown.clarity}/5.0</Text>
                        </HStack>
                        <ProgressBar label="Clarity rating" isLabelHidden value={resource.qualityBreakdown.clarity * 20} max={100} />
                      </VStack>

                      <VStack gap={1}>
                        <HStack justify="between">
                          <Text type="supporting" size="xsm">Exam-Focused</Text>
                          <Text type="supporting" size="xsm" weight="semibold">{resource.qualityBreakdown.examFocus}/5.0</Text>
                        </HStack>
                        <ProgressBar label="Exam focus rating" isLabelHidden value={resource.qualityBreakdown.examFocus * 20} max={100} />
                      </VStack>

                      <VStack gap={1}>
                        <HStack justify="between">
                          <Text type="supporting" size="xsm">Well-Organized</Text>
                          <Text type="supporting" size="xsm" weight="semibold">{resource.qualityBreakdown.organization}/5.0</Text>
                        </HStack>
                        <ProgressBar label="Organization rating" isLabelHidden value={resource.qualityBreakdown.organization * 20} max={100} />
                      </VStack>
                    </VStack>
                  </VStack>

                  <Divider />

                  {/* Copyright & Report */}
                  <HStack justify="between" vAlign="center">
                    <Text type="supporting" color="secondary" size="xsm">
                      Original student author
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      label="Report resource"
                      onClick={() => setReportModalOpen(true)}
                    />
                  </HStack>
                </VStack>
              </Card>
            </VStack>
          </div>
        </Grid>

        {/* Related Resources */}
        {relatedResources.length > 0 && (
          <VStack gap={4} style={{ marginTop: 'var(--spacing-6)' }}>
            <Heading level={2} style={{ fontSize: '1.375rem' }}>
              Related resources
            </Heading>
            <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
              {relatedResources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </Grid>
          </VStack>
        )}
      </VStack>

      {/* Share Card Modal */}
      <ShareCardModal
        resource={resource}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        defaultStyle="new_upload"
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="resource"
        targetId={resource.id}
        targetTitle={resource.title}
      />

      {/* Rate Resource Modal */}
      <Dialog
        isOpen={rateModalOpen}
        onOpenChange={(open) => !open && setRateModalOpen(false)}
        width={500}
      >
        <DialogHeader
          title="Rate this resource"
          subtitle="Help other students understand the quality and utility of these notes."
        />
        <VStack gap={4} padding={4}>
          <VStack gap={3}>
            <HStack justify="between" vAlign="center">
              <Text type="body" size="sm">Helpful score (1-5):</Text>
              <HStack gap={1}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={helpfulScore === s ? 'primary' : 'secondary'}
                    label={String(s)}
                    onClick={() => setHelpfulScore(s)}
                  />
                ))}
              </HStack>
            </HStack>

            <HStack justify="between" vAlign="center">
              <Text type="body" size="sm">Clarity score (1-5):</Text>
              <HStack gap={1}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={clarityScore === s ? 'primary' : 'secondary'}
                    label={String(s)}
                    onClick={() => setClarityScore(s)}
                  />
                ))}
              </HStack>
            </HStack>

            <HStack justify="between" vAlign="center">
              <Text type="body" size="sm">Exam-focused (1-5):</Text>
              <HStack gap={1}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={examFocusScore === s ? 'primary' : 'secondary'}
                    label={String(s)}
                    onClick={() => setExamFocusScore(s)}
                  />
                ))}
              </HStack>
            </HStack>

            <HStack justify="between" vAlign="center">
              <Text type="body" size="sm">Well-organized (1-5):</Text>
              <HStack gap={1}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={organizationScore === s ? 'primary' : 'secondary'}
                    label={String(s)}
                    onClick={() => setOrganizationScore(s)}
                  />
                ))}
              </HStack>
            </HStack>
          </VStack>

          <VStack gap={1}>
            <Text type="label" weight="medium">
              Optional review notes:
            </Text>
            <TextArea
              label="Review text"
              isLabelHidden
              placeholder="What specifically makes these notes helpful or how could they be improved?"
              value={reviewComment}
              onChange={setReviewComment}
              rows={2}
            />
          </VStack>

          <HStack gap={3} justify="end">
            <Button variant="secondary" label="Cancel" onClick={() => setRateModalOpen(false)} />
            <Button variant="primary" label="Submit Rating" onClick={handleRatingSubmit} />
          </HStack>
        </VStack>
      </Dialog>
    </div>
  );
}
