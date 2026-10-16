import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = request.headers.get('origin') || new URL(request.url).origin;
  const redirectUri = `${origin}/auth/callback`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return NextResponse.json({
      enabled: false,
      message: 'Supabase URL is not configured.',
    });
  }

  const authorizeUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;

  try {
    const probeRes = await fetch(authorizeUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      redirect: 'manual',
    });

    if (probeRes.status === 400) {
      const errorJson = await probeRes.json().catch(() => ({}));
      return NextResponse.json({
        enabled: false,
        status: 400,
        provider: 'google',
        message: errorJson.msg || 'Unsupported provider: provider is not enabled',
        instructions: {
          step1: 'Open your Supabase Dashboard: https://supabase.com/dashboard/project/kxuscyoiwnbufxdupgjf/auth/providers',
          step2: 'Click on Google provider and toggle it ON',
          step3: 'Enter your Google Client ID and Secret from Google Cloud Console',
          callbackUrl: `${supabaseUrl}/auth/v1/callback`,
        },
      });
    }

    // Provider is enabled (will return 302/303 redirect to accounts.google.com)
    return NextResponse.json({
      enabled: true,
      url: authorizeUrl,
    });
  } catch (err: any) {
    return NextResponse.json({
      enabled: false,
      message: err.message || 'Failed to verify Google OAuth status',
    });
  }
}
