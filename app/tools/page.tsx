'use client';

import { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import ToolCard from '@/components/ui/ToolCard';
import Button from '@/components/ui/Button';
import styles from './page.module.css';
import { mockTools } from '@/lib/data';
import { Tool } from '@/lib/types';

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>(mockTools);

  const handleDelete = (id: string) => {
    setTools(tools.filter(t => t.id !== id));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Tools</h1>
          <p className={styles.subtitle}>{tools.length} tools configured</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />}>
          New Tool
        </Button>
      </div>

      {tools.length > 0 ? (
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Wrench size={28} />
          </div>
          <div className={styles.emptyTitle}>No tools yet</div>
          <div className={styles.emptyText}>
            Create your first custom tool to start automating your workflows.
          </div>
          <Button variant="primary" icon={<Plus size={16} />}>
            Create First Tool
          </Button>
        </div>
      )}
    </div>
  );
}