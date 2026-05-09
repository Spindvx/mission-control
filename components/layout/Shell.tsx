'use client';

import { ReactNode } from 'react';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import styles from './Shell.module.css';

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <TopNav />
      <div className={styles.main}>
        <Sidebar />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}