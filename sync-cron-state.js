#!/usr/bin/env node
/**
 * Mission Control Live Cron Sync
 * 
 * Runs on your local Ubuntu machine, posts cron state to Vercel every 30s.
 * This keeps your Mission Control Calendar page showing real-time OpenClaw cron data.
 * 
 * Usage: node sync-cron-state.js
 * Runs continuously, posts every 30 seconds.
 */

const VERCEL_SYNC_URL = 'https://mission-control-spindvx.vercel.app/api/cron-sync';
const SYNC_SECRET = 'mc-sync-2026-josh-sable';
const POLL_INTERVAL = 30000; // 30 seconds

const CRON_JOBS_PATH = `${process.env.HOME}/.openclaw/cron/jobs.json`;
const CRON_STATE_PATH = `${process.env.HOME}/.openclaw/cron/jobs-state.json`;

async function readJson(path) {
  const fs = await import('fs/promises');
  try {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function getRelativeTime(dateMs) {
  const now = Date.now();
  const diffMs = dateMs - now;
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

function formatDuration(ms) {
  if (!ms) return null;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

async function fetchCronData() {
  const jobsData = await readJson(CRON_JOBS_PATH);
  const stateData = await readJson(CRON_STATE_PATH);
  
  if (!jobsData?.jobs) {
    console.error('[Sync] No cron jobs found at', CRON_JOBS_PATH);
    return [];
  }

  const crons = jobsData.jobs.map(job => {
    const jobState = stateData?.jobs?.[job.id];
    const nextRunMs = jobState?.state?.nextRunAtMs;
    const lastRunMs = jobState?.state?.lastRunAtMs;
    const nextRun = nextRunMs ? new Date(nextRunMs) : null;
    const lastRun = lastRunMs ? new Date(lastRunMs) : null;

    return {
      id: job.id,
      name: job.name || 'Unnamed Job',
      description: job.description || null,
      schedule: {
        kind: job.schedule?.kind || 'unknown',
        expr: job.schedule?.expr || '',
        tz: job.schedule?.tz || null,
      },
      enabled: job.enabled !== false,
      nextRun: nextRun?.toISOString() || null,
      nextRunRelative: nextRun ? getRelativeTime(nextRunMs) : null,
      lastRun: lastRun?.toISOString() || null,
      lastRunRelative: lastRun ? getRelativeTime(lastRunMs) : null,
      lastRunStatus: jobState?.state?.lastRunStatus || null,
      lastStatus: jobState?.state?.lastStatus || null,
      lastDurationMs: jobState?.state?.lastDurationMs || null,
      consecutiveErrors: jobState?.state?.consecutiveErrors || 0,
      sessionTarget: job.sessionTarget || null,
      deliveryMode: job.delivery?.mode || null,
    };
  });

  return crons;
}

async function sync() {
  try {
    const crons = await fetchCronData();
    
    const response = await fetch(VERCEL_SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SYNC_SECRET}`,
      },
      body: JSON.stringify({ crons }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Sync] Failed: ${response.status} - ${errorText}`);
      return;
    }

    const result = await response.json();
    const timestamp = new Date().toLocaleTimeString('en-NZ', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    console.log(`[${timestamp}] Synced ${result.received} cron jobs to Mission Control`);
    
  } catch (error) {
    console.error('[Sync] Error:', error.message);
  }
}

async function main() {
  console.log('🚀 Mission Control Live Cron Sync');
  console.log('   Polling OpenClaw cron state every 30s...');
  console.log('   Target: Mission Control Calendar');
  console.log('');
  
  // Initial sync
  await sync();
  
  // Then poll every 30 seconds
  setInterval(sync, POLL_INTERVAL);
}

main().catch(console.error);