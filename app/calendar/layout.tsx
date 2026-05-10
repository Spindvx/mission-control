import Shell from '@/components/layout/Shell';

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}