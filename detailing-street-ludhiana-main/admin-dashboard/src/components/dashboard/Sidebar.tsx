'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './Icon';

const navigation: { label: string; icon: IconName; href?: string }[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '/' },
  { label: 'Appointments', icon: 'appointments', href: '/appointments' },
  { label: 'Customers', icon: 'customers', href: '/customers' },
  { label: 'Vehicles', icon: 'vehicles', href: '/vehicles' },
  { label: 'Services', icon: 'services', href: '/services' },
  { label: 'Staff', icon: 'staff' },
  { label: 'Reports', icon: 'reports' },
  { label: 'Settings', icon: 'settings' },
  { label: 'Subscriptions', icon: 'subscriptions' },
];

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
};

export function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          type="button"
        />
      )}
      <aside
        aria-label="Main sidebar"
        className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}${mobileOpen ? ' sidebar--mobile-open' : ''}`}
      >
        <div className="sidebar-brand">
          <div aria-hidden="true" className="brand-mark">
            <span>D</span>
            <i />
          </div>
          <div className="brand-copy">
            <span className="brand-name">DETAILING STREET</span>
            <span className="brand-caption">ADMIN CONSOLE</span>
          </div>
          <button
            aria-label="Close navigation"
            className="icon-button sidebar-mobile-close"
            onClick={onCloseMobile}
            type="button"
          >
            <Icon name="close" />
          </button>
          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={collapsed}
            className="icon-button sidebar-collapse"
            onClick={onToggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type="button"
          >
            <span aria-hidden="true" className="collapse-glyph">
              {collapsed ? '›' : '‹'}
            </span>
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>
        <nav aria-label="Dashboard sections" className="sidebar-nav">
          {navigation.map((item, index) => (
            <div className="nav-item-wrap" key={item.label}>
              {index === 1 && <div aria-hidden="true" className="nav-divider" />}
              {index === 1 && !collapsed && (
                <div className="sidebar-section-label nav-section-label">MANAGE</div>
              )}
              {index === 6 && <div aria-hidden="true" className="nav-divider" />}
              {item.href ? (
                <Link
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className={`nav-item${pathname === item.href ? ' nav-item--active' : ''}`}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon name={item.icon} />
                  <span className="nav-label">{item.label}</span>
                  {pathname === item.href && <span aria-hidden="true" className="nav-active-indicator" />}
                </Link>
              ) : (
                <button
                  aria-disabled="true"
                  className="nav-item nav-item--future"
                  disabled
                  title={`${item.label} is not implemented yet`}
                  type="button"
                >
                  <Icon name={item.icon} />
                  <span className="nav-label">{item.label}</span>
                  {!collapsed && <span className="nav-future-label">Soon</span>}
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span aria-hidden="true" className="footer-status-dot" />
          <div className="sidebar-footer-copy">
            <span>Independent workspace</span>
            <span>Not connected to a backend</span>
          </div>
        </div>
      </aside>
    </>
  );
}
