'use client';

import { useState } from 'react';
import ActivityItem from '@/components/ui/ActivityItem';
import Button from '@/components/ui/Button';
import styles from './page.module.css';
import { mockActivity } from '@/lib/data';

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Tool Runs', value: 'tool_run' },
  { label: 'System', value: 'system' },
  { label: 'Errors', value: 'error' },
  { label: 'Deploys', value: 'deploy' },
];

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredActivity = activeFilter === 'all'
    ? mockActivity
    : mockActivity.filter(e => e.type === activeFilter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Activity</h1>
          <p className={styles.subtitle}>Event timeline and telemetry</p>
        </div>
      </div>

      <div className={styles.filters}>
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`${styles.filterBtn} ${activeFilter === filter.value ? styles.active : ''}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className={styles.activityFeed}>
        {filteredActivity.map((event, i) => (
          <ActivityItem key={event.id} event={event} isNew={i === 0} />
        ))}
      </div>

      <div className={styles.loadMore}>
        <Button variant="secondary">Load more</Button>
      </div>
    </div>
  );
}