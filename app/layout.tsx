import type { Metadata } from 'next';
import Shell from '@/components/layout/Shell';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'Custom operator dashboard for Josh',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}