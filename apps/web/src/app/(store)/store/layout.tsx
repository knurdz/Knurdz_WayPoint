import React from 'react';
import AppShell from '@/components/shell/AppShell';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="store" userName="Anjali Jayawardena" depot="OUT001 Fresh Galle Rd">
      {children}
    </AppShell>
  );
}
