'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="wp-stack wp-pad-lg wp-card-panel" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
      <div className="wp-headline-md" style={{ color: 'var(--color-coral, #ff5e1e)' }}>
        Application Error Encountered
      </div>
      <p className="wp-subtext">
        {error.message || 'An unexpected runtime issue occurred while loading this view.'}
      </p>
      {error.digest && (
        <code className="wp-font-mono wp-text-xs wp-text-muted">
          Digest: {error.digest}
        </code>
      )}
      <div className="wp-row-center wp-mt-md" style={{ gap: '1rem' }}>
        <button
          type="button"
          onClick={() => reset()}
          className="wp-btn wp-btn-primary"
        >
          Retry Request
        </button>
        <Link href="/login" className="wp-btn wp-btn-secondary">
          Return to Login
        </Link>
      </div>
    </div>
  );
}
