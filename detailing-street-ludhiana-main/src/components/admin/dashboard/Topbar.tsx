'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Icon } from './Icon';

type MenuName = 'business' | 'notifications' | 'profile';

interface NotificationAppointment {
  _id?: string;
  bookingId?: string;
  customerName?: string;
  service?: string;
  preferredDate?: string;
  preferredTime?: string;
  status?: string;
}

interface DashboardNotificationResponse {
  success: boolean;
  error?: string;
  metrics?: {
    pendingAppointments?: number;
  };
  recentAppointments?: NotificationAppointment[];
}

export function Topbar() {
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null);
  const [pendingAppointmentCount, setPendingAppointmentCount] = useState(0);
  const [pendingAppointments, setPendingAppointments] = useState<NotificationAppointment[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [notificationRefreshKey, setNotificationRefreshKey] = useState(0);
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  useEffect(() => {
    function syncFullscreenState() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setAdminUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch {
      window.location.href = '/admin/login';
    }
  };

  useEffect(() => {
    if (openMenu !== 'notifications' && notificationsLoaded) return;

    let active = true;

    async function loadNotifications() {
      setNotificationsLoading(true);
      setNotificationsError(null);
      try {
        const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
        const data: DashboardNotificationResponse = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || `Dashboard request failed with status ${response.status}`);
        }

        const recentPending = (data.recentAppointments || [])
          .filter((appointment) => appointment.status?.toLowerCase() === 'pending')
          .slice(0, 5);
        if (active) {
          setPendingAppointmentCount(data.metrics?.pendingAppointments || 0);
          setPendingAppointments(recentPending);
        }
      } catch (error) {
        console.error('Failed to load dashboard notifications:', error);
        if (active) setNotificationsError('Could not load pending appointments. Please try again.');
      } finally {
        if (active) {
          setNotificationsLoading(false);
          setNotificationsLoaded(true);
        }
      }
    }

    loadNotifications();
    return () => {
      active = false;
    };
  }, [openMenu, notificationRefreshKey, notificationsLoaded]);

  function toggleMenu(menu: MenuName) {
    setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu));
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement && !document.fullscreenEnabled) {
      toast.error('Full screen is not available in this browser.');
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Could not change dashboard full-screen mode:', error);
      toast.error('Could not change full-screen mode. Please try again.');
    }
  }

  return (
    <header className="topbar">
      <label className="global-search">
        <Icon name="search" />
        <input aria-label="Search dashboard (not connected)" placeholder="Search dashboard..." />
      </label>

      <div className="topbar-actions" ref={topbarRef}>
        <Link aria-label="View public website" className="main-website-link" href="/">
          View website
          <Icon name="arrow" />
        </Link>
        <button
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          aria-pressed={isFullscreen}
          className="fullscreen-toggle"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          type="button"
        >
          <Icon name={isFullscreen ? 'fullscreenExit' : 'fullscreen'} />
          <span>{isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
        </button>
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
              <span className="dropdown-eyebrow">Current business</span>
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
            aria-label={`Notifications${pendingAppointmentCount ? `, ${pendingAppointmentCount} pending appointments` : ''}`}
            className={`icon-button notification-button${openMenu === 'notifications' ? ' topbar-control--open' : ''}`}
            onClick={() => toggleMenu('notifications')}
            ref={(element) => {
              triggerRefs.current.notifications = element;
            }}
            type="button"
          >
            <Icon name="notifications" />
            {pendingAppointmentCount > 0 && (
              <span aria-hidden="true" className="notification-indicator" />
            )}
          </button>
          {openMenu === 'notifications' && (
            <div aria-label="Notifications" className="dropdown-panel notification-panel" role="group">
              <span className="dropdown-title">Notifications</span>
              {notificationsLoading ? (
                <p aria-live="polite">Checking for pending appointments...</p>
              ) : notificationsError ? (
                <div className="notification-error">
                  <p role="alert">{notificationsError}</p>
                  <button
                    className="notification-retry"
                    onClick={() => setNotificationRefreshKey((key) => key + 1)}
                    type="button"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <p className="notification-summary">
                    {pendingAppointmentCount === 0
                      ? 'You’re all caught up. No pending appointments.'
                      : `${pendingAppointmentCount} appointment${pendingAppointmentCount === 1 ? '' : 's'} need${pendingAppointmentCount === 1 ? 's' : ''} your attention.`}
                  </p>
                  {pendingAppointments.length > 0 && (
                    <ul className="notification-list">
                      {pendingAppointments.map((appointment, index) => (
                        <li key={appointment._id || appointment.bookingId || index}>
                          <Link
                            className="notification-item"
                            href="/admin/appointments"
                            onClick={() => setOpenMenu(null)}
                          >
                            <span className="notification-item-copy">
                              <strong>{appointment.customerName || 'New customer booking'}</strong>
                              <span>{appointment.service || 'Service not specified'}</span>
                            </span>
                            {(appointment.preferredDate || appointment.preferredTime) && (
                              <span className="notification-item-date">
                                {[appointment.preferredDate, appointment.preferredTime]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {pendingAppointmentCount > 0 && (
                    <Link
                      className="notification-view-all"
                      href="/admin/appointments"
                      onClick={() => setOpenMenu(null)}
                    >
                      View appointments
                      <Icon name="arrow" />
                    </Link>
                  )}
                </>
              )}
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
              <div className="profile-panel-header">
                <span className="dropdown-current" title={adminUser?.email || 'Admin'}>
                  {adminUser?.email || 'Admin'}
                </span>
                <span className="dropdown-role">{adminUser?.role || 'Owner'}</span>
              </div>
              <p className="profile-panel-hint">Studio Administrator Access</p>
              <div className="profile-panel-divider" />
              <button
                type="button"
                className="profile-logout-button"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <Icon name="logout" className="logout-icon" />
                <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
