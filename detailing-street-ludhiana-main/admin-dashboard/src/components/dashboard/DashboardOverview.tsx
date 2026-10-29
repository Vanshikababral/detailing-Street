'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import {
  bookingTrend,
  dashboardDataNotice,
  dashboardMetrics,
  quickActions,
  recentAppointments,
  upcomingAppointments,
} from '../../data/dashboard-data';

const chart = {
  width: 720,
  height: 250,
  left: 48,
  right: 12,
  top: 14,
  bottom: 40,
  max: 35,
};

const chartPoints = bookingTrend.map((point, index) => {
  const x = chart.left + (index * (chart.width - chart.left - chart.right)) / (bookingTrend.length - 1);
  const y = chart.top + ((chart.max - point.bookings) * (chart.height - chart.top - chart.bottom)) / chart.max;
  return { ...point, x, y };
});

const chartLine = chartPoints.map(({ x, y }) => `${x},${y}`).join(' ');
const chartArea = `${chart.left},${chart.height - chart.bottom} ${chartLine} ${chart.width - chart.right},${chart.height - chart.bottom}`;
const yAxisTicks = [0, 10, 20, 30];

const quickActionDescriptions: Record<string, string> = {
  'New Appointment': 'Appointment creation is not available yet.',
  'Add Customer': 'Customer management is not available yet.',
  'Add Vehicle': 'Vehicle management is not available yet.',
  'Generate Report': 'Report generation is not available yet.',
};

function getLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function DashboardDate() {
  const [date, setDate] = useState<{ iso: string; label: string } | null>(null);

  useEffect(() => {
    const now = new Date();
    setDate({ iso: getLocalDate(now), label: formatLocalDate(now) });
  }, []);

  return (
    <time className="overview-date" dateTime={date?.iso}>
      <Icon name="appointments" />
      {date?.label ?? 'Today'}
    </time>
  );
}

function MetricCard({
  label,
  value,
  trend,
  trendTone,
  icon,
}: (typeof dashboardMetrics)[number]) {
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
          <span className="metric-trend-context">vs last week</span>
        </span>
      </div>
    </article>
  );
}

function BookingTrendsPanel() {
  return (
    <section aria-labelledby="booking-trends-title" className="overview-panel booking-trends-panel">
      <div className="overview-panel-header">
        <div>
          <span className="panel-kicker">ACTIVITY</span>
          <h2 id="booking-trends-title">Booking Trends</h2>
        </div>
        <label className="chart-range">
          <span className="visually-hidden">Booking trends date range</span>
          <select aria-label="Booking trends date range" defaultValue="7" disabled>
            <option value="7">Last 7 days</option>
          </select>
          <Icon name="chevron" />
        </label>
      </div>
      <div className="chart-summary">
        <strong>24</strong>
        <span>bookings today</span>
        <span className="chart-summary-divider" />
        <span className="chart-summary-caption">Sample activity</span>
      </div>
      <div className="booking-chart-wrap">
        <svg
          aria-labelledby="booking-chart-svg-title booking-chart-svg-description"
          className="booking-chart"
          role="img"
          viewBox={`0 0 ${chart.width} ${chart.height}`}
        >
          <title id="booking-chart-svg-title">Daily booking trends for the last seven days</title>
          <desc id="booking-chart-svg-description">
            Sample booking counts from 23 to 29 October: {bookingTrend.map((point) => point.bookings).join(', ')}.
          </desc>
          <defs>
            <linearGradient id="booking-area-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {yAxisTicks.map((tick) => {
            const y = chart.top + ((chart.max - tick) * (chart.height - chart.top - chart.bottom)) / chart.max;
            return (
              <g key={tick}>
                <line
                  className="chart-grid-line"
                  x1={chart.left}
                  x2={chart.width - chart.right}
                  y1={y}
                  y2={y}
                />
                <text className="chart-axis-label" textAnchor="end" x={chart.left - 10} y={y + 3}>
                  {tick}
                </text>
              </g>
            );
          })}
          <polygon className="chart-area" points={chartArea} />
          <polyline className="chart-line" points={chartLine} />
          {chartPoints.map(({ day, bookings, x, y }) => (
            <g key={day}>
              <circle className="chart-point-halo" cx={x} cy={y} r="5" />
              <circle className="chart-point" cx={x} cy={y} r="2.5" />
              <text className="chart-axis-label chart-day-label" textAnchor="middle" x={x} y={chart.height - 13}>
                {day}
              </text>
              <title>{`${day}: ${bookings} bookings`}</title>
            </g>
          ))}
        </svg>
      </div>
      <p className="panel-demo-note">Illustrative seven-day sample · not live booking data</p>
    </section>
  );
}

function AppointmentStatus({ status }: { status: (typeof recentAppointments)[number]['status'] }) {
  return <span className={`appointment-status appointment-status--${status.toLowerCase()}`}>{status}</span>;
}

function RecentAppointmentsPanel() {
  return (
    <section aria-labelledby="recent-appointments-title" className="overview-panel recent-appointments-panel">
      <div className="overview-panel-header">
        <div>
          <span className="panel-kicker">SCHEDULE</span>
          <h2 id="recent-appointments-title">Recent Appointments</h2>
        </div>
        <button
          className="panel-text-action"
          disabled
          title="Appointment pages are not implemented yet."
          type="button"
        >
          View all
          <Icon name="arrow" />
        </button>
      </div>
      <p className="panel-inline-note">Sample appointment records · not connected to live data</p>
      <div className="appointments-table-scroll" role="region" aria-label="Recent appointments table" tabIndex={0}>
        <table className="appointments-table">
          <thead>
            <tr>
              <th scope="col">Customer</th>
              <th scope="col">Service</th>
              <th scope="col">Date &amp; Time</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentAppointments.map((appointment) => (
              <tr key={appointment.customer}>
                <th scope="row">
                  <span className="customer-avatar" aria-hidden="true">
                    {appointment.customer
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </span>
                  {appointment.customer}
                </th>
                <td>{appointment.service}</td>
                <td className="appointment-date-cell">{appointment.dateTime}</td>
                <td><AppointmentStatus status={appointment.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function UpcomingAppointmentsPanel() {
  return (
    <section aria-labelledby="upcoming-title" className="overview-panel upcoming-panel">
      <div className="overview-panel-header">
        <div>
          <span className="panel-kicker">ON THE CALENDAR</span>
          <h2 id="upcoming-title">Upcoming Appointments</h2>
        </div>
        <span className="upcoming-count">{upcomingAppointments.length}</span>
      </div>
      <p className="panel-inline-note">Today · sample schedule</p>
      <ol className="upcoming-list">
        {upcomingAppointments.map((appointment) => (
          <li className="upcoming-item" key={appointment.customer}>
            <time className="upcoming-time">{appointment.time}</time>
            <span aria-hidden="true" className="upcoming-timeline">
              <i />
            </span>
            <div className="upcoming-details">
              <strong>{appointment.customer}</strong>
              <span>{appointment.service}</span>
              <AppointmentStatus status={appointment.status} />
            </div>
            <button
              aria-label={`Details for ${appointment.customer} (not available yet)`}
              className="upcoming-detail-button"
              disabled
              title="Appointment details are not implemented yet."
              type="button"
            >
              <Icon name="arrow" />
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function QuickActionsPanel() {
  return (
    <section aria-labelledby="quick-actions-title" className="overview-panel quick-actions-panel">
      <div className="overview-panel-header">
        <div>
          <span className="panel-kicker">SHORTCUTS</span>
          <h2 id="quick-actions-title">Quick Actions</h2>
        </div>
      </div>
      <p className="quick-actions-note">These actions are placeholders and are not connected yet.</p>
      <div className="quick-actions-list">
        {quickActions.map((action) => (
          <button
            aria-label={`${action.label} (not available yet)`}
            className="quick-action"
            disabled
            key={action.label}
            title={quickActionDescriptions[action.label]}
            type="button"
          >
            <span className="quick-action-icon"><Icon name={action.icon} /></span>
            <span className="quick-action-label">{action.label}</span>
            <span className="quick-action-state">Unavailable</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function DashboardOverview() {
  return (
    <div className="dashboard-overview">
      <header className="overview-header">
        <div className="overview-heading">
          <span className="overview-eyebrow">DETAILING STREET <i /> LUDHIANA</span>
          <h1 id="dashboard-title">Dashboard</h1>
          <p>Welcome back, Admin. Here’s what’s happening with your business today.</p>
          <p className="overview-data-note">{dashboardDataNotice}</p>
        </div>
        <div className="overview-header-actions">
          <DashboardDate />
          <div className="overview-action-group">
            <button
              className="overview-button overview-button--secondary"
              disabled
              title="Reports are not implemented yet."
              type="button"
            >
              <Icon name="reports" />
              View Reports
            </button>
            <button
              className="overview-button overview-button--primary"
              disabled
              title="Appointment creation is not available yet."
              type="button"
            >
              <span aria-hidden="true" className="button-plus">+</span>
              New Appointment
            </button>
          </div>
        </div>
      </header>

      <section aria-label="Business metrics (demonstration data)" className="overview-metrics">
        {dashboardMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <div className="overview-grid">
        <BookingTrendsPanel />
        <UpcomingAppointmentsPanel />
        <RecentAppointmentsPanel />
        <QuickActionsPanel />
      </div>
    </div>
  );
}
