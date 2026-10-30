'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon, type IconName } from './Icon';

function formatLocalDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function MetricCard({
  label,
  value,
  trend,
  trendTone,
  icon,
}: {
  label: string;
  value: string | number;
  trend: string;
  trendTone: 'positive' | 'neutral' | 'attention';
  icon: IconName;
}) {
  return (
    <article className="overview-metric-card">
      <div className="metric-card-top">
        <span className="metric-label">{label}</span>
        <span className="metric-icon">
          <Icon name={icon} />
        </span>
      </div>
      <div className="metric-card-bottom">
        <strong className="metric-value">{value}</strong>
        <span className={`metric-trend metric-trend--${trendTone}`}>
          <Icon name="trend" />
          {trend}
        </span>
      </div>
    </article>
  );
}

export function DashboardOverview() {
  const [data, setData] = useState<{
    metrics: {
      totalBookings: number;
      pendingAppointments: number;
      revenue: number;
      completedServices: number;
      totalCustomers: number;
      totalVehicles: number;
      totalServices: number;
    };
    recentAppointments: any[];
  }>({
    metrics: {
      totalBookings: 0,
      pendingAppointments: 0,
      revenue: 0,
      completedServices: 0,
      totalCustomers: 0,
      totalVehicles: 0,
      totalServices: 0,
    },
    recentAppointments: [],
  });

  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState('Today');

  useEffect(() => {
    setTodayStr(formatLocalDate(new Date()));
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        if (json.success) {
          setData({
            metrics: json.metrics,
            recentAppointments: json.recentAppointments || [],
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-overview">
      <header className="overview-header">
        <div className="overview-heading">
          <span className="overview-eyebrow">DETAILING STREET <i /> LUDHIANA</span>
          <h1 id="dashboard-title">Dashboard</h1>
          <p>Welcome back, Admin. Here’s what’s happening with your business today.</p>
          <p className="overview-data-note">Connected directly to MongoDB Atlas via Django</p>
        </div>
        <div className="overview-header-actions">
          <time className="overview-date">
            <Icon name="appointments" />
            {todayStr}
          </time>
        </div>
      </header>

      {/* Metrics Row 1 */}
      <section aria-label="Business metrics" className="overview-metrics">
        <MetricCard
          label="Total Bookings"
          value={loading ? '...' : data.metrics.totalBookings}
          trend="Live database count"
          trendTone="positive"
          icon="appointments"
        />
        <MetricCard
          label="Pending Appointments"
          value={loading ? '...' : data.metrics.pendingAppointments}
          trend="Needs attention"
          trendTone="attention"
          icon="clock"
        />
        <MetricCard
          label="Revenue"
          value={loading ? '...' : `₹${data.metrics.revenue.toLocaleString('en-IN')}`}
          trend="From completed jobs"
          trendTone="positive"
          icon="revenue"
        />
        <MetricCard
          label="Completed Services"
          value={loading ? '...' : data.metrics.completedServices}
          trend="Finished work"
          trendTone="positive"
          icon="completed"
        />
      </section>

      {/* Metrics Row 2 */}
      <section aria-label="Database entity counts" className="overview-metrics" style={{ marginTop: '1.25rem' }}>
        <MetricCard
          label="Registered Customers"
          value={loading ? '...' : data.metrics.totalCustomers}
          trend="Active in MongoDB"
          trendTone="neutral"
          icon="customers"
        />
        <MetricCard
          label="Registered Vehicles"
          value={loading ? '...' : data.metrics.totalVehicles}
          trend="In fleet records"
          trendTone="neutral"
          icon="vehicles"
        />
        <MetricCard
          label="Offered Services"
          value={loading ? '...' : data.metrics.totalServices}
          trend="In service catalog"
          trendTone="neutral"
          icon="services"
        />
      </section>

      {/* Clean Table Panel for Recent Appointments */}
      <div className="overview-grid" style={{ marginTop: '1.75rem', gridTemplateColumns: '1fr' }}>
        <section aria-labelledby="recent-appointments-title" className="overview-panel recent-appointments-panel">
          <div className="overview-panel-header">
            <div>
              <span className="panel-kicker">DATABASE ACTIVITY</span>
              <h2 id="recent-appointments-title">Recent Appointments</h2>
            </div>
            <Link href="/admin/appointments" className="panel-text-action">
              View all
              <Icon name="arrow" />
            </Link>
          </div>
          <p className="panel-inline-note">Live appointment records retrieved from MongoDB Atlas</p>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
              Loading live records from database...
            </div>
          ) : data.recentAppointments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
              <p style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#fff' }}>No appointments in database yet.</p>
              <p style={{ fontSize: '0.85rem' }}>Customer bookings submitted on the website will appear here automatically.</p>
            </div>
          ) : (
            <div className="appointments-table-scroll" role="region" aria-label="Recent appointments table" tabIndex={0}>
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th scope="col">Customer</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Vehicle</th>
                    <th scope="col">Service</th>
                    <th scope="col">Date &amp; Time</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAppointments.map((app) => (
                    <tr key={app._id || app.bookingId}>
                      <th scope="row">
                        <span className="customer-avatar" aria-hidden="true">
                          {(app.customerName || 'U')
                            .split(' ')
                            .map((p: string) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        {app.customerName}
                      </th>
                      <td>{app.phoneNumber}</td>
                      <td>{app.carModel || '—'}</td>
                      <td>{app.service}</td>
                      <td className="appointment-date-cell">
                        {app.preferredDate || 'Flexible'} {app.preferredTime ? `· ${app.preferredTime}` : ''}
                      </td>
                      <td>
                        <span className={`appointment-status appointment-status--${(app.status || 'pending').toLowerCase()}`}>
                          {app.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
