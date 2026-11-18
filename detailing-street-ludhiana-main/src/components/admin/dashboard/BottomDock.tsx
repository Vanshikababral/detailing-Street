'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './Icon';

const navigation: { label: string; icon: IconName; href: string }[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Appointments', icon: 'appointments', href: '/admin/appointments' },
  { label: 'Customers', icon: 'customers', href: '/admin/customers' },
  { label: 'Vehicles', icon: 'vehicles', href: '/admin/vehicles' },
  { label: 'Services', icon: 'services', href: '/admin/services' },
  { label: 'Staff', icon: 'staff', href: '/admin/staff' },
  { label: 'Settings', icon: 'settings', href: '/admin/settings' },
];

const primaryMobileNavigation = navigation.slice(0, 3);
const moreMobileNavigation = navigation.slice(3);

function isActiveRoute(pathname: string, href: string) {
  return href === '/admin'
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomDock() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState(0);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const activeMoreRoute = moreMobileNavigation.some((item) => isActiveRoute(pathname, item.href));

  useEffect(() => {
    let active = true;

    async function fetchPendingAppointments() {
      try {
        const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Dashboard summary request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (active && data.success && Number.isFinite(data.metrics?.pendingAppointments)) {
          setPendingAppointments(data.metrics.pendingAppointments);
        }
      } catch (error) {
        console.error('Failed to load pending appointment count:', error);
      }
    }

    fetchPendingAppointments();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!moreOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!moreMenuRef.current?.contains(event.target as Node)) setMoreOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreOpen]);

  function renderItem(item: (typeof navigation)[number]) {
    const active = isActiveRoute(pathname, item.href);
    const hasPendingAppointments = item.href === '/admin/appointments' && pendingAppointments > 0;

    return (
      <Link
        aria-current={active ? 'page' : undefined}
        className={`dock-item${active ? ' dock-item--active' : ''}`}
        href={item.href}
        key={item.href}
        onClick={() => setMoreOpen(false)}
      >
        <span className="dock-icon-wrap">
          <Icon name={item.icon} />
          {hasPendingAppointments && (
            <span
              aria-label={`${pendingAppointments} pending appointments`}
              className="dock-notification"
            >
              {pendingAppointments > 9 ? '9+' : pendingAppointments}
            </span>
          )}
        </span>
        <span className="dock-label">{item.label}</span>
        {active && <span aria-hidden="true" className="dock-active-indicator" />}
      </Link>
    );
  }

  return (
    <nav aria-label="Dashboard navigation" className="bottom-dock">
      <div className="dock-items dock-items--desktop">{navigation.map(renderItem)}</div>
      <div className="dock-items dock-items--mobile">
        {primaryMobileNavigation.map(renderItem)}
        <div className="dock-more-wrap" ref={moreMenuRef}>
          <button
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            aria-label="More dashboard sections"
            className={`dock-item dock-more-button${activeMoreRoute ? ' dock-item--active' : ''}`}
            onClick={() => setMoreOpen((open) => !open)}
            ref={moreButtonRef}
            type="button"
          >
            <span className="dock-icon-wrap">
              <Icon name="more" />
            </span>
            <span className="dock-label">More</span>
            {activeMoreRoute && (
              <span aria-hidden="true" className="dock-active-indicator" />
            )}
          </button>
          {moreOpen && (
            <div aria-label="More dashboard sections" className="dock-more-menu" role="menu">
              {moreMobileNavigation.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                return (
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={`dock-more-item${active ? ' dock-more-item--active' : ''}`}
                    href={item.href}
                    key={item.href}
                    onClick={() => setMoreOpen(false)}
                    role="menuitem"
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
