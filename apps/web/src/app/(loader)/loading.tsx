import React from 'react';

export default function LoaderLoading() {
  return (
    <div className="wp-stack wp-pad-lg" style={{ opacity: 0.75 }}>
      <div className="wp-row-between">
        <div style={{ width: '200px', height: '28px', background: 'var(--border-color)', borderRadius: '6px' }} />
        <div style={{ width: '120px', height: '28px', background: 'var(--border-color)', borderRadius: '6px' }} />
      </div>
      <div className="wp-grid-sidebar wp-mt-md">
        <div className="wp-card-panel" style={{ height: '380px', background: 'var(--border-color)' }} />
        <div className="wp-card-panel" style={{ height: '380px', background: 'var(--border-color)' }} />
      </div>
    </div>
  );
}
