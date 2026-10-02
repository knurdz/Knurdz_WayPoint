import React from 'react';
import AppShell from '@/components/shell/AppShell';

export default function LoaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="loader" userName="Priya Fernando" depot="Peliyagoda Dock">
      {children}
    </AppShell>
  );
}
