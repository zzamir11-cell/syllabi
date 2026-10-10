'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/types';
import { useSyllabi } from '@/lib/store';
import { formatSavesCount, formatRating } from '@/lib/formatters';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Token } from '@astryxdesign/core/Token';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Avatar } from '@astryxdesign/core/Avatar';
import { ShareCardModal } from './ShareCardModal';
import { getSubjectColor, getSubjectTokenColor } from '@/lib/academicColors';

interface ResourceCardProps {
  resource: Resource;
  elevation?: 'none' | 'low' | 'med';
}

export function ResourceCard({ resource, elevation = 'low' }: ResourceCardProps) {
  const { isResourceSaved, toggleSaveResource } = useSyllabi();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saved = isResourceSaved(resource.id);
  const subjectStyle = getSubjectColor(resource.subjectName);

  return (
    <>
      <ClickableCard
        label={`View ${resource.title}`}
        href={`/resource/${resource.slug}`}
        elevation={elevation}
        padding={3}
        width="100%"
        style={{
          backgroundColor: 'var(--color-background-surface)',
          borderRadius: 'var(--radius-container)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <VStack gap={2} height="100%" justify="between">
          {/* Header metadata: Resource Category & Exam Specification (No cover image per user request) */}
          <VStack gap={2}>
            <HStack justify="between" vAlign="center" wrap="wrap" gap={1.5}>
              <Token
                label={resource.resourceType}
                color={getSubjectTokenColor(resource.subjectName)}
                size="sm"
              />

              <HStack gap={1} vAlign="center">
                <Token label={resource.qualificationName} size="sm" />
                <Token label={resource.examBoardName} size="sm" />
              </HStack>
            </HStack>

            {/* Subject & Topic indicator */}
            <HStack gap={1.5} vAlign="center" wrap="wrap">
              <Text type="supporting" color="secondary" size="xsm" weight="semibold">
                {resource.subjectName}
              </Text>
              {resource.topicName && (
                <>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-secondary)',
                      padding: '0 2px',
                    }}
                  >
                    ·
                  </span>
                  <Text type="supporting" color="secondary" size="xsm">
                    {resource.topicName}
                  </Text>
                </>
              )}
            </HStack>

            {/* Title */}
            <Text
              type="body"
              weight="semibold"
              style={{
                lineHeight: 1.35,
                fontSize: '1rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {resource.title}
            </Text>

            {/* Concise One-Line Descriptor */}
            <Text
              type="supporting"
              color="secondary"
              size="xsm"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.45,
              }}
            >
              {resource.description}
            </Text>

            {/* Academic Spec Details */}
            <HStack gap={1.5} vAlign="center" wrap="wrap" style={{ marginTop: 'var(--spacing-0.5)' }}>
              <Token label={`${resource.pageCount} pages`} size="sm" />
              <Token label={resource.fileType.toUpperCase()} size="sm" />
              {resource.tags && resource.tags[0] && (
                <Token label={`#${resource.tags[0]}`} size="sm" />
              )}
            </HStack>
          </VStack>

          {/* Footer Metadata & Actions */}
          <VStack gap={2} style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-2)' }}>
            <HStack justify="between" vAlign="center">
              {/* Creator info */}
              <HStack gap={1} vAlign="center">
                <Avatar size="xsm" name={resource.creatorUsername} />
                <Link
                  href={`/creator/${resource.creatorUsername}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  @{resource.creatorUsername}
                </Link>
                {resource.creatorReputation && (
                  <StatusDot variant="success" label="Verified creator" />
                )}
              </HStack>

              {/* Saves count */}
              <Text type="supporting" size="xsm" color="secondary">
                {formatSavesCount(resource.savesCount)}
              </Text>
            </HStack>

            {/* Actions Bar with loading feedback */}
            <HStack justify="between" vAlign="center">
              <HStack gap={1.5}>
                <Button
                  size="sm"
                  variant={saved ? 'primary' : 'secondary'}
                  label={isSaving ? 'Saving...' : (saved ? 'Saved' : 'Save')}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsSaving(true);
                    toggleSaveResource(resource.id);
                    setTimeout(() => setIsSaving(false), 300);
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  label="Share"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShareModalOpen(true);
                  }}
                />
              </HStack>

              {/* Rating */}
              <Text type="supporting" size="xsm" color="secondary">
                {formatRating(resource.ratingAvg, resource.ratingCount)}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </ClickableCard>

      <ShareCardModal
        resource={resource}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        defaultStyle="resource_stats"
      />
    </>
  );
}
