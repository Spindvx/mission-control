'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Play, Pause, RefreshCw, CalendarDays } from 'lucide-react';
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
  lastDeliveryStatus: string | null;
}

export default function CalendarPage() {
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchCrons = useCallback(async () => {
    try {
      const res = await fetch('/api/cron', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCrons(data.crons || []);
      setError(null);
      setLastFetch(new Date());
    } catch (err) {
      setError('Failed to load cron jobs. Is the local API server running?');
    } finally {
      setLoading(false);
    }
  }, []);

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
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Calendar</h1>
            <p className={styles.subtitle}>OpenClaw cron jobs and scheduled tasks</p>
          </div>
        </div>
        <div className={styles.error}>
          <AlertCircle size={24} style={{ marginBottom: 8 }} />
          <p>{error}</p>
          <button onClick={fetchCrons} style={{ marginTop: 16, cursor: 'pointer', color: 'var(--accent-blue)' }}>
            Retry
          </button>
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
        <div className={styles.refreshBadge}>
          <span className={styles.refreshDot} />
          Live
        </div>
      </div>

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
                    {job.lastDeliveryStatus && job.lastDeliveryStatus !== 'not-requested' && (
                      <span className={styles.metricSub}>{job.lastDeliveryStatus}</span>
                    )}
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Session</span>
                    <span className={styles.metricValue}>{job.sessionTarget || 'default'}</span>
                    {job.consecutiveErrors > 0 && (
                      <span className={styles.metricSub} style={{ color: 'var(--accent-red)' }}>
                        {job.consecutiveErrors} consecutive errors
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