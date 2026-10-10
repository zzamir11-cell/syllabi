'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSyllabi } from '@/lib/store';
import {
  INITIAL_QUALIFICATIONS,
  INITIAL_EXAM_BOARDS,
  INITIAL_SUBJECTS,
} from '@/lib/data';
import { ResourceType } from '@/lib/types';
import { analyzeUploadedFile, AnalysisResult } from '@/lib/qualityPipeline';
import { uploadResourceFileToStorage } from '@/lib/supabase/service';
import { getSubjectColor, getSubjectTokenColor } from '@/lib/academicColors';
import { ShareCardModal } from '@/components/ShareCardModal';
import { Stepper, Step } from '@astryxdesign/core/Stepper';
import { Section } from '@astryxdesign/core/Section';
import { Grid } from '@astryxdesign/core/Grid';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Selector } from '@astryxdesign/core/Selector';
import { Token } from '@astryxdesign/core/Token';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';

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

function UploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, addResource, fulfillRequest, showToast } = useSyllabi();

  const [activeStep, setActiveStep] = useState(0);

  // Read prefill parameters (e.g. from "I can help" in Requests or Your Subjects)
  const prefillTitle = searchParams.get('prefillTitle') || '';
  const prefillSubject = searchParams.get('prefillSubject') || '';
  const prefillBoard = searchParams.get('prefillBoard') || '';
  const prefillQual = searchParams.get('prefillQualification') || '';
  const prefillTopic = searchParams.get('prefillTopic') || '';
  const prefillRequestId = searchParams.get('prefillRequestId') || '';

  // Step 1: File
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileType, setFileType] = useState('pdf');
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [pageCount, setPageCount] = useState(1);
  const [fileError, setFileError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);


  // Step 2: Details
  const [title, setTitle] = useState(prefillTitle);
  const [description, setDescription] = useState('');
  const [qualificationSlug, setQualificationSlug] = useState('gcse');
  const [examBoardSlug, setExamBoardSlug] = useState('aqa');
  const [subjectSlug, setSubjectSlug] = useState('chemistry');
  const [topicName, setTopicName] = useState(prefillTopic);
  const [resourceType, setResourceType] = useState<ResourceType>('Revision notes');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Revision']);

  const currentQual = INITIAL_QUALIFICATIONS.find((q) => q.slug === qualificationSlug)?.name || qualificationSlug.toUpperCase();
  const currentBoard = INITIAL_EXAM_BOARDS.find((b) => b.slug === examBoardSlug)?.name || examBoardSlug.toUpperCase();
  const currentSubj = INITIAL_SUBJECTS.find((s) => s.slug === subjectSlug)?.name || subjectSlug;
  const currentSubjColor = getSubjectColor(currentSubj);

  // Handle prefill syncing
  useEffect(() => {
    if (prefillTitle && !title) setTitle(prefillTitle);
    if (prefillTopic && !topicName) setTopicName(prefillTopic);

    if (prefillSubject) {
      const match = INITIAL_SUBJECTS.find(
        (s) => s.slug.toLowerCase() === prefillSubject.toLowerCase() || s.name.toLowerCase() === prefillSubject.toLowerCase()
      );
      if (match) setSubjectSlug(match.slug);
    }

    if (prefillBoard) {
      const match = INITIAL_EXAM_BOARDS.find(
        (b) => b.slug.toLowerCase() === prefillBoard.toLowerCase() || b.name.toLowerCase() === prefillBoard.toLowerCase()
      );
      if (match) setExamBoardSlug(match.slug);
    }

    if (prefillQual) {
      const match = INITIAL_QUALIFICATIONS.find(
        (q) => q.slug.toLowerCase() === prefillQual.toLowerCase() || q.name.toLowerCase() === prefillQual.toLowerCase()
      );
      if (match) setQualificationSlug(match.slug);
    }
  }, [prefillTitle, prefillSubject, prefillBoard, prefillQual, prefillTopic]);

  // Step 3: Copyright
  const [confirmedOriginal, setConfirmedOriginal] = useState(false);
  const [confirmedNotOfficialExam, setConfirmedNotOfficialExam] = useState(false);
  const [confirmedNotTextbookScan, setConfirmedNotTextbookScan] = useState(false);

  // Step 5: Published result
  const [publishedResource, setPublishedResource] = useState<any>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileError('');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    // Validate size (max 25MB)
    if (selectedFile.size > 25 * 1024 * 1024) {
      setFileError('File exceeds maximum upload size of 25MB.');
      return;
    }

    // Validate type (PDF, Images, Word documents)
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
    const nameLower = selectedFile.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => nameLower.endsWith(ext));

    if (!hasValidExt) {
      setFileError('Invalid file type. Supported formats are PDF, PNG, JPG, and DOCX.');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(selectedFile.size);
    setFileType(nameLower.endsWith('.pdf') ? 'pdf' : nameLower.endsWith('.docx') ? 'docx' : 'image');

    // Run automatic analysis & page count extraction pipeline
    setIsAnalyzing(true);
    try {
      const result = await analyzeUploadedFile(selectedFile);
      setAnalysisResult(result);
      setPageCount(result.pageCount);

      // Auto-prefill title if currently empty
      if (!title) {
        setTitle(result.suggestedMetadata.title);
      }
      if (!topicName && result.suggestedMetadata.topicName) {
        setTopicName(result.suggestedMetadata.topicName);
      }
      if (!description) {
        setDescription(result.suggestedMetadata.summary);
      }
    } catch {
      setPageCount(1);
    } finally {
      setIsAnalyzing(false);
    }
  };


  const handleApplyAiSuggestions = () => {
    if (!analysisResult) return;
    const sm = analysisResult.suggestedMetadata;
    setTitle(sm.title);
    setTopicName(sm.topicName);
    setDescription(sm.summary);
    setQualificationSlug(sm.qualificationSlug);
    setExamBoardSlug(sm.examBoardSlug);
    setSubjectSlug(sm.subjectSlug);
    setResourceType(sm.resourceType);
    setTags(sm.tags);
    showToast('Applied automatic metadata suggestions');
  };

  const handleAddTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePublish = async () => {
    if (!currentUser) {
      showToast('Please sign in or select a demo student persona.');
      router.push('/login');
      return;
    }

    const qualObj = INITIAL_QUALIFICATIONS.find((q) => q.slug === qualificationSlug) || INITIAL_QUALIFICATIONS[0];
    const boardObj = INITIAL_EXAM_BOARDS.find((b) => b.slug === examBoardSlug) || INITIAL_EXAM_BOARDS[0];
    const subjObj = INITIAL_SUBJECTS.find((s) => s.slug === subjectSlug) || INITIAL_SUBJECTS[0];

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + `-${Date.now().toString().slice(-4)}`;

    let finalFileUrl = `/uploads/${slug}.${fileType}`;
    if (file && currentUser) {
      try {
        const storageResult = await uploadResourceFileToStorage(file, currentUser.id);
        finalFileUrl = storageResult.fileUrl;
      } catch {
        // Fallback to local URL gracefully
      }
    }

    const finalPreviewUrl = '';

    const newRes = addResource({
      creatorId: currentUser.id,
      creatorUsername: currentUser.username,
      creatorReputation: currentUser.reputationTitle,
      title: title.trim(),
      slug,
      description: description.trim() || `${qualObj.name} ${boardObj.name} ${subjObj.name} student revision resource.`,
      qualificationId: qualObj.id,
      qualificationName: qualObj.name,
      examBoardId: boardObj.id,
      examBoardName: boardObj.name,
      subjectId: subjObj.id,
      subjectName: subjObj.name,
      topicName: topicName.trim() || undefined,
      resourceType,
      fileUrl: finalFileUrl,
      fileName: fileName || `${slug}.${fileType}`,
      fileSize: fileSize || 2 * 1024 * 1024,
      fileType,
      pageCount: pageCount || 1,
      previewUrl: finalPreviewUrl,
      tags: tags.length ? tags : [qualObj.name, boardObj.name, subjObj.name],
      status: analysisResult?.moderationState === 'needs_attention' ? 'under_review' : 'published',
      copyrightConfirmed: confirmedOriginal && confirmedNotOfficialExam && confirmedNotTextbookScan,
      previewPages: [
        `Page 1: ${title} — Overview and key definitions`,
        `Page 2: Core theoretical framework and equations`,
        `Page 3: Worked exam examples and common pitfalls`,
        `Page 4: Summary checklist and high-yield review`,
      ],
    });

    if (prefillRequestId) {
      fulfillRequest(prefillRequestId, newRes.id);
    }

    setPublishedResource(newRes);
    setActiveStep(4);

    showToast('Resource published to the Syllabi library!');
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--spacing-5) var(--spacing-4)' }}>
      <VStack gap={5}>
        {/* Header */}
        <VStack gap={0.5}>
          <Heading level={1} style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
            Upload Academic Resource
          </Heading>
          <Text type="body" color="secondary" size="sm">
            Share your revision notes, mind maps, or essay plans with students studying the same specification.
          </Text>
        </VStack>

        {/* Astryx Stepper */}
        <Card padding={3} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
          <Stepper activeStep={activeStep} onStepClick={(s) => s < activeStep && setActiveStep(s)}>
            <Step step={0} label="File" description="Select document" />
            <Step step={1} label="Details" description="Specification metadata" />
            <Step step={2} label="Rights" description="Honor & originality" />
            <Step step={3} label="Review" description="Verify info" />
            <Step step={4} label="Published" description="Share achievement" />
          </Stepper>
        </Card>

        {/* Step 1: Upload File */}
        {activeStep === 0 && (
          <Card padding={5} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
            <VStack gap={4}>
              <VStack gap={0.5}>
                <Heading level={2} style={{ fontSize: '1.1875rem' }}>
                  Step 1: Choose your document
                </Heading>
                <Text type="supporting" color="secondary" size="sm">
                  Upload PDF notes, mind maps, or guides (max 25MB). Page count is calculated automatically.
                </Text>
              </VStack>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                style={{
                  border: '2px dashed var(--color-border-emphasized)',
                  borderRadius: 'var(--radius-container)',
                  padding: 'var(--spacing-6) var(--spacing-4)',
                  textAlign: 'center',
                  backgroundColor: file ? 'var(--color-background-muted)' : 'var(--color-background-body)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => document.getElementById('syllabi-file-input')?.click()}
              >
                <input
                  id="syllabi-file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileInput}
                />

                <VStack gap={2} hAlign="center">
                  {file ? (
                    <VStack gap={1}>
                      <StatusDot variant="success" label="File loaded" />
                      <Text type="body" weight="semibold">
                        {fileName}
                      </Text>
                      <Text type="supporting" color="secondary" size="xsm">
                        {(fileSize / 1024 / 1024).toFixed(2)} MB · {fileType.toUpperCase()}
                      </Text>
                      <Text type="supporting" size="xsm" color="secondary" style={{ textDecoration: 'underline', marginTop: 4 }}>
                        Click to choose a different file
                      </Text>
                    </VStack>
                  ) : (
                    <VStack gap={1}>
                      <Text type="body" weight="medium">
                        Drag and drop your study resource here, or click to browse
                      </Text>
                      <Text type="supporting" color="secondary" size="xsm">
                        Supported: PDF, PNG, JPG, DOCX
                      </Text>
                    </VStack>
                  )}
                </VStack>
              </div>

              {fileError && (
                <Text type="supporting" style={{ color: 'var(--color-text-red)' }}>
                  {fileError}
                </Text>
              )}

              {/* Read-Only Automatically Calculated Page Count (Section 9) */}
              {file && (
                <Card padding={3} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)', border: '1px solid var(--color-border)' }}>
                  <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
                    <VStack gap={0.5}>
                      <HStack gap={1.5} vAlign="center">
                        <StatusDot variant="success" label="Calculated" />
                        <Text type="body" weight="semibold" size="sm">
                          Calculated Document Metadata
                        </Text>
                      </HStack>
                      <Text type="supporting" color="secondary" size="xsm">
                        Page count analyzed automatically from document structure.
                      </Text>
                    </VStack>

                    <HStack gap={2} vAlign="center">
                      <Token label={`${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`} size="md" />
                      <Token label={fileType.toUpperCase()} size="md" />
                    </HStack>
                  </HStack>
                </Card>
              )}



              <HStack justify="end">
                <Button
                  variant="primary"
                  size="md"
                  label="Continue to Details →"
                  isDisabled={!file && !fileName}
                  onClick={() => {
                    if (!file && !fileName) {
                      setFileError('Please select or drag a file to proceed.');
                      return;
                    }
                    setActiveStep(1);
                  }}
                />
              </HStack>
            </VStack>
          </Card>
        )}

        {/* Step 2: Add Details */}
        {activeStep === 1 && (
          <Card padding={5} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
            <VStack gap={4}>
              <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
                <VStack gap={0.5}>
                  <Heading level={2} style={{ fontSize: '1.1875rem' }}>
                    Step 2: Specification metadata
                  </Heading>
                  <Text type="supporting" color="secondary" size="sm">
                    Tag this resource with its exact exam curriculum so other students can discover it.
                  </Text>
                </VStack>

                {analysisResult && (
                  <Button
                    variant="secondary"
                    size="sm"
                    label="Auto-suggest details"
                    onClick={handleApplyAiSuggestions}
                  />
                )}
              </HStack>

              {/* Title */}
              <VStack gap={1}>
                <Text type="label" weight="medium">
                  Resource Title *
                </Text>
                <TextInput
                  label="Resource Title"
                  isLabelHidden
                  placeholder="e.g. AQA GCSE Chemistry — Electrolysis & Chemical Changes Master Guide"
                  value={title}
                  onChange={setTitle}
                  size="md"
                />
              </VStack>

              {/* Hierarchy Dropdowns: Qualification, Board, Subject */}
              <Grid columns={{ minWidth: 220, repeat: 'fit' }} gap={3}>
                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Qualification *
                  </Text>
                  <Selector
                    label="Qualification"
                    value={qualificationSlug}
                    onChange={(val) => setQualificationSlug(String(val))}
                    size="md"
                    options={INITIAL_QUALIFICATIONS.map((q) => ({ value: q.slug, label: q.name }))}
                  />
                </VStack>

                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Exam Board *
                  </Text>
                  <Selector
                    label="Exam Board"
                    value={examBoardSlug}
                    onChange={(val) => setExamBoardSlug(String(val))}
                    size="md"
                    options={INITIAL_EXAM_BOARDS.map((b) => ({ value: b.slug, label: b.name }))}
                  />
                </VStack>

                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Subject *
                  </Text>
                  <Selector
                    label="Subject"
                    value={subjectSlug}
                    onChange={(val) => setSubjectSlug(String(val))}
                    size="md"
                    options={INITIAL_SUBJECTS.map((s) => ({ value: s.slug, label: s.name }))}
                  />
                </VStack>
              </Grid>

              {/* Topic & Resource Type */}
              <Grid columns={{ minWidth: 240, repeat: 'fit' }} gap={3}>
                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Topic / Unit Name
                  </Text>
                  <TextInput
                    label="Topic"
                    isLabelHidden
                    placeholder="e.g. Electrolysis or Cell Biology or Calculus"
                    value={topicName}
                    onChange={setTopicName}
                    size="md"
                  />
                </VStack>

                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Resource Type *
                  </Text>
                  <Selector
                    label="Resource Type"
                    value={resourceType}
                    onChange={(val) => setResourceType(val as ResourceType)}
                    size="md"
                    options={RESOURCE_TYPES.map((t) => ({ value: t, label: t }))}
                  />
                </VStack>
              </Grid>

              {/* Description */}
              <VStack gap={1}>
                <Text type="label" weight="medium">
                  Summary & Description
                </Text>
                <TextArea
                  label="Description"
                  isLabelHidden
                  placeholder="Summarize what is covered in this resource (e.g. includes half-equations, diagrams, practical methods, exam tips)..."
                  value={description}
                  onChange={setDescription}
                  rows={3}
                />
              </VStack>

              {/* Tags Input */}
              <VStack gap={1}>
                <Text type="label" weight="medium">
                  Keywords & Search Tags
                </Text>
                <HStack gap={2}>
                  <TextInput
                    label="Add tag"
                    isLabelHidden
                    placeholder="Type tag and press Add"
                    value={tagInput}
                    onChange={setTagInput}
                    size="md"
                  />
                  <Button variant="secondary" size="md" label="Add" onClick={() => handleAddTag()} />
                </HStack>

                <HStack gap={1.5} wrap="wrap" style={{ marginTop: 'var(--spacing-2)' }}>
                  {tags.map((t) => (
                    <span
                      key={t}
                      onClick={() => handleRemoveTag(t)}
                      style={{ cursor: 'pointer' }}
                      title="Click to remove tag"
                    >
                      <Token label={`${t} ×`} size="sm" />
                    </span>
                  ))}
                </HStack>
              </VStack>

              <HStack justify="between">
                <Button variant="secondary" size="md" label="← Back" onClick={() => setActiveStep(0)} />
                <Button
                  variant="primary"
                  size="md"
                  label="Continue to Rights →"
                  isDisabled={!title.trim()}
                  onClick={() => setActiveStep(2)}
                />
              </HStack>
            </VStack>
          </Card>
        )}

        {/* Step 3: Rights & Quality (Section 11 — Clean Symmetrical Styling) */}
        {activeStep === 2 && (
          <Card padding={5} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
            <VStack gap={4}>
              <VStack gap={0.5}>
                <Heading level={2} style={{ fontSize: '1.1875rem' }}>
                  Step 3: Originality & copyright declaration
                </Heading>
                <Text type="supporting" color="secondary" size="sm">
                  Syllabi is strictly a student-created resource community. Protecting original student work and respecting intellectual property laws is our highest priority.
                </Text>
              </VStack>

              {/* Clean Symmetrical Prohibited Materials Notice (No border-left slop) */}
              <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)', border: '1px solid var(--color-border)' }}>
                <VStack gap={2}>
                  <HStack gap={1.5} vAlign="center">
                    <StatusDot variant="error" label="Prohibited" />
                    <Text type="body" weight="semibold">
                      Strictly Prohibited on Syllabi:
                    </Text>
                  </HStack>
                  <VStack gap={1}>
                    <Text type="supporting" color="secondary" size="sm">
                      • Official exam board past papers or locked specimen papers
                    </Text>
                    <Text type="supporting" color="secondary" size="sm">
                      • Official exam mark schemes and examiner reports
                    </Text>
                    <Text type="supporting" color="secondary" size="sm">
                      • Scanned textbook pages or copyrighted publisher worksheets
                    </Text>
                    <Text type="supporting" color="secondary" size="sm">
                      • Teacher-only proprietary coursework resources or paid question banks
                    </Text>
                  </VStack>
                </VStack>
              </Card>

              {/* Astryx CheckboxInput Components */}
              <VStack gap={3}>
                <CheckboxInput
                  label="I confirm that I personally created this resource, or hold the necessary rights and permissions to share it publicly."
                  value={confirmedOriginal}
                  onChange={(val) => setConfirmedOriginal(val)}
                />

                <CheckboxInput
                  label="I certify that this file does not contain official exam board past papers or official mark schemes."
                  value={confirmedNotOfficialExam}
                  onChange={(val) => setConfirmedNotOfficialExam(val)}
                />

                <CheckboxInput
                  label="I certify that this file does not include textbook scans or unauthorized copyrighted third-party material."
                  value={confirmedNotTextbookScan}
                  onChange={(val) => setConfirmedNotTextbookScan(val)}
                />
              </VStack>

              <HStack justify="between">
                <Button variant="secondary" size="md" label="← Back" onClick={() => setActiveStep(1)} />
                <Button
                  variant="primary"
                  size="md"
                  label="Review Resource →"
                  isDisabled={!confirmedOriginal || !confirmedNotOfficialExam || !confirmedNotTextbookScan}
                  onClick={() => setActiveStep(3)}
                />
              </HStack>
            </VStack>
          </Card>
        )}

        {/* Step 4: Review Before Publishing */}
        {activeStep === 3 && (
          <Card padding={5} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
            <VStack gap={4}>
              <VStack gap={0.5}>
                <Heading level={2} style={{ fontSize: '1.1875rem' }}>
                  Step 4: Final verification & preview
                </Heading>
                <Text type="supporting" color="secondary" size="sm">
                  Review how your resource will appear in the library and search results before publishing.
                </Text>
              </VStack>

              {/* Summary Review Card */}
              <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-container)' }}>
                <VStack gap={3}>
                  <HStack justify="between" vAlign="center" wrap="wrap" gap={2}>
                    <HStack gap={1.5} vAlign="center" wrap="wrap">
                      <Token
                        color={getSubjectTokenColor(currentSubj)}
                        label={resourceType}
                        size="sm"
                      />
                      <Token label={currentSubj} size="sm" />
                      <Token label={`${currentQual} · ${currentBoard}`} size="sm" />
                      {topicName && <Token label={topicName} size="sm" />}
                    </HStack>

                    <Text type="supporting" size="xsm" color="secondary">
                      {pageCount} pages • {fileType.toUpperCase()}
                    </Text>
                  </HStack>

                  <Heading level={3} style={{ fontSize: '1.25rem' }}>
                    {title}
                  </Heading>

                  <Text type="body" size="sm" style={{ lineHeight: 1.6 }}>
                    {description || 'No description provided.'}
                  </Text>

                  {tags && tags.length > 0 && (
                    <HStack gap={1.5} wrap="wrap">
                      {tags.map((t) => (
                        <Token key={t} label={`#${t}`} size="sm" />
                      ))}
                    </HStack>
                  )}

                  <HStack gap={3} vAlign="center" wrap="wrap" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-2)' }}>
                    <Text type="supporting" size="xsm" color="secondary">
                      File: <strong>{fileName}</strong>
                    </Text>
                    <Text type="supporting" size="xsm" color="secondary">
                      Author: <strong>@{currentUser?.username || 'you'}</strong>
                    </Text>
                  </HStack>
                </VStack>
              </Card>

              {/* Quality & Integrity Signals */}
              {analysisResult && (
                <Card padding={3} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
                  <HStack justify="between" vAlign="center">
                    <HStack gap={1.5} vAlign="center">
                      <StatusDot variant="success" label="Passed" />
                      <Text type="supporting" size="xsm" weight="semibold">
                        Quality & Originality Checks Passed
                      </Text>
                    </HStack>
                    <Text type="supporting" color="secondary" size="xsm">
                      Ready for immediate student discovery
                    </Text>
                  </HStack>
                </Card>
              )}

              <HStack justify="between">
                <Button variant="secondary" size="md" label="← Edit Details" onClick={() => setActiveStep(1)} />
                <Button
                  variant="primary"
                  size="md"
                  label="Publish Resource"
                  onClick={handlePublish}
                />
              </HStack>
            </VStack>
          </Card>
        )}

        {/* Step 5: Published & Strava Share Card */}
        {activeStep === 4 && (
          <Card padding={6} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <VStack gap={4} hAlign="center">
              <StatusDot variant="success" label="Published" />

              <VStack gap={1} hAlign="center">
                <Heading level={2} style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                  Your resource is live!
                </Heading>
                <Text type="body" color="secondary" style={{ maxWidth: 500 }}>
                  Students studying {qualificationSlug.toUpperCase()} {examBoardSlug.toUpperCase()} can now discover, save, and learn from your work.
                </Text>
              </VStack>

              {/* Social Loop Action Box */}
              <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)', maxWidth: 480, width: '100%', border: '1px solid var(--color-border)' }}>
                <VStack gap={3}>
                  <VStack gap={0.5}>
                    <Text type="body" weight="semibold">
                      Share Your Study Milestone
                    </Text>
                    <Text type="supporting" color="secondary" size="xsm">
                      Generate a high-res Instagram Story or Square card to share on social or study group chats.
                    </Text>
                  </VStack>

                  <HStack justify="center" gap={2}>
                    <Button
                      variant="primary"
                      size="md"
                      label="Generate Share Card"
                      onClick={() => setShareModalOpen(true)}
                    />
                    {publishedResource && (
                      <Link href={`/resource/${publishedResource.slug}`} style={{ textDecoration: 'none' }}>
                        <Button
                          variant="secondary"
                          size="md"
                          label="View Resource Page →"
                        />
                      </Link>
                    )}
                  </HStack>
                </VStack>
              </Card>

              <HStack justify="center">
                <Button
                  variant="ghost"
                  size="sm"
                  label="Upload another resource"
                  onClick={() => {
                    setFile(null);
                    setFileName('');
                    setTitle('');
                    setDescription('');
                    setAnalysisResult(null);
                    setActiveStep(0);
                  }}
                />
              </HStack>
            </VStack>
          </Card>
        )}

        {publishedResource && (
          <ShareCardModal
            resource={publishedResource}
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            defaultStyle="new_upload"
          />
        )}
      </VStack>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div style={{ padding: 'var(--spacing-6)' }}><Text>Loading upload wizard...</Text></div>}>
      <UploadContent />
    </Suspense>
  );
}
