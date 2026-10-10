import { ResourceType } from './types';

export interface AnalysisResult {
  fileValid: boolean;
  pageCount: number;
  fileSizeBytes: number;
  mimeType: string;
  suggestedMetadata: {
    title: string;
    qualificationSlug: string;
    examBoardSlug: string;
    subjectSlug: string;
    topicName: string;
    resourceType: ResourceType;
    tags: string[];
    summary: string;
  };
  qualitySignals: {
    passedBasicChecks: boolean;
    copyrightRiskScore: 'low' | 'medium' | 'high';
    copyrightRiskReasons: string[];
    lowDensityRisk: boolean;
    duplicateRisk: boolean;
    scanQuality: 'high' | 'medium' | 'low';
  };
  moderationState: 'published' | 'needs_attention' | 'pending_review';
}

const COPYRIGHT_RISK_TERMS = [
  'mark scheme',
  'examiner report',
  'past paper',
  'question paper',
  'specimen paper',
  'confidential exam',
  'pearson edexcel general certificate',
  'aqa all rights reserved',
  'oxford cambridge and rsa examinations',
  'hodder education',
  'cgp books',
  'cambridge university press',
  'oxford university press',
  'copyrighted material',
  'textbook photocopy',
];

/**
 * Client & Server analysis pipeline.
 * Extracts page count and screens for copyright and density risks.
 */
export async function analyzeUploadedFile(
  file: File | { name: string; size: number; type: string; arrayBuffer?: () => Promise<ArrayBuffer> }
): Promise<AnalysisResult> {
  const fileName = file.name || 'Untitled Resource';
  const fileSize = file.size || 0;
  const mimeType = file.type || '';
  const lowerName = fileName.toLowerCase();

  let pageCount = 1;

  // Extract page count for PDF
  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    try {
      if (file.arrayBuffer) {
        const buffer = await file.arrayBuffer();
        const text = new TextDecoder('latin1').decode(buffer);
        // Look for PDF /Type /Page occurrences or /Count N
        const countMatch = text.match(/\/Count\s+(\d+)/);
        if (countMatch && parseInt(countMatch[1]) > 0) {
          pageCount = Math.min(250, parseInt(countMatch[1]));
        } else {
          const pageMatches = text.match(/\/Type\s*\/Page\b/g);
          if (pageMatches && pageMatches.length > 0) {
            pageCount = Math.min(250, pageMatches.length);
          } else {
            // Heuristic estimation based on PDF byte size (approx 45KB per page average)
            pageCount = Math.max(1, Math.min(80, Math.round(fileSize / (45 * 1024))));
          }
        }
      } else {
        pageCount = Math.max(1, Math.min(60, Math.round(fileSize / (50 * 1024))));
      }
    } catch {
      pageCount = Math.max(1, Math.round(fileSize / (50 * 1024)));
    }
  } else if (mimeType.startsWith('image/')) {
    pageCount = 1;
  } else if (lowerName.endsWith('.docx')) {
    pageCount = Math.max(1, Math.round(fileSize / (25 * 1024)));
  }

  // Detect copyright risk keywords in file name
  const copyrightRiskReasons: string[] = [];
  for (const term of COPYRIGHT_RISK_TERMS) {
    if (lowerName.includes(term)) {
      copyrightRiskReasons.push(`Filename contains proprietary/exam term: "${term}"`);
    }
  }

  const copyrightRiskScore =
    copyrightRiskReasons.length >= 2 ? 'high' : copyrightRiskReasons.length === 1 ? 'medium' : 'low';

  const lowDensityRisk = fileSize < 1024; // Less than 1KB is likely an empty or placeholder file
  const duplicateRisk = false;

  // Metadata deduction from filename
  let qualificationSlug = 'gcse';
  if (lowerName.includes('a-level') || lowerName.includes('alevel') || lowerName.includes('a2') || lowerName.includes('as-level')) {
    qualificationSlug = 'a-level';
  } else if (lowerName.includes('ib') || lowerName.includes('international baccalaureate')) {
    qualificationSlug = 'ib';
  }

  let examBoardSlug = 'aqa';
  if (lowerName.includes('edexcel') || lowerName.includes('pearson')) {
    examBoardSlug = 'edexcel';
  } else if (lowerName.includes('ocr')) {
    examBoardSlug = 'ocr';
  } else if (lowerName.includes('cie') || lowerName.includes('cambridge')) {
    examBoardSlug = 'cie';
  }

  let subjectSlug = 'chemistry';
  if (lowerName.includes('bio') || lowerName.includes('biology')) {
    subjectSlug = 'biology';
  } else if (lowerName.includes('physic')) {
    subjectSlug = 'physics';
  } else if (lowerName.includes('math') || lowerName.includes('calculus')) {
    subjectSlug = 'mathematics';
  } else if (lowerName.includes('history')) {
    subjectSlug = 'history';
  } else if (lowerName.includes('psycholog')) {
    subjectSlug = 'psychology';
  } else if (lowerName.includes('econom')) {
    subjectSlug = 'economics';
  }

  let resourceType: ResourceType = 'Revision notes';
  if (lowerName.includes('mind map') || lowerName.includes('mindmap')) {
    resourceType = 'Mind maps';
  } else if (lowerName.includes('formula') || lowerName.includes('equation')) {
    resourceType = 'Formula sheets';
  } else if (lowerName.includes('guide')) {
    resourceType = 'Revision guides';
  } else if (lowerName.includes('essay plan')) {
    resourceType = 'Essay plans';
  } else if (lowerName.includes('summary')) {
    resourceType = 'Topic summaries';
  } else if (lowerName.includes('flashcard')) {
    resourceType = 'Flashcards';
  }

  // Clean title recommendation
  let cleanTitle = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b(pdf|docx|notes|final|v\d+)\b/gi, '')
    .trim();

  if (!cleanTitle || cleanTitle.length < 5) {
    cleanTitle = `${examBoardSlug.toUpperCase()} ${qualificationSlug.toUpperCase()} ${subjectSlug.charAt(0).toUpperCase() + subjectSlug.slice(1)} Study Resource`;
  } else {
    // Title case
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  }

  const topicName = cleanTitle.split(' ').slice(0, 3).join(' ');

  const tags = [
    qualificationSlug.toUpperCase(),
    examBoardSlug.toUpperCase(),
    subjectSlug.charAt(0).toUpperCase() + subjectSlug.slice(1),
    resourceType,
  ];

  const summary = `Student-authored ${resourceType.toLowerCase()} covering ${cleanTitle}, structured specifically for ${examBoardSlug.toUpperCase()} ${qualificationSlug.toUpperCase()} examination requirements.`;

  const moderationState =
    copyrightRiskScore === 'high' || lowDensityRisk ? 'needs_attention' : 'published';

  return {
    fileValid: fileSize > 0 && fileSize <= 50 * 1024 * 1024,
    pageCount: Math.max(1, pageCount),
    fileSizeBytes: fileSize,
    mimeType,
    suggestedMetadata: {
      title: cleanTitle,
      qualificationSlug,
      examBoardSlug,
      subjectSlug,
      topicName,
      resourceType,
      tags,
      summary,
    },
    qualitySignals: {
      passedBasicChecks: fileSize > 0 && copyrightRiskScore !== 'high',
      copyrightRiskScore,
      copyrightRiskReasons,
      lowDensityRisk,
      duplicateRisk,
      scanQuality: 'high',
    },
    moderationState,
  };
}
