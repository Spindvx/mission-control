'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Play, Pause, AlertCircle, Wifi, WifiOff } from 'lucide-react';
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

async function fetchCrons(): Promise<{ crons: CronJob[]; source: string; lastUpdated: string | null }> {
  const res = await fetch('/api/cron', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function CalendarPage() {
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadCrons = useCallback(async () => {
    try {
      const data = await fetchCrons();
      setCrons(data.crons || []);
      setConnected(data.source === 'live-sync');
      setLastUpdated(data.lastUpdated);
      setLastFetch(new Date());
    } catch {
      setCrons([]);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCrons();
    const interval = setInterval(loadCrons, 30000);
    return () => clearInterval(interval);
  }, [loadCrons]);

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
      return `${job.schedule.expr}${job.schedule.tz ? ` (${job.schedule.tz})` : ''}`;
    }
    if (job.schedule.kind === 'every') return `Every ${job.schedule.expr}`;
    if (job.schedule.kind === 'at') return `At ${job.schedule.expr}`;
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
                <span>Waiting for sync</span>
              </>
            )}
          </div>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Updated {new Date(lastUpdated).toLocaleTimeString('en-NZ')}
            </span>
          )}
        </div>
      </div>

      {crons.length === 0 ? (
        <div className={styles.noCrons}>
          <div className={styles.noCronsIcon}>
            <Calendar size={24} />
          </div>
          <div className={styles.noCronsTitle}>No scheduled jobs</div>
          <div className={styles.noCronsText}>
            {connected 
              ? 'No cron jobs configured in OpenClaw' 
              : 'Sync script not running on local machine'}
            <br />
            <code style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8, display: 'block' }}>
              node sync-cron-state.js
            </code>
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