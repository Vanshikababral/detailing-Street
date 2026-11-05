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
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="dashboard-kicker">DATABASE</span>
          <h1 className="dashboard-title">Services</h1>
          <p className="dashboard-subtitle">
            Live catalog of services configured in MongoDB Atlas.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: '#E31C1C',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          + Add Service
        </button>
      </header>

      {error && (
        <p role="alert" style={{ color: '#fca5a5', marginTop: '1rem' }}>
          {error}
        </p>
      )}

      <div style={{ margin: '1.5rem 0' }}>
        <input
          type="text"
          placeholder="Search services by name, category, ID..."
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
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
          Loading services from MongoDB...
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
            {services.length === 0 ? 'No services configured in database.' : 'No services match this search.'}
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            {services.length === 0
              ? 'Add the starter catalog with prices left unset, or create your own services.'
              : 'Try another search or clear the current search.'}
          </p>
          {services.length === 0 ? (
            <button
              disabled={saving}
              onClick={handleSeedDefaults}
              style={{
                marginTop: '1rem',
                background: '#E31C1C',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1rem',
                borderRadius: '6px',
                cursor: saving ? 'wait' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {saving ? 'Adding services…' : 'Add default services'}
            </button>
          ) : (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                marginTop: '1rem',
                background: 'transparent',
                color: '#fff',
                border: '1px solid #555',
                padding: '0.65rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
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
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{s.description}</div>
                    )}
                  </td>
                  <td>{s.category}</td>
                  <td>{Number(s.price || 0) > 0 ? `₹${Number(s.price).toLocaleString('en-IN')}` : 'Not set'}</td>
                  <td>{Number(s.durationMinutes || 0) > 0 ? `${s.durationMinutes} mins` : 'Not set'}</td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        background: s.status === 'Active' ? '#22c55e20' : '#ef444420',
                        color: s.status === 'Active' ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(s)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#d1d5db',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        marginRight: '0.75rem',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
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

      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#141414',
              padding: '2rem',
              borderRadius: '8px',
              border: '1px solid #333',
              maxWidth: '450px',
              width: '100%',
            }}
          >
            <h2 style={{ marginBottom: '1.2rem', color: '#fff' }}>{editingId ? 'Edit Service' : 'Add New Service'}</h2>
            <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: '#aaa' }}>Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PPF Front Bumper"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: '#aaa' }}>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
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
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: '#aaa' }}>Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: '#aaa' }}>Duration (mins)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: '#aaa' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', minHeight: '60px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                    setFormData(emptyForm);
                  }}
                  style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '0.6rem 1.2rem', background: '#E31C1C', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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
