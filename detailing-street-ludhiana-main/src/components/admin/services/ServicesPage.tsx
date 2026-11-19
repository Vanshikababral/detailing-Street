'use client';

import { useEffect, useState, useMemo } from 'react';
import { Icon } from '../dashboard/Icon';

interface ServiceRecord {
  _id: string;
  serviceId: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  durationMinutes: number;
  status: 'Active' | 'Inactive';
}

const emptyForm = {
  name: '',
  category: 'Paint Protection',
  description: '',
  price: 0,
  durationMinutes: 60,
  status: 'Active',
};

export function ServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not load services.');
      }
      setServices(data.services || []);
      setError('');
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Could not load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/services', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...formData, _id: editingId } : formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not save this service.');
      }
      setShowAddModal(false);
      setEditingId(null);
      setFormData(emptyForm);
      await fetchServices();
    } catch (err) {
      console.error('Failed to create service:', err);
      setError(err instanceof Error ? err.message : 'Could not save this service.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedDefaults: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not add the default service catalog.');
      }
      setServices(data.services || []);
    } catch (err) {
      console.error('Failed to add default services:', err);
      setError(err instanceof Error ? err.message : 'Could not add the default service catalog.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (service: ServiceRecord) => {
    const newStatus = service.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: service._id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) =>
          prev.map((s) => (s._id === service._id ? { ...s, status: newStatus } : s))
        );
      }
    } catch (err) {
      console.error('Failed to toggle service status:', err);
    }
  };

  const handleEdit = (service: ServiceRecord) => {
    setEditingId(service._id);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || '',
      price: service.price || 0,
      durationMinutes: service.durationMinutes || 0,
      status: service.status,
    });
    setError('');
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not delete this service.');
      }
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error('Failed to delete service:', err);
      setError(err instanceof Error ? err.message : 'Could not delete this service.');
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return services.filter(
      (s) =>
        !searchQuery ||
        s.name?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.serviceId?.toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  return (
    <div className="services-management">
      <header className="dashboard-header customers-header">
        <div>
          <span className="dashboard-kicker">Database</span>
          <h1 className="dashboard-title">Services</h1>
          <p className="dashboard-subtitle">
            Live catalog of services configured in MongoDB Atlas.
          </p>
        </div>
        <button className="admin-primary-button" onClick={() => setShowAddModal(true)}>
          + Add Service
        </button>
      </header>

      {error && (
        <p className="admin-inline-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-search-row">
        <input
          className="admin-search-input"
          type="text"
          placeholder="Search services by name, category, ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div aria-live="polite" className="admin-state admin-state--loading">
          Loading services from MongoDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-state admin-state--empty">
          <p className="admin-state-title">
            {services.length === 0 ? 'No services configured in database.' : 'No services match this search.'}
          </p>
          <p className="admin-state-description">
            {services.length === 0
              ? 'Add the starter catalog with prices left unset, or create your own services.'
              : 'Try another search or clear the current search.'}
          </p>
          {services.length === 0 ? (
            <button
              className="admin-primary-button"
              disabled={saving}
              onClick={handleSeedDefaults}
            >
              {saving ? 'Adding services…' : 'Add default services'}
            </button>
          ) : (
            <button
              className="admin-secondary-button"
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="appointments-table-wrap">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Service ID</th>
                <th>Service Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s._id}>
                  <td>
                    <span className="booking-id-tag">{s.serviceId}</span>
                  </td>
                  <td>
                    <strong>{s.name}</strong>
                    {s.description && (
                      <div className="service-description">{s.description}</div>
                    )}
                  </td>
                  <td>{s.category}</td>
                  <td>{Number(s.price || 0) > 0 ? `₹${Number(s.price).toLocaleString('en-IN')}` : 'Not set'}</td>
                  <td>{Number(s.durationMinutes || 0) > 0 ? `${s.durationMinutes} mins` : 'Not set'}</td>
                  <td>
                    <button
                      type="button"
                      title={`Click to switch to ${s.status === 'Active' ? 'Inactive' : 'Active'}`}
                      className={`service-status-badge service-status-badge--${s.status.toLowerCase()} service-status-badge--btn`}
                      onClick={() => handleToggleStatus(s)}
                    >
                      {s.status}
                    </button>
                  </td>
                  <td>
                    <button className="admin-table-action" onClick={() => handleEdit(s)}>
                      Edit
                    </button>
                    <button className="admin-table-action" onClick={() => handleDelete(s._id)}>
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
            <h2 className="admin-modal-title">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
            <form className="admin-form" onSubmit={handleSaveService}>
              <div className="admin-form-field">
                <label>Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PPF Front Bumper"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="admin-form-control"
                />
              </div>
              <div className="admin-form-field">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="admin-form-control"
                >
                  <option value="Paint Protection">Paint Protection (PPF)</option>
                  <option value="Ceramic Coating">Ceramic Coating</option>
                  <option value="Detailing & Wash">Detailing & Wash</option>
                  <option value="Vinyl Wraps">Vinyl Wraps</option>
                  <option value="Window Tinting">Window Tinting</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other / Consultation</option>
                </select>
              </div>
              <div className="admin-form-field">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                  className="admin-form-control"
                >
                  <option value="Active">Active (Available for booking)</option>
                  <option value="Inactive">Inactive (Temporarily paused)</option>
                </select>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-field">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="admin-form-control"
                  />
                </div>
                <div className="admin-form-field">
                  <label>Duration (mins)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="admin-form-control"
                  />
                </div>
              </div>
              <div className="admin-form-field">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="admin-form-control"
                />
              </div>
              <div className="admin-form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                    setFormData(emptyForm);
                  }}
                  className="admin-secondary-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-primary-button"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
