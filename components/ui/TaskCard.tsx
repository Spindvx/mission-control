'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Task } from '@/lib/types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const assigneeLabels = {
  josh: 'JC',
  sable: 'SB',
  both: '✓',
};

const assigneeTitles = {
  josh: 'Josh',
  sable: 'Sable',
  both: 'Josh & Sable',
};

export default function TaskCard({ task, onDragStart, onDragEnd, onUpdate, onDelete }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, task);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <div
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-task-id={task.id}
    >
      <div className={styles.header}>
        <span className={styles.title}>{task.title}</span>
        <span className={`${styles.priority} ${styles[task.priority]}`}>{task.priority}</span>
      </div>
      
      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      <div className={styles.footer}>
        <div className={styles.assignees}>
          {(task.assignee === 'both' ? ['josh', 'sable'] as const : [task.assignee]).map(a => (
            <div
              key={a}
              className={`${styles.assignee} ${styles[a]}`}
              title={assigneeTitles[a]}
            >
              {assigneeLabels[a]}
            </div>
          ))}
          <span className={styles.assigneeLabel} style={{ marginLeft: 4, alignSelf: 'center' }}>
            {assigneeTitles[task.assignee]}
          </span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} title="Edit" onClick={() => {}}>
            <Pencil size={12} />
          </button>
          <button className={`${styles.actionBtn} ${styles.delete}`} title="Delete" onClick={() => onDelete(task.id)}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}