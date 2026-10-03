import React from 'react';

export default function StoreLoading() {
  return (
    <div className="wp-stack wp-pad-lg" style={{ opacity: 0.75 }}>
      <div className="wp-row-between">
        <div style={{ width: '220px', height: '28px', background: 'var(--border-color)', borderRadius: '6px' }} />
        <div style={{ width: '130px', height: '28px', background: 'var(--border-color)', borderRadius: '6px' }} />
      </div>
      <div className="wp-grid-3 wp-mt-md">
        {[1, 2, 3].map((i) => (
          <div key={i} className="wp-card-panel" style={{ height: '120px', background: 'var(--border-color)' }} />
        ))}
      </div>
      <div className="wp-card-panel wp-mt-lg" style={{ height: '320px', background: 'var(--border-color)' }} />
    </div>
  );
}
