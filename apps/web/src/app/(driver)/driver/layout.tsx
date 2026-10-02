import React from 'react';
import AppShell from '@/components/shell/AppShell';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="driver" userName="Kamal Silva" depot="Route R025229">
      {children}
    </AppShell>
  );
}
