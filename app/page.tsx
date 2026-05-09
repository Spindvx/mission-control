'use client';

import Shell from '@/components/layout/Shell';

export default function Home() {
  return (
    <Shell>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Active Tools', value: '4', delta: 1, deltaLabel: 'from yesterday' },
          { label: 'Events Today', value: '847', delta: 12, deltaLabel: '% vs yesterday' },
          { label: 'Uptime', value: '99.8%', delta: 0.1, deltaLabel: '% vs last week' },
          { label: 'Avg Response', value: '42ms', delta: -8, deltaLabel: '% vs yesterday' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '20px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
              {stat.delta > 0 ? '+' : ''}{stat.delta}{stat.deltaLabel}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Recent Activity</span>
          </div>
          {[
            { time: '10:44', type: 'tool_run', msg: 'Trading Bot Monitor executed trade signal: BUY QQQ', status: 'success' },
            { time: '10:40', type: 'system', msg: 'System health check passed — all services nominal', status: 'info' },
            { time: '10:32', type: 'tool_run', msg: 'SSH Deployer deployed v2.4.1 to prod-server-01', status: 'success' },
            { time: '09:15', type: 'error', msg: 'Media Scanner failed to connect to Zima OS', status: 'error' },
            { time: '09:00', type: 'tool_run', msg: 'Log Aggregator completed index rebuild', status: 'success' },
          ].map((event, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '12px',
              padding: '12px 0',
              borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-tertiary)', minWidth: 50 }}>
                {event.time}
              </span>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: event.type === 'tool_run' ? 'rgba(79, 124, 247, 0.15)' :
                          event.type === 'system' ? 'rgba(6, 182, 212, 0.15)' :
                          'rgba(239, 68, 68, 0.15)',
                color: event.type === 'tool_run' ? 'var(--accent-blue)' :
                       event.type === 'system' ? 'var(--accent-cyan)' :
                       'var(--accent-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}>
                {event.type === 'tool_run' ? '▶' : event.type === 'system' ? '⚙' : '✕'}
              </div>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>
                {event.msg}
              </div>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: event.status === 'success' ? 'var(--accent-green)' :
                           event.status === 'error' ? 'var(--accent-red)' :
                           'var(--accent-cyan)',
                marginTop: 4,
              }} />
            </div>
          ))}
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>System Status</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Updated just now</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { name: 'Zima OS', status: 'online', latency: 24 },
              { name: 'ARR Stack', status: 'online', latency: 18 },
              { name: 'Trading Bot', status: 'online', latency: 12 },
              { name: 'OpenClaw Gateway', status: 'online', latency: 8 },
              { name: 'Vercel Edge', status: 'degraded', latency: 145 },
            ].map((service) => (
              <div key={service.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: 'var(--bg-elevated)',
                borderRadius: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: service.status === 'online' ? 'var(--accent-green)' :
                               service.status === 'degraded' ? 'var(--accent-amber)' :
                               'var(--accent-red)',
                    boxShadow: service.status === 'online' ? '0 0 6px var(--accent-green)' : 'none',
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{service.name}</span>
                </div>
                <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-tertiary)' }}>
                  {service.latency}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}