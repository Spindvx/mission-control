import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  status?: 'normal' | 'warning' | 'critical';
  loading?: boolean;
}

export default function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  status = 'normal',
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={styles.statCard}>
        <div className={styles.label}>{label}</div>
        <div className={`${styles.skeleton} ${styles.loading}`} />
      </div>
    );
  }

  const isPositive = delta !== undefined && delta >= 0;
  const showDelta = delta !== undefined && delta !== 0;

  return (
    <div className={`${styles.statCard} ${status !== 'normal' ? styles[status] : ''}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.valueRow}>
        <div className={styles.value}>{value}</div>
        {showDelta && (
          <div className={`${styles.delta} ${isPositive ? styles.deltaPos : styles.deltaNeg}`}>
            {isPositive ? <TrendingUp className={styles.deltaIcon} /> : <TrendingDown className={styles.deltaIcon} />}
            {Math.abs(delta)}{typeof delta === 'number' && delta < 1 && delta > -1 ? '%' : ''}
            {deltaLabel && <span style={{ color: 'var(--text-tertiary)' }}>{deltaLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}