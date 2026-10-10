'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress on route change
  useEffect(() => {
    if (navigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setNavigating(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept click on internal links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignore external, hash-only, or new tab links
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || targetAttr === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      // Check if it's the exact same pathname and query
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start transition indicator immediately
      setNavigating(true);
      setProgress(25);

      setTimeout(() => {
        setProgress((prev) => (prev < 80 ? 70 : prev));
      }, 150);
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, []);

  if (!navigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundColor: 'transparent',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: 'var(--color-accent)',
          boxShadow: '0 0 8px var(--color-accent)',
          transition: progress === 100 ? 'width 0.15s ease-out, opacity 0.2s ease-out' : 'width 0.3s ease-in-out',
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
