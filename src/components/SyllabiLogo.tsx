'use client';

import React from 'react';
import { HStack } from '@astryxdesign/core/Layout';

interface SyllabiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const SYLLABI_BRAND = {
  fontFamily: 'var(--font-family-heading), Figtree, -apple-system, BlinkMacSystemFont, sans-serif',
  fontWeight: 700,
  letterSpacing: '-0.035em',
  dotRatio: 0.18, // Dot size relative to font size
  dotColorHex: '#171717',
  textColorHex: '#171717',
};

export function SyllabiLogo({ size = 'md', showSubtitle = false }: SyllabiLogoProps) {
  const fontSizes = {
    sm: '1.125rem',
    md: '1.3125rem',
    lg: '1.625rem',
    xl: '2rem',
  };

  const dotSizes = {
    sm: 4,
    md: 5,
    lg: 6,
    xl: 7,
  };

  const fontSize = fontSizes[size] || fontSizes.md;
  const dotSize = dotSizes[size] || dotSizes.md;

  return (
    <HStack gap={1} vAlign="center" style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
      <span
        style={{
          fontFamily: SYLLABI_BRAND.fontFamily,
          fontWeight: SYLLABI_BRAND.fontWeight,
          fontSize,
          letterSpacing: SYLLABI_BRAND.letterSpacing,
          color: 'var(--color-text-primary)',
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'baseline',
          userSelect: 'none',
        }}
      >
        <span>Syllabi</span>
        <span
          style={{
            display: 'inline-block',
            width: dotSize,
            height: dotSize,
            backgroundColor: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-full)',
            marginLeft: Math.max(2, Math.round(dotSize * 0.4)),
            alignSelf: 'center',
            transform: 'translateY(1px)',
          }}
          aria-hidden="true"
        />
      </span>
      {showSubtitle && (
        <span
          style={{
            fontFamily: 'var(--font-family-body), Figtree, sans-serif',
            fontSize: '0.6875rem',
            color: 'var(--color-text-secondary)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginLeft: 6,
          }}
        >
          Academic
        </span>
      )}
    </HStack>
  );
}
