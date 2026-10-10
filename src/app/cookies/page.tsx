'use client';

import React, { useState } from 'react';
import { useSyllabi } from '@/lib/store';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Switch } from '@astryxdesign/core/Switch';

export default function CookiesPolicyPage() {
  const { cookieConsent, setCookieConsent, showToast } = useSyllabi();
  const [analytics, setAnalytics] = useState(cookieConsent.analytics);

  const handleSave = () => {
    setCookieConsent({ essential: true, analytics, answered: true });
    showToast('Cookie preferences updated');
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--spacing-8) var(--spacing-4)' }}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={1} style={{ fontSize: '2.25rem', letterSpacing: '-0.02em' }}>
            Cookie Policy & Preferences
          </Heading>
          <Text type="supporting" color="secondary">
            How Syllabi uses local storage and cookies to provide a fast, secure experience.
          </Text>
        </VStack>

        <Card padding={6} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)', lineHeight: 1.7 }}>
          <VStack gap={6}>
            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                1. What Are Cookies?
              </Heading>
              <Text type="body" color="secondary">
                Cookies and local storage are small text files placed on your device to keep you signed in, remember your saved study bookmarks, and ensure secure communication with our database.
              </Text>
            </VStack>

            <Divider />

            <VStack gap={4}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                2. Manage Your Cookie Preferences
              </Heading>

              <Card padding={4} elevation="none" style={{ backgroundColor: 'var(--color-background-muted)' }}>
                <VStack gap={4}>
                  <HStack justify="between" vAlign="start">
                    <VStack gap={0.5}>
                      <Text type="body" weight="semibold">
                        Strictly Necessary Cookies (Always Active)
                      </Text>
                      <Text type="supporting" color="secondary" size="xsm">
                        Required for session tokens, CSRF protection, and authenticating user requests.
                      </Text>
                    </VStack>
                    <Switch value={true} isDisabled label="Required" />
                  </HStack>

                  <Divider />

                  <HStack justify="between" vAlign="start">
                    <VStack gap={0.5}>
                      <Text type="body" weight="semibold">
                        Optional Analytics & Discovery Telemetry
                      </Text>
                      <Text type="supporting" color="secondary" size="xsm">
                        Helps us measure which topics students find most difficult without collecting identifying personal data.
                      </Text>
                    </VStack>
                    <Switch value={analytics} onChange={(val) => setAnalytics(val)} label="Analytics" />
                  </HStack>
                </VStack>
              </Card>

              <HStack justify="end">
                <Button variant="primary" label="Save Cookie Preferences" onClick={handleSave} />
              </HStack>
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </div>
  );
}

