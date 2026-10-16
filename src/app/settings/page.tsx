'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyllabi } from '@/lib/store';
import { INITIAL_QUALIFICATIONS, INITIAL_EXAM_BOARDS, INITIAL_SUBJECTS } from '@/lib/data';
import { getSubjectTokenColor } from '@/lib/academicColors';
import { VStack, HStack, StackItem } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Selector } from '@astryxdesign/core/Selector';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Token } from '@astryxdesign/core/Token';
import { Divider } from '@astryxdesign/core/Divider';
import { Avatar } from '@astryxdesign/core/Avatar';

export default function SettingsPage() {
  const router = useRouter();
  const {
    currentUser,
    updateUserProfile,
    uploadUserAvatar,
    signOutUser,
    showToast,
    themeMode,
    toggleThemeMode,
  } = useSyllabi();

  // Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [qualification, setQualification] = useState(currentUser?.qualification || 'GCSE');
  const [examBoard, setExamBoard] = useState(currentUser?.examBoard || 'AQA');
  const [subjects, setSubjects] = useState<string[]>(currentUser?.subjects || ['Chemistry', 'Biology']);
  const [isPublic, setIsPublic] = useState(currentUser?.isPublic ?? true);
  const [showActivity, setShowActivity] = useState(currentUser?.showActivity ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setBio(currentUser.bio || '');
      setQualification(currentUser.qualification || 'GCSE');
      setExamBoard(currentUser.examBoard || 'AQA');
      setSubjects(currentUser.subjects || ['Chemistry', 'Biology']);
      setIsPublic(currentUser.isPublic ?? true);
      setShowActivity(currentUser.showActivity ?? true);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 var(--spacing-4)', textAlign: 'center' }}>
        <Card
          padding={6}
          elevation="low"
          style={{
            backgroundColor: 'var(--color-background-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-container)',
          }}
        >
          <VStack gap={4} hAlign="center">
            <Heading level={2} style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
              Sign in to manage your settings
            </Heading>
            <Text type="body" color="secondary" size="base">
              You must be signed in to configure your academic specifications and profile preferences.
            </Text>
            <HStack gap={2} justify="center">
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button size="md" variant="primary" label="Sign in" />
              </Link>
              <Link href="/signup" style={{ textDecoration: 'none' }}>
                <Button size="md" variant="secondary" label="Sign up" />
              </Link>
            </HStack>
          </VStack>
        </Card>
      </div>
    );
  }

  const toggleSubject = (subjectName: string) => {
    setSubjects((prev) =>
      prev.includes(subjectName)
        ? prev.filter((s) => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        fullName: fullName.trim() || currentUser.username,
        bio: bio.trim(),
        qualification,
        examBoard,
        subjects,
        isPublic,
        showActivity,
      });
      showToast('Settings saved successfully!');
    } catch {
      showToast('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      await uploadUserAvatar(file);
      showToast('Profile photo updated!');
    } catch {
      showToast('Avatar upload failed.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: 'var(--spacing-6) var(--spacing-4)' }}>
      <VStack gap={6}>
        {/* Header */}
        <VStack gap={1}>
          <Heading level={1} style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
            Account & Curriculum Settings
          </Heading>
          <Text type="body" color="secondary" size="base">
            Configure your academic specifications and personal profile visible to other students.
          </Text>
        </VStack>

        {/* Section 1: Profile & Avatar */}
        <Card
          padding={5}
          elevation="none"
          style={{
            backgroundColor: 'var(--color-background-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-container)',
          }}
        >
          <VStack gap={4}>
            <Heading level={2} style={{ fontSize: '1.25rem' }}>
              Student Identity
            </Heading>

            <HStack gap={4} vAlign="center" wrap="wrap">
              <Avatar
                size="lg"
                name={currentUser.fullName || currentUser.username}
                src={currentUser.avatarUrl || undefined}
              />
              <VStack gap={1}>
                <Text type="body" weight="bold">
                  @{currentUser.username}
                </Text>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    style={{ display: 'none' }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    label={isUploadingAvatar ? 'Uploading...' : 'Change avatar'}
                    isDisabled={isUploadingAvatar}
                  />
                </label>
              </VStack>
            </HStack>

            <VStack gap={1}>
              <Text type="label" weight="medium">
                Full Name
              </Text>
              <TextInput
                label="Full Name"
                isLabelHidden
                placeholder="e.g. Zayan Khan"
                value={fullName}
                onChange={setFullName}
                size="md"
              />
            </VStack>

            <VStack gap={1}>
              <Text type="label" weight="medium">
                Student Bio
              </Text>
              <TextArea
                label="Bio"
                isLabelHidden
                placeholder="Share what subjects you specialize in, target grades, or study goals..."
                value={bio}
                onChange={setBio}
                rows={3}
              />
            </VStack>
          </VStack>
        </Card>

        {/* Section 2: Academic Specifications */}
        <Card
          padding={5}
          elevation="none"
          style={{
            backgroundColor: 'var(--color-background-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-container)',
          }}
        >
          <VStack gap={4}>
            <Heading level={2} style={{ fontSize: '1.25rem' }}>
              Academic Specifications
            </Heading>
            <Text type="supporting" color="secondary" size="sm">
              Your qualification and exam board customize your feed and recommended study resources.
            </Text>

            <Grid columns={{ minWidth: 220, repeat: 'fit' }} gap={3}>
              <VStack gap={1}>
                <Text type="label" weight="medium">
                  Qualification Level
                </Text>
                <Selector
                  label="Qualification"
                  value={qualification}
                  onChange={(val) => setQualification(String(val))}
                  options={INITIAL_QUALIFICATIONS.map((q) => ({ value: q.slug.toUpperCase(), label: q.name }))}
                  size="md"
                />
              </VStack>

              <VStack gap={1}>
                <Text type="label" weight="medium">
                  Exam Board
                </Text>
                <Selector
                  label="Exam Board"
                  value={examBoard}
                  onChange={(val) => setExamBoard(String(val))}
                  options={INITIAL_EXAM_BOARDS.map((b) => ({ value: b.slug.toUpperCase(), label: b.name }))}
                  size="md"
                />
              </VStack>
            </Grid>

            {/* Target Subjects Selection */}
            <VStack gap={2}>
              <Text type="label" weight="medium">
                Your Subjects (click to select)
              </Text>
              <HStack gap={1.5} wrap="wrap">
                {INITIAL_SUBJECTS.map((sub) => {
                  const isSelected = subjects.includes(sub.name);
                  return (
                    <Button
                      key={sub.id}
                      size="sm"
                      variant={isSelected ? 'primary' : 'secondary'}
                      label={isSelected ? `✓ ${sub.name}` : sub.name}
                      onClick={() => toggleSubject(sub.name)}
                    />
                  );
                })}
              </HStack>
            </VStack>
          </VStack>
        </Card>

        {/* Section 3: Privacy & Appearance */}
        <Card
          padding={5}
          elevation="none"
          style={{
            backgroundColor: 'var(--color-background-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-container)',
          }}
        >
          <VStack gap={4}>
            <Heading level={2} style={{ fontSize: '1.25rem' }}>
              Preferences & Privacy
            </Heading>

            <VStack gap={3}>
              <CheckboxInput
                label="Public Profile — Allow other students to discover your profile and revision uploads."
                value={isPublic}
                onChange={setIsPublic}
              />
              <CheckboxInput
                label="Study Activity — Show your recent uploads in community activity feeds."
                value={showActivity}
                onChange={setShowActivity}
              />
            </VStack>

            <Divider />

            <HStack justify="between" vAlign="center">
              <VStack gap={0.5}>
                <Text type="body" weight="medium">
                  Theme Appearance
                </Text>
                <Text type="supporting" color="secondary" size="xsm">
                  Currently set to {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </VStack>
              <Button
                size="sm"
                variant="secondary"
                label={themeMode === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
                onClick={toggleThemeMode}
              />
            </HStack>
          </VStack>
        </Card>

        {/* Save Bar */}
        <HStack justify="between" vAlign="center" wrap="wrap" gap={3}>
          <Link href="/profile" style={{ textDecoration: 'none' }}>
            <Button size="md" variant="ghost" label="← Back to Profile" />
          </Link>
          <Button
            size="md"
            variant="primary"
            label={isSaving ? 'Saving...' : 'Save Settings'}
            isDisabled={isSaving}
            onClick={handleSave}
          />
        </HStack>

        <Divider />

        {/* Danger / Session Zone */}
        <Card
          padding={4}
          elevation="none"
          style={{
            backgroundColor: 'var(--color-background-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-container)',
          }}
        >
          <HStack justify="between" vAlign="center" wrap="wrap" gap={3}>
            <VStack gap={0.5}>
              <Text type="body" weight="bold">
                Account Session
              </Text>
              <Text type="supporting" color="secondary" size="xsm">
                Sign out of your active student session on this browser.
              </Text>
            </VStack>

            <Button
              size="sm"
              variant="secondary"
              label="Sign Out"
              onClick={async () => {
                await signOutUser();
                router.push('/');
              }}
            />
          </HStack>
        </Card>
      </VStack>
    </div>
  );
}
