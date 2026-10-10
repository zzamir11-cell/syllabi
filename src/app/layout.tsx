import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@/theme/neutral.css';
import { AppProviders } from '@/components/AppProviders';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-figtree',
});

export const metadata: Metadata = {
  title: 'Syllabi — Student-Created Academic Resources',
  description:
    'Discover, upload, organize, save, rate, and share academic revision notes, guides, mind maps, and essay plans created by students.',
  keywords: [
    'GCSE revision',
    'A-Level notes',
    'AQA Chemistry',
    'Edexcel Biology',
    'OCR Maths',
    'Student revision notes',
    'Mind maps',
    'Essay plans',
  ],
  openGraph: {
    title: 'Syllabi — Student-Created Academic Resources',
    description: 'Study resources, made by students for GCSE, A-Level, and beyond.',
    url: 'https://syllabi.app',
    siteName: 'Syllabi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syllabi — Student-Created Academic Resources',
    description: 'Study resources, made by students for GCSE, A-Level, and beyond.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // next/font self-hosts Figtree under a hashed family name; point the theme's
  // font tokens at it so every Astryx component actually renders in Figtree.
  const fontTokens = {
    '--font-family-body': `${figtree.style.fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    '--font-family-heading': `${figtree.style.fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  } as React.CSSProperties;

  return (
    // suppressHydrationWarning: the inline theme script below sets
    // data-theme / class / color-scheme on <html> before React hydrates.
    <html lang="en" className={figtree.variable} style={fontTokens} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement,m=localStorage.getItem('syllabi_theme_mode');if(m!=='light'&&m!=='dark'){m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}d.setAttribute('data-theme',m);d.classList.toggle('dark',m==='dark');d.style.colorScheme=m;}catch(e){}})();`,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: 'var(--font-family-body)',
          backgroundColor: 'var(--color-background-body)',
          color: 'var(--color-text-primary)',
          minHeight: '100vh',
        }}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

