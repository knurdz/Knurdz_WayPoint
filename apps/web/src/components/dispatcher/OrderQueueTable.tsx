'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Snowflake, Truck, Building2, CheckCircle2, Clock } from 'lucide-react';

interface OrderItem {
  orderId: string;
  outletId: string;
  outletName: string;
  brand: string;
  district: string;
  depot: string;
  tempRequirement: string;
  parkingConstraint: string;
  dockType: string;
  weightKg: number;
  volumeM3: number;
  window: string;
  status: string;
}

interface OrderQueueTableProps {
  initialOrders: OrderItem[];
}

export default function OrderQueueTable({ initialOrders }: OrderQueueTableProps) {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);

  React.useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTemp, setSelectedTemp] = useState('');
  const [selectedConstraint, setSelectedConstraint] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (search) {
        const query = search.toLowerCase();
        const matches =
          o.orderId.toLowerCase().includes(query) ||
          o.outletId.toLowerCase().includes(query) ||
          o.outletName.toLowerCase().includes(query) ||
          o.district.toLowerCase().includes(query);
        if (!matches) return false;
      }
      if (selectedBrand && o.brand !== selectedBrand) return false;
      if (selectedDistrict && o.district !== selectedDistrict) return false;
      if (selectedTemp && o.tempRequirement !== selectedTemp) return false;
      if (selectedConstraint && o.parkingConstraint !== selectedConstraint) return false;
      return true;
    });
  }, [orders, search, selectedBrand, selectedDistrict, selectedTemp, selectedConstraint]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map((o) => o.orderId));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter Bar */}
      <div style={{
        background: 'var(--wp-panel, #FFFFFF)',
        border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
        borderRadius: 10,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: 1,
          minWidth: 240,
          background: 'var(--wp-subpanel, #F8F8F7)',
          border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
          borderRadius: 8,
          padding: '8px 12px',
        }}>
          <Search size={16} color="var(--wp-muted, #6E838A)" />
          <input
            type="text"
            placeholder="Search Order ID, Outlet, District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: 13,
              color: 'var(--wp-heading, #1A1C1C)',
            }}
          />
        </div>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          aria-label="Brand Filter"
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
            background: 'var(--wp-subpanel, #F8F8F7)',
            fontSize: 13,
            color: 'var(--wp-heading, #1A1C1C)',
            cursor: 'pointer',
          }}
        >
          <option value="">All Brands</option>
          <option value="Fresh">Fresh</option>
          <option value="Style">Style</option>
          <option value="Tech">Tech</option>
        </select>

        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          aria-label="District Filter"
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
            background: 'var(--wp-subpanel, #F8F8F7)',
            fontSize: 13,
            color: 'var(--wp-heading, #1A1C1C)',
            cursor: 'pointer',
          }}
        >
          <option value="">All Districts</option>
          <option value="Colombo">Colombo</option>
          <option value="Gampaha">Gampaha</option>
          <option value="Kandy">Kandy</option>
        </select>

        <select
          value={selectedTemp}
          onChange={(e) => setSelectedTemp(e.target.value)}
          aria-label="Temperature Filter"
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
            background: 'var(--wp-subpanel, #F8F8F7)',
            fontSize: 13,
            color: 'var(--wp-heading, #1A1C1C)',
            cursor: 'pointer',
          }}
        >
          <option value="">All Temperatures</option>
          <option value="chilled">Chilled Reefer</option>
          <option value="ambient">Ambient</option>
        </select>

        <select
          value={selectedConstraint}
          onChange={(e) => setSelectedConstraint(e.target.value)}
          aria-label="Constraint Filter"
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
            background: 'var(--wp-subpanel, #F8F8F7)',
            fontSize: 13,
            color: 'var(--wp-heading, #1A1C1C)',
            cursor: 'pointer',
          }}
        >
          <option value="">All Access Constraints</option>
          <option value="van_only">Van Only (Curbside Exclusive)</option>
          <option value="mall_dock">Mall Dock (Loading Bay)</option>
          <option value="normal">Standard Access</option>
        </select>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderRadius: 10,
          background: '#1A1C1C',
          color: '#FFFFFF',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--wp-primary, #377A8B)' }}>
              {selectedIds.length} Orders Selected
            </span>
            <span style={{ fontSize: 13, color: '#A1A1AA' }}>
              Send selected orders to carrier allocation or batch deferral
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              href="/dispatcher/allocation"
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                background: 'var(--wp-primary, #377A8B)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Send to Carrier Board
            </Link>
            <Link
              href="/dispatcher/deferral"
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Stage Deferral
            </Link>
          </div>
        </div>
      )}

      {/* High Density Table */}
      <div className="wp-table-wrap" style={{
        background: 'var(--wp-panel, #FFFFFF)',
        border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
        borderRadius: 12,
        overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{
              background: 'var(--wp-subpanel, #F8F8F7)',
              borderBottom: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
              color: 'var(--wp-muted, #6E838A)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              <th style={{ padding: '12px 16px', width: 40 }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all orders"
                />
              </th>
              <th style={{ padding: '12px 16px' }}>Delivery Target</th>
              <th style={{ padding: '12px 16px' }}>Lane & Temp</th>
              <th style={{ padding: '12px 16px' }}>Window</th>
              <th style={{ padding: '12px 16px' }}>Payload</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const isSelected = selectedIds.includes(order.orderId);
              return (
                <tr
                  key={order.orderId}
                  style={{
                    borderBottom: '1px solid var(--wp-border, rgba(0,0,0,0.05))',
                    background: isSelected ? 'var(--wp-subpanel, #F8F8F7)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOrder(order.orderId)}
                      aria-label={`Select order ${order.orderId}`}
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: 'var(--wp-heading, #1A1C1C)' }}>{order.orderId}</strong>
                      <span style={{ fontSize: 12, color: 'var(--wp-subtext, #3E555C)' }}>
                        {order.outletId} {order.outletName}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--wp-muted, #6E838A)' }}>
                        {order.district} ({order.depot})
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--wp-subpanel, #F8F8F7)',
                        border: '1px solid var(--wp-border, rgba(0,0,0,0.08))',
                        fontWeight: 600,
                        fontSize: 11,
                      }}>
                        {order.brand}
                      </span>
                      {order.tempRequirement === 'chilled' && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'rgba(37, 99, 235, 0.1)',
                          color: '#2563EB',
                          fontWeight: 600,
                          fontSize: 11,
                        }}>
                          <Snowflake size={11} />
                          Chilled
                        </span>
                      )}
                      {order.parkingConstraint === 'van_only' && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'rgba(217, 119, 6, 0.1)',
                          color: '#D97706',
                          fontWeight: 600,
                          fontSize: 11,
                        }}>
                          <Truck size={11} />
                          Van Only
                        </span>
                      )}
                      {order.parkingConstraint === 'mall_dock' && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'rgba(107, 114, 128, 0.1)',
                          color: '#4B5563',
                          fontWeight: 600,
                          fontSize: 11,
                        }}>
                          <Building2 size={11} />
                          Mall Dock
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--wp-subtext, #3E555C)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={13} color="var(--wp-muted, #6E838A)" />
                      <span>{order.window}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--wp-heading, #1A1C1C)' }}>
                        {order.weightKg} kg
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--wp-muted, #6E838A)' }}>
                        {order.volumeM3} m³
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      borderRadius: 12,
                      background: 'rgba(22, 163, 74, 0.12)',
                      color: '#16A34A',
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      <CheckCircle2 size={12} />
                      Confirmed
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
