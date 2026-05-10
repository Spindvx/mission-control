import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Spindvx/mission-control/master/cron-state.json';

export async function GET() {
  try {
    const res = await fetch(GITHUB_RAW_URL, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        // No cron state pushed yet
        return NextResponse.json({
          crons: [],
          lastUpdated: null,
          source: 'github',
          message: 'No cron state synced yet. Run sync-cron-state.js locally.',
        });
      }
      throw new Error(`GitHub returned ${res.status}`);
    }

    const data = await res.json();
    
    return NextResponse.json({
      crons: data.crons || [],
      lastUpdated: data.lastUpdated || null,
      source: 'github',
    });

  } catch (error) {
    // Fallback: return empty state with helpful message
    return NextResponse.json({
      crons: [],
      lastUpdated: null,
      source: 'error',
      error: 'Could not fetch from GitHub',
    });
  }
}