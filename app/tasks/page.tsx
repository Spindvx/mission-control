'use client';

import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import Button from '@/components/ui/Button';
import TaskBoard from '@/components/ui/TaskBoard';
import TaskModal from '@/components/ui/TaskModal';
import { autoCompleteSableBacklogTasks, getTasks } from '@/lib/taskStore';
import styles from './page.module.css';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [showModal, setShowModal] = useState(false);
  const [lastAutoComplete, setLastAutoComplete] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks and auto-complete Sable's backlog tasks on mount
  useEffect(() => {
    const completed = autoCompleteSableBacklogTasks();
    if (completed.length > 0) {
      setLastAutoComplete(completed.map(t => t.title));
      console.log(`[Mission Control] Auto-completed ${completed.length} Sable backlog tasks:`, completed.map(t => t.title));
    }
    setTasks(getTasks());
  }, []);

  const joshTasks = tasks.filter(t => t.assignee === 'josh' || t.assignee === 'both');
  const sableTasks = tasks.filter(t => t.assignee === 'sable' || t.assignee === 'both');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.subtitle}>
            {tasks.length} total · {joshTasks.length} assigned to you · {sableTasks.length} assigned to Sable
            {lastAutoComplete.length > 0 && ` · ${lastAutoComplete.length} auto-completed`}
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${view === 'board' ? styles.active : ''}`}
              onClick={() => setView('board')}
            >
              Board
            </button>
            <button
              className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            New Task
          </Button>
        </div>
      </div>

      <TaskBoard />
      
      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={(task) => setTasks(prev => [...prev, task])}
      />
    </div>
  );
}