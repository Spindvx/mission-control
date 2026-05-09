import { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'active' | 'idle' | 'running' | 'error' | 'info' | 'warning' | 'success' | 'default';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  showDot?: boolean;
}

export default function Badge({
  variant = 'default',
  size = 'sm',
  children,
  showDot = false,
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${size === 'sm' ? styles.sm : ''}`}>
      {showDot && <span className={styles.dot} />}
      {children}
    </span>
  );
}