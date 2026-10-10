'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyllabi } from '@/lib/store';
import { INITIAL_QUALIFICATIONS, INITIAL_EXAM_BOARDS } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/service';
import { SyllabiLogo } from '@/components/SyllabiLogo';
import { Center } from '@astryxdesign/core/Center';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack, StackItem } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Selector } from '@astryxdesign/core/Selector';
import { Token } from '@astryxdesign/core/Token';
import { Divider } from '@astryxdesign/core/Divider';

export default function SignUpPage() {
  const router = useRouter();
  const { setCurrentUser, showToast, signInWithGoogle } = useSyllabi();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qualification, setQualification] = useState('GCSE');
  const [examBoard, setExamBoard] = useState('AQA');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: cleanUsername,
              full_name: cleanUsername,
              qualification,
              exam_board: examBoard,
              subjects: ['Chemistry', 'Biology', 'Physics'],
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          setIsLoading(false);
          return;
        }

        showToast('Registration successful! Welcome to Syllabi.');
        router.push('/explore');
      } catch (err: any) {
        setErrorMsg(err.message || 'Registration failed');
        setIsLoading(false);
      }
    } else {
      // Local fallback for testing
      setTimeout(() => {
        setIsLoading(false);
        const newUser = {
          id: `user-${Date.now()}`,
          username: cleanUsername,
          fullName: cleanUsername,
          bio: `${qualification} student studying ${examBoard}.`,
          qualification,
          examBoard,
          subjects: ['Chemistry', 'Biology', 'Physics'],
          isPublic: true,
          showActivity: true,
          allowIndexing: true,
          role: 'student' as const,
          resourcesCount: 0,
          totalViews: 0,
          totalSaves: 0,
          createdAt: new Date().toISOString(),
        };

        setCurrentUser(newUser);
        showToast(`Account created! Welcome, @${cleanUsername}`);
        router.push('/explore');
      }, 500);
    }
  };

  return (
    <Center padding={6} style={{ minHeight: 'calc(100vh - 160px)', backgroundColor: 'var(--color-background-body)' }}>
      <div style={{ width: '100%', maxWidth: 540 }}>
        <Card padding={6} width="100%" elevation="low" style={{ backgroundColor: 'var(--color-background-surface)', borderRadius: 'var(--radius-container)', border: '1px solid var(--color-border)' }}>
          <VStack gap={5}>
            {/* Header */}
            <HStack justify="between" vAlign="center">
              <Link href="/" style={{ textDecoration: 'none' }}>
                <SyllabiLogo size="md" />
              </Link>
              <Token label="Student Onboarding" size="sm" />
            </HStack>

            <VStack gap={1}>
              <Heading level={1} style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                Create student profile
              </Heading>
              <Text type="body" color="secondary" size="sm">
                Join students sharing notes and revision guides for your exam specifications.
              </Text>
            </VStack>

            {/* Google OAuth Onboarding Button */}
            <Button
              size="lg"
              variant="secondary"
              label="Sign up with Google"
              onClick={() => signInWithGoogle()}
            />

            <Divider label="or register with email" />

            <form onSubmit={handleSignUp}>
              <VStack gap={3}>
                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Student Username
                  </Text>
                  <TextInput
                    label="Username"
                    isLabelHidden
                    type="text"
                    placeholder="e.g. zayan_revision or elena_bio"
                    value={username}
                    onChange={setUsername}
                    size="md"
                  />
                  <Text type="supporting" color="secondary" size="xsm">
                    This is your public creator handle on all uploaded resources.
                  </Text>
                </VStack>

                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Email Address
                  </Text>
                  <TextInput
                    label="Email"
                    isLabelHidden
                    type="email"
                    placeholder="student@school.ac.uk"
                    value={email}
                    onChange={setEmail}
                    size="md"
                  />
                </VStack>

                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Password
                  </Text>
                  <TextInput
                    label="Password"
                    isLabelHidden
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={setPassword}
                    size="md"
                  />
                </VStack>

                {/* Qualification & Board Onboarding (Requirement 8) */}
                <HStack gap={2}>
                  <StackItem size="fill">
                    <Selector
                      label="Primary Qualification"
                      value={qualification}
                      onChange={(val) => setQualification(String(val))}
                      options={INITIAL_QUALIFICATIONS.map((q) => ({ value: q.name, label: q.name }))}
                      size="sm"
                    />
                  </StackItem>
                  <StackItem size="fill">
                    <Selector
                      label="Exam Board"
                      value={examBoard}
                      onChange={(val) => setExamBoard(String(val))}
                      options={INITIAL_EXAM_BOARDS.map((b) => ({ value: b.name, label: b.name }))}
                      size="sm"
                    />
                  </StackItem>
                </HStack>

                {errorMsg && (
                  <Text type="supporting" style={{ color: 'var(--color-text-red)', fontSize: '0.8125rem' }}>
                    {errorMsg}
                  </Text>
                )}

                <Button
                  size="lg"
                  variant="primary"
                  label={isLoading ? 'Creating profile...' : 'Join Syllabi Free'}
                  isDisabled={isLoading}
                  onClick={handleSignUp}
                />
              </VStack>
            </form>

            <HStack justify="center">
              <Text type="supporting" color="secondary">
                Already have an account?{' '}
                <Link
                  href="/login"
                  style={{
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                  }}
                >
                  Sign in
                </Link>
              </Text>
            </HStack>
          </VStack>
        </Card>
      </div>
    </Center>
  );
}
