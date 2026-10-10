import { NextRequest, NextResponse } from 'next/server';
import { analyzeUploadedFile } from '@/lib/qualityPipeline';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, fileSize, mimeType } = body;

    const result = await analyzeUploadedFile({
      name: fileName || 'Document.pdf',
      size: fileSize || 10240,
      type: mimeType || 'application/pdf',
    });

    return NextResponse.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    );
  }
}
