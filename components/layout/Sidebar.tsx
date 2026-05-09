'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid, Wrench, Zap, Settings, ChevronRight } from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { label: 'Overview', href: '/', icon: Grid },
  { label: 'Tools', href: '/tools', icon: Wrench, badge: 6 },
  { label: 'Activity', href: '/activity', icon: Zap, badge: 3 },
];

const bottomItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <div className={styles.section}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon className={styles.icon} />
                {item.label}
                {item.badge !== undefined && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </Link>
            );
          })}
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon className={styles.icon} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerInfo}>v0.1.0 · Node v22</div>
      </div>
    </aside>
  );
}