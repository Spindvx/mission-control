'use client';

import { Play, Edit2, Trash2, Clock, Zap, AlertCircle } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';
import styles from './ToolCard.module.css';
import { Tool } from '@/lib/types';

interface ToolCardProps {
  tool: Tool;
  onRun?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ToolCard({ tool, onRun, onEdit, onDelete }: ToolCardProps) {
  const statusVariant = tool.status === 'active' ? 'active' :
                        tool.status === 'running' ? 'running' :
                        tool.status === 'error' ? 'error' : 'idle';

  const cardClass = [
    styles.toolCard,
    tool.status === 'running' ? styles.running : '',
    tool.status === 'error' ? styles.error : '',
  ].filter(Boolean).join(' ');

  const formatTime = (iso: string | null) => {
    if (!iso) return 'Never';
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={cardClass}>
      <div className={styles.header}>
        <div>
          <div className={styles.name}>{tool.name}</div>
          <div className={styles.description}>{tool.description}</div>
        </div>
        <Badge variant={statusVariant} showDot>{tool.status}</Badge>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <Zap className={styles.metaIcon} />
          {tool.runCount.toLocaleString()} runs
        </div>
        <div className={styles.metaItem}>
          <Clock className={styles.metaIcon} />
          {formatTime(tool.lastRun)}
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="sm"
          icon={<Play size={14} />}
          onClick={() => onRun?.(tool.id)}
        >
          Run
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Edit2 size={14} />}
          onClick={() => onEdit?.(tool.id)}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} />}
          onClick={() => onDelete?.(tool.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}