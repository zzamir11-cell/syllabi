import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_RESOURCES, INITIAL_QUALIFICATIONS, INITIAL_EXAM_BOARDS, INITIAL_SUBJECTS } from '@/lib/data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const qualification = searchParams.get('qualification') || 'all';
  const board = searchParams.get('board') || 'all';
  const subject = searchParams.get('subject') || 'all';
  const type = searchParams.get('type') || 'all';

  const lowerQ = q.toLowerCase();

  // Natural query intent extraction
  let extractedQual: string | null = null;
  let extractedBoard: string | null = null;
  let extractedSubj: string | null = null;

  for (const item of INITIAL_QUALIFICATIONS) {
    if (lowerQ.includes(item.slug) || lowerQ.includes(item.name.toLowerCase())) {
      extractedQual = item.slug;
      break;
    }
  }

  for (const item of INITIAL_EXAM_BOARDS) {
    if (lowerQ.includes(item.slug) || lowerQ.includes(item.name.toLowerCase()) || lowerQ.includes(item.code.toLowerCase())) {
      extractedBoard = item.slug;
      break;
    }
  }

  for (const item of INITIAL_SUBJECTS) {
    if (lowerQ.includes(item.slug) || lowerQ.includes(item.name.toLowerCase())) {
      extractedSubj = item.slug;
      break;
    }
  }

  // Filter resources
  const results = INITIAL_RESOURCES.filter((res) => {
    if (res.status === 'removed') return false;

    // Direct filters take precedence; fall back to extracted intent
    const targetQual = qualification !== 'all' ? qualification : extractedQual;
    if (targetQual && res.qualificationName.toLowerCase() !== targetQual.toLowerCase() && !res.qualificationId.includes(targetQual)) {
      return false;
    }

    const targetBoard = board !== 'all' ? board : extractedBoard;
    if (targetBoard && res.examBoardName.toLowerCase() !== targetBoard.toLowerCase() && !res.examBoardId.includes(targetBoard)) {
      return false;
    }

    const targetSubj = subject !== 'all' ? subject : extractedSubj;
    if (targetSubj && res.subjectName.toLowerCase() !== targetSubj.toLowerCase() && !res.subjectId.includes(targetSubj)) {
      return false;
    }

    if (type !== 'all' && res.resourceType.toLowerCase() !== type.toLowerCase()) {
      return false;
    }

    // Remaining keyword search
    if (lowerQ) {
      const terms = lowerQ.split(/\s+/).filter((t) => t.length > 1);
      const haystack = `${res.title} ${res.description} ${res.topicName || ''} ${res.tags.join(' ')} ${res.creatorUsername}`.toLowerCase();
      // If terms exist after removing extracted facets, check if at least one matches
      const nonFacetTerms = terms.filter(
        (t) =>
          !['aqa', 'edexcel', 'ocr', 'gcse', 'a-level', 'alevel', 'notes', 'guide', 'chemistry', 'biology', 'physics', 'maths'].includes(t)
      );

      if (nonFacetTerms.length > 0) {
        return nonFacetTerms.some((term) => haystack.includes(term));
      }
    }

    return true;
  });

  return NextResponse.json({
    success: true,
    total: results.length,
    results,
    extractedIntent: {
      qualification: extractedQual,
      examBoard: extractedBoard,
      subject: extractedSubj,
    },
  });
}
