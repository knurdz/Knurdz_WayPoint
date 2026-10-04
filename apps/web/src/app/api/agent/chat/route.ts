import { NextResponse } from 'next/server';
import { COPILOT_KNOWLEDGE_BASE } from '@/lib/copilot_kb';
import { checkRateLimit } from '@/lib/rate_limiter';
import { executeVoiceTool } from '@/lib/agent_tools';
import { queryRAG } from '@/lib/rag_engine';
import { agentChatSchema, validateRequestBody } from '@/lib/api_schemas';

interface ActionPayload {
  id: string;
  label: string;
  href: string;
  description: string;
  status: string;
}

interface StaticAnswer {
  match: RegExp;
  reply: string;
  action?: ActionPayload;
}

const STATIC_ANSWERS: StaticAnswer[] = [
  {
    match: /orders?\s*(today|count|how many)|how many orders/i,
    reply: 'There are 142 orders today: 138 confirmed and 4 pending deferrals across Western and Central routes.',
    action: {
      id: 'queue',
      label: 'Order Queue',
      href: '/dispatcher/queue',
      description: 'Navigate to the dispatcher order queue for today 142 orders.',
      status: 'Opened Order Queue',
    },
  },
  {
    match: /cutoff|deadline|16:00|4\s*pm/i,
    reply: 'Today cutoff is 16:00 SLST. The countdown is live in the sidebar and on cutoff screens.',
    action: {
      id: 'cutoff',
      label: 'Cutoff & Late Orders',
      href: '/dispatcher/cutoff',
      description: 'Navigate to the cutoff countdown and late order review screen.',
      status: 'Opened Cutoff',
    },
  },
  {
    match: /fleet|vehicles?|active fleet|how many (trucks|vans)/i,
    reply: '32 vehicles are active today: 28 at Peliyagoda Hub and 4 at Kandy Terminal.',
    action: {
      id: 'allocation',
      label: 'Fleet Allocation',
      href: '/dispatcher/allocation',
      description: 'Navigate to the fleet allocation board to review vehicle assignments.',
      status: 'Opened Fleet Allocation',
    },
  },
  {
    match: /exception|incident|triage count|open incident/i,
    reply: 'There are 3 open exceptions requiring triage across dock, sync, and cold chain.',
    action: {
      id: 'exceptions',
      label: 'Exceptions',
      href: '/dispatcher/exceptions',
      description: 'Navigate to Exception & Synchronization Triage and highlight the incident table.',
      status: 'Opened Exceptions',
    },
  },
  {
    match: /open\s+exception|exceptions|triage|show exception/i,
    reply: 'I can take you to Exceptions. Please confirm below.',
    action: {
      id: 'exceptions',
      label: 'Exceptions',
      href: '/dispatcher/exceptions',
      description: 'Navigate to Exception & Synchronization Triage and highlight the incident table.',
      status: 'Opened Exceptions',
    },
  },
  {
    match: /order\s+queue|open queue|show queue|queue page/i,
    reply: 'I can take you to Order Queue. Please confirm below.',
    action: {
      id: 'queue',
      label: 'Order Queue',
      href: '/dispatcher/queue',
      description: 'Navigate to the dispatcher order queue for today 142 orders.',
      status: 'Opened Order Queue',
    },
  },
  {
    match: /fleet\s+alloc|allocation|allocate|open allocation/i,
    reply: 'I can take you to Fleet Allocation. Please confirm below.',
    action: {
      id: 'allocation',
      label: 'Fleet Allocation',
      href: '/dispatcher/allocation',
      description: 'Navigate to the fleet allocation board to review vehicle assignments.',
      status: 'Opened Fleet Allocation',
    },
  },
  {
    match: /cutoff screen|late orders|open cutoff/i,
    reply: 'I can take you to Cutoff & Late Orders. Please confirm below.',
    action: {
      id: 'cutoff',
      label: 'Cutoff & Late Orders',
      href: '/dispatcher/cutoff',
      description: 'Navigate to the cutoff countdown and late order review screen.',
      status: 'Opened Cutoff',
    },
  },
  {
    match: /warehouse\s+dock|dock\s+queue|open dock|dock/i,
    reply: 'I can take you to Warehouse Dock. Please confirm below.',
    action: {
      id: 'dock',
      label: 'Warehouse Dock',
      href: '/loader',
      description: 'Navigate to warehouse dock dispatch queue and pallet staging.',
      status: 'Opened Warehouse Dock',
    },
  },
  {
    match: /driver\s+cockpit|driver\s+route|active route/i,
    reply: 'I can take you to Driver Cockpit. Please confirm below.',
    action: {
      id: 'driver',
      label: 'Driver Cockpit',
      href: '/driver',
      description: 'Navigate to driver route navigation and manifest execution.',
      status: 'Opened Driver Cockpit',
    },
  },
  {
    match: /store\s+portal|place\s+order|new order/i,
    reply: 'I can take you to Store Order Placement. Please confirm below.',
    action: {
      id: 'store',
      label: 'Place Order',
      href: '/store/order',
      description: 'Navigate to store order booking portal.',
      status: 'Opened Store Portal',
    },
  },
];

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

    const validation = await validateRequestBody(req, agentChatSchema);
    if (!validation.success) {
      return validation.response;
    }
    const query = validation.data.query;

    // Query dynamic operational RAG engine for citations and grounded context
    const ragResult = queryRAG(query, 3);

    // Check real time voice telemetry tools first
    const voiceToolResult = executeVoiceTool(query);
    if (voiceToolResult.matched && voiceToolResult.spokenReply) {
      return NextResponse.json({
        reply: voiceToolResult.spokenReply,
        action: voiceToolResult.action || null,
        telemetryData: voiceToolResult.telemetryData || null,
        toolName: voiceToolResult.toolName,
        citations: ragResult.citations,
        ragContext: ragResult.groundedContext,
      });
    }

    // Check pre configured intent patterns
    for (const item of STATIC_ANSWERS) {
      if (item.match.test(query)) {
        return NextResponse.json({
          reply: item.reply,
          action: item.action || null,
          citations: ragResult.citations,
          ragContext: ragResult.groundedContext,
        });
      }
    }

    // Next check RAG match
    if (ragResult.matched && ragResult.bestDocument) {
      const best = ragResult.bestDocument;
      const actionPayload: ActionPayload | null = best.actionUrl
        ? {
            id: best.id,
            label: best.title,
            href: best.actionUrl,
            description: best.summary,
            status: `Opened ${best.title}`,
          }
        : null;

      return NextResponse.json({
        reply: `${best.title}. ${best.summary}`,
        action: actionPayload,
        category: best.category,
        citations: ragResult.citations,
        ragContext: ragResult.groundedContext,
      });
    }

    // Default conversational fallback
    const defaultFallback =
      'I can answer questions about orders today, cutoff time, active fleet, and open exceptions. I can also open Exceptions, Order Queue, Fleet Allocation, or Cutoff after you approve.';

    return NextResponse.json({
      reply: defaultFallback,
      action: {
        id: 'validator',
        label: 'Constraint Validator',
        href: '/dispatcher/validator',
        description: 'Inspect live allocation rules and constraints in the validator.',
        status: 'Opened Validator',
      },
      category: 'General',
    });
  } catch {
    return NextResponse.json({ error: 'Internal agent error' }, { status: 500 });
  }
}
