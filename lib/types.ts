// Types shared across the application

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'in_review' | 'done';
  assignee: 'josh' | 'sable' | 'both';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

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

export const TASK_COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'var(--text-tertiary)' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--accent-blue)' },
  { id: 'in_review', label: 'In Review', color: 'var(--accent-violet)' },
  { id: 'done', label: 'Done', color: 'var(--accent-green)' },
] as const;