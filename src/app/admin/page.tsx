'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSyllabi } from '@/lib/store';
import { INITIAL_CREATORS } from '@/lib/data';
import { VStack, HStack, StackItem } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Token } from '@astryxdesign/core/Token';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Divider } from '@astryxdesign/core/Divider';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { TextArea } from '@astryxdesign/core/TextArea';

export default function AdminPage() {
  const {
    reports,
    resolveReport,
    resources,
    removeResource,
    restoreResource,
    currentUser,
    showToast,
  } = useSyllabi();

  const [activeTab, setActiveTab] = useState<'reports' | 'resources' | 'users'>('reports');
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Metrics
  const totalViews = resources.reduce((acc, r) => acc + r.viewsCount, 0);
  const totalDownloads = resources.reduce((acc, r) => acc + r.downloadsCount, 0);
  const totalSaves = resources.reduce((acc, r) => acc + r.savesCount, 0);
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  const handleOpenResolve = (reportId: string) => {
    setSelectedReportId(reportId);
    setResolutionNotes('');
    setResolutionModalOpen(true);
  };

  const handleExecuteResolution = (action: 'resolved' | 'dismissed') => {
    if (!selectedReportId) return;
    const report = reports.find((r) => r.id === selectedReportId);
    if (report && action === 'resolved' && report.targetType === 'resource') {
      removeResource(report.targetId);
    }
    resolveReport(selectedReportId, action, resolutionNotes);
    setResolutionModalOpen(false);
    setSelectedReportId(null);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-6) var(--spacing-4)' }}>
      <VStack gap={6}>
        {/* Header */}
        <HStack justify="between" vAlign="center" wrap="wrap" gap={3}>
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <Heading level={1} style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
                Moderation & Admin Console
              </Heading>
              <Token label="STAFF" size="sm" />
            </HStack>
            <Text type="body" color="secondary" size="sm">
              Review flagged content, copyright notices, and platform integrity logs.
            </Text>
          </VStack>

          <Text type="supporting" color="secondary" size="xsm">
            Logged in as: <strong>@{currentUser?.username || 'admin'}</strong>
          </Text>
        </HStack>

        {/* Platform Overview Metrics */}
        <Grid columns={{ minWidth: 220, repeat: 'fit' }} gap={4}>
          <Card padding={4} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
            <VStack gap={1}>
              <Text type="supporting" color="secondary" size="xsm">
                TOTAL RESOURCES
              </Text>
              <Text type="body" weight="bold" size="lg">
                {resources.length}
              </Text>
              <Text type="supporting" size="xsm">
                {resources.filter((r) => r.status === 'published').length} active
              </Text>
            </VStack>
          </Card>

          <Card padding={4} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
            <VStack gap={1}>
              <Text type="supporting" color="secondary" size="xsm">
                REPORTS PENDING
              </Text>
              <HStack gap={1.5} vAlign="center">
                <Text type="body" weight="bold" size="lg">
                  {pendingReportsCount}
                </Text>
                {pendingReportsCount > 0 && <StatusDot variant="error" label="Reports pending" />}
              </HStack>
              <Text type="supporting" size="xsm">
                Requires review
              </Text>
            </VStack>
          </Card>

          <Card padding={4} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
            <VStack gap={1}>
              <Text type="supporting" color="secondary" size="xsm">
                TOTAL STUDY VIEWS
              </Text>
              <Text type="body" weight="bold" size="lg">
                {totalViews.toLocaleString()}
              </Text>
              <Text type="supporting" size="xsm">
                Across specifications
              </Text>
            </VStack>
          </Card>

          <Card padding={4} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
            <VStack gap={1}>
              <Text type="supporting" color="secondary" size="xsm">
                TOTAL STUDENT SAVES
              </Text>
              <Text type="body" weight="bold" size="lg">
                {totalSaves.toLocaleString()}
              </Text>
              <Text type="supporting" size="xsm">
                {totalDownloads.toLocaleString()} downloads
              </Text>
            </VStack>
          </Card>
        </Grid>

        {/* Tab Navigation */}
        <HStack gap={2}>
          <Button
            size="sm"
            variant={activeTab === 'reports' ? 'primary' : 'ghost'}
            label={`Reports Queue (${pendingReportsCount})`}
            onClick={() => setActiveTab('reports')}
          />
          <Button
            size="sm"
            variant={activeTab === 'resources' ? 'primary' : 'ghost'}
            label={`All Resources (${resources.length})`}
            onClick={() => setActiveTab('resources')}
          />
          <Button
            size="sm"
            variant={activeTab === 'users' ? 'primary' : 'ghost'}
            label="Creators & Safety"
            onClick={() => setActiveTab('users')}
          />
        </HStack>

        {/* Tab 1: Moderation Queue */}
        {activeTab === 'reports' && (
          <VStack gap={4}>
            {reports.map((rep) => (
              <Card key={rep.id} padding={5} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
                <VStack gap={3}>
                  <HStack justify="between" vAlign="start" wrap="wrap" gap={2}>
                    <VStack gap={0.5}>
                      <HStack gap={1.5} vAlign="center">
                        <Token label={rep.reason.toUpperCase().replace(/_/g, ' ')} size="sm" />
                        <StatusDot variant={rep.status === 'pending' ? 'error' : 'success'} label={rep.status} />
                        <Text type="supporting" size="xsm" weight="semibold">
                          {rep.status.toUpperCase()}
                        </Text>
                      </HStack>
                      <Text type="body" weight="bold">
                        Flagged: {rep.targetTitle}
                      </Text>
                      <Text type="supporting" color="secondary" size="xsm">
                        Reported by @{rep.reporterUsername} • {new Date(rep.createdAt).toLocaleString()}
                      </Text>
                    </VStack>

                    {rep.status === 'pending' ? (
                      <HStack gap={2}>
                        <Button
                          size="sm"
                          variant="secondary"
                          label="Dismiss"
                          onClick={() => resolveReport(rep.id, 'dismissed')}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          label="Take Action / Remove"
                          onClick={() => handleOpenResolve(rep.id)}
                        />
                      </HStack>
                    ) : (
                      <VStack gap={0.5} hAlign="end">
                        <Text type="supporting" size="xsm" color="secondary">
                          Resolved by @{rep.resolvedBy || 'staff'}
                        </Text>
                        {rep.resolutionNotes && (
                          <Text type="supporting" size="xsm" color="secondary">
                            &quot;{rep.resolutionNotes}&quot;
                          </Text>
                        )}
                      </VStack>
                    )}
                  </HStack>

                  <Card padding={3} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)' }}>
                    <Text type="supporting" size="sm">
                      <strong>Report reason:</strong> {rep.description || 'No additional note provided.'}
                    </Text>
                  </Card>
                </VStack>
              </Card>
            ))}
          </VStack>
        )}

        {/* Tab 2: All Resources Directory */}
        {activeTab === 'resources' && (
          <VStack gap={3}>
            {resources.map((res) => (
              <Card key={res.id} padding={4} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
                <HStack justify="between" vAlign="center" wrap="wrap" gap={3}>
                  <VStack gap={0.5} style={{ maxWidth: 640 }}>
                    <HStack gap={1.5} vAlign="center">
                      <Token label={res.qualificationName} size="sm" />
                      <Token label={res.examBoardName} size="sm" />
                      <Token label={res.subjectName} size="sm" />
                      <StatusDot variant={res.status === 'published' ? 'success' : 'error'} label={res.status} />
                      <Text type="supporting" size="xsm">
                        {res.status}
                      </Text>
                    </HStack>
                    <Link
                      href={`/resource/${res.slug}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Text type="body" weight="semibold">
                        {res.title}
                      </Text>
                    </Link>
                    <Text type="supporting" color="secondary" size="xsm">
                      Author: @{res.creatorUsername} • {res.viewsCount} views • {res.savesCount} saves
                    </Text>
                  </VStack>

                  <HStack gap={2}>
                    {res.status === 'published' ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        label="Remove Resource"
                        onClick={() => removeResource(res.id)}
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        label="Restore Resource"
                        onClick={() => restoreResource(res.id)}
                      />
                    )}
                  </HStack>
                </HStack>
              </Card>
            ))}
          </VStack>
        )}

        {/* Tab 3: Users & Creators Safety */}
        {activeTab === 'users' && (
          <VStack gap={3}>
            {INITIAL_CREATORS.map((user) => (
              <Card key={user.id} padding={4} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
                <HStack justify="between" vAlign="center" wrap="wrap" gap={3}>
                  <VStack gap={0.5}>
                    <HStack gap={1.5} vAlign="center">
                      <Text type="body" weight="bold">
                        @{user.username}
                      </Text>
                      <StatusDot variant="success" label="Active user" />
                      {user.qualification && <Token label={user.qualification} size="sm" />}
                      {user.reputationTitle && <Token label={user.reputationTitle} size="sm" />}
                    </HStack>
                    <Text type="supporting" color="secondary" size="xsm">
                      {user.resourcesCount} resources • {(user.totalViews / 1000).toFixed(1)}k views • {(user.totalSaves / 1000).toFixed(1)}k saves
                    </Text>
                  </VStack>

                  <HStack gap={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      label="View Profile"
                      onClick={() => window.open(`/creator/${user.username}`, '_blank')}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      label="Suspend User"
                      onClick={() => showToast(`Account @${user.username} suspended for review`)}
                    />
                  </HStack>
                </HStack>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Resolution Dialog */}
      <Dialog
        isOpen={resolutionModalOpen}
        onOpenChange={(open) => !open && setResolutionModalOpen(false)}
        width={500}
      >
        <DialogHeader
          title="Resolve Flagged Report"
          subtitle="Record an official moderation decision. Taking action on a resource removes it from the public directory."
        />
        <VStack gap={4} padding={4}>
          <VStack gap={1}>
            <Text type="label" weight="medium">
              Moderation notes
            </Text>
            <TextArea
              label="Notes"
              isLabelHidden
              placeholder="Explain the decision for the audit log..."
              value={resolutionNotes}
              onChange={setResolutionNotes}
              rows={3}
            />
          </VStack>

          <HStack gap={3} justify="end">
            <Button
              variant="secondary"
              label="Dismiss Report"
              onClick={() => handleExecuteResolution('dismissed')}
            />
            <Button
              variant="destructive"
              label="Confirm Removal & Resolve"
              onClick={() => handleExecuteResolution('resolved')}
            />
          </HStack>
        </VStack>
      </Dialog>
    </div>
  );
}

