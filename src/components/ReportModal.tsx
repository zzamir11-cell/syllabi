'use client';

import React, { useState } from 'react';
import { useSyllabi } from '@/lib/store';
import { Report } from '@/lib/types';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextArea } from '@astryxdesign/core/TextArea';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'resource' | 'profile' | 'request';
  targetId: string;
  targetTitle: string;
}

const REPORT_REASONS: { key: Report['reason']; label: string; description: string }[] = [
  {
    key: 'copyright',
    label: 'Copyright infringement',
    description: 'Uploaded material owned by someone else without permission',
  },
  {
    key: 'official_exam_material',
    label: 'Official exam paper or mark scheme',
    description: 'Official assessment materials from exam boards are prohibited on Syllabi',
  },
  {
    key: 'plagiarism',
    label: 'Plagiarism / uncredited work',
    description: 'Copied student work or textbook verbatim',
  },
  {
    key: 'spam',
    label: 'Spam or commercial promotion',
    description: 'Links, advertisements, or non-educational spam',
  },
  {
    key: 'misleading',
    label: 'Misleading or inaccurate academic content',
    description: 'Fabricated formulas, factually incorrect information, or broken files',
  },
  {
    key: 'harassment',
    label: 'Harassment or abuse',
    description: 'Targeted hostility or bullying',
  },
  {
    key: 'other',
    label: 'Other policy violation',
    description: 'Violates our terms of service or community guidelines',
  },
];

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: ReportModalProps) {
  const { submitReport } = useSyllabi();
  const [selectedReason, setSelectedReason] = useState<Report['reason']>('copyright');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    submitReport(targetType, targetId, targetTitle, selectedReason, details);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()} width={620}>
      <DialogHeader
        title={`Report ${targetType === 'resource' ? 'Resource' : targetType === 'profile' ? 'Profile' : 'Request'}`}
        subtitle={`Reporting "${targetTitle}". Our moderation team investigates all reports thoroughly.`}
      />
      <VStack gap={4} padding={4}>
        <VStack gap={2}>
          <Text type="label" weight="medium">
            Reason for report
          </Text>
          <RadioList
            label="Reason for report"
            isLabelHidden
            htmlName="report-reason"
            value={selectedReason}
            onChange={(val) => setSelectedReason(val as Report['reason'])}
          >
            {REPORT_REASONS.map((r) => (
              <RadioListItem
                key={r.key}
                value={r.key}
                label={r.label}
                description={r.description}
              />
            ))}
          </RadioList>
        </VStack>

        <VStack gap={1}>
          <Text type="label" weight="medium">
            Additional details (optional)
          </Text>
          <TextArea
            label="Additional details"
            isLabelHidden
            placeholder="Please provide any context or links to help our moderation team evaluate this report..."
            value={details}
            onChange={setDetails}
            rows={3}
          />
        </VStack>

        <HStack gap={3} justify="end">
          <Button variant="secondary" label="Cancel" onClick={onClose} />
          <Button
            variant="destructive"
            label={isSubmitting ? 'Submitting...' : 'Submit Report'}
            onClick={handleSubmit}
          />
        </HStack>
      </VStack>
    </Dialog>
  );
}

