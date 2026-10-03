import { NextResponse } from 'next/server';
import { COPILOT_KNOWLEDGE_BASE } from '@/lib/copilot_kb';
import { checkRateLimit } from '@/lib/rate_limiter';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = checkRateLimit(`chat_${ip}`, 30, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many queries submitted. Please wait before submitting more questions.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } }
      );
    }

    const body = await req.json();
    const query = (body.query || '').trim().toLowerCase();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const matches = COPILOT_KNOWLEDGE_BASE.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.details.toLowerCase().includes(query) ||
      item.keywords.some((k) => k.toLowerCase().includes(query))
    );

    if (matches.length > 0) {
      const top = matches[0];
      return NextResponse.json({
        reply: `${top.title}: ${top.details}`,
        actionUrl: top.actionUrl || null,
        category: top.category,
        matches: matches.slice(0, 3).map((m) => ({
          id: m.id,
          title: m.title,
          summary: m.summary,
          actionUrl: m.actionUrl,
        })),
      });
    }

    return NextResponse.json({
      reply: `I searched the operational rules and outlet registry for "${body.query}". No exact constraint was triggered, but our fleet allocation engine is actively monitoring capacity, cooling profiles, and driver hours. You can inspect the validator or exceptions queue for real time alerts.`,
      actionUrl: '/dispatcher/validator',
      category: 'General',
      matches: [],
    });
  } catch {
    return NextResponse.json({ error: 'Internal agent error' }, { status: 500 });
  }
}
