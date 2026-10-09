'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import {
  Menu,
  Search,
  Bell,
  PlusCircle,
  LayoutGrid,
  Truck,
  Store,
  CheckCircle2,
  MessageSquare,
  AudioWaveform,

} from 'lucide-react';
import { useAgent } from '../agent/AgentContext';

interface TopBarProps {
  role?: string;
  userName?: string;
  depot?: string;
  title?: string;
  headerAction?: React.ReactNode;
  onOpenSearch?: () => void;
  onToggleSidebar?: () => void;
}

const TITLE_MAP: Record<string, string> = {
  '/dispatcher': 'Mission Control',
  '/dispatcher/allocation': 'Fleet Allocation',
  '/dispatcher/queue': 'Order Queue',
  '/dispatcher/exceptions': 'Exceptions',
  '/dispatcher/cutoff': 'Cutoff Control Room',
  '/dispatcher/deferral': 'Deferral Desk',
  '/dispatcher/validator': 'Constraint Validator',
  '/dispatcher/forecast': 'Capacity Forecast',
  '/dispatcher/map': 'Fleet Live Map',
  '/dispatcher/outlet': 'Outlet Profile',
  '/loader': 'Warehouse Dock',
  '/loader/runs': 'Vehicle Runs',
  '/loader/depot': 'Depot Select',
  '/loader/shortfall': 'Shortfall Report',
  '/loader/signoff': 'Departure Signoff',
  '/driver': 'Driver Cockpit',
  '/driver/route': 'Driver Route',
  '/driver/stop': 'Stop Detail',
  '/driver/pod': 'Proof of Delivery',
  '/driver/issue': 'Issue Report',
  '/driver/sync': 'Offline & Sync',
  '/driver/degradation': 'Network Degradation',
  '/store': 'Store Portal',
  '/store/orders': 'Orders List',
  '/store/order': 'Place Order',
  '/store/confirm': 'Order Confirmation',
  '/store/cutoff': 'Cutoff Countdown',
  '/store/deferral': 'Deferral Notice',
  '/store/tracking': 'Delivery Tracking',
  '/store/receipt': 'Receipt Confirmation',
};

export default function TopBar({
  title,
  headerAction,
  onOpenSearch,
  onToggleSidebar,
}: TopBarProps) {
  const pathname = usePathname() || '';
  const {
    isLive,
    toggleLive,
    openDrawer,
  } = useAgent();

  const displayTitle = title || TITLE_MAP[pathname] || 'Mission Control';

  return (
    <header className="wp-topbar">
      <div className="wp-topbar-left">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="wp-nav-toggle"
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>
        <span className="wp-topbar-title">{displayTitle}</span>
      </div>

      <div className="wp-topbar-center">
        <button
          type="button"
          onClick={onOpenSearch}
          className="wp-search-trigger"
          data-wp-command-open
          aria-label="Search pages and actions"
        >
          <Search size={14} />
          <span className="wp-search-trigger-text">Search pages and actions</span>
          <kbd className="wp-kbd">⌘K</kbd>
        </button>
      </div>

      <div className="wp-topbar-right">
        <div className="wp-agent-controls">


          <button
            type="button"
            onClick={openDrawer}
            className="wp-icon-btn wp-agent-chat-link"
            aria-label="Open Waypoint Agent chat"
            title="Open Agent chat"
          >
            <MessageSquare size={16} />
          </button>
          <button
            type="button"
            onClick={toggleLive}
            className={`wp-btn wp-btn-outline wp-agent-toggle ${isLive ? 'is-active' : ''}`}
            data-wp-agent-toggle
            aria-pressed={isLive}
            aria-label={isLive ? 'Deactivate Waypoint Agent' : 'Activate Waypoint Agent'}
            title={isLive ? 'Agent active — click to deactivate' : 'Activate Waypoint Agent'}
          >
            <AudioWaveform size={14} />
            <span>Agent</span>
          </button>
        </div>
        <ThemeToggle />
        {headerAction ? (
          headerAction
        ) : (
          <>
            {pathname.startsWith('/dispatcher') && (
              <>
                <Link
                  href="/dispatcher/exceptions"
                  className="wp-icon-btn"
                  title="System alerts"
                  aria-label="Notifications"
                  style={{ position: 'relative' }}
                >
                  <Bell size={16} />
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 7,
                      height: 7,
                      background: 'var(--wp-error)',
                      borderRadius: '50%',
                    }}
                  />
                </Link>
                {pathname === '/dispatcher/allocation' ? (
                  <Link
                    href="/dispatcher/queue"
                    className="wp-btn wp-btn-primary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                  >
                    <PlusCircle size={14} />
                    <span>Order Queue</span>
                  </Link>
                ) : pathname === '/dispatcher/queue' ? (
                  <Link
                    href="/dispatcher/allocation"
                    className="wp-btn wp-btn-primary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                  >
                    <LayoutGrid size={14} />
                    <span>Allocation Board</span>
                  </Link>
                ) : (
                  <Link
                    href="/dispatcher/queue"
                    className="wp-btn wp-btn-primary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                  >
                    <PlusCircle size={14} />
                    <span>Review Queue</span>
                  </Link>
                )}
              </>
            )}

            {pathname.startsWith('/loader') && (
              <>
                <Link
                  href="/loader/signoff"
                  className="wp-btn wp-btn-primary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                >
                  <CheckCircle2 size={14} />
                  <span>Departure Signoff</span>
                </Link>
              </>
            )}

            {pathname.startsWith('/driver') && (
              <>
                <Link
                  href="/driver/route"
                  className="wp-btn wp-btn-primary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                >
                  <Truck size={14} />
                  <span>Active Route</span>
                </Link>
              </>
            )}

            {pathname.startsWith('/store') && (
              <>
                <Link
                  href="/store/order"
                  className="wp-btn wp-btn-primary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                >
                  <Store size={14} />
                  <span>Place Order</span>
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
}
