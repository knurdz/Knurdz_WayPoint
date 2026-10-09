'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ListOrdered,
  Clock,
  CalendarX,
  LayoutGrid,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  MapPin,
  Building2,
  Warehouse,
  List,
  CheckSquare,
  AlertTriangle,
  BadgeCheck,
  User,
  Truck,
  Camera,
  MessageSquareWarning,
  WifiOff,
  Store,
  ClipboardList,
  ShoppingCart,
  Timer,
  BellOff,
  Route,
  PackageOpen,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  section?: string;
}

const DISPATCHER_ITEMS: SidebarItem[] = [
  { href: '/dispatcher', label: 'Mission Control', icon: LayoutDashboard, section: 'Overview' },
  { href: '/dispatcher/queue', label: 'Order Queue', icon: ListOrdered, section: 'Dispatch & Planning' },
  { href: '/dispatcher/allocation', label: 'Fleet Allocation', icon: LayoutGrid, section: 'Dispatch & Planning' },
  { href: '/dispatcher/exceptions', label: 'Exceptions', icon: AlertCircle, section: 'Dispatch & Planning' },
  { href: '/dispatcher/cutoff', label: 'Cutoff & Late Orders', icon: Clock, section: 'Orders & Service' },
  { href: '/dispatcher/deferral', label: 'Deferral Panel', icon: CalendarX, section: 'Orders & Service' },
  { href: '/dispatcher/validator', label: 'Constraint Validator', icon: ShieldCheck, section: 'Analytics' },
  { href: '/dispatcher/forecast', label: 'Capacity Forecast', icon: TrendingUp, section: 'Analytics' },
  { href: '/dispatcher/map', label: 'Fleet Live Map', icon: MapPin, section: 'Field Operations' },
  { href: '/dispatcher/outlet', label: 'Outlet Detail', icon: Building2, section: 'Field Operations' },
];

const LOADER_ITEMS: SidebarItem[] = [
  { href: '/loader', label: 'Warehouse Dock', icon: CheckSquare, section: 'Dock Operations' },
  { href: '/loader/runs', label: 'Vehicle Runs', icon: List, section: 'Dock Operations' },
  { href: '/loader/depot', label: 'Depot Select', icon: Warehouse, section: 'Facility' },
  { href: '/loader/shortfall', label: 'Shortfall Report', icon: AlertTriangle, section: 'Discrepancies' },
  { href: '/loader/signoff', label: 'Departure Sign-off', icon: BadgeCheck, section: 'Discrepancies' },
];

const DRIVER_ITEMS: SidebarItem[] = [
  { href: '/driver', label: 'Driver Home', icon: User, section: 'Today Run' },
  { href: '/driver/route', label: 'Driver Route', icon: Truck, section: 'Today Run' },
  { href: '/driver/stop', label: 'Stop Detail', icon: MapPin, section: 'Today Run' },
  { href: '/driver/pod', label: 'Proof of Delivery', icon: Camera, section: 'Handover' },
  { href: '/driver/issue', label: 'Issue Report', icon: MessageSquareWarning, section: 'Handover' },
  { href: '/driver/sync', label: 'Offline & Sync', icon: WifiOff, section: 'Network' },
  { href: '/driver/degradation', label: 'Degradation', icon: AlertCircle, section: 'Network' },
];

const STORE_ITEMS: SidebarItem[] = [
  { href: '/store', label: 'Store Portal', icon: Store, section: 'Store Overview' },
  { href: '/store/orders', label: 'Orders List', icon: ClipboardList, section: 'Orders' },
  { href: '/store/order', label: 'Place Order', icon: ShoppingCart, section: 'Orders' },
  { href: '/store/confirm', label: 'Order Confirmation', icon: BadgeCheck, section: 'Orders' },
  { href: '/store/tracking', label: 'Delivery Tracking', icon: Route, section: 'Delivery Tracking' },
  { href: '/store/receipt', label: 'Receipt Confirmation', icon: PackageOpen, section: 'Delivery Tracking' },
  { href: '/store/cutoff', label: 'Cutoff Countdown', icon: Timer, section: 'Cutoff & Service' },
  { href: '/store/deferral', label: 'Deferral Notice', icon: BellOff, section: 'Cutoff & Service' },
];

interface SidebarProps {
  role?: string;
  userName?: string;
  depot?: string;
  onClose?: () => void;
}

export default function Sidebar({
  role = 'dispatcher',
  userName = 'Nimal Perera',
  depot = 'Peliyagoda Hub',
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [timeRemaining, setTimeRemaining] = useState('00:00:00');

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(16, 0, 0, 0);
      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }
      const diff = cutoff.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.href = '/login';
  };

  let items = DISPATCHER_ITEMS;
  if (role === 'loader') items = LOADER_ITEMS;
  if (role === 'driver') items = DRIVER_ITEMS;
  if (role === 'store') items = STORE_ITEMS;

  let currentSection = '';

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="wp-sidebar" aria-label="Sidebar Navigation">
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div className="wp-sidebar-header">
          <Link href={`/${role}`} className="wp-logo" onClick={onClose}>
            <span className="wp-logo-mark" aria-hidden="true">
              <img src="/assets/logo-mark.svg" alt="Waypoint" width={32} height={32} />
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="font-laro wp-title-md">Waypoint</span>
              <span className="wp-logo-badge">Logistics</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="wp-nav-close"
            aria-label="Close menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--wp-muted)',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="wp-sidebar-nav" aria-label="Main Navigation">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const showSection = item.section && item.section !== currentSection;
            if (item.section) currentSection = item.section;

            return (
              <React.Fragment key={item.href}>
                {showSection && (
                  <div className="wp-sidebar-nav-group-title">
                    {item.section}
                  </div>
                )}
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`wp-sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="wp-sidebar-footer">
        <div style={{ marginBottom: '0.65rem' }}>
          <div className="wp-flex-between" style={{ marginBottom: '0.35rem' }}>
            <span className="wp-label" style={{ fontSize: '0.65rem' }}>Cutoff 16:00 SLST</span>
            <span className="wp-status-pulse"></span>
          </div>
          <div
            className="font-mono"
            style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--wp-primary)' }}
          >
            {timeRemaining}
          </div>
        </div>

        <div
          className="wp-profile-pill"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.65rem',
            background: 'var(--wp-subpanel)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--wp-border-sub)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <span className="wp-avatar">{initials}</span>
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div
                className="wp-title-md"
                style={{
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  fontWeight: 600,
                }}
              >
                {userName}
              </div>
              <div className="wp-subtext" style={{ fontSize: '0.7rem' }}>
                {depot}
              </div>
            </div>
          </div>
          <a
            href="/api/auth/logout"
            onClick={handleLogout}
            title="Log out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--wp-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
            }}
          >
            <LogOut size={15} />
          </a>
        </div>
      </div>
    </aside>
  );
}
