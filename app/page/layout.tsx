import Shell from '@/components/layout/Shell';

export default function RootPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}