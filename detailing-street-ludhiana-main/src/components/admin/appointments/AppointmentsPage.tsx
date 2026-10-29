'use client';

import { useEffect, useState, useMemo } from 'react';
import { Icon } from '../dashboard/Icon';

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/appointments');
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments((prev) =>
          prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const res = await fetch(`/api/admin/appointments?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setAppointments((prev) => prev.filter((app) => app._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete appointment:', err);
    }
  };

  const filtered = useMemo(() => {
    return appointments.filter((app) => {
      const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        app.customerName?.toLowerCase().includes(q) ||
        app.phoneNumber?.includes(q) ||
        app.bookingId?.toLowerCase().includes(q) ||
        app.service?.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [appointments, filterStatus, searchQuery]);

  return (
    <div className="appointments-management">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">MANAGEMENT</span>
          <h1 className="dashboard-title">Appointments</h1>
          <p className="dashboard-subtitle">
            Live appointments connected directly to MongoDB Atlas.
          </p>
        </div>
      </header>

      {/* Filter and search toolbar */}
      <div className="filter-toolbar" style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by customer, phone, ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: '#141414',
            border: '1px solid #2a2a2a',
            padding: '0.6rem 1rem',
            color: '#fff',
            borderRadius: '6px',
            minWidth: '280px',
          }}
        />

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: filterStatus === st ? '#E31C1C' : '#2a2a2a',
                background: filterStatus === st ? '#E31C1C' : '#141414',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
          Loading appointments from MongoDB Atlas...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            background: '#141414',
            borderRadius: '8px',
            border: '1px dashed #333',
            color: '#888',
          }}
        >
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>
            No appointments found in database.
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            Bookings made by customers on the website will be listed here automatically.
          </p>
        </div>
      ) : (
        <div className="appointments-table-wrap">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app._id}>
                  <td>
                    <span className="booking-id-tag">{app.bookingId}</span>
                  </td>
                  <td>
                    <strong>{app.customerName}</strong>
                    {app.email && (
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{app.email}</div>
                    )}
                  </td>
                  <td>{app.phoneNumber}</td>
                  <td>{app.carModel || '—'}</td>
                  <td>{app.service}</td>
                  <td>
                    {app.preferredDate || '—'}
                    {app.preferredTime && (
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{app.preferredTime}</div>
                    )}
                  </td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value as AppointmentStatus)}
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        color:
                          app.status === 'Confirmed'
                            ? '#22c55e'
                            : app.status === 'Pending'
                            ? '#eab308'
                            : app.status === 'Completed'
                            ? '#3b82f6'
                            : '#ef4444',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(app._id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                      title="Delete appointment"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
