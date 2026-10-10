'use client';

import React from 'react';
import Link from 'next/link';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Card } from '@astryxdesign/core/Card';
import { Divider } from '@astryxdesign/core/Divider';
import { Button } from '@astryxdesign/core/Button';

export default function CopyrightPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--spacing-8) var(--spacing-4)' }}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={1} style={{ fontSize: '2.25rem', letterSpacing: '-0.02em' }}>
            Copyright Policy & Takedowns
          </Heading>
          <Text type="supporting" color="secondary">
            Intellectual property integrity, DMCA framework, and rightsholder protection.
          </Text>
        </VStack>

        <Card padding={6} elevation="low" style={{ backgroundColor: 'var(--color-background-surface)', lineHeight: 1.7 }}>
          <VStack gap={6}>
            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                1. Respect for Intellectual Property
              </Heading>
              <Text type="body" color="secondary">
                Syllabi respects the intellectual property rights of educators, publishers, exam boards, and authors. We require our student users to confirm that they personally created the revision resources they share or possess the necessary rights to distribute them.
              </Text>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                2. Prohibition of Commercial & Exam Materials
              </Heading>
              <Text type="body" color="secondary">
                Our Terms of Service explicitly prohibit uploading commercial textbook scans, publisher copyrighted worksheets, official exam board question papers, or locked mark schemes. Any detected materials of this nature are promptly removed.
              </Text>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                3. Notice and Takedown Procedure
              </Heading>
              <Text type="body" color="secondary">
                If you are a copyright owner or an authorized agent and believe that content hosted on Syllabi infringes your copyright, please submit a written notification containing:
              </Text>
              <ol style={{ paddingLeft: 24, margin: '8px 0', color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>The specific URL or resource title on Syllabi alleged to be infringing.</li>
                <li>Your contact information (name, address, telephone number, and email address).</li>
                <li>A statement that you have a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
                <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner.</li>
                <li>A physical or electronic signature of the copyright owner or authorized representative.</li>
              </ol>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                4. Designated Copyright Agent
              </Heading>
              <Text type="body" color="secondary">
                Send all formal copyright notices and DMCA notices to:
                <br />
                <strong>Designated Copyright Agent:</strong> Legal Department
                <br />
                <strong>Email:</strong> copyright@syllabi.app
                <br />
                <strong>Service Provider:</strong> [Syllabi Ltd / Operator Legal Entity]
              </Text>
            </VStack>

            <Divider />

            <VStack gap={2}>
              <Heading level={2} style={{ fontSize: '1.25rem' }}>
                5. Quick Online Reporting
              </Heading>
              <Text type="body" color="secondary">
                You can also report any resource directly from its page using the <strong>Report</strong> button, selecting &quot;Copyright infringement&quot; or &quot;Official exam material&quot;.
              </Text>
              <Link href="/explore" style={{ textDecoration: 'none', marginTop: 8 }}>
                <Button variant="secondary" size="sm" label="Browse resources to report" />
              </Link>
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </div>
  );
}

