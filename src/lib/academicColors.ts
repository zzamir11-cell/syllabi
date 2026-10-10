/**
 * Syllabi Academic Color System
 * Strictly uses Astryx Color Tokens with meaningful academic associations:
 * - Chemistry: Amber / Coral (Warm chemistry flasks, elements)
 * - Biology: Emerald Green (Life sciences, nature)
 * - Physics: Cobalt / Royal Blue (Electromagnetism, astrophysics)
 * - Mathematics: Violet / Indigo (Logic, proof, geometry)
 * - English: Crimson / Rose (Literature, essays, analysis)
 * - History: Warm Ochre / Amber (Antiquity, historical manuscripts)
 * - Economics & Business: Teal (Markets, equilibrium, finance)
 * - Computer Science: Cyan / Sky (Logic gates, systems, algorithms)
 * - Psychology: Purple / Lavender (Mind, neuroscience, cognition)
 */

export interface SubjectColorStyle {
  name: string;
  bgToken: string;
  borderToken: string;
  textToken: string;
  iconToken: string;
  accentHex: string;
  lightBgHex: string;
  paperStripeHex: string;
}

export const SUBJECT_COLORS: Record<string, SubjectColorStyle> = {
  chemistry: {
    name: 'Chemistry',
    bgToken: 'var(--color-background-orange)',
    borderToken: 'var(--color-border-orange)',
    textToken: 'var(--color-text-orange)',
    iconToken: 'var(--color-icon-orange)',
    accentHex: '#d97706',
    lightBgHex: '#fffbeb',
    paperStripeHex: '#f59e0b',
  },
  biology: {
    name: 'Biology',
    bgToken: 'var(--color-background-green)',
    borderToken: 'var(--color-border-green)',
    textToken: 'var(--color-text-green)',
    iconToken: 'var(--color-icon-green)',
    accentHex: '#16a34a',
    lightBgHex: '#f0fdf4',
    paperStripeHex: '#22c55e',
  },
  physics: {
    name: 'Physics',
    bgToken: 'var(--color-background-blue)',
    borderToken: 'var(--color-border-blue)',
    textToken: 'var(--color-text-blue)',
    iconToken: 'var(--color-icon-blue)',
    accentHex: '#2563eb',
    lightBgHex: '#eff6ff',
    paperStripeHex: '#3b82f6',
  },
  mathematics: {
    name: 'Mathematics',
    bgToken: 'var(--color-background-purple)',
    borderToken: 'var(--color-border-purple)',
    textToken: 'var(--color-text-purple)',
    iconToken: 'var(--color-icon-purple)',
    accentHex: '#7c3aed',
    lightBgHex: '#f5f3ff',
    paperStripeHex: '#8b5cf6',
  },
  'further mathematics': {
    name: 'Further Mathematics',
    bgToken: 'var(--color-background-purple)',
    borderToken: 'var(--color-border-purple)',
    textToken: 'var(--color-text-purple)',
    iconToken: 'var(--color-icon-purple)',
    accentHex: '#6d28d9',
    lightBgHex: '#f5f3ff',
    paperStripeHex: '#7c3aed',
  },
  'english literature': {
    name: 'English Literature',
    bgToken: 'var(--color-background-pink)',
    borderToken: 'var(--color-border-pink)',
    textToken: 'var(--color-text-pink)',
    iconToken: 'var(--color-icon-pink)',
    accentHex: '#e11d48',
    lightBgHex: '#fff1f2',
    paperStripeHex: '#f43f5e',
  },
  'english language': {
    name: 'English Language',
    bgToken: 'var(--color-background-pink)',
    borderToken: 'var(--color-border-pink)',
    textToken: 'var(--color-text-pink)',
    iconToken: 'var(--color-icon-pink)',
    accentHex: '#be123c',
    lightBgHex: '#fff1f2',
    paperStripeHex: '#e11d48',
  },
  history: {
    name: 'History',
    bgToken: 'var(--color-background-yellow)',
    borderToken: 'var(--color-border-yellow)',
    textToken: 'var(--color-text-yellow)',
    iconToken: 'var(--color-icon-yellow)',
    accentHex: '#b45309',
    lightBgHex: '#fefce8',
    paperStripeHex: '#d97706',
  },
  economics: {
    name: 'Economics',
    bgToken: 'var(--color-background-teal)',
    borderToken: 'var(--color-border-teal)',
    textToken: 'var(--color-text-teal)',
    iconToken: 'var(--color-icon-teal)',
    accentHex: '#0f766e',
    lightBgHex: '#f0fdfa',
    paperStripeHex: '#14b8a6',
  },
  business: {
    name: 'Business',
    bgToken: 'var(--color-background-teal)',
    borderToken: 'var(--color-border-teal)',
    textToken: 'var(--color-text-teal)',
    iconToken: 'var(--color-icon-teal)',
    accentHex: '#0d9488',
    lightBgHex: '#f0fdfa',
    paperStripeHex: '#2dd4bf',
  },
  psychology: {
    name: 'Psychology',
    bgToken: 'var(--color-background-purple)',
    borderToken: 'var(--color-border-purple)',
    textToken: 'var(--color-text-purple)',
    iconToken: 'var(--color-icon-purple)',
    accentHex: '#9333ea',
    lightBgHex: '#faf5ff',
    paperStripeHex: '#a855f7',
  },
  'computer science': {
    name: 'Computer Science',
    bgToken: 'var(--color-background-cyan)',
    borderToken: 'var(--color-border-cyan)',
    textToken: 'var(--color-text-cyan)',
    iconToken: 'var(--color-icon-cyan)',
    accentHex: '#0369a1',
    lightBgHex: '#f0f9ff',
    paperStripeHex: '#0ea5e9',
  },
  geography: {
    name: 'Geography',
    bgToken: 'var(--color-background-green)',
    borderToken: 'var(--color-border-green)',
    textToken: 'var(--color-text-green)',
    iconToken: 'var(--color-icon-green)',
    accentHex: '#15803d',
    lightBgHex: '#f0fdf4',
    paperStripeHex: '#4ade80',
  },
};

const DEFAULT_SUBJECT_COLOR: SubjectColorStyle = {
  name: 'Academic',
  bgToken: 'var(--color-background-muted)',
  borderToken: 'var(--color-border)',
  textToken: 'var(--color-text-primary)',
  iconToken: 'var(--color-icon-primary)',
  accentHex: '#44403c',
  lightBgHex: '#fafaf9',
  paperStripeHex: '#78716c',
};

export function getSubjectColor(subjectName?: string): SubjectColorStyle {
  if (!subjectName) return DEFAULT_SUBJECT_COLOR;
  const normalized = subjectName.toLowerCase().trim();

  for (const [key, val] of Object.entries(SUBJECT_COLORS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return val;
    }
  }

  // Partial heuristics
  if (normalized.includes('chem')) return SUBJECT_COLORS.chemistry;
  if (normalized.includes('bio')) return SUBJECT_COLORS.biology;
  if (normalized.includes('phys')) return SUBJECT_COLORS.physics;
  if (normalized.includes('math') || normalized.includes('calc') || normalized.includes('alg')) return SUBJECT_COLORS.mathematics;
  if (normalized.includes('econ') || normalized.includes('finance')) return SUBJECT_COLORS.economics;
  if (normalized.includes('hist') || normalized.includes('politics')) return SUBJECT_COLORS.history;
  if (normalized.includes('lit') || normalized.includes('eng')) return SUBJECT_COLORS['english literature'];
  if (normalized.includes('psych') || normalized.includes('socio')) return SUBJECT_COLORS.psychology;
  if (normalized.includes('comp') || normalized.includes('code') || normalized.includes('it')) return SUBJECT_COLORS['computer science'];
  if (normalized.includes('geog') || normalized.includes('earth')) return SUBJECT_COLORS.geography;

  return DEFAULT_SUBJECT_COLOR;
}

export function getQualificationBadgeStyle(qualificationName?: string) {
  const q = (qualificationName || '').toUpperCase();
  if (q.includes('A-LEVEL') || q.includes('A LEVEL')) {
    return {
      bg: 'var(--color-background-blue)',
      border: 'var(--color-border-blue)',
      text: 'var(--color-text-blue)',
      hex: '#2563eb',
    };
  }
  if (q.includes('GCSE')) {
    return {
      bg: 'var(--color-background-green)',
      border: 'var(--color-border-green)',
      text: 'var(--color-text-green)',
      hex: '#16a34a',
    };
  }
  if (q.includes('IGCSE')) {
    return {
      bg: 'var(--color-background-teal)',
      border: 'var(--color-border-teal)',
      text: 'var(--color-text-teal)',
      hex: '#0d9488',
    };
  }
  if (q.includes('IB')) {
    return {
      bg: 'var(--color-background-purple)',
      border: 'var(--color-border-purple)',
      text: 'var(--color-text-purple)',
      hex: '#7c3aed',
    };
  }
  return {
    bg: 'var(--color-background-muted)',
    border: 'var(--color-border)',
    text: 'var(--color-text-secondary)',
    hex: '#57534e',
  };
}

export function getStatusStyle(status: 'open' | 'fulfilled' | 'published' | 'pending') {
  switch (status) {
    case 'open':
    case 'pending':
      return {
        variant: 'warning' as const,
        label: status === 'open' ? 'Open' : 'Pending',
        color: 'var(--color-warning)',
        bg: 'var(--color-warning-muted)',
        border: 'var(--color-border-yellow)',
      };
    case 'fulfilled':
    case 'published':
      return {
        variant: 'success' as const,
        label: status === 'fulfilled' ? 'Fulfilled' : 'Published',
        color: 'var(--color-success)',
        bg: 'var(--color-success-muted)',
        border: 'var(--color-border-green)',
      };
    default:
      return {
        variant: 'neutral' as const,
        label: String(status),
        color: 'var(--color-text-secondary)',
        bg: 'var(--color-background-muted)',
        border: 'var(--color-border)',
      };
  }
}

export function getSubjectTokenColor(subjectName: string): 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray' {
  const s = (subjectName || '').toLowerCase();
  if (s.includes('chem')) return 'orange';
  if (s.includes('bio')) return 'green';
  if (s.includes('phys')) return 'blue';
  if (s.includes('math')) return 'purple';
  if (s.includes('eng')) return 'pink';
  if (s.includes('hist')) return 'yellow';
  if (s.includes('econ') || s.includes('bus')) return 'teal';
  if (s.includes('comput') || s.includes('cs')) return 'cyan';
  if (s.includes('psych') || s.includes('sociol')) return 'purple';
  if (s.includes('geog')) return 'green';
  if (s.includes('law') || s.includes('polit')) return 'red';
  return 'gray';
}

