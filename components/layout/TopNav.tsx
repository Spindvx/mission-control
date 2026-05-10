'use client';

import Link from 'next/link';
import { Activity, Bell, Search, Zap, Menu } from 'lucide-react';
import styles from './TopNav.module.css';

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <nav className={styles.nav}>
      <button className={styles.menuBtn} onClick={onMenuClick} title="Toggle sidebar">
        <Menu size={18} />
      </button>

      <Link href="/" className={styles.brand}>
        <div className={styles.logoMark}>
          <Zap />
        </div>
        <span className={styles.wordmark}>Mission Control</span>
      </Link>

      <div className={styles.search}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search tools, events..."
        />
        <span className={styles.kbd}>⌘K</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} title="Activity">
          <Activity size={18} />
        </button>
        <button className={styles.iconBtn} title="Notifications">
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 6,
            height: 6,
            background: 'var(--accent-red)',
            borderRadius: '50%',
          }} />
        </button>
        <div className={styles.statusDot} title="All systems operational" />
        <div className={styles.avatar} title="Josh Chamberlin">JC</div>
      </div>
    </nav>
  );
}