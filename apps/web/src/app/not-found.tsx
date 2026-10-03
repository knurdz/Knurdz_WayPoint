import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wp-stack wp-pad-lg wp-card-panel" style={{ maxWidth: '520px', margin: '5rem auto', textAlign: 'center' }}>
      <div className="wp-badge-pill" style={{ background: '#fef3c7', color: '#b45309', alignSelf: 'center' }}>
        404 Not Found
      </div>
      <h1 className="wp-headline-lg wp-m0">
        Page Not Located
      </h1>
      <p className="wp-subtext wp-mt-sm">
        The logistics resource or route you requested does not exist or has been relocated.
      </p>
      <div className="wp-row-center wp-mt-md" style={{ gap: '1rem' }}>
        <Link href="/login" className="wp-btn wp-btn-primary">
          Logistics Portal Login
        </Link>
      </div>
    </div>
  );
}
