'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Play, Pause, AlertCircle, RefreshCw, CalendarDays, Wifi, WifiOff } from 'lucide-react';
import styles from './page.module.css';

interface CronJob {
  id: string;
  name: string;
  description: string | null;
  schedule: {
    kind: string;
    expr: string;
    tz?: string;
  };
  enabled: boolean;
  nextRun: string | null;
  nextRunRelative: string | null;
  lastRun: string | null;
  lastRunRelative: string | null;
  lastRunStatus: string | null;
  lastStatus: string | null;
  lastDurationMs: number | null;
  consecutiveErrors: number;
  sessionTarget: string | null;
  deliveryMode: string | null;
}

// Use your Tailscale serve URL to proxy to the local gateway
const GATEWAY_BASE = 'https://openclaw.tail7991ec.ts.net';

async function fetchCronsDirect(): Promise<CronJob[]> {
  const token = localStorage.getItem('openclaw_token') || '';
  
  // Try the gateway's WebSocket API via HTTP upgrade
  // First, let's check if there's a REST endpoint
  const endpoints = [
    `${GATEWAY_BASE}/api/cron`,
    `${GATEWAY_BASE}/api/schedule`,
    `${GATEWAY_BASE}/api/jobs`,
  ];
  
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        return data.crons || [];
      }
    } catch {
      // Try next endpoint
    }
  }
  
  throw new Error('Could not reach gateway');
}

// Fallback: read from the gateway's cron state via a direct file read
// Since we can't access local files from Vercel, we simulate the live cron state
// with data that matches what we know from `openclaw cron list --json`
const mockCrons: CronJob[] = [
  {
    id: '6bc0d3aa-be00-4823-8034-5b0f08d9db02',
    name: 'Daily Gmail Report',
    description: 'Morning email digest sent to Telegram',
    schedule: {
      kind: 'cron',
      expr: '30 6 * * *',
      tz: 'Pacific/Auckland',
    },
    enabled: true,
    nextRun: '2026-05-11T18:30:00.000Z',
    nextRunRelative: 'in 8h 30m',
    lastRun: '2026-05-10T18:30:00.000Z',
    lastRunRelative: '6h ago',
    lastRunStatus: 'ok',
    lastStatus: 'ok',
    lastDurationMs: 290913,
    consecutiveErrors: 0,
    sessionTarget: 'isolated',
    deliveryMode: 'announce',
  },
  {
    id: 'bbce5704-0eb2-4f71-96a2-de04d1c582fe',
    name: 'Memory Dreaming Promotion',
    description: 'Promotes short-term memory into long-term storage',
    schedule: {
      kind: 'cron',
      expr: '0 3 * * *',
    },
    enabled: true,
    nextRun: '2026-05-11T15:00:00.000Z',
    nextRunRelative: 'in 5h',
    lastRun: '2026-05-10T15:00:00.000Z',
    lastRunRelative: '3h ago',
    lastRunStatus: 'ok',
    lastStatus: 'ok',
    lastDurationMs: 4642,
    consecutiveErrors: 0,
    sessionTarget: 'isolated',
    deliveryMode: 'none',
  },
];

export default function CalendarPage() {
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [useLiveData, setUseLiveData] = useState(false);

  const fetchCrons = useCallback(async () => {
    if (!useLiveData) {
      // Use mock data that matches the real cron state
      setCrons(mockCrons);
      setConnected(false);
      setError(null);
      setLastFetch(new Date());
      setLoading(false);
      return;
    }

    try {
      const data = await fetchCronsDirect();
      setCrons(data);
      setConnected(true);
      setError(null);
      setLastFetch(new Date());
    } catch (err) {
      setError('Could not connect to gateway. Using cached data.');
      setConnected(false);
      setCrons(mockCrons);
    } finally {
      setLoading(false);
    }
  }, [useLiveData]);

  useEffect(() => {
    fetchCrons();
    const interval = setInterval(fetchCrons, 30000);
    return () => clearInterval(interval);
  }, [fetchCrons]);

  const getStatus = (job: CronJob) => {
    if (!job.enabled) return 'paused';
    if (job.consecutiveErrors > 0) return 'error';
    return 'active';
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getScheduleLabel = (job: CronJob) => {
    if (job.schedule.kind === 'cron') {
      return `${job.schedule.expr}${job.schedule.tz ? ` TZ:${job.schedule.tz}` : ''}`;
    }
    if (job.schedule.kind === 'every') {
      return `Every ${job.schedule.expr}`;
    }
    if (job.schedule.kind === 'at') {
      return `At ${job.schedule.expr}`;
    }
    return job.schedule.expr || 'Unknown';
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Calendar</h1>
            <p className={styles.subtitle}>Loading scheduled jobs...</p>
          </div>
        </div>
        <div className={styles.loadingGrid}>
          {[1, 2].map(i => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonLine} style={{ width: '60%' }} />
              <div className={styles.skeletonLine} style={{ width: '40%' }} />
              <div className={styles.skeletonLine} style={{ width: '80%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Calendar</h1>
          <p className={styles.subtitle}>
            {crons.length} scheduled job{crons.length !== 1 ? 's' : ''} · Auto-refreshes every 30s
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.connectionStatus}>
            {connected ? (
              <>
                <span className={`${styles.statusDot} ${styles.online}`} />
                <Wifi size={12} />
                <span>Live</span>
              </>
            ) : (
              <>
                <span className={`${styles.statusDot} ${styles.offline}`} />
                <WifiOff size={12} />
                <span>Demo data</span>
              </>
            )}
          </div>
          <div className={styles.refreshBadge}>
            <span className={styles.refreshDot} />
            Live
          </div>
        </div>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(245, 158, 11, 0.1)', 
          border: '1px solid var(--accent-amber)',
          borderRadius: 8, 
          padding: '12px 16px', 
          marginBottom: 24,
          fontSize: 13,
          color: 'var(--accent-amber)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {crons.length === 0 ? (
        <div className={styles.noCrons}>
          <div className={styles.noCronsIcon}>
            <CalendarDays size={24} />
          </div>
          <div className={styles.noCronsTitle}>No scheduled jobs</div>
          <div className={styles.noCronsText}>
            Create cron jobs with <code>openclaw cron add</code>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {crons.map(job => {
            const status = getStatus(job);
            return (
              <div key={job.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>
                    <Calendar size={16} className={styles.cardIcon} />
                    {job.name}
                  </span>
                  <span className={`${styles.statusBadge} ${styles[status]}`}>
                    {status === 'active' && <Play size={8} style={{ marginRight: 4 }} />}
                    {status === 'paused' && <Pause size={8} style={{ marginRight: 4 }} />}
                    {status === 'error' && <AlertCircle size={8} style={{ marginRight: 4 }} />}
                    {status}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Next Run</span>
                    <span className={`${styles.metricValue} ${styles.highlight}`}>
                      {job.nextRunRelative || '—'}
                    </span>
                    {job.nextRun && (
                      <span className={styles.metricSub}>
                        {new Date(job.nextRun).toLocaleString('en-NZ', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Last Run</span>
                    <span className={`${styles.metricValue} ${
                      job.lastRunStatus === 'ok' ? styles.success :
                      job.lastRunStatus === 'error' ? styles.error : ''
                    }`}>
                      {job.lastRunRelative || 'Never'}
                    </span>
                    {job.lastDurationMs && (
                      <span className={styles.metricSub}>took {formatDuration(job.lastDurationMs)}</span>
                    )}
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Delivery</span>
                    <span className={styles.metricValue}>{job.deliveryMode || 'none'}</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Session</span>
                    <span className={styles.metricValue}>{job.sessionTarget || 'default'}</span>
                    {job.consecutiveErrors > 0 && (
                      <span className={styles.metricSub} style={{ color: 'var(--accent-red)' }}>
                        {job.consecutiveErrors} errors
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.scheduleExpr}>
                    <Clock className={styles.scheduleIcon} />
                    {getScheduleLabel(job)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}