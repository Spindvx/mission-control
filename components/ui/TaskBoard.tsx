'use client';

import { useState, useEffect, useCallback } from 'react';
import { Inbox, Plus } from 'lucide-react';
import { Task, TASK_COLUMNS } from '@/lib/types';
import { getTasks, saveTasks, addTask, deleteTask } from '@/lib/taskStore';
import TaskCard from './TaskCard';
import styles from './TaskBoard.module.css';

const columnColors: Record<string, string> = {
  backlog: 'var(--text-tertiary)',
  in_progress: 'var(--accent-blue)',
  in_review: 'var(--accent-violet)',
  done: 'var(--accent-green)',
};

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    setTasks(prev => {
      const updated = prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      );
      saveTasks(updated);
      return updated;
    });
    
    setDragOverColumn(null);
  }, []);

  const handleUpdate = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updated = prev.map(t => 
        t.id === id ? { ...t, ...updates } : t
      );
      saveTasks(updated);
      return updated;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveTasks(updated);
      return updated;
    });
  }, []);

  const handleAddTask = useCallback((columnId: Task['status']) => {
    const newTask = addTask({
      title: 'New task',
      description: '',
      status: columnId,
      assignee: 'josh',
      priority: 'medium',
    });
    setTasks(prev => [...prev, newTask]);
  }, []);

  return (
    <div className={styles.board}>
      {TASK_COLUMNS.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.columnTitle}>
                <span className={styles.columnDot} style={{ background: columnColors[col.id] }} />
                {col.label}
              </span>
              <span className={styles.columnCount}>{columnTasks.length}</span>
            </div>
            <div
              className={`${styles.columnBody} ${dragOverColumn === col.id ? styles.dragOver : ''}`}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.id as Task['status'])}
            >
              {columnTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Inbox size={18} />
                  </div>
                  <span className={styles.emptyText}>No tasks</span>
                </div>
              ) : (
                columnTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))
              )}
              <button className={styles.addTaskBtn} onClick={() => handleAddTask(col.id as Task['status'])}>
                <Plus /> Add task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}