'use client';

import React, { useEffect } from 'react';

export default function DispatcherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError =
    Boolean(error?.message && (
      error.message.includes('Loading chunk') ||
      error.message.includes('ChunkLoadError') ||
      error.message.includes('Failed to fetch')
    ));

  useEffect(() => {
    if (isChunkError && typeof window !== 'undefined') {
      const hasReloaded = sessionStorage.getItem('wp_chunk_reloaded');
      if (!hasReloaded) {
        sessionStorage.setItem('wp_chunk_reloaded', '1');
        window.location.reload();
      }
    }
  }, [isChunkError]);

  const handleReconnect = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('wp_chunk_reloaded');
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="wp-card-panel wp-stack wp-pad-lg" style={{ maxWidth: '640px', margin: '3rem auto' }}>
      <div className="wp-badge-pill" style={{ background: '#fee2e2', color: '#991b1b', alignSelf: 'flex-start' }}>
        Dispatcher Portal Error
      </div>
      <h2 className="wp-headline-sm wp-m0">
        Dispatch Operations Feed Interrupted
      </h2>
      <p className="wp-subtext wp-text-sm">
        {error.message || 'Unable to render dispatch state. Vehicle telemetry or queue streams may be temporarily unavailable.'}
      </p>
      <div className="wp-row wp-mt-sm">
        <button type="button" onClick={handleReconnect} className="wp-btn wp-btn-primary">
          Reconnect Feeds
        </button>
      </div>
    </div>
  );
}
