import { COPILOT_KNOWLEDGE_BASE } from './copilot_kb';
import { GLOBAL_INCIDENTS } from './incidentsStore';

export interface RAGDocument {
  id: string;
  title: string;
  category: 'Rule' | 'Incident' | 'Telemetry' | 'Outlet' | 'Driver';
  content: string;
  summary: string;
  actionUrl?: string;
  keywords: string[];
  timestamp?: string;
  score?: number;
}

export interface RAGCitation {
  id: string;
  title: string;
  category: string;
  actionUrl?: string;
  score: number;
}

export interface RAGQueryResult {
  matched: boolean;
  topScore: number;
  bestDocument?: RAGDocument;
  citations: RAGCitation[];
  retrievedDocuments: RAGDocument[];
  groundedContext: string;
}

// In memory document repository for dynamic RAG operations
const DOCUMENT_STORE: Map<string, RAGDocument> = new Map();

// Helper token extraction for hybrid similarity scoring
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

// Ingest a document into the operational RAG repository
export function ingestDocument(doc: RAGDocument): void {
  DOCUMENT_STORE.set(doc.id, doc);
}

// Retrieve all operational documents
export function getAllDocuments(): RAGDocument[] {
  return Array.from(DOCUMENT_STORE.values());
}

// Seed the RAG repository with enterprise operational knowledge
function initializeCorpus(): void {
  // 1. Ingest Feasibility Rules R01 to R14
  for (const item of COPILOT_KNOWLEDGE_BASE) {
    ingestDocument({
      id: item.id,
      title: item.title,
      category: item.category === 'Rule' ? 'Rule' : item.category === 'Outlet' ? 'Outlet' : 'Telemetry',
      content: `${item.title}. Summary: ${item.summary}. Detailed Constraint: ${item.details}`,
      summary: item.summary,
      actionUrl: item.actionUrl,
      keywords: item.keywords,
      timestamp: 'Active Feasibility Constraint',
    });
  }

  // 2. Ingest Live Exception Incidents
  for (const inc of GLOBAL_INCIDENTS) {
    ingestDocument({
      id: inc.code,
      title: inc.title,
      category: 'Incident',
      content: `Live Exception ${inc.code}: ${inc.title}. Severity: ${inc.severity}. Vehicle: ${inc.vehicleId}. Route: ${inc.routeId}. Outlet: ${inc.outletId}. Description: ${inc.description}. Status: ${inc.status}. Timestamp: ${inc.timestamp}`,
      summary: inc.description,
      actionUrl: '/dispatcher/exceptions',
      keywords: [inc.code.toLowerCase(), inc.type, inc.severity, inc.vehicleId.toLowerCase(), inc.outletId.toLowerCase(), 'incident', 'shortfall', 'sync', 'bay 04', 'reefer tote'],
      timestamp: inc.timestamp,
    });
  }

  // 3. Ingest Cold Chain Deviations
  ingestDocument({
    id: 'TELEMETRY_ALERT_TRK004',
    title: 'Cold Chain Breach: TRK004 Chilled Chamber Temperature Spike',
    category: 'Telemetry',
    content: 'Vehicle TRK004 driven by Anura Bandara at Kollupitiya has an active chilled chamber breach at 5.8 degrees Celsius against certified maximum of 4.0 degrees Celsius. Duration 14 minutes. Compressor cycle anomaly flagged for OUT001 Colombo Superstore delivery.',
    summary: 'Chilled compartment at 5.8 degrees Celsius exceeds mandatory 4.0 degrees limit.',
    actionUrl: '/dispatcher/exceptions',
    keywords: ['trk004', 'chilled', 'breach', 'anura bandara', 'kollupitiya', 'temperature spike', '5.8'],
    timestamp: 'Live Sensor Telemetry',
  });

  ingestDocument({
    id: 'TELEMETRY_ALERT_VAN002',
    title: 'Cold Chain Warning: VAN002 Freezer Compartment Deviation',
    category: 'Telemetry',
    content: 'Vehicle VAN002 driven by Ruwan Jayasuriya at Kandy Peradeniya Bypass has a freezer temperature of minus 14.2 degrees Celsius exceeding mandatory threshold of minus 18.0 degrees Celsius. Active delivery for OUT003 Kandy Central Superstore.',
    summary: 'Freezer at minus 14.2 degrees Celsius warning for OUT003 delivery.',
    actionUrl: '/dispatcher/exceptions',
    keywords: ['van002', 'freezer', 'warning', 'ruwan jayasuriya', 'kandy', 'minus 14.2'],
    timestamp: 'Live Sensor Telemetry',
  });

  // 4. Ingest Outlet Physical Bay Specifications
  ingestDocument({
    id: 'OUTLET_SPEC_OUT001',
    title: 'Outlet Profile OUT001: Colombo Superstore Loading Bay',
    category: 'Outlet',
    content: 'Outlet OUT001 Colombo Superstore features two high clearance bays with 4.2 meter roof clearance. Unloading window is open between 04:00 and 14:00 SLST. Equipped with dock levelers compatible with heavy refrigeration trucks.',
    summary: 'High clearance bays compatible with class A and B heavy trucks.',
    actionUrl: '/dispatcher/outlet',
    keywords: ['out001', 'colombo superstore', 'bay clearance', 'dock leveler'],
    timestamp: 'Physical Asset Registry',
  });

  ingestDocument({
    id: 'OUTLET_SPEC_OUT003',
    title: 'Outlet Profile OUT003: Kandy Central Superstore Access Constraint',
    category: 'Outlet',
    content: 'Outlet OUT003 Kandy Central Superstore is situated in an urban hill corridor restricted to Class C vans. Heavy trucks are blocked by municipal bridge load limits and tight 8 meter turning radiuses. Hard feasibility rule R14 applies.',
    summary: 'Strict van only restriction due to hill country bridge limits.',
    actionUrl: '/dispatcher/outlet',
    keywords: ['out003', 'kandy central', 'van only', 'bridge limit', 'r14'],
    timestamp: 'Physical Asset Registry',
  });

  ingestDocument({
    id: 'OUTLET_SPEC_OUT004',
    title: 'Outlet Profile OUT004: Duplication Road Mall Window Constraint',
    category: 'Outlet',
    content: 'Outlet OUT004 Duplication Road Shopping Mall enforces strict security receiving slots between 10:30 and 12:30 SLST. Deliveries arriving outside this two hour window are refused entry by mall security. Hard feasibility rule R08 applies.',
    summary: 'Strict security receiving slot 10:30 to 12:30 SLST.',
    actionUrl: '/dispatcher/exceptions',
    keywords: ['out004', 'mall window', 'security slot', 'duplication road', 'r08'],
    timestamp: 'Physical Asset Registry',
  });

  // 5. Ingest Driver Roster Manifests
  ingestDocument({
    id: 'DRIVER_MANIFEST_DRV001',
    title: 'Driver Manifest DRV001: Sunil Shantha (TRK001)',
    category: 'Driver',
    content: 'Driver Sunil Shantha on TRK001 assigned to Route 01 Peliyagoda to Negombo Corridor. 6 assigned stops with 3 completed and 3 proof of delivery signatures collected. Next scheduled delivery is OUT002 Negombo Distribution Depot. Zero safety issues reported.',
    summary: 'Route 01 Peliyagoda to Negombo Corridor. 3 of 6 stops completed.',
    actionUrl: '/driver',
    keywords: ['drv001', 'sunil shantha', 'trk001', 'route 01', 'negombo'],
    timestamp: 'Active Driver Shift',
  });
}

// Initialize on first module load
initializeCorpus();

// Query the RAG engine using hybrid vector and keyword scoring
export function queryRAG(query: string, topK = 3): RAGQueryResult {
  const queryTokens = tokenize(query);
  const lowerQuery = query.toLowerCase();

  if (queryTokens.length === 0) {
    return {
      matched: false,
      topScore: 0,
      citations: [],
      retrievedDocuments: [],
      groundedContext: '',
    };
  }

  const scoredDocs: { doc: RAGDocument; score: number }[] = [];

  for (const doc of DOCUMENT_STORE.values()) {
    const docTokens = tokenize(`${doc.title} ${doc.content} ${doc.keywords.join(' ')}`);
    const docTokensSet = new Set(docTokens);

    // 1. Calculate Keyword Term Overlap (Jaccard variant)
    let overlapCount = 0;
    for (const qt of queryTokens) {
      if (docTokensSet.has(qt)) {
        overlapCount++;
      }
    }
    const keywordScore = overlapCount / Math.max(1, queryTokens.length);

    // 2. Direct exact phrase match bonus
    let phraseBonus = 0;
    if (doc.content.toLowerCase().includes(lowerQuery) || doc.title.toLowerCase().includes(lowerQuery)) {
      phraseBonus = 0.45;
    } else if (doc.keywords.some((k) => lowerQuery.includes(k.toLowerCase()))) {
      phraseBonus = 0.35;
    }

    // 3. Category relevance bonus
    let categoryBonus = 0;
    if (lowerQuery.includes(doc.category.toLowerCase())) {
      categoryBonus = 0.15;
    }

    // Combined relevance score normalized between 0 and 1
    const totalScore = Math.min(1.0, keywordScore * 0.5 + phraseBonus + categoryBonus);

    if (totalScore > 0.18) {
      scoredDocs.push({
        doc: { ...doc, score: Math.round(totalScore * 100) / 100 },
        score: totalScore,
      });
    }
  }

  // Sort by highest relevance score
  scoredDocs.sort((a, b) => b.score - a.score);

  const topMatches = scoredDocs.slice(0, topK);

  if (topMatches.length === 0) {
    return {
      matched: false,
      topScore: 0,
      citations: [],
      retrievedDocuments: [],
      groundedContext: '',
    };
  }

  const retrievedDocuments = topMatches.map((m) => m.doc);
  const citations: RAGCitation[] = topMatches.map((m) => ({
    id: m.doc.id,
    title: m.doc.title,
    category: m.doc.category,
    actionUrl: m.doc.actionUrl,
    score: Math.round(m.score * 100),
  }));

  const groundedContext = retrievedDocuments
    .map((d) => `[Source: ${d.title}] ${d.content}`)
    .join('\n\n');

  return {
    matched: true,
    topScore: topMatches[0].score,
    bestDocument: topMatches[0].doc,
    citations,
    retrievedDocuments,
    groundedContext,
  };
}
