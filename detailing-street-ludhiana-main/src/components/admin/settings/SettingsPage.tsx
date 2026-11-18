'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../dashboard/Icon';

interface StudioSettings {
  studioName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  workingHours: string;
  instagram: string;
  notificationEmail: string;
  sendCustomerConfirmation: boolean;
  sendStatusUpdateEmails: boolean;
}

interface SystemInfo {
  activeAdminEmail: string;
  smtpConfigured: boolean;
  smtpHost: string;
  smtpUser: string;
  databaseName: string;
}

const DEFAULT_SETTINGS: StudioSettings = {
  studioName: '',
  tagline: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  workingHours: '',
  instagram: '',
  notificationEmail: '',
  sendCustomerConfirmation: true,
  sendStatusUpdateEmails: true,
};

type TabId = 'studio' | 'notifications' | 'system';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'studio', label: 'Studio Profile', icon: 'building' },
  { id: 'notifications', label: 'Notifications', icon: 'mail' },
  { id: 'system', label: 'System Info', icon: 'settings' },
];

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`settings-toggle${checked ? ' settings-toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="settings-toggle-thumb" />
    </button>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_SETTINGS);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('studio');

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
          setSystemInfo(data.systemInfo || null);
        } else {
          setError(data.error || 'Failed to load settings.');
        }
      } catch {
        setError('Could not connect to settings server.');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (key: keyof StudioSettings, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || 'Failed to save settings.');
      }
    } catch {
      setError('Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="settings-spinner" />
        <p>Loading studio settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-management">
      <header className="settings-header">
        <div>
          <span className="dashboard-kicker">CONFIGURATION</span>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">
            Manage your studio profile, booking rules, and notification preferences.
          </p>
        </div>
        <button
          type="button"
          className={`settings-save-btn${saving ? ' settings-save-btn--loading' : ''}${saved ? ' settings-save-btn--saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
          form="settings-form"
        >
          {saving ? (
            <>
              <svg className="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Saving...
            </>
          ) : saved ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </header>

      {error && (
        <div className="settings-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="settings-tabs" aria-label="Settings sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`settings-tab${activeTab === tab.id ? ' settings-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon as any} />
            {tab.label}
          </button>
        ))}
      </nav>

      <form id="settings-form" onSubmit={handleSave}>
        {/* Studio Profile Tab */}
        {activeTab === 'studio' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h2>Studio Profile</h2>
              <p>Basic business information displayed on the public website and booking confirmations.</p>
            </div>

            <div className="settings-grid">
              <div className="settings-field settings-field--full">
                <label className="settings-label">Studio Name</label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.studioName}
                  onChange={(e) => handleChange('studioName', e.target.value)}
                  placeholder="Detailing Street Ludhiana"
                />
              </div>

              <div className="settings-field settings-field--full">
                <label className="settings-label">Tagline</label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="Paint Protection & Studio Auto Detailing"
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">Business Phone</label>
                <input
                  type="tel"
                  className="settings-input"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="9115555035"
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">Business Email</label>
                <input
                  type="email"
                  className="settings-input"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="studio@detailingstreet.com"
                />
              </div>

              <div className="settings-field settings-field--full">
                <label className="settings-label">Street Address</label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Detailing Street, Ferozepur Road"
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">City</label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Ludhiana"
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">State</label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Punjab"
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">PIN Code</label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  placeholder="141001"
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">Working Hours</label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.workingHours}
                  onChange={(e) => handleChange('workingHours', e.target.value)}
                  placeholder="Mon–Sun: 9:00 AM – 8:00 PM"
                />
              </div>

              <div className="settings-field settings-field--full">
                <label className="settings-label">Instagram Handle</label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="@detailingstreetludhiana"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h2>Notifications</h2>
              <p>Control how emails are sent to customers and the studio admin.</p>
            </div>

            <div className="settings-grid">
              <div className="settings-field settings-field--full">
                <label className="settings-label">Studio Notification Email</label>
                <p className="settings-hint">New booking alerts will be sent to this address</p>
                <input
                  type="email"
                  className="settings-input"
                  value={settings.notificationEmail}
                  onChange={(e) => handleChange('notificationEmail', e.target.value)}
                  placeholder="admin@detailingstreet.com"
                />
              </div>

              <div className="settings-field settings-field--full">
                <div className="settings-toggle-row">
                  <div>
                    <span className="settings-label">Send Customer Booking Confirmations</span>
                    <p className="settings-hint">
                      Automatically email customers a booking confirmation when they submit the form.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.sendCustomerConfirmation}
                    onChange={(v) => handleChange('sendCustomerConfirmation', v)}
                    label="Send customer confirmation emails"
                  />
                </div>
              </div>

              <div className="settings-field settings-field--full">
                <div className="settings-toggle-row">
                  <div>
                    <span className="settings-label">Send Status Update Emails</span>
                    <p className="settings-hint">
                      Notify customers by email when their appointment status changes (Confirmed, Completed, Cancelled).
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.sendStatusUpdateEmails}
                    onChange={(v) => handleChange('sendStatusUpdateEmails', v)}
                    label="Send status update emails"
                  />
                </div>
              </div>

              {systemInfo && (
                <div className="settings-field settings-field--full">
                  <div className={`settings-smtp-status ${systemInfo.smtpConfigured ? 'settings-smtp-status--ok' : 'settings-smtp-status--warn'}`}>
                    <div className="settings-smtp-dot" />
                    <div>
                      <strong>{systemInfo.smtpConfigured ? 'SMTP Connected' : 'SMTP Not Configured'}</strong>
                      <p>
                        {systemInfo.smtpConfigured
                          ? `Sending via ${systemInfo.smtpHost} as ${systemInfo.smtpUser}`
                          : 'Email delivery is not configured. Contact your administrator to enable notifications.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Info Tab (read-only) */}
        {activeTab === 'system' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h2>System Information</h2>
              <p>Overview of active system connectivity, database storage, and messaging services.</p>
            </div>

            <div className="settings-info-cards">
              <div className="settings-info-card">
                <span className="settings-info-label">Admin Account</span>
                <span className="settings-info-value">{systemInfo?.activeAdminEmail || '—'}</span>
                <span className="settings-info-hint">Authorized studio administrator</span>
              </div>

              <div className="settings-info-card">
                <span className="settings-info-label">Database</span>
                <span className="settings-info-value">{systemInfo?.databaseName || 'test'}</span>
                <span className="settings-info-hint">Connected cloud cluster</span>
              </div>

              <div className="settings-info-card">
                <span className="settings-info-label">Outgoing Mail Server</span>
                <span className="settings-info-value">{systemInfo?.smtpHost || '—'}</span>
                <span className="settings-info-hint">Mail relay provider</span>
              </div>

              <div className="settings-info-card">
                <span className="settings-info-label">Sender Account</span>
                <span className="settings-info-value">{systemInfo?.smtpUser || 'Not set'}</span>
                <span className="settings-info-hint">Studio dispatch address</span>
              </div>

              <div className="settings-info-card">
                <span className="settings-info-label">Email Service</span>
                <span className={`settings-info-badge ${systemInfo?.smtpConfigured ? 'settings-info-badge--ok' : 'settings-info-badge--warn'}`}>
                  {systemInfo?.smtpConfigured ? '● Active' : '● Offline'}
                </span>
                <span className="settings-info-hint">Customer and alert notifications</span>
              </div>

              <div className="settings-info-card">
                <span className="settings-info-label">Security &amp; Session</span>
                <span className="settings-info-badge settings-info-badge--ok">● Protected</span>
                <span className="settings-info-hint">Encrypted cryptographic token</span>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

