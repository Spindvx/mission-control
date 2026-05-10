'use client';

import { Task, TASK_COLUMNS } from './types';

const TASKS_KEY = 'mission-control-tasks';

// Default tasks for demo
const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Set up Mission Control deployment',
    description: 'Configure Vercel, GitHub integration, and auto-deploy pipeline',
    status: 'done',
    assignee: 'both',
    priority: 'high',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-10T08:00:00Z',
  },
  {
    id: '2',
    title: 'Build task board UI',
    description: 'Create Kanban board with drag-and-drop, persistence, and real-time sync',
    status: 'in_progress',
    assignee: 'sable',
    priority: 'high',
    createdAt: '2026-05-05T14:00:00Z',
    updatedAt: '2026-05-10T22:00:00Z',
  },
  {
    id: '3',
    title: 'Design custom tool schemas',
    description: 'Define data model and API structure for custom tool definitions',
    status: 'in_review',
    assignee: 'both',
    priority: 'medium',
    createdAt: '2026-05-06T09:00:00Z',
    updatedAt: '2026-05-10T20:00:00Z',
  },
  {
    id: '4',
    title: 'Connect Zima OS monitoring',
    description: 'Integrate system metrics from Zima OS machine into mission control',
    status: 'backlog',
    assignee: 'sable',
    priority: 'medium',
    createdAt: '2026-05-08T11:00:00Z',
    updatedAt: '2026-05-08T11:00:00Z',
  },
  {
    id: '5',
    title: 'Set up trading bot alerts',
    description: 'Configure monitoring and alerting for trading bot performance',
    status: 'backlog',
    assignee: 'josh',
    priority: 'low',
    createdAt: '2026-05-09T16:00:00Z',
    updatedAt: '2026-05-09T16:00:00Z',
  },
  {
    id: '6',
    title: 'Build tool creation wizard',
    description: 'UI flow for creating custom tools with code editor and configuration',
    status: 'backlog',
    assignee: 'both',
    priority: 'high',
    createdAt: '2026-05-07T10:00:00Z',
    updatedAt: '2026-05-07T10:00:00Z',
  },
  {
    id: '7',
    title: 'Implement heartbeat scheduler',
    description: 'Background job system for periodic tasks and monitoring',
    status: 'done',
    assignee: 'sable',
    priority: 'high',
    createdAt: '2026-05-02T08:00:00Z',
    updatedAt: '2026-05-09T15:00:00Z',
  },
];

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return defaultTasks;
  
  const stored = localStorage.getItem(TASKS_KEY);
  if (!stored) {
    saveTasks(defaultTasks);
    return defaultTasks;
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return defaultTasks;
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const tasks = getTasks();
  const now = new Date().toISOString();
  const newTask: Task = {
    ...task,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;
  
  tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
  saveTasks(tasks);
  return tasks[idx];
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return false;
  
  tasks.splice(idx, 1);
  saveTasks(tasks);
  return true;
}

export function moveTask(id: string, newStatus: Task['status']): Task | null {
  return updateTask(id, { status: newStatus });
}

export function getTasksByStatus(status: Task['status']): Task[] {
  return getTasks().filter(t => t.status === status);
}

export function autoCompleteSableBacklogTasks(): Task[] {
  const tasks = getTasks();
  const now = new Date().toISOString();
  const completed: Task[] = [];
  
  const updated = tasks.map(t => {
    if (t.assignee === 'sable' && t.status === 'backlog') {
      completed.push({ ...t, status: 'done', updatedAt: now });
      return { ...t, status: 'done' as const, updatedAt: now };
    }
    return t;
  });
  
  if (completed.length > 0) {
    saveTasks(updated);
  }
  
  return completed;
}