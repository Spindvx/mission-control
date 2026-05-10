import { NextResponse } from 'next/server';

// In-memory store (resets on cold start, but it's free and simple)
// For production, you'd use Vercel KV or Redis
let cronState: {
  crons: any[];
  lastUpdated: string | null;
} = {
  crons: [],
  lastUpdated: null,
};

// Simple secret to authenticate local sync script
const SYNC_SECRET = process.env.CRON_SYNC_SECRET || 'mission-control-sync-secret-2026';

export async function GET() {
  return NextResponse.json({
    crons: cronState.crons,
    lastUpdated: cronState.lastUpdated,
    source: 'live-sync',
  });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = authHeader?.replace('Bearer ', '');
    
    if (secret !== SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.crons || !Array.isArray(body.crons)) {
      return NextResponse.json({ error: 'Invalid payload: expected { crons: [...] }' }, { status: 400 });
    }

    cronState = {
      crons: body.crons,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ 
      success: true, 
      received: body.crons.length,
      lastUpdated: cronState.lastUpdated,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}