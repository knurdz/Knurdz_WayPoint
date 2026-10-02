import React from 'react';
import AppShell from '@/components/shell/AppShell';

export default function DispatcherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="dispatcher" userName="Nimal Perera" depot="Peliyagoda Hub">
      {children}
    </AppShell>
  );
}
