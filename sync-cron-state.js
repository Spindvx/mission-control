#!/usr/bin/env node
/**
 * Mission Control Live Cron Sync
 * 
 * Posts cron state to GitHub repo as cron-state.json.
 * Site fetches from: https://raw.githubusercontent.com/Spindvx/mission-control/master/cron-state.json
 * 
 * Runs every 30s, keeps your Calendar page showing real OpenClaw state.
 */

const GITHUB_REPO = 'Spindvx/mission-control';
const CRON_STATE_FILE = 'cron-state.json';
const POLL_INTERVAL = 30000;

const CRON_JOBS_PATH = `${process.env.HOME}/.openclaw/cron/jobs.json`;
const CRON_STATE_PATH = `${process.env.HOME}/.openclaw/cron/jobs-state.json`;

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

function formatDuration(ms) {
  if (!ms) return null;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
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

async function pushCronState(crons) {
  const { execSync } = await import('child_process');
  const content = JSON.stringify({ crons, lastUpdated: new Date().toISOString() }, null, 2);
  
  // Get the commit SHA of master
  const sha = execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: process.cwd() }).trim();
  
  // Create blob and update file
  const encoded = Buffer.from(content).toString('base64');
  
  const gitCommands = `
git checkout master 2>/dev/null || git checkout master
echo '${content.replace(/'/g, "'\\''")}' > ${CRON_STATE_FILE}
git add ${CRON_STATE_FILE}
git commit -m "Update cron state $(date -Iseconds)" --allow-empty
git push origin master || git push origin master
  `.trim();

  try {
    execSync(gitCommands, { 
      cwd: '/home/spindux/mission-control', 
      stdio: 'pipe',
      timeout: 15000 
    });
    return true;
  } catch (e) {
    // If push fails, try git fetch and retry
    try {
      execSync('git fetch origin master', { cwd: '/home/spindux/mission-control', stdio: 'pipe', timeout: 5000 });
      execSync(gitCommands, { cwd: '/home/spindux/mission-control', stdio: 'pipe', timeout: 15000 });
      return true;
    } catch (e2) {
      console.error('[Sync] Push failed:', e2.message.substring(0, 100));
      return false;
    }
  }
}

let lastCronState = '';

async function sync() {
  try {
    const crons = await fetchCronData();
    const stateStr = JSON.stringify(crons);
    
    // Only push if state changed
    if (stateStr === lastCronState) {
      return; // No change, skip
    }
    lastCronState = stateStr;
    
    const pushed = await pushCronState(crons);
    
    const ts = new Date().toLocaleTimeString('en-NZ', { 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
    
    if (pushed) {
      console.log(`[${ts}] ✓ Synced ${crons.length} cron jobs to GitHub`);
    }
  } catch (error) {
    console.error('[Sync] Error:', error.message);
  }
}

async function master() {
  console.log('🚀 Mission Control Live Cron Sync');
  console.log('   Polling OpenClaw every 30s, pushing state to GitHub...');
  console.log('');
  
  await sync();
  setInterval(sync, POLL_INTERVAL);
}

master().catch(console.error);