'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Resource, ShareCardStyle, UserProfile } from '@/lib/types';
import { renderShareCardToCanvas, renderProfileShareCardToCanvas } from '@/lib/shareCardRenderer';
import { useSyllabi } from '@/lib/store';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';

interface ShareCardModalProps {
  resource?: Resource | null;
  profile?: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  defaultStyle?: ShareCardStyle;
}

export function ShareCardModal({
  resource,
  profile,
  isOpen,
  onClose,
  defaultStyle = 'new_upload',
}: ShareCardModalProps) {
  const { showToast } = useSyllabi();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ShareCardStyle>(defaultStyle);
  const [format, setFormat] = useState<'story' | 'square'>('story');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (defaultStyle) {
      setSelectedStyle(defaultStyle);
    }
  }, [defaultStyle]);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      if (resource) {
        renderShareCardToCanvas(canvasRef.current, {
          resource,
          cardStyle: selectedStyle,
          format,
        });
      } else if (profile) {
        renderProfileShareCardToCanvas(canvasRef.current, {
          user: profile,
          format,
        });
      }
    }
  }, [isOpen, resource, profile, selectedStyle, format]);

  if (!isOpen || (!resource && !profile)) return null;

  const targetTitle = resource ? resource.title : `@${profile?.username}'s Profile`;
  const targetSlug = resource ? resource.slug : `creator/${profile?.username}`;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `syllabi-${targetSlug.replace('/', '-')}-${format}.png`;
    link.href = dataUrl;
    link.click();
    setIsExporting(false);
    showToast('Share card image downloaded');
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          showToast('Image copied to clipboard');
        } catch {
          handleDownload();
        }
      });
    } catch {
      handleDownload();
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = `${window.location.origin}/${targetSlug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: targetTitle,
          text: `Check out ${targetTitle} on Syllabi:`,
          url: shareUrl,
        });
        showToast('Shared successfully');
      } catch {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast('Link copied to clipboard');
    }
  };

  const handleWhatsApp = () => {
    const shareUrl = `${window.location.origin}/${targetSlug}`;
    const text = encodeURIComponent(`Study resources on Syllabi: ${targetTitle} — ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/${targetSlug}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Link copied to clipboard');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      width={720}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'min(88vh, 760px)',
          overflow: 'hidden',
        }}
      >
        <DialogHeader
          title={resource ? 'Share Resource' : 'Share Profile'}
          subtitle="Generate an editorial Strava-style share card for Instagram, WhatsApp, or messaging."
        />

        {/* Scrollable Center Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--spacing-3) var(--spacing-4)',
          }}
        >
          <VStack gap={3}>
            {/* Format & Style Selectors */}
            <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
              {resource && (
                <HStack gap={1} wrap="wrap">
                  <Button
                    size="sm"
                    variant={selectedStyle === 'new_upload' ? 'primary' : 'ghost'}
                    label="Milestone"
                    onClick={() => setSelectedStyle('new_upload')}
                  />
                  <Button
                    size="sm"
                    variant={selectedStyle === 'resource_stats' ? 'primary' : 'ghost'}
                    label="Stats"
                    onClick={() => setSelectedStyle('resource_stats')}
                  />
                  <Button
                    size="sm"
                    variant={selectedStyle === 'study_achievement' ? 'primary' : 'ghost'}
                    label="Achievement"
                    onClick={() => setSelectedStyle('study_achievement')}
                  />
                  <Button
                    size="sm"
                    variant={selectedStyle === 'popular_resource' ? 'primary' : 'ghost'}
                    label="Popular"
                    onClick={() => setSelectedStyle('popular_resource')}
                  />
                </HStack>
              )}

              <HStack gap={1}>
                <Button
                  size="sm"
                  variant={format === 'story' ? 'primary' : 'secondary'}
                  label="9:16 Story"
                  onClick={() => setFormat('story')}
                />
                <Button
                  size="sm"
                  variant={format === 'square' ? 'primary' : 'secondary'}
                  label="1:1 Square"
                  onClick={() => setFormat('square')}
                />
              </HStack>
            </HStack>

            {/* Canvas Preview Area — Independently scrollable if needed, never overflows viewport */}
            <div
              style={{
                backgroundColor: 'var(--color-background-muted)',
                borderRadius: 'var(--radius-element)',
                padding: 'var(--spacing-3)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 280,
                maxHeight: format === 'story' ? 380 : 340,
                overflow: 'auto',
                border: '1px solid var(--color-border)',
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  maxHeight: format === 'story' ? 360 : 320,
                  maxWidth: '100%',
                  width: 'auto',
                  borderRadius: 'var(--radius-element)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}
              />
            </div>
          </VStack>
        </div>

        {/* Sticky Action Footer */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            padding: 'var(--spacing-3) var(--spacing-4)',
            backgroundColor: 'var(--color-background-surface)',
          }}
        >
          <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
            <Button
              variant="secondary"
              size="sm"
              label="Cancel"
              onClick={onClose}
            />

            <HStack gap={2} wrap="wrap">
              <Button
                variant="secondary"
                size="sm"
                label="WhatsApp"
                onClick={handleWhatsApp}
              />
              <Button
                variant="secondary"
                size="sm"
                label="Copy Link"
                onClick={handleCopyLink}
              />
              <Button
                variant="secondary"
                size="sm"
                label="Copy Image"
                onClick={handleCopyImage}
              />
              <Button
                variant="primary"
                size="sm"
                label={isExporting ? 'Generating...' : 'Download PNG'}
                onClick={handleDownload}
              />
            </HStack>
          </HStack>
        </div>
      </div>
    </Dialog>
  );
}
