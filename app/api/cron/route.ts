import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Read cron jobs definition
    const jobsPath = join(process.env.HOME || '/home/spindux', '.openclaw/cron/jobs.json');
    const statePath = join(process.env.HOME || '/home/spindux', '.openclaw/cron/jobs-state.json');
    
    let jobs = { jobs: [] as any[] };
    let state = { jobs: {} as Record<string, any> };
    
    try {
      const jobsRaw = await readFile(jobsPath, 'utf-8');
      jobs = JSON.parse(jobsRaw);
    } catch {
      // No jobs file yet
    }
    
    try {
      const stateRaw = await readFile(statePath, 'utf-8');
      state = JSON.parse(stateRaw);
    } catch {
      // No state file yet
    }
    
    // Combine jobs with their state
    const result = jobs.jobs.map(job => {
      const jobState = state.jobs?.[job.id];
      const nextRun = jobState?.state?.nextRunAtMs ? new Date(jobState.state.nextRunAtMs) : null;
      const lastRun = jobState?.state?.lastRunAtMs ? new Date(jobState.state.lastRunAtMs) : null;
      
      return {
        id: job.id,
        name: job.name || job.payload?.message?.substring(0, 50) || 'Unnamed Job',
        description: job.description || null,
        schedule: job.schedule,
        enabled: job.enabled,
        nextRun: nextRun?.toISOString() || null,
        nextRunRelative: nextRun ? getRelativeTime(nextRun) : null,
        lastRun: lastRun?.toISOString() || null,
        lastRunRelative: lastRun ? getRelativeTime(lastRun) : null,
        lastRunStatus: jobState?.state?.lastRunStatus || null,
        lastStatus: jobState?.state?.lastStatus || null,
        lastDurationMs: jobState?.state?.lastDurationMs || null,
        lastDeliveryStatus: jobState?.state?.lastDeliveryStatus || null,
        consecutiveErrors: jobState?.state?.consecutiveErrors || 0,
        sessionTarget: job.sessionTarget || null,
        deliveryMode: job.delivery?.mode || null,
      };
    });
    
    return NextResponse.json({ 
      crons: result,
      fetchedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Failed to read cron data:', error);
    return NextResponse.json({ error: 'Failed to read cron data' }, { status: 500 });
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMs < 0) {
    const absMins = Math.abs(diffMins);
    const absHours = Math.abs(diffHours);
    if (absMins < 60) return `${absMins}m ago`;
    if (absHours < 24) return `${absHours}h ago`;
    return `${Math.abs(diffDays)}d ago`;
  }
  
  if (diffMins < 60) return `in ${diffMins}m`;
  if (diffHours < 24) return `in ${diffHours}h`;
  return `in ${diffDays}d`;
}