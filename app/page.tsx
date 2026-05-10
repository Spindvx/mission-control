'use client';

import { Activity, Server, Plus, FileText, Search, Wrench } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import ActivityItem from '@/components/ui/ActivityItem';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { mockStats, mockActivity, mockServices } from '@/lib/data';
import styles from './page.module.css';

export default function OverviewPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>Mission Control — all systems nominal</p>
      </div>

      <div className={styles.statsGrid}>
        {mockStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              <Activity size={16} className={styles.cardIcon} />
              Recent Activity
            </span>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <div className={styles.activityList}>
            {mockActivity.slice(0, 5).map((event, i) => (
              <ActivityItem key={event.id} event={event} isNew={i === 0} />
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              <Server size={16} className={styles.cardIcon} />
              System Status
            </span>
            <span className={styles.updateTime}>Updated just now</span>
          </div>
          <div className={styles.servicesGrid}>
            {mockServices.map((service) => (
              <div key={service.name} className={styles.serviceItem}>
                <div className={styles.serviceInfo}>
                  <div className={`${styles.serviceDot} ${styles[service.status]}`} />
                  <span className={styles.serviceName}>{service.name}</span>
                </div>
                {service.latency !== undefined && (
                  <span className={styles.serviceLatency}>{service.latency}ms</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Quick Actions</span>
          </div>
          <div className={styles.actionsRow}>
            <button className={styles.quickAction}>
              <Plus size={16} className={styles.quickActionIcon} />
              New Tool
            </button>
            <button className={styles.quickAction}>
              <FileText size={16} className={styles.quickActionIcon} />
              View Logs
            </button>
            <button className={styles.quickAction}>
              <Search size={16} className={styles.quickActionIcon} />
              System Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}