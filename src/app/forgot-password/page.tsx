'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SyllabiLogo } from '@/components/SyllabiLogo';
import { Center } from '@astryxdesign/core/Center';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <Center padding={6} style={{ minHeight: 'calc(100vh - 160px)', backgroundColor: 'var(--color-background-body)' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <Card padding={6} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
          <VStack gap={5}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <SyllabiLogo size="md" />
            </Link>

            <VStack gap={1}>
              <Heading level={1} style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                Reset password
              </Heading>
              <Text type="body" color="secondary" size="sm">
                Enter your account email and we&apos;ll send you a secure link to reset your password.
              </Text>
            </VStack>

            {submitted ? (
              <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)' }}>
                <VStack gap={2}>
                  <Text type="body" weight="semibold">
                    Check your inbox
                  </Text>
                  <Text type="supporting" color="secondary" size="sm">
                    If an account exists for {email}, password reset instructions have been sent.
                  </Text>
                  <Link href="/login" style={{ textDecoration: 'none', marginTop: 8 }}>
                    <Button variant="secondary" size="sm" label="Back to Sign in" />
                  </Link>
                </VStack>
              </Card>
            ) : (
              <form onSubmit={handleSubmit}>
                <VStack gap={3}>
                  <TextInput
                    label="Email address"
                    type="email"
                    placeholder="student@school.org"
                    value={email}
                    onChange={setEmail}
                    size="md"
                  />
                  <Button
                    size="lg"
                    variant="primary"
                    label="Send Reset Link"
                    isDisabled={!email.trim()}
                    onClick={handleSubmit}
                  />
                </VStack>
              </form>
            )}

            <HStack justify="center">
              <Link href="/login" style={{ textDecoration: 'none', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                ← Return to Sign in
              </Link>
            </HStack>
          </VStack>
        </Card>
      </div>
    </Center>
  );
}

