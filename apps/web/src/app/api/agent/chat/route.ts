import { NextResponse } from 'next/server';
import { COPILOT_KNOWLEDGE_BASE } from '@/lib/copilot_kb';
import { checkRateLimit } from '@/lib/rate_limiter';

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

    const body = await req.json();
    const query = (body.query || '').trim();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Check pre configured intent patterns
    for (const item of STATIC_ANSWERS) {
      if (item.match.test(query)) {
        return NextResponse.json({
          reply: item.reply,
          action: item.action || null,
        });
      }
    }

    // Fallback to knowledge base search
    const lowerQuery = query.toLowerCase();
    const queryTokens = lowerQuery.split(/\s+/).filter((t: string) => t.length > 2);

    const matches = COPILOT_KNOWLEDGE_BASE.filter((item) => {
      const itemTitleLower = item.title.toLowerCase();
      const itemSummaryLower = item.summary.toLowerCase();
      const itemDetailsLower = item.details.toLowerCase();

      // Check if query contains any of the item keywords
      if (item.keywords.some((k) => lowerQuery.includes(k.toLowerCase()))) {
        return true;
      }

      // Check if query mentions rule ID or title
      if (
        itemTitleLower.includes(lowerQuery) ||
        lowerQuery.includes(itemTitleLower) ||
        itemSummaryLower.includes(lowerQuery) ||
        itemDetailsLower.includes(lowerQuery)
      ) {
        return true;
      }

      // Check token match
      const matchingTokens = queryTokens.filter(
        (t: string) =>
          itemTitleLower.includes(t) ||
          itemSummaryLower.includes(t) ||
          item.keywords.some((k) => k.toLowerCase().includes(t))
      );
      return matchingTokens.length >= 2;
    });

    if (matches.length > 0) {
      const top = matches[0];
      const actionPayload: ActionPayload | null = top.actionUrl
        ? {
            id: top.id,
            label: top.title,
            href: top.actionUrl,
            description: top.summary,
            status: `Opened ${top.title}`,
          }
        : null;

      return NextResponse.json({
        reply: `${top.title}: ${top.details}`,
        action: actionPayload,
        category: top.category,
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
