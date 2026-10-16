'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter, VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Token } from '@astryxdesign/core/Token';
import { GoogleLogo } from '@/components/GoogleLogo';
import { useSyllabi } from '@/lib/store';

export function GoogleAuthModal() {
  const router = useRouter();
  const { isGoogleModalOpen, setIsGoogleModalOpen, loginAsGoogleDemo } = useSyllabi();

  if (!isGoogleModalOpen) return null;

  const handleDemoSignIn = () => {
    loginAsGoogleDemo();
    router.push('/profile');
  };

  return (
    <Dialog
      isOpen={isGoogleModalOpen}
      onOpenChange={(open) => setIsGoogleModalOpen(open)}
      width={560}
      purpose="info"
    >
      <Layout
        header={
          <DialogHeader
            title="Google Sign-In: Setup Required in Supabase"
            onOpenChange={(open) => setIsGoogleModalOpen(open)}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={4} padding={4}>
              <HStack gap={2} vAlign="center">
                <GoogleLogo size={24} />
                <Text type="body" weight="medium">
                  Google OAuth Provider is currently disabled in your project
                </Text>
              </HStack>

              <Text type="body" color="secondary" size="sm">
                Supabase returned <code style={{ backgroundColor: 'var(--color-background-surface)', padding: '2px 6px', borderRadius: '4px' }}>Unsupported provider: provider is not enabled</code>. To enable genuine Google sign-ups, follow these 3 quick steps in your Supabase dashboard:
              </Text>

              <Card padding={4} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)', border: '1px solid var(--color-border)' }}>
                <VStack gap={3}>
                  <HStack gap={2} vAlign="start">
                    <Token label="Step 1" size="sm" />
                    <Text type="body" size="sm">
                      Open <strong>Supabase Dashboard &rarr; Authentication &rarr; Providers &rarr; Google</strong>
                    </Text>
                  </HStack>

                  <HStack gap={2} vAlign="start">
                    <Token label="Step 2" size="sm" />
                    <Text type="body" size="sm">
                      Toggle <strong>&quot;Enable Sign in with Google&quot;</strong> to <strong>ON</strong>
                    </Text>
                  </HStack>

                  <HStack gap={2} vAlign="start">
                    <Token label="Step 3" size="sm" />
                    <Text type="body" size="sm">
                      Enter your Google <strong>Client ID</strong> &amp; <strong>Client Secret</strong> from Google Cloud Console
                    </Text>
                  </HStack>

                  <VStack gap={1} style={{ marginTop: 'var(--spacing-2)' }}>
                    <Text type="supporting" color="secondary" size="xsm">
                      Google Cloud Console Authorized Redirect URI:
                    </Text>
                    <code style={{ fontSize: '0.75rem', padding: '6px 8px', backgroundColor: 'var(--color-background-body)', borderRadius: '4px', wordBreak: 'break-all', userSelect: 'all' }}>
                      https://kxuscyoiwnbufxdupgjf.supabase.co/auth/v1/callback
                    </code>
                  </VStack>
                </VStack>
              </Card>

              <Text type="body" size="sm">
                Want to test the student profile &amp; features right now while setting up Google Cloud? You can continue with a demo Google student profile below:
              </Text>
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack justify="between" vAlign="center" width="100%" padding={4}>
              <a
                href="https://supabase.com/dashboard/project/kxuscyoiwnbufxdupgjf/auth/providers"
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button
                  size="md"
                  variant="secondary"
                  label="Open Supabase Providers &rarr;"
                />
              </a>

              <HStack gap={2}>
                <Button
                  size="md"
                  variant="secondary"
                  label="Cancel"
                  onClick={() => setIsGoogleModalOpen(false)}
                />
                <Button
                  size="md"
                  variant="primary"
                  icon={<GoogleLogo size={16} />}
                  label="Sign In as Google Demo Student"
                  onClick={handleDemoSignIn}
                />
              </HStack>
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
