'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

type MenuName = 'business' | 'notifications' | 'profile';

type TopbarProps = {
  onOpenMobileNavigation: () => void;
};

export function Topbar({ onOpenMobileNavigation }: TopbarProps) {
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null);
  const topbarRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<MenuName, HTMLButtonElement | null>>({
    business: null,
    notifications: null,
    profile: null,
  });

  useEffect(() => {
    if (!openMenu) return;

    function handlePointerDown(event: PointerEvent) {
      if (!topbarRef.current?.contains(event.target as Node)) setOpenMenu(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && openMenu) {
        triggerRefs.current[openMenu]?.focus();
        setOpenMenu(null);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenu]);

  function toggleMenu(menu: MenuName) {
    setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu));
  }

  return (
    <header className="topbar">
      <button
        aria-label="Open navigation"
        className="icon-button mobile-menu-button"
        onClick={onOpenMobileNavigation}
        type="button"
      >
        <Icon name="menu" />
      </button>

      <label className="global-search">
        <Icon name="search" />
        <input aria-label="Search dashboard (not connected)" placeholder="Search dashboard..." />
      </label>

      <div className="topbar-actions" ref={topbarRef}>
        <div className="topbar-menu">
          <button
            aria-expanded={openMenu === 'business'}
            aria-label="Business selector: Detailing Street Ludhiana"
            className={`business-selector${openMenu === 'business' ? ' topbar-control--open' : ''}`}
            onClick={() => toggleMenu('business')}
            ref={(element) => {
              triggerRefs.current.business = element;
            }}
            type="button"
          >
            <span className="business-selector-icon">
              <Icon name="building" />
            </span>
            <span className="business-selector-name">Detailing Street Ludhiana</span>
            <Icon className="chevron-icon" name="chevron" />
          </button>
          {openMenu === 'business' && (
            <div aria-label="Business selector" className="dropdown-panel business-panel" role="group">
              <span className="dropdown-eyebrow">CURRENT BUSINESS</span>
              <span className="dropdown-current">
                <span aria-hidden="true" className="dropdown-check">✓</span>
                Detailing Street Ludhiana
              </span>
              <p>Business switching is not available yet.</p>
            </div>
          )}
        </div>

        <div className="topbar-menu">
          <button
            aria-expanded={openMenu === 'notifications'}
            aria-label="Notifications (preview; not connected)"
            className={`icon-button notification-button${openMenu === 'notifications' ? ' topbar-control--open' : ''}`}
            onClick={() => toggleMenu('notifications')}
            ref={(element) => {
              triggerRefs.current.notifications = element;
            }}
            type="button"
          >
            <Icon name="notifications" />
            <span aria-hidden="true" className="notification-indicator" />
          </button>
          {openMenu === 'notifications' && (
            <div aria-label="Notifications" className="dropdown-panel notification-panel" role="group">
              <span className="dropdown-title">Notifications</span>
              <p>Notifications are not connected in this preview.</p>
            </div>
          )}
        </div>

        <span aria-hidden="true" className="topbar-divider" />

        <div className="topbar-menu">
          <button
            aria-expanded={openMenu === 'profile'}
            aria-label="Admin profile, Owner"
            className={`profile-control${openMenu === 'profile' ? ' topbar-control--open' : ''}`}
            onClick={() => toggleMenu('profile')}
            ref={(element) => {
              triggerRefs.current.profile = element;
            }}
            type="button"
          >
            <span aria-hidden="true" className="profile-avatar">A</span>
            <span className="profile-copy">
              <span className="profile-name">Admin</span>
              <span className="profile-role">Owner</span>
            </span>
            <Icon className="chevron-icon" name="chevron" />
          </button>
          {openMenu === 'profile' && (
            <div aria-label="Profile" className="dropdown-panel profile-panel" role="group">
              <span className="dropdown-current">Admin</span>
              <span className="dropdown-role">Owner</span>
              <p>Profile controls are not connected yet.</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
