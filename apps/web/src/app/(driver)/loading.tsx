import React from 'react';

export default function DriverLoading() {
  return (
    <div className="wp-stack wp-pad-md" style={{ maxWidth: '420px', margin: '0 auto', opacity: 0.75 }}>
      <div className="wp-card-panel" style={{ height: '80px', background: 'var(--border-color)' }} />
      <div className="wp-card-panel wp-mt-sm" style={{ height: '140px', background: 'var(--border-color)' }} />
      <div className="wp-card-panel wp-mt-sm" style={{ height: '140px', background: 'var(--border-color)' }} />
    </div>
  );
}
