'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  { href: '/dispatcher/queue', label: 'Order Queue', icon: ListOrdered, section: 'Orders' },
  { href: '/dispatcher/cutoff', label: 'Cutoff & Late Orders', icon: Clock, section: 'Orders' },
  { href: '/dispatcher/deferral', label: 'Deferral Panel', icon: CalendarX, section: 'Orders' },
  { href: '/dispatcher/allocation', label: 'Fleet Allocation', icon: LayoutGrid, section: 'Fleet' },
  { href: '/dispatcher/validator', label: 'Constraint Validator', icon: ShieldCheck, section: 'Fleet' },
  { href: '/dispatcher/exceptions', label: 'Exceptions', icon: AlertCircle, badge: '3', section: 'Fleet' },
  { href: '/dispatcher/forecast', label: 'Capacity Forecast', icon: TrendingUp, section: 'Fleet' },
  { href: '/dispatcher/map', label: 'Live Progress Map', icon: MapPin, section: 'Network' },
  { href: '/dispatcher/outlet', label: 'Outlet Detail', icon: Building2, section: 'Network' },
];

const LOADER_ITEMS: SidebarItem[] = [
  { href: '/loader', label: 'Depot Select', icon: Warehouse, section: 'Depot' },
  { href: '/loader/runs', label: 'Vehicle Runs', icon: List, section: 'Depot' },
  { href: '/loader/dock', label: 'Load Checklist', icon: CheckSquare, section: 'Load' },
  { href: '/loader/shortfall', label: 'Shortfall / Damage', icon: AlertTriangle, section: 'Load' },
  { href: '/loader/signoff', label: 'Departure Sign-off', icon: BadgeCheck, section: 'Load' },
];

const DRIVER_ITEMS: SidebarItem[] = [
  { href: '/driver', label: 'Driver Home', icon: User, section: 'Today' },
  { href: '/driver/route', label: "Today's Route", icon: Truck, section: 'Today' },
  { href: '/driver/stop', label: 'Stop Detail', icon: MapPin, section: 'Today' },
  { href: '/driver/pod', label: 'Proof of Delivery', icon: Camera, section: 'Delivery' },
  { href: '/driver/issue', label: 'Issue Report', icon: MessageSquareWarning, section: 'Delivery' },
  { href: '/driver/sync', label: 'Offline & Sync', icon: WifiOff, section: 'Delivery' },
];

const STORE_ITEMS: SidebarItem[] = [
  { href: '/store', label: 'Store Portal', icon: Store, section: 'Orders' },
  { href: '/store/orders', label: 'Orders List', icon: ClipboardList, section: 'Orders' },
  { href: '/store/order', label: 'Place Order', icon: ShoppingCart, section: 'Orders' },
  { href: '/store/confirm', label: 'Order Confirmation', icon: BadgeCheck, section: 'Orders' },
  { href: '/store/cutoff', label: 'Cutoff Countdown', icon: Timer, section: 'Service' },
  { href: '/store/deferral', label: 'Deferral Notice', icon: BellOff, section: 'Service' },
  { href: '/store/tracking', label: 'Delivery Tracking', icon: Route, section: 'Service' },
  { href: '/store/receipt', label: 'Receipt Confirmation', icon: PackageOpen, section: 'Service' },
];

interface SidebarProps {
  role?: string;
  onClose?: () => void;
}

export default function Sidebar({ role = 'dispatcher', onClose }: SidebarProps) {
  const pathname = usePathname();

  let items = DISPATCHER_ITEMS;
  if (role === 'loader') items = LOADER_ITEMS;
  if (role === 'driver') items = DRIVER_ITEMS;
  if (role === 'store') items = STORE_ITEMS;

  let currentSection = '';

  return (
    <aside className="wp-sidebar" style={{
      width: 240,
      borderRight: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
      background: 'var(--wp-subpanel, #F8F8F7)',
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minHeight: 'calc(100vh - 64px)',
      boxSizing: 'border-box',
    }}>
      <div className="wp-sidebar-mobile-header" style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 8px 12px',
        borderBottom: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/assets/logo-mark.svg" alt="Waypoint" width={24} height={24} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--wp-heading, #1A1C1C)' }}>Waypoint</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            color: 'var(--wp-muted, #6E838A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        const showSection = item.section && item.section !== currentSection;
        if (item.section) currentSection = item.section;

        return (
          <React.Fragment key={item.href}>
            {showSection && (
              <div style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--wp-muted, #6E838A)',
                fontWeight: 700,
                padding: '12px 10px 4px',
              }}>
                {item.section}
              </div>
            )}
            <Link
              href={item.href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFFFFF' : 'var(--wp-subtext, #3E555C)',
                background: isActive ? 'var(--wp-primary, #377A8B)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: isActive ? '#FFFFFF' : 'var(--wp-warning, #D97706)',
                  color: isActive ? 'var(--wp-primary, #377A8B)' : '#FFFFFF',
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          </React.Fragment>
        );
      })}
    </aside>
  );
}
