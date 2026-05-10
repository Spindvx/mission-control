'use client';

import { useState } from 'react';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import styles from './Shell.module.css';

export default function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.shell}>
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className={styles.main}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`${styles.content} ${!sidebarOpen ? styles.expanded : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}