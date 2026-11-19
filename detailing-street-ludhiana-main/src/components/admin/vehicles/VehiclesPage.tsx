'use client';

import { useEffect, useState, useMemo } from 'react';
import { Icon } from '../dashboard/Icon';

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    registration: '',
    make: '',
    model: '',
    type: 'Sedan',
    ownerName: '',
    notes: '',
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/vehicles');
      const data = await res.json();
      if (data.success) {
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({ registration: '', make: '', model: '', type: 'Sedan', ownerName: '', notes: '' });
        fetchVehicles();
      }
    } catch (err) {
      console.error('Failed to create vehicle:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const res = await fetch(`/api/admin/vehicles?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setVehicles((prev) => prev.filter((v) => v._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return vehicles.filter(
      (v) =>
        !searchQuery ||
        v.registration?.toLowerCase().includes(q) ||
        v.make?.toLowerCase().includes(q) ||
        v.model?.toLowerCase().includes(q) ||
        v.ownerName?.toLowerCase().includes(q)
    );
  }, [vehicles, searchQuery]);

  return (
    <div className="vehicles-management">
      <header className="dashboard-header customers-header">
        <div>
          <span className="dashboard-kicker">Database</span>
          <h1 className="dashboard-title">Vehicles</h1>
          <p className="dashboard-subtitle">
            Live vehicle records stored in MongoDB Atlas.
          </p>
        </div>
        <button className="admin-primary-button" onClick={() => setShowAddModal(true)}>
          + Add Vehicle
        </button>
      </header>

      <div className="admin-search-row">
        <input
          className="admin-search-input"
          type="text"
          placeholder="Search by registration number, make, model, owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div aria-live="polite" className="admin-state admin-state--loading">
          Loading vehicles from MongoDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-state admin-state--empty">
          <p className="admin-state-title">
            No vehicles registered yet.
          </p>
          <p className="admin-state-description">
            Add vehicles using the &quot;+ Add Vehicle&quot; button above.
          </p>
        </div>
      ) : (
        <div className="appointments-table-wrap">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Make & Model</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Services</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v._id}>
                  <td>
                    <span className="booking-id-tag">{v.registration}</span>
                  </td>
                  <td>
                    <strong>{v.make} {v.model}</strong>
                  </td>
                  <td>{v.type}</td>
                  <td>{v.ownerName}</td>
                  <td>{v.serviceCount || 0}</td>
                  <td>
                    <button className="admin-table-action" onClick={() => handleDelete(v._id)}>
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
            <h2 className="admin-modal-title">Add New Vehicle</h2>
            <form className="admin-form" onSubmit={handleAddVehicle}>
              <div className="admin-form-field">
                <label>Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PB10AB1234"
                  value={formData.registration}
                  onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                  className="admin-form-control"
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-field">
                  <label>Make *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BMW"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="admin-form-control"
                  />
                </div>
                <div className="admin-form-field">
                  <label>Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 Series"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="admin-form-control"
                  />
                </div>
              </div>
              <div className="admin-form-field">
                <label>Vehicle Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="admin-form-control"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="admin-form-field">
                <label>Owner Name *</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
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
