'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyllabi } from '@/lib/store';
import {
  INITIAL_QUALIFICATIONS,
  INITIAL_EXAM_BOARDS,
  INITIAL_SUBJECTS,
} from '@/lib/data';
import { ResourceRequest } from '@/lib/types';
import { getSubjectColor, getStatusStyle } from '@/lib/academicColors';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Token } from '@astryxdesign/core/Token';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Selector } from '@astryxdesign/core/Selector';

export default function RequestsPage() {
  const router = useRouter();
  const { requests, createRequest, updateRequest, currentUser, resources } = useSyllabi();

  // Exactly TWO primary sections: "for_you" and "my_requests"
  const [activeTab, setActiveTab] = useState<'for_you' | 'my_requests'>('for_you');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ResourceRequest | null>(null);

  // Form states for creation (Pre-filled with user's academic profile)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [qualification, setQualification] = useState(currentUser?.qualification || 'GCSE');
  const [examBoard, setExamBoard] = useState(currentUser?.examBoard || 'AQA');
  const [subject, setSubject] = useState(currentUser?.subjects[0] || 'Chemistry');
  const [topicName, setTopicName] = useState('');

  // Form states for editing
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editQual, setEditQual] = useState('');
  const [editBoard, setEditBoard] = useState('');
  const [editSubj, setEditSubj] = useState('');
  const [editTopic, setEditTopic] = useState('');

  const userSubjects = currentUser?.subjects || ['Chemistry', 'Biology', 'Physics'];
  const userQual = currentUser?.qualification || 'GCSE';
  const userBoard = currentUser?.examBoard || 'AQA';

  // "FOR YOU" RANKING & FILTERING
  // Requests other students made that current user can realistically help with
  const forYouRequests = requests
    .filter((req) => req.status === 'open')
    .map((req) => {
      let matchScore = 0;
      const subjMatch = userSubjects.some(
        (s) => s.toLowerCase() === req.subjectName.toLowerCase()
      );
      const qualMatch = req.qualificationName.toLowerCase() === userQual.toLowerCase();
      const boardMatch = req.examBoardName.toLowerCase() === userBoard.toLowerCase();

      if (subjMatch) matchScore += 10;
      if (qualMatch) matchScore += 5;
      if (boardMatch) matchScore += 3;

      return { req, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((item) => item.req);

  // "MY REQUESTS" FILTERING
  const myRequests = requests.filter(
    (req) => req.username.toLowerCase() === (currentUser?.username || '').toLowerCase()
  );

  const myOpenRequests = myRequests.filter((r) => r.status === 'open');
  const myFulfilledRequests = myRequests.filter((r) => r.status === 'fulfilled');

  const handleOpenCreateModal = () => {
    // Pre-fill with current user's profile
    setQualification(currentUser?.qualification || 'GCSE');
    setExamBoard(currentUser?.examBoard || 'AQA');
    setSubject(currentUser?.subjects[0] || 'Chemistry');
    setTitle('');
    setDescription('');
    setTopicName('');
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = () => {
    if (!title.trim()) return;
    createRequest({
      title: title.trim(),
      description: description.trim() || 'Looking for clear student revision notes for this topic.',
      qualificationName: qualification,
      examBoardName: examBoard,
      subjectName: subject,
      topicName: topicName.trim() || undefined,
    });
    setCreateModalOpen(false);
  };

  const handleStartEdit = (req: ResourceRequest) => {
    if (req.status === 'fulfilled') return; // Immutable
    setEditingRequest(req);
    setEditTitle(req.title);
    setEditDesc(req.description);
    setEditQual(req.qualificationName);
    setEditBoard(req.examBoardName);
    setEditSubj(req.subjectName);
    setEditTopic(req.topicName || '');
  };

  const handleSaveEdit = () => {
    if (!editingRequest || !editTitle.trim()) return;
    updateRequest(editingRequest.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      qualificationName: editQual,
      examBoardName: editBoard,
      subjectName: editSubj,
      topicName: editTopic.trim() || undefined,
    });
    setEditingRequest(null);
  };

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: 'var(--spacing-5) var(--spacing-4)' }}>
      <VStack gap={5}>
        {/* Header */}
        <HStack justify="between" vAlign="center" wrap="wrap" gap={3}>
          <VStack gap={0.5}>
            <Heading level={1} style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
              Resource Requests
            </Heading>
            <Text type="body" color="secondary" size="sm">
              Ask peer students for specific revision notes, mind maps, or essay plans you need.
            </Text>
          </VStack>

          <Button
            variant="primary"
            size="sm"
            label="Request a Resource"
            onClick={handleOpenCreateModal}
          />
        </HStack>

        {/* Simplified Two-Tab Navigation */}
        <HStack gap={2} vAlign="center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-2)' }}>
          <Button
            size="sm"
            variant={activeTab === 'for_you' ? 'primary' : 'ghost'}
            label={`For You (${forYouRequests.length})`}
            onClick={() => setActiveTab('for_you')}
          />
          <Button
            size="sm"
            variant={activeTab === 'my_requests' ? 'primary' : 'ghost'}
            label={`My Requests (${myRequests.length})`}
            onClick={() => setActiveTab('my_requests')}
          />
        </HStack>

        {/* TAB 1: FOR YOU (Action-oriented: Requests I Can Help With) */}
        {activeTab === 'for_you' && (
          <VStack gap={4}>
            <HStack justify="between" vAlign="center">
              <Text type="supporting" color="secondary" size="sm">
                Requests matching your subjects (<strong>{userSubjects.join(', ')}</strong>) and curriculum (<strong>{userQual} · {userBoard}</strong>).
              </Text>
              <Text type="supporting" color="secondary" size="xsm">
                Sorted by specification relevance
              </Text>
            </HStack>

            {forYouRequests.length > 0 ? (
              <Grid columns={{ minWidth: 320, repeat: 'fit' }} gap={3}>
                {forYouRequests.map((req) => {
                  const subjColor = getSubjectColor(req.subjectName);

                  return (
                    <Card
                      key={req.id}
                      padding={4}
                      elevation="none"
                      style={{
                        backgroundColor: 'var(--color-background-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-container)',
                      }}
                    >
                      <VStack gap={3} height="100%" justify="between">
                        <VStack gap={2}>
                          {/* Specification Tags */}
                          <HStack justify="between" vAlign="start">
                            <HStack gap={1.5} vAlign="center" wrap="wrap">
                              <span
                                style={{
                                  backgroundColor: subjColor.lightBgHex,
                                  color: subjColor.accentHex,
                                  border: `1px solid ${subjColor.accentHex}33`,
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-inner)',
                                }}
                              >
                                {req.subjectName}
                              </span>
                              <Token label={`${req.qualificationName} · ${req.examBoardName}`} size="sm" />
                            </HStack>

                            <HStack gap={1} vAlign="center">
                              <StatusDot variant="warning" label="Open" />
                              <Text type="supporting" size="xsm" weight="semibold">
                                Open
                              </Text>
                            </HStack>
                          </HStack>

                          {/* Request Title */}
                          <Text type="body" weight="semibold" size="base">
                            {req.title}
                          </Text>

                          {req.topicName && (
                            <Text type="supporting" color="secondary" size="xsm">
                              Topic: <strong>{req.topicName}</strong>
                            </Text>
                          )}

                          {/* Description */}
                          <Text type="supporting" color="secondary" size="sm" style={{ lineHeight: 1.4 }}>
                            {req.description}
                          </Text>
                        </VStack>

                        {/* Bottom Action: "I Can Help" redirects to pre-filled upload */}
                        <HStack
                          justify="between"
                          vAlign="center"
                          style={{
                            borderTop: '1px solid var(--color-border)',
                            paddingTop: 'var(--spacing-3)',
                            marginTop: 'var(--spacing-2)',
                          }}
                        >
                          <Text type="supporting" size="xsm" color="secondary">
                            Requested by @{req.username}
                          </Text>

                          <Link
                            href={`/upload?prefillQualification=${encodeURIComponent(req.qualificationName)}&prefillBoard=${encodeURIComponent(req.examBoardName)}&prefillSubject=${encodeURIComponent(req.subjectName)}&prefillTopic=${encodeURIComponent(req.topicName || '')}&prefillTitle=${encodeURIComponent(req.title)}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <Button
                              size="sm"
                              variant="secondary"
                              label="I Can Help →"
                            />
                          </Link>
                        </HStack>
                      </VStack>
                    </Card>
                  );
                })}
              </Grid>
            ) : (
              <Card padding={6} elevation="none" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <VStack gap={2} hAlign="center">
                  <Text type="body" weight="semibold">
                    No open requests matching your subjects right now.
                  </Text>
                  <Text type="supporting" color="secondary" size="sm">
                    Be the first student to upload revision material or post a request for your class!
                  </Text>
                  <Button variant="primary" size="sm" label="Post a Request" onClick={handleOpenCreateModal} />
                </VStack>
              </Card>
            )}
          </VStack>
        )}

        {/* TAB 2: MY REQUESTS (Differentiating Open [Editable] vs Fulfilled [Locked]) */}
        {activeTab === 'my_requests' && (
          <VStack gap={5}>
            {/* Open / Unanswered Section */}
            <VStack gap={3}>
              <HStack justify="between" vAlign="center">
                <Text type="body" weight="semibold">
                  Unanswered Requests ({myOpenRequests.length})
                </Text>
                <Text type="supporting" color="secondary" size="xsm">
                  Open — You can edit these requests
                </Text>
              </HStack>

              {myOpenRequests.length > 0 ? (
                <Grid columns={{ minWidth: 320, repeat: 'fit' }} gap={3}>
                  {myOpenRequests.map((req) => (
                    <Card
                      key={req.id}
                      padding={4}
                      elevation="none"
                      style={{
                        backgroundColor: 'var(--color-background-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-container)',
                      }}
                    >
                      <VStack gap={3} height="100%" justify="between">
                        <VStack gap={2}>
                          <HStack justify="between" vAlign="start">
                            <HStack gap={1.5} vAlign="center" wrap="wrap">
                              <Token label={req.subjectName} size="sm" />
                              <Token label={`${req.qualificationName} · ${req.examBoardName}`} size="sm" />
                            </HStack>

                            <HStack gap={1} vAlign="center">
                              <StatusDot variant="warning" label="Open" />
                              <Text type="supporting" size="xsm" weight="semibold" style={{ color: 'var(--color-warning)' }}>
                                Open
                              </Text>
                            </HStack>
                          </HStack>

                          <Text type="body" weight="semibold" size="base">
                            {req.title}
                          </Text>

                          {req.topicName && (
                            <Text type="supporting" color="secondary" size="xsm">
                              Topic: <strong>{req.topicName}</strong>
                            </Text>
                          )}

                          <Text type="supporting" color="secondary" size="sm">
                            {req.description}
                          </Text>
                        </VStack>

                        {/* Open requests are editable by owner */}
                        <HStack
                          justify="between"
                          vAlign="center"
                          style={{
                            borderTop: '1px solid var(--color-border)',
                            paddingTop: 'var(--spacing-3)',
                          }}
                        >
                          <Text type="supporting" size="xsm" color="secondary">
                            Still looking for a resource
                          </Text>

                          <Button
                            size="sm"
                            variant="secondary"
                            label="Edit Request"
                            onClick={() => handleStartEdit(req)}
                          />
                        </HStack>
                      </VStack>
                    </Card>
                  ))}
                </Grid>
              ) : (
                <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)', border: '1px solid var(--color-border)' }}>
                  <Text type="supporting" color="secondary" size="sm">
                    You currently have no open unanswered requests.
                  </Text>
                </Card>
              )}
            </VStack>

            {/* Fulfilled Section (IMMUTABLE / LOCKED) */}
            <VStack gap={3}>
              <HStack justify="between" vAlign="center">
                <Text type="body" weight="semibold">
                  Fulfilled Requests ({myFulfilledRequests.length})
                </Text>
                <Text type="supporting" color="secondary" size="xsm">
                  Fulfilled — Request locked
                </Text>
              </HStack>

              {myFulfilledRequests.length > 0 ? (
                <Grid columns={{ minWidth: 320, repeat: 'fit' }} gap={3}>
                  {myFulfilledRequests.map((req) => {
                    // Match fulfilling resource if available
                    const matchedRes = resources.find(
                      (r) => r.id === req.fulfilledResourceId || r.title.toLowerCase().includes(req.title.toLowerCase().slice(0, 15))
                    );

                    return (
                      <Card
                        key={req.id}
                        padding={4}
                        elevation="none"
                        style={{
                          backgroundColor: 'var(--color-background-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-container)',
                        }}
                      >
                        <VStack gap={3} height="100%" justify="between">
                          <VStack gap={2}>
                            <HStack justify="between" vAlign="start">
                              <HStack gap={1.5} vAlign="center" wrap="wrap">
                                <Token label={req.subjectName} size="sm" />
                                <Token label={`${req.qualificationName} · ${req.examBoardName}`} size="sm" />
                              </HStack>

                              <HStack gap={1} vAlign="center">
                                <StatusDot variant="success" label="Fulfilled" />
                                <Text type="supporting" size="xsm" weight="semibold" style={{ color: 'var(--color-success)' }}>
                                  Fulfilled
                                </Text>
                              </HStack>
                            </HStack>

                            <Text type="body" weight="semibold" size="base">
                              {req.title}
                            </Text>

                            <Text type="supporting" color="secondary" size="sm">
                              {req.description}
                            </Text>
                          </VStack>

                          {/* Fulfilled Card Footer linking directly to fulfilling resource */}
                          <VStack
                            gap={2}
                            style={{
                              borderTop: '1px solid var(--color-border)',
                              paddingTop: 'var(--spacing-3)',
                              backgroundColor: 'var(--color-background-muted)',
                              padding: 'var(--spacing-3)',
                              borderRadius: 'var(--radius-inner)',
                            }}
                          >
                            <HStack justify="between" vAlign="center">
                              <Text type="supporting" size="xsm" weight="semibold">
                                Answered by @{matchedRes?.creatorUsername || 'student_creator'}
                              </Text>

                              {matchedRes ? (
                                <Link href={`/resource/${matchedRes.slug}`} style={{ textDecoration: 'none' }}>
                                  <Button size="sm" variant="primary" label="View Resource →" />
                                </Link>
                              ) : (
                                <Link href="/explore" style={{ textDecoration: 'none' }}>
                                  <Button size="sm" variant="secondary" label="Browse Library" />
                                </Link>
                              )}
                            </HStack>
                          </VStack>
                        </VStack>
                      </Card>
                    );
                  })}
                </Grid>
              ) : (
                <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)', border: '1px solid var(--color-border)' }}>
                  <Text type="supporting" color="secondary" size="sm">
                    No fulfilled requests yet.
                  </Text>
                </Card>
              )}
            </VStack>
          </VStack>
        )}
      </VStack>

      {/* CREATE REQUEST MODAL */}
      <Dialog
        isOpen={createModalOpen}
        onOpenChange={(open) => !open && setCreateModalOpen(false)}
        width={620}
      >
        <DialogHeader title="Request an Academic Resource" />
        <div style={{ padding: 'var(--spacing-4)' }}>
          <VStack gap={4}>
            <Text type="body" color="secondary" size="sm">
              Pre-filled with your current study profile. Explain what topic notes or summary sheet you need.
            </Text>

            <Grid columns={{ minWidth: 140, repeat: 'fit' }} gap={2}>
              <Selector
                label="Qualification"
                value={qualification}
                onChange={(val) => setQualification(String(val))}
                options={INITIAL_QUALIFICATIONS.map((q) => ({ value: q.name, label: q.name }))}
                size="sm"
              />
              <Selector
                label="Exam Board"
                value={examBoard}
                onChange={(val) => setExamBoard(String(val))}
                options={INITIAL_EXAM_BOARDS.map((b) => ({ value: b.name, label: b.name }))}
                size="sm"
              />
              <Selector
                label="Subject"
                value={subject}
                onChange={(val) => setSubject(String(val))}
                options={INITIAL_SUBJECTS.map((s) => ({ value: s.name, label: s.name }))}
                size="sm"
              />
            </Grid>

            <TextInput
              label="Topic"
              placeholder="e.g. Electrolysis, Photosynthesis, Calculus"
              value={topicName}
              onChange={setTopicName}
            />

            <TextInput
              label="What resource do you need?"
              placeholder="e.g. Concise topic summary with required practical steps"
              value={title}
              onChange={setTitle}
            />

            <TextArea
              label="Additional details or specific exam focus"
              placeholder="Describe what specific subtopics or diagrams would help most..."
              value={description}
              onChange={setDescription}
              rows={3}
            />

            <HStack justify="end" gap={2}>
              <Button variant="secondary" label="Cancel" onClick={() => setCreateModalOpen(false)} />
              <Button variant="primary" label="Post Request" onClick={handleCreateSubmit} />
            </HStack>
          </VStack>
        </div>
      </Dialog>

      {/* EDIT REQUEST MODAL (FOR OPEN REQUESTS ONLY) */}
      <Dialog
        isOpen={Boolean(editingRequest)}
        onOpenChange={(open) => !open && setEditingRequest(null)}
        width={620}
      >
        <DialogHeader title="Edit Open Request" />
        <div style={{ padding: 'var(--spacing-4)' }}>
          <VStack gap={4}>
            <Text type="supporting" color="secondary" size="sm">
              You can edit this request because it has not yet been fulfilled. Once fulfilled, requests become locked.
            </Text>

            <TextInput
              label="Request Title"
              value={editTitle}
              onChange={setEditTitle}
            />

            <Grid columns={{ minWidth: 140, repeat: 'fit' }} gap={2}>
              <Selector
                label="Qualification"
                value={editQual}
                onChange={(val) => setEditQual(String(val))}
                options={INITIAL_QUALIFICATIONS.map((q) => ({ value: q.name, label: q.name }))}
                size="sm"
              />
              <Selector
                label="Exam Board"
                value={editBoard}
                onChange={(val) => setEditBoard(String(val))}
                options={INITIAL_EXAM_BOARDS.map((b) => ({ value: b.name, label: b.name }))}
                size="sm"
              />
              <Selector
                label="Subject"
                value={editSubj}
                onChange={(val) => setEditSubj(String(val))}
                options={INITIAL_SUBJECTS.map((s) => ({ value: s.name, label: s.name }))}
                size="sm"
              />
            </Grid>

            <TextInput
              label="Topic"
              value={editTopic}
              onChange={setEditTopic}
            />

            <TextArea
              label="Description"
              value={editDesc}
              onChange={setEditDesc}
              rows={3}
            />

            <HStack justify="end" gap={2}>
              <Button variant="secondary" label="Cancel" onClick={() => setEditingRequest(null)} />
              <Button variant="primary" label="Save Changes" onClick={handleSaveEdit} />
            </HStack>
          </VStack>
        </div>
      </Dialog>
    </div>
  );
}
