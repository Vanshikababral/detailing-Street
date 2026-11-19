'use client';

import { useEffect, useState, useMemo } from 'react';
import { Icon } from '../dashboard/Icon';

export function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({ name: '', phone: '', email: '', notes: '' });
        fetchCustomers();
      }
    } catch (err) {
      console.error('Failed to create customer:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await fetch(`/api/admin/customers?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCustomers((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        !searchQuery ||
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.customerId?.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  return (
    <div className="customers-management">
      <header className="dashboard-header customers-header">
        <div>
          <span className="dashboard-kicker">Database</span>
          <h1 className="dashboard-title">Customers</h1>
          <p className="dashboard-subtitle">
            Live customer records stored in MongoDB Atlas.
          </p>
        </div>
        <button className="admin-primary-button" onClick={() => setShowAddModal(true)}>
          + Add Customer
        </button>
      </header>

      <div className="admin-search-row">
        <input
          className="admin-search-input"
          type="text"
          placeholder="Search customers by name, phone, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div aria-live="polite" className="admin-state admin-state--loading">
          Loading customers from MongoDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-state admin-state--empty">
          <p className="admin-state-title">
            No customers found in database.
          </p>
          <p className="admin-state-description">
            Add customers using the &quot;+ Add Customer&quot; button above.
          </p>
        </div>
      ) : (
        <div className="appointments-table-wrap">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Total Visits</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td>
                    <span className="booking-id-tag">{c.customerId}</span>
                  </td>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.totalVisits || 0}</td>
                  <td>
                    <span className={`customer-type-badge${c.type === 'VIP' ? ' customer-type-badge--vip' : ''}`}>
                      {c.type || 'New'}
                    </span>
                  </td>
                  <td>
                    <button className="admin-table-action" onClick={() => handleDelete(c._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h2 className="admin-modal-title">Add New Customer</h2>
            <form className="admin-form" onSubmit={handleAddCustomer}>
              <div className="admin-form-field">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="admin-form-control"
                />
              </div>
              <div className="admin-form-field">
                <label>Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="admin-form-control"
                />
              </div>
              <div className="admin-form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="admin-form-control"
                />
              </div>
              <div className="admin-form-field">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="admin-form-control"
                />
              </div>
              <div className="admin-form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="admin-secondary-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-button"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
