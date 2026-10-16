'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SyllabiLogo } from './SyllabiLogo';
import { useSyllabi } from '@/lib/store';
import { TopNav, TopNavItem, TopNavHeading } from '@astryxdesign/core/TopNav';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { Badge } from '@astryxdesign/core/Badge';
import { Avatar } from '@astryxdesign/core/Avatar';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, signOutUser, savedResourceIds, themeMode, toggleThemeMode } = useSyllabi();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Explore', href: '/explore' },
    { label: 'Your Subjects', href: '/your-subjects' },
    { label: 'Requests', href: '/requests' },
    { label: 'Collections', href: '/collections' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--color-background-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 var(--spacing-4)',
        }}
      >
        <TopNav
          label="Syllabi Main Navigation"
          heading={
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: 'var(--spacing-4)',
              }}
            >
              <SyllabiLogo size="md" />
            </Link>
          }
          startContent={
            <HStack gap={1} vAlign="center">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <TopNavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    isSelected={isActive}
                  />
                );
              })}
            </HStack>
          }
          endContent={
            <HStack gap={2} vAlign="center">
              {/* Saved shortcut */}
              <Link href="/saved" style={{ textDecoration: 'none' }}>
                <Button
                  size="sm"
                  variant={pathname === '/saved' ? 'secondary' : 'ghost'}
                  label="Saved"
                  endContent={
                    savedResourceIds.length > 0 ? (
                      <Badge label={savedResourceIds.length} variant="neutral" />
                    ) : undefined
                  }
                />
              </Link>

              {/* Dark/Light mode toggle */}
              <Button
                size="sm"
                variant="ghost"
                label={themeMode === 'dark' ? '☀️' : '🌙'}
                onClick={toggleThemeMode}
                tooltip={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              />

              {/* Upload CTA */}
              <Link href="/upload" style={{ textDecoration: 'none' }}>
                <Button
                  size="sm"
                  variant="primary"
                  label="Upload"
                />
              </Link>

              {/* Real User Profile Menu or Sign In */}
              {currentUser ? (
                <HStack gap={1} vAlign="center">
                  <Link href="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      size="sm"
                      name={currentUser.fullName || currentUser.username}
                      src={currentUser.avatarUrl || undefined}
                    />
                  </Link>
                  <DropdownMenu
                    button={{
                      label: `@${currentUser.username}`,
                      size: 'sm',
                      variant: 'ghost',
                    }}
                    items={[
                      {
                        label: currentUser.fullName || `@${currentUser.username}`,
                        description: `${currentUser.qualification} • ${currentUser.examBoard || ''}`,
                        onClick: () => router.push('/profile'),
                      },
                      { type: 'divider' },
                      {
                        label: 'Your Profile',
                        description: 'View your student portfolio and notes',
                        onClick: () => router.push('/profile'),
                      },
                      {
                        label: 'Account Settings',
                        description: 'Update subjects, qualifications & bio',
                        onClick: () => router.push('/settings'),
                      },
                      {
                        label: 'Your Collections',
                        description: 'Study stacks organized by you',
                        onClick: () => router.push('/collections'),
                      },
                      {
                        label: 'Saved Resources',
                        description: `${savedResourceIds.length} saved resources`,
                        onClick: () => router.push('/saved'),
                      },
                      ...(currentUser.role === 'admin'
                        ? [
                            { type: 'divider' as const },
                            {
                              label: 'Admin Console',
                              description: 'Review reports & moderation',
                              onClick: () => router.push('/admin'),
                            },
                          ]
                        : []),
                      { type: 'divider' },
                      {
                        label: 'Sign Out',
                        onClick: async () => {
                          await signOutUser();
                          router.push('/');
                        },
                      },
                    ]}
                  />
                </HStack>
              ) : (
                <HStack gap={1.5} vAlign="center">
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Button size="sm" variant="ghost" label="Sign in" />
                  </Link>
                  <Link href="/signup" style={{ textDecoration: 'none' }}>
                    <Button size="sm" variant="secondary" label="Sign up" />
                  </Link>
                </HStack>
              )}
            </HStack>
          }
        />
      </div>
    </header>
  );
}

