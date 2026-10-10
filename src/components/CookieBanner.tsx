'use client';

import React, { useState } from 'react';
import { useSyllabi } from '@/lib/store';
import { Card } from '@astryxdesign/core/Card';
import { VStack, HStack, StackItem } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Switch } from '@astryxdesign/core/Switch';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Link } from '@astryxdesign/core/Link';

export function CookieBanner() {
  const { cookieConsent, setCookieConsent } = useSyllabi();
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(cookieConsent.analytics);

  if (cookieConsent.answered && !showPreferences) {
    return null;
  }

  const handleAcceptAll = () => {
    setCookieConsent({ essential: true, analytics: true, answered: true });
    setShowPreferences(false);
  };

  const handleAcceptEssential = () => {
    setCookieConsent({ essential: true, analytics: false, answered: true });
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    setCookieConsent({ essential: true, analytics: analyticsEnabled, answered: true });
    setShowPreferences(false);
  };

  return (
    <>
      {!cookieConsent.answered && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            right: 24,
            maxWidth: 680,
            margin: '0 auto',
            zIndex: 9999,
          }}
        >
          <Card padding={4} style={{ boxShadow: 'var(--shadow-high)' }}>
            <VStack gap={3}>
              <VStack gap={1}>
                <Text type="body" weight="semibold">
                  Privacy & Cookie Preferences
                </Text>
                <Text type="supporting" color="secondary">
                  Syllabi uses essential cookies strictly necessary for authentication and session
                  security. Optional analytics cookies are only loaded with your explicit permission.
                  Read our{' '}
                  <Link href="/privacy" type="supporting">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="/cookies" type="supporting">
                    Cookie Policy
                  </Link>
                  .
                </Text>
              </VStack>

              <HStack gap={2} justify="end" wrap="wrap">
                <Button
                  size="sm"
                  variant="ghost"
                  label="Preferences"
                  onClick={() => setShowPreferences(true)}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  label="Reject Optional"
                  onClick={handleAcceptEssential}
                />
                <Button
                  size="sm"
                  variant="primary"
                  label="Accept All"
                  onClick={handleAcceptAll}
                />
              </HStack>
            </VStack>
          </Card>
        </div>
      )}

      {showPreferences && (
        <Dialog
          isOpen={showPreferences}
          onOpenChange={(open) => !open && setShowPreferences(false)}
          width={540}
        >
          <DialogHeader
            title="Cookie & Tracking Preferences"
            subtitle="Manage your privacy choices. Essential storage cannot be disabled."
          />
          <VStack gap={4} padding={4}>
            <VStack gap={3}>
              {/* Essential */}
              <HStack gap={3} vAlign="start" justify="between">
                <VStack gap={0.5}>
                  <HStack gap={1}>
                    <Text type="body" weight="semibold">
                      Strictly Essential
                    </Text>
                    <Text type="supporting" color="secondary">
                      (Required)
                    </Text>
                  </HStack>
                  <Text type="supporting" color="secondary">
                    Necessary for user login, authentication tokens, and basic security protections.
                  </Text>
                </VStack>
                <Switch value={true} isDisabled label="Always on" />
              </HStack>

              {/* Analytics */}
              <HStack gap={3} vAlign="start" justify="between">
                <VStack gap={0.5}>
                  <Text type="body" weight="semibold">
                    Measurement & Analytics
                  </Text>
                  <Text type="supporting" color="secondary">
                    Helps us understand resource discovery trends without identifying individual students.
                  </Text>
                </VStack>
                <Switch
                  value={analyticsEnabled}
                  onChange={(val) => setAnalyticsEnabled(val)}
                  label="Toggle analytics"
                />
              </HStack>
            </VStack>

            <HStack gap={3} justify="end">
              <Button
                variant="secondary"
                label="Cancel"
                onClick={() => setShowPreferences(false)}
              />
              <Button
                variant="primary"
                label="Save Preferences"
                onClick={handleSavePreferences}
              />
            </HStack>
          </VStack>
        </Dialog>
      )}
    </>
  );
}

