import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate_limiter';

// Default studio voice profiles available on ElevenLabs free tier
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel: Professional operations dispatcher

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = checkRateLimit(`voice_synth_${ip}`, 15, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many voice synthesis requests. Please retry shortly.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } },
      );
    }

    const body = await req.json();
    const text = (body.text || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) {
      return NextResponse.json({ error: 'Text is required for voice synthesis' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    // Graceful zero cost fallback if API key is not configured
    if (!apiKey) {
      return NextResponse.json({
        fallback: true,
        plainText: text,
        provider: 'browser_neural',
        reason: 'api_key_not_configured',
      });
    }

    const voiceId = body.voiceId || DEFAULT_VOICE_ID;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

    const elevenRes = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.52,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    });

    if (!elevenRes.ok) {
      // Fallback seamlessly if quota exceeded or invalid key
      return NextResponse.json({
        fallback: true,
        plainText: text,
        provider: 'browser_neural',
        reason: 'quota_exceeded_or_request_failed',
      });
    }

    const audioBuffer = await elevenRes.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json(
      {
        fallback: true,
        provider: 'browser_neural',
        reason: 'internal_error',
      },
      { status: 200 },
    );
  }
}
