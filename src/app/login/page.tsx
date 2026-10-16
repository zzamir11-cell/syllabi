'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyllabi } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { SyllabiLogo } from '@/components/SyllabiLogo';
import { GoogleLogo } from '@/components/GoogleLogo';
import { Center } from '@astryxdesign/core/Center';
import { Card } from '@astryxdesign/core/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { Section } from '@astryxdesign/core/Section';
import { VStack, HStack, StackItem } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Token } from '@astryxdesign/core/Token';

export default function LoginPage() {
  const router = useRouter();
  const { showToast, signInWithGoogle } = useSyllabi();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your student email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      showToast('Signed in successfully!');
      router.push('/profile');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <Center padding={6} style={{ minHeight: 'calc(100vh - 160px)', backgroundColor: 'var(--color-background-body)' }}>
      <div style={{ width: '100%', maxWidth: 960 }}>
        <Card padding={0} width="100%" elevation="low">
          <Grid columns={{ minWidth: 320, repeat: 'fit' }} gap={0} align="stretch">
            {/* Left Column: Login Form */}
            <Section padding={8} variant="transparent" style={{ width: '100%' }}>
              <VStack gap={5} height="100%" justify="between">
                <HStack justify="between" vAlign="center">
                  <Link href="/" style={{ textDecoration: 'none' }}>
                    <SyllabiLogo size="md" />
                  </Link>
                  <Token label="Student Portal" size="sm" />
                </HStack>

                <VStack gap={4}>
                  <VStack gap={1}>
                    <Heading level={1} style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
                      Welcome back
                    </Heading>
                    <Text type="body" color="secondary" size="sm">
                      Sign in to your Syllabi library to access your saved notes, upload guides, and track study views.
                    </Text>
                  </VStack>

                  {/* Google OAuth Login Button */}
                  <Button
                    size="lg"
                    variant="secondary"
                    icon={<GoogleLogo size={18} />}
                    label="Continue with Google"
                    onClick={() => signInWithGoogle()}
                  />

                  <Divider label="or sign in with student email" />

                  <form onSubmit={handleLogin}>
                    <VStack gap={3}>
                      <VStack gap={1}>
                        <Text type="label" weight="medium">
                          Email or Username
                        </Text>
                        <TextInput
                          label="Email or Username"
                          isLabelHidden
                          type="text"
                          placeholder="student@school.ac.uk or username"
                          value={email}
                          onChange={setEmail}
                          size="lg"
                        />
                      </VStack>

                      <VStack gap={1}>
                        <HStack justify="between">
                          <Text type="label" weight="medium">
                            Password
                          </Text>
                          <Link
                            href="/forgot-password"
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--color-text-secondary)',
                              textDecoration: 'none',
                            }}
                          >
                            Forgot password?
                          </Link>
                        </HStack>
                        <TextInput
                          label="Password"
                          isLabelHidden
                          type="password"
                          placeholder="••••••••••••"
                          value={password}
                          onChange={setPassword}
                          size="lg"
                        />
                      </VStack>

                      {errorMsg && (
                        <Text type="supporting" style={{ color: 'var(--color-text-red)', fontSize: '0.8125rem' }}>
                          {errorMsg}
                        </Text>
                      )}

                      <Button
                        size="lg"
                        variant="primary"
                        label={isLoading ? 'Signing in...' : 'Sign in'}
                        isDisabled={isLoading}
                        onClick={handleLogin}
                      />
                    </VStack>
                  </form>
                </VStack>

                <HStack justify="center">
                  <Text type="supporting" color="secondary">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/signup"
                      style={{
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        textDecoration: 'none',
                      }}
                    >
                      Sign up free
                    </Link>
                  </Text>
                </HStack>
              </VStack>
            </Section>

            {/* Right Column: Editorial Showcase */}
            <div
              style={{
                backgroundColor: 'var(--color-background-surface)',
                borderLeft: '1px solid var(--color-border)',
                padding: 'var(--spacing-8)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <VStack gap={4}>
                <Token label="STUDENT ECOSYSTEM" size="sm" />
                <Heading level={2} style={{ fontSize: '1.5rem', lineHeight: 1.25 }}>
                  The place where students put the stuff they actually made for school.
                </Heading>
                <Text type="body" color="secondary" size="sm" style={{ lineHeight: 1.6 }}>
                  Syllabi was built to celebrate original revision notes, visual topic mind maps, and essay plans created by students studying for GCSE, A-Level, and Cambridge International examinations.
                </Text>

                <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)' }}>
                  <VStack gap={1}>
                    <Text type="body" weight="bold">
                      &quot;Zayan&apos;s C6 Electrolysis Notes&quot;
                    </Text>
                    <Text type="supporting" color="secondary" size="xsm">
                      1,284 views · 683 saves · 4.9 rating
                    </Text>
                  </VStack>
                </Card>
              </VStack>

              <Text type="supporting" color="secondary" size="xsm" style={{ marginTop: 'var(--spacing-6)' }}>
                Protected by Syllabi Honor Code and independent academic integrity standards.
              </Text>
            </div>
          </Grid>
        </Card>
      </div>
    </Center>
  );
}
