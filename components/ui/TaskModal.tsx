'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { Task } from '@/lib/types';
import { addTask } from '@/lib/taskStore';
import styles from './TaskModal.module.css';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Task) => void;
  defaultStatus?: Task['status'];
}

export default function TaskModal({ isOpen, onClose, onAdd, defaultStatus = 'backlog' }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>(defaultStatus);
  const [assignee, setAssignee] = useState<'josh' | 'sable' | 'both'>('josh');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setAssignee('josh');
      setPriority('medium');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = addTask({ title: title.trim(), description, status, assignee, priority });
    onAdd(newTask);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Create New Task</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label}>Title</label>
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                placeholder="What needs to be done?"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Add more details..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Assignee</label>
                <select
                  className={styles.select}
                  value={assignee}
                  onChange={e => setAssignee(e.target.value as typeof assignee)}
                >
                  <option value="josh">Josh</option>
                  <option value="sable">Sable</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Priority</label>
                <select
                  className={styles.select}
                  value={priority}
                  onChange={e => setPriority(e.target.value as typeof priority)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select
                className={styles.select}
                value={status}
                onChange={e => setStatus(e.target.value as Task['status'])}
              >
                <option value="backlog">Backlog</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className={styles.footer}>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit">Create Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
}