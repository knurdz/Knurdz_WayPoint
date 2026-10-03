'use client';

import React from 'react';

export default function DriverError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="wp-card-panel wp-stack wp-pad-lg" style={{ maxWidth: '420px', margin: '2rem auto', textAlign: 'center' }}>
      <div className="wp-badge-pill" style={{ background: '#fee2e2', color: '#991b1b', alignSelf: 'center' }}>
        Driver Mobile Offline Mode
      </div>
      <h2 className="wp-headline-sm wp-m0">
        Run Manifest Temporarily Paused
      </h2>
      <p className="wp-subtext wp-text-sm">
        {error.message || 'Unable to update route view. Cached stop records remain protected in local device storage.'}
      </p>
      <div className="wp-row-center wp-mt-sm">
        <button type="button" onClick={() => reset()} className="wp-btn wp-btn-primary">
          Reload Manifest
        </button>
      </div>
    </div>
  );
}
