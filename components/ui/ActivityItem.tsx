'use client';

import { Play, Server, AlertTriangle, GitBranch, Clock } from 'lucide-react';
import styles from './ActivityItem.module.css';
import { ActivityEvent } from '@/lib/types';

interface ActivityItemProps {
  event: ActivityEvent;
  isNew?: boolean;
}

const iconMap = {
  tool_run: Play,
  system: Server,
  error: AlertTriangle,
  deploy: GitBranch,
  schedule: Clock,
};

export default function ActivityItem({ event, isNew = false }: ActivityItemProps) {
  const Icon = iconMap[event.type] || Server;
  const statusClass = event.status || 'info';

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className={`${styles.item} ${isNew ? styles.new : ''}`}>
      <span className={styles.time}>{formatTime(event.timestamp)}</span>
      <div className={`${styles.iconWrap} ${styles[event.type]}`}>
        <Icon className={styles.icon} />
      </div>
      <div className={styles.content}>
        <div className={styles.message}>{event.message}</div>
        {event.metadata && (
          <div className={styles.meta}>
            {Object.entries(event.metadata).map(([key, value]) => (
              <span key={key} className={styles.metaTag}>
                {key}: {value}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={`${styles.status} ${styles[statusClass]}`} title={statusClass} />
    </div>
  );
}