import React from 'react';

export default function DispatcherLoading() {
  return (
    <div className="wp-stack wp-pad-lg" style={{ opacity: 0.75 }}>
      <div className="wp-row-between">
        <div style={{ width: '220px', height: '28px', background: 'var(--border-color)', borderRadius: '6px' }} />
        <div style={{ width: '140px', height: '28px', background: 'var(--border-color)', borderRadius: '6px' }} />
      </div>
      <div className="wp-grid-4 wp-mt-md">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="wp-card-panel" style={{ height: '110px', background: 'var(--border-color)' }} />
        ))}
      </div>
      <div className="wp-card-panel wp-mt-lg" style={{ height: '360px', background: 'var(--border-color)' }} />
    </div>
  );
}
