'use client';

import React from 'react';

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="wp-card-panel wp-stack wp-pad-lg" style={{ maxWidth: '640px', margin: '3rem auto' }}>
      <div className="wp-badge-pill" style={{ background: '#fee2e2', color: '#991b1b', alignSelf: 'flex-start' }}>
        Store Portal Error
      </div>
      <h2 className="wp-headline-sm wp-m0">
        Store Order Processing Disrupted
      </h2>
      <p className="wp-subtext wp-text-sm">
        {error.message || 'Unable to communicate with the central order placement service. Draft lines are preserved.'}
      </p>
      <div className="wp-row wp-mt-sm">
        <button type="button" onClick={() => reset()} className="wp-btn wp-btn-primary">
          Refresh Orders
        </button>
      </div>
    </div>
  );
}
