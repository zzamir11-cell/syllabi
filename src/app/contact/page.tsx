'use client';

import React, { useState } from 'react';
import { useSyllabi } from '@/lib/store';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Card } from '@astryxdesign/core/Card';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Button } from '@astryxdesign/core/Button';
import { Selector } from '@astryxdesign/core/Selector';
import { StatusDot } from '@astryxdesign/core/StatusDot';

export default function ContactPage() {
  const { showToast } = useSyllabi();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSubmitted(true);
    showToast('Your message has been sent to our team.');
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 'var(--spacing-8) var(--spacing-4)' }}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={1} style={{ fontSize: '2.25rem', letterSpacing: '-0.02em' }}>
            Contact & Support
          </Heading>
          <Text type="body" color="secondary">
            Have questions about Syllabi, copyright inquiries, or feedback? Get in touch with our team.
          </Text>
        </VStack>

        <Card padding={6} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)' }}>
          {submitted ? (
            <VStack gap={3} hAlign="center" style={{ textAlign: 'center', padding: 'var(--spacing-6) 0' }}>
              <StatusDot variant="success" label="Message received" />
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                Message Received
              </Heading>
              <Text type="body" color="secondary">
                Thank you for contacting Syllabi. We review inquiries within 24 business hours.
              </Text>
            </VStack>
          ) : (
            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Your Name or Pseudonym
                  </Text>
                  <TextInput
                    label="Name"
                    isLabelHidden
                    placeholder="e.g. Zayan or Student"
                    value={name}
                    onChange={setName}
                    size="md"
                  />
                </VStack>

                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Email Address *
                  </Text>
                  <TextInput
                    label="Email"
                    isLabelHidden
                    type="email"
                    placeholder="you@school.ac.uk"
                    value={email}
                    onChange={setEmail}
                    size="md"
                  />
                </VStack>

                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Topic / Department
                  </Text>
                  <Selector
                    label="Category"
                    value={category}
                    onChange={(v) => setCategory(String(v))}
                    size="md"
                    options={[
                      { value: 'general', label: 'General Question & Student Feedback' },
                      { value: 'copyright', label: 'Copyright / Takedown Notice' },
                      { value: 'safety', label: 'Child Safety / Moderation Inquiry' },
                      { value: 'technical', label: 'Bug Report / Technical Issue' },
                    ]}
                  />
                </VStack>

                <VStack gap={1}>
                  <Text type="label" weight="medium">
                    Message *
                  </Text>
                  <TextArea
                    label="Message"
                    isLabelHidden
                    placeholder="How can we help?"
                    value={message}
                    onChange={setMessage}
                    rows={4}
                  />
                </VStack>

                <HStack justify="end">
                  <Button
                    size="lg"
                    variant="primary"
                    label="Send Message"
                    isDisabled={!email.trim() || !message.trim()}
                    onClick={handleSubmit}
                  />
                </HStack>
              </VStack>
            </form>
          )}
        </Card>
      </VStack>
    </div>
  );
}

