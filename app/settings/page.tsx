'use client';

import { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, Key } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

const tabs = [
  { label: 'Profile', icon: User },
  { label: 'Notifications', icon: Bell },
  { label: 'Security', icon: Shield },
  { label: 'Appearance', icon: Palette },
  { label: 'Integrations', icon: Globe },
  { label: 'API Keys', icon: Key },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Configure Mission Control</p>
      </div>

      <div className={styles.grid}>
        <nav className={styles.tabs}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.label}
                className={`${styles.tab} ${activeTab === tab.label ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.label)}
              >
                <Icon className={styles.tabIcon} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Profile</h2>
            <div className={styles.field}>
              <label className={styles.label}>Display Name</label>
              <input
                type="text"
                className={styles.input}
                defaultValue="Josh Chamberlin"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                defaultValue="chamberlin.josh@gmail.com"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Timezone</label>
              <input
                type="text"
                className={styles.input}
                defaultValue="Pacific/Auckland (GMT+12)"
                readOnly
              />
              <p className={styles.hint}>Timezone is set automatically from your location</p>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Preferences</h2>
            <div className={styles.field}>
              <label className={styles.label}>Default Dashboard</label>
              <input
                type="text"
                className={styles.input}
                defaultValue="Overview"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Items Per Page</label>
              <input
                type="number"
                className={styles.input}
                defaultValue="25"
              />
            </div>
          </div>

          <div className={styles.saveRow}>
            <Button variant="primary">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}