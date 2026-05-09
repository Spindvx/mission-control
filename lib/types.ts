export interface Tool {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'idle' | 'error' | 'running';
  lastRun: string | null;
  runCount: number;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: 'tool_run' | 'system' | 'error' | 'deploy' | 'schedule';
  message: string;
  timestamp: string;
  metadata?: Record<string, string>;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export interface StatData {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  status?: 'normal' | 'warning' | 'critical';
}

export interface ServiceStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  latency?: number;
  lastCheck: string;
}

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};