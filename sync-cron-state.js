#!/usr/bin/env node
/**
 * Mission Control Live Cron Sync
 * 
 * Posts cron state to GitHub repo as cron-state.json.
 * Runs every 30s, keeps Calendar showing real OpenClaw state.
 */

const CRON_STATE_FILE = 'cron-state.json';
const SYNC_DIR = '/home/spindux/mission-control';
const CRON_JOBS_PATH = `${process.env.HOME}/.openclaw/cron/jobs.json`;
const CRON_STATE_PATH = `${process.env.HOME}/.openclaw/cron/jobs-state.json`;
const POLL_INTERVAL = 30000;

let lastCronState = '';
let lastCommitHash = '';

async function readJson(path) {
  const fs = await import('fs/promises');
  try {
    return JSON.parse(await fs.readFile(path, 'utf-8'));
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

async function fetchCronData() {
  const jobsData = await readJson(CRON_JOBS_PATH);
  const stateData = await readJson(CRON_STATE_PATH);
  
  if (!jobsData?.jobs) return [];

  return jobsData.jobs.map(job => {
    const state = stateData?.jobs?.[job.id];
    const nextRunMs = state?.state?.nextRunAtMs;
    const lastRunMs = state?.state?.lastRunAtMs;

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
      nextRun: nextRunMs ? new Date(nextRunMs).toISOString() : null,
      nextRunRelative: nextRunMs ? getRelativeTime(nextRunMs) : null,
      lastRun: lastRunMs ? new Date(lastRunMs).toISOString() : null,
      lastRunRelative: lastRunMs ? getRelativeTime(lastRunMs) : null,
      lastRunStatus: state?.state?.lastRunStatus || null,
      lastStatus: state?.state?.lastStatus || null,
      lastDurationMs: state?.state?.lastDurationMs || null,
      consecutiveErrors: state?.state?.consecutiveErrors || 0,
      sessionTarget: job.sessionTarget || null,
      deliveryMode: job.delivery?.mode || null,
    };
  });
}

async function sync() {
  try {
    const crons = await fetchCronData();
    const stateStr = JSON.stringify(crons);
    
    if (stateStr === lastCronState) {
      return; // No change, skip
    }
    lastCronState = stateStr;

    const fs = await import('fs/promises');
    const { execSync } = await import('child_process');
    
    const content = JSON.stringify({ crons, lastUpdated: new Date().toISOString() }, null, 2);
    
    // Change to sync dir
    process.chdir(SYNC_DIR);
    
    // Write cron-state.json
    await fs.writeFile(`${SYNC_DIR}/${CRON_STATE_FILE}`, content);
    
    // Git add, commit, push
    try {
      execSync('git add cron-state.json', { cwd: SYNC_DIR, stdio: 'pipe' });
      execSync(`git commit -m "Sync cron state $(date +'%H:%M:%S')"`, { cwd: SYNC_DIR, stdio: 'pipe' });
      execSync('git push origin master', { cwd: SYNC_DIR, stdio: 'pipe', timeout: 15000 });
      
      const ts = new Date().toLocaleTimeString('en-NZ', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
      });
      console.log(`[${ts}] ✓ Synced ${crons.length} cron jobs to GitHub`);
      
    } catch (e) {
      console.error('[Sync] Git error:', e.message.substring(0, 100));
    }
    
  } catch (error) {
    console.error('[Sync] Error:', error.message);
  }
}

async function main() {
  console.log('🚀 Mission Control Live Cron Sync');
  console.log('   Polling OpenClaw every 30s, pushing to GitHub...');
  console.log('');
  
  await sync();
  setInterval(sync, POLL_INTERVAL);
}

main().catch(console.error);