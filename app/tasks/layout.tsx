import Shell from '@/components/layout/Shell';

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}