'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { customerDataNotice, initialCustomers } from '../../data/customers-data';
import {
  getVehicleServiceStatus,
  initialVehicles,
  vehicleDataNotice,
  vehicleMetrics,
  vehicleTypes,
  type Vehicle,
  type VehicleFormValues,
  type VehicleServiceStatus,
  type VehicleType,
} from '../../data/vehicles-data';
import { Icon } from '../dashboard/Icon';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const vehicleDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

type VehicleModalMode = 'details' | 'add' | 'edit' | 'delete';
type VehicleStatusFilter = 'All statuses' | VehicleServiceStatus;
type VehicleSort = 'registration' | 'model' | 'service';

const emptyFormValues: VehicleFormValues = {
  registration: '',
  make: '',
  model: '',
  type: 'Other',
  ownerId: '',
  notes: '',
};

const vehicleCsvColumns: { label: string; value: (vehicle: Vehicle) => string }[] = [
  { label: 'Registration Number', value: (vehicle) => vehicle.registration },
  { label: 'Make', value: (vehicle) => vehicle.make },
  { label: 'Model', value: (vehicle) => vehicle.model },
  { label: 'Vehicle Type', value: (vehicle) => vehicle.type },
  { label: 'Owner', value: (vehicle) => vehicle.ownerName },
  { label: 'Owner ID', value: (vehicle) => vehicle.ownerId },
  { label: 'Last Service', value: (vehicle) => vehicle.lastServiced },
  { label: 'Service Count', value: (vehicle) => String(vehicle.serviceHistory.length) },
  { label: 'Total Spent (INR)', value: (vehicle) => String(vehicle.serviceHistory.reduce((total, visit) => total + visit.amount, 0)) },
  { label: 'Service Status', value: (vehicle) => getVehicleServiceStatus(vehicle.lastServiced) },
];

function normalizeRegistration(registration: string) {
  return registration.toUpperCase().replace(/[\s-]/g, '');
}

function isValidRegistration(registration: string) {
  const normalized = normalizeRegistration(registration);
  return /^(?:[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}|\d{2}BH\d{4}[A-Z]{1,2})$/.test(normalized);
}

function formatVehicleDate(date: string) {
  if (!date) return 'Never serviced';
  return vehicleDateFormatter.format(new Date(`${date}T12:00:00`));
}

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function getLocalDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function vehicleFormError(values: VehicleFormValues, vehicles: Vehicle[], currentVehicleId: string | null) {
  if (!isValidRegistration(values.registration)) {
    return 'Enter a valid Indian registration, such as PB10AB1234 or 22BH1234AA.';
  }
  const registration = normalizeRegistration(values.registration);
  if (vehicles.some((vehicle) => vehicle.id !== currentVehicleId && vehicle.registration === registration)) {
    return 'That registration number is already in this sample directory.';
  }
  if (!values.make.trim()) return 'Enter the vehicle make.';
  if (!values.model.trim()) return 'Enter the vehicle model.';
  if (!values.ownerId || !initialCustomers.some((customer) => customer.id === values.ownerId)) {
    return 'Select an owner from the sample Customers directory.';
  }
  return '';
}

function VehicleStatusBadge({ status }: { status: VehicleServiceStatus }) {
  const modifier = status.toLowerCase().replaceAll(' ', '-');
  return <span className={`vehicle-status-badge vehicle-status-badge--${modifier}`}>{status}</span>;
}

function VehicleModal({
  mode,
  vehicle,
  values: initialValues,
  vehicles,
  onClose,
  onSave,
  onDelete,
  onEdit,
}: {
  mode: VehicleModalMode;
  vehicle: Vehicle | null;
  values: VehicleFormValues;
  vehicles: Vehicle[];
  onClose: () => void;
  onSave: (values: VehicleFormValues) => string;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const [values, setValues] = useState(initialValues);
  const [validationError, setValidationError] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const isForm = mode === 'add' || mode === 'edit';

  useEffect(() => {
    if (mode === 'delete') cancelDeleteRef.current?.focus();
    else closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      } else if (event.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, onClose]);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = vehicleFormError(values, vehicles, vehicle?.id ?? null);
    if (error) {
      setValidationError(error);
      return;
    }

    const saveError = onSave({
      ...values,
      registration: normalizeRegistration(values.registration),
      make: values.make.trim(),
      model: values.model.trim(),
      notes: values.notes.trim(),
    });
    setValidationError(saveError);
  }

  const title = mode === 'add'
    ? 'Add vehicle'
    : mode === 'edit'
      ? 'Edit vehicle'
      : mode === 'delete'
        ? 'Delete vehicle?'
        : 'Vehicle details';

  return (
    <div
      className="appointment-modal-backdrop vehicle-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="vehicle-dialog-title"
        aria-modal="true"
        className="appointment-modal vehicle-modal"
        ref={modalRef}
        role={mode === 'delete' ? 'alertdialog' : 'dialog'}
      >
        <header className="appointment-modal-header">
          <div>
            <span className="appointment-modal-kicker">{mode === 'add' ? 'VEHICLE DIRECTORY' : vehicle?.id}</span>
            <h2 id="vehicle-dialog-title">{title}</h2>
          </div>
          <button
            aria-label="Close vehicle dialog"
            className="appointment-modal-close"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <Icon name="close" />
          </button>
        </header>

        {isForm && (
          <form className="vehicle-form" noValidate onSubmit={submitForm}>
            <p className="vehicle-form-preview-note">Preview only — changes are not saved to the database.</p>
            <label className="customer-form-field">
              <span>Registration number <i>*</i></span>
              <input
                autoCapitalize="characters"
                autoComplete="off"
                maxLength={16}
                onChange={(event) => setValues((current) => ({ ...current, registration: event.target.value }))}
                placeholder="e.g. PB10AB1234"
                required
                value={values.registration}
              />
            </label>
            <div className="vehicle-form-two-column">
              <label className="customer-form-field">
                <span>Make <i>*</i></span>
                <input
                  autoComplete="off"
                  maxLength={50}
                  onChange={(event) => setValues((current) => ({ ...current, make: event.target.value }))}
                  placeholder="e.g. Hyundai"
                  required
                  value={values.make}
                />
              </label>
              <label className="customer-form-field">
                <span>Model <i>*</i></span>
                <input
                  autoComplete="off"
                  maxLength={60}
                  onChange={(event) => setValues((current) => ({ ...current, model: event.target.value }))}
                  placeholder="e.g. Creta"
                  required
                  value={values.model}
                />
              </label>
            </div>
            <div className="vehicle-form-two-column">
              <label className="customer-form-field">
                <span>Vehicle type <i>*</i></span>
                <select
                  onChange={(event) => setValues((current) => ({ ...current, type: event.target.value as VehicleType }))}
                  required
                  value={values.type}
                >
                  {vehicleTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="customer-form-field">
                <span>Owner / customer <i>*</i></span>
                <select
                  onChange={(event) => setValues((current) => ({ ...current, ownerId: event.target.value }))}
                  required
                  value={values.ownerId}
                >
                  <option value="">Select a sample customer</option>
                  {initialCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name} · {customer.id}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="customer-form-field">
              <span>Notes <small>Optional</small></span>
              <textarea
                maxLength={300}
                onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Preferences or other helpful notes"
                rows={3}
                value={values.notes}
              />
            </label>
            {validationError && <p className="customer-form-error" role="alert">{validationError}</p>}
            <div className="customer-dialog-actions">
              <button className="appointment-secondary-button" onClick={onClose} type="button">Discard</button>
              <button className="appointments-new-button" type="submit">
                {mode === 'add' ? 'Add vehicle' : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        {mode === 'details' && vehicle && (
          <VehicleDetails
            onClose={onClose}
            onEdit={onEdit}
            vehicle={vehicle}
          />
        )}

        {mode === 'delete' && vehicle && (
          <div className="appointment-cancel-confirmation">
            <p>
              Remove the fictional vehicle <strong>{vehicle.registration}</strong> from this page preview?
              This action cannot be undone, but does not affect a database.
            </p>
            <div className="appointment-modal-actions">
              <button
                className="appointment-secondary-button"
                onClick={onClose}
                ref={cancelDeleteRef}
                type="button"
              >
                Keep vehicle
              </button>
              <button className="appointment-danger-button" onClick={onDelete} type="button">
                Delete vehicle
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function VehicleDetails({
  vehicle,
  onClose,
  onEdit,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  onEdit: () => void;
}) {
  const owner = initialCustomers.find((customer) => customer.id === vehicle.ownerId);
  const totalSpent = vehicle.serviceHistory.reduce((total, record) => total + record.amount, 0);

  return (
    <div className="vehicle-details">
      <div className="vehicle-detail-identity">
        <span aria-hidden="true" className="vehicle-detail-mark"><Icon name="car" /></span>
        <div>
          <strong>{vehicle.make} {vehicle.model}</strong>
          <span>{vehicle.registration} <i /> <VehicleStatusBadge status={getVehicleServiceStatus(vehicle.lastServiced)} /></span>
        </div>
      </div>
      <div className="vehicle-detail-grid">
        <div><span>Owner</span><strong>{vehicle.ownerName}</strong></div>
        <div><span>Customer ID</span><strong>{vehicle.ownerId}</strong></div>
        <div><span>Phone number</span><strong>{owner?.phone ?? '—'}</strong></div>
        <div><span>Vehicle type</span><strong>{vehicle.type}</strong></div>
        <div><span>Last service</span><strong>{formatVehicleDate(vehicle.lastServiced)}</strong></div>
        <div><span>Total visits</span><strong>{vehicle.serviceHistory.length}</strong></div>
        <div><span>Total spent</span><strong>{inrFormatter.format(totalSpent)}</strong></div>
      </div>
      <section className="vehicle-history-section" aria-labelledby="vehicle-history-title">
        <div className="vehicle-history-heading">
          <h3 id="vehicle-history-title">Service history</h3>
          <span>{vehicle.serviceHistory.length}</span>
        </div>
        {vehicle.serviceHistory.length ? (
          <ul className="vehicle-history-list">
            {vehicle.serviceHistory.map((record, index) => (
              <li key={`${record.date}-${record.service}-${index}`}>
                <span className="customer-visit-dot" />
                <span className="customer-record-main">
                  <strong>{record.service}</strong>
                  <span>{formatVehicleDate(record.date)}</span>
                </span>
                <strong className="customer-visit-amount">{inrFormatter.format(record.amount)}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="customer-detail-empty">No service visits are recorded for this sample vehicle.</p>
        )}
      </section>
      {vehicle.notes && (
        <div className="customer-notes">
          <span>Notes</span>
          <p>{vehicle.notes}</p>
        </div>
      )}
      <p className="appointment-modal-notice">{vehicleDataNotice}</p>
      <div className="customer-dialog-actions">
        <button className="appointment-secondary-button" onClick={onClose} type="button">Close</button>
        <button className="customer-edit-button" onClick={onEdit} type="button">
          <Icon name="edit" /> Edit vehicle
        </button>
      </div>
    </div>
  );
}

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [statusFilter, setStatusFilter] = useState<VehicleStatusFilter>('All statuses');
  const [sort, setSort] = useState<VehicleSort>('registration');
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<VehicleModalMode | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [formValues, setFormValues] = useState<VehicleFormValues>(emptyFormValues);
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);
  const nextIdRef = useRef(1);
  const closeDialog = useCallback(() => {
    setModalMode(null);
    dialogTriggerRef.current?.focus();
  }, []);

  const visibleVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return vehicles
      .filter((vehicle) => {
        const matchesQuery =
          !normalizedQuery ||
          vehicle.registration.toLocaleLowerCase().includes(normalizedQuery.replace(/[\s-]/g, '')) ||
          `${vehicle.make} ${vehicle.model}`.toLocaleLowerCase().includes(normalizedQuery) ||
          vehicle.ownerName.toLocaleLowerCase().includes(normalizedQuery);
        const matchesType = typeFilter === 'All types' || vehicle.type === typeFilter;
        const matchesStatus = statusFilter === 'All statuses' ||
          getVehicleServiceStatus(vehicle.lastServiced) === statusFilter;
        return matchesQuery && matchesType && matchesStatus;
      })
      .sort((first, second) => {
        if (sort === 'model') {
          return `${first.make} ${first.model}`.localeCompare(`${second.make} ${second.model}`);
        }
        if (sort === 'service') return second.lastServiced.localeCompare(first.lastServiced);
        return first.registration.localeCompare(second.registration);
      });
  }, [query, sort, statusFilter, typeFilter, vehicles]);

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId) ?? null;
  const hasFilters = query !== '' || typeFilter !== 'All types' ||
    statusFilter !== 'All statuses' || sort !== 'registration';

  function clearFilters() {
    setQuery('');
    setTypeFilter('All types');
    setStatusFilter('All statuses');
    setSort('registration');
    searchRef.current?.focus();
  }

  function openModal(mode: VehicleModalMode, vehicle: Vehicle | null, trigger: HTMLButtonElement | null) {
    dialogTriggerRef.current = trigger;
    setActiveVehicleId(vehicle?.id ?? null);
    setFormValues(vehicle
      ? {
          registration: vehicle.registration,
          make: vehicle.make,
          model: vehicle.model,
          type: vehicle.type,
          ownerId: vehicle.ownerId,
          notes: vehicle.notes,
        }
      : emptyFormValues);
    setModalMode(mode);
  }

  function saveVehicle(values: VehicleFormValues) {
    const duplicate = vehicles.find((vehicle) =>
      vehicle.id !== selectedVehicle?.id &&
      vehicle.registration === values.registration,
    );
    if (duplicate) return 'That registration number is already in this sample directory.';

    const owner = initialCustomers.find((customer) => customer.id === values.ownerId);
    if (!owner) return 'Select an owner from the sample Customers directory.';

    if (modalMode === 'add') {
      const vehicle: Vehicle = {
        ...values,
        id: `VEH-LOCAL-${String(nextIdRef.current).padStart(3, '0')}`,
        ownerName: owner.name,
        lastServiced: '',
        serviceHistory: [],
      };
      nextIdRef.current += 1;
      setVehicles((current) => [...current, vehicle]);
      setAnnouncement(`${vehicle.registration} was added to this local preview.`);
      setQuery('');
      setTypeFilter('All types');
      setStatusFilter('All statuses');
      setSort('registration');
      setActiveVehicleId(vehicle.id);
      setModalMode('details');
      return '';
    }

    if (!selectedVehicle) return 'Select a vehicle to edit.';
    setVehicles((current) => current.map((vehicle) => vehicle.id === selectedVehicle.id
      ? { ...vehicle, ...values, ownerName: owner.name }
      : vehicle));
    setAnnouncement(`${values.registration} was updated in this local preview.`);
    setActiveVehicleId(selectedVehicle.id);
    setModalMode('details');
    return '';
  }

  function deleteVehicle() {
    if (!selectedVehicle) return;
    const registration = selectedVehicle.registration;
    setVehicles((current) => current.filter((vehicle) => vehicle.id !== selectedVehicle.id));
    setAnnouncement(`${registration} was removed from this local preview.`);
    setModalMode(null);
    dialogTriggerRef.current?.focus();
  }

  function exportVehicles() {
    const lines = [
      vehicleCsvColumns.map(({ label }) => escapeCsvValue(label)).join(','),
      ...visibleVehicles.map((vehicle) =>
        vehicleCsvColumns.map(({ value }) => escapeCsvValue(value(vehicle))).join(','),
      ),
    ];
    const file = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `detailing-street-vehicles-${getLocalDate()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setAnnouncement(`Exported ${visibleVehicles.length} filtered vehicle records as a CSV file.`);
  }

  return (
    <div className="vehicles-page">
      <header className="vehicles-page-header">
        <div className="vehicles-page-heading">
          <span className="vehicles-page-eyebrow">DETAILING STREET <i /> LUDHIANA</span>
          <h1>Vehicles</h1>
          <p>Manage customer vehicles and their detailing history.</p>
          <p className="vehicles-demo-note">{vehicleDataNotice}</p>
        </div>
        <div className="vehicles-header-actions">
          <button
            className="appointments-export-button"
            disabled={!visibleVehicles.length}
            onClick={exportVehicles}
            type="button"
          >
            <Icon name="download" />
            Export CSV
          </button>
          <button
            className="appointments-new-button"
            onClick={(event) => openModal('add', null, event.currentTarget)}
            type="button"
          >
            <span aria-hidden="true">+</span>
            Add Vehicle
          </button>
        </div>
      </header>

      <p className="vehicles-preview-banner" role="note">
        <span aria-hidden="true" />
        Preview mode — vehicle edits are local to this page and are not saved to a database.
      </p>

      <section aria-label="Vehicle metrics, demonstration data" className="vehicles-summary-grid">
        {vehicleMetrics.map((metric, index) => (
          <article className={`appointments-summary-card vehicles-summary-card--${index}`} key={metric.label}>
            <div className="appointments-summary-top">
              <span>{metric.label}</span>
              <span className="appointments-summary-icon"><Icon name={metric.icon} /></span>
            </div>
            <strong>{metric.value}</strong>
            <span className="appointments-summary-caption">Demonstration metric</span>
          </article>
        ))}
      </section>

      <section aria-labelledby="vehicles-list-title" className="appointments-list-panel vehicles-list-panel">
        <div className="appointments-list-header">
          <div>
            <span className="appointments-section-kicker">VEHICLE DIRECTORY</span>
            <h2 id="vehicles-list-title">All Vehicles</h2>
            <p>Showing {visibleVehicles.length} of {vehicles.length} linked sample records</p>
          </div>
          <button
            className="appointments-clear-button"
            disabled={!hasFilters}
            onClick={clearFilters}
            type="button"
          >
            Clear filters
          </button>
        </div>

        <div className="vehicles-toolbar">
          <label className="appointments-search">
            <Icon name="search" />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search registration, make, model, or owner"
              ref={searchRef}
              type="search"
              value={query}
            />
          </label>
          <label className="appointments-filter">
            <span>Type</span>
            <select
              aria-label="Filter vehicles by type"
              onChange={(event) => setTypeFilter(event.target.value)}
              value={typeFilter}
            >
              <option>All types</option>
              {vehicleTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="appointments-filter">
            <span>Service</span>
            <select
              aria-label="Filter vehicles by service status"
              onChange={(event) => setStatusFilter(event.target.value as VehicleStatusFilter)}
              value={statusFilter}
            >
              <option>All statuses</option>
              <option>Recently Serviced</option>
              <option>Due for Service</option>
              <option>Never Serviced</option>
            </select>
          </label>
          <label className="appointments-filter">
            <span>Sort by</span>
            <select
              aria-label="Sort vehicles"
              onChange={(event) => setSort(event.target.value as VehicleSort)}
              value={sort}
            >
              <option value="registration">Registration</option>
              <option value="model">Make / Model</option>
              <option value="service">Last service</option>
            </select>
          </label>
        </div>

        {visibleVehicles.length ? (
          <div className="vehicles-table-scroll" role="region" aria-label="Vehicle list table" tabIndex={0}>
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th scope="col">Registration Number</th>
                  <th scope="col">Vehicle</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Vehicle Type</th>
                  <th scope="col">Last Service</th>
                  <th scope="col">Service Count</th>
                  <th scope="col">Total Spent</th>
                  <th scope="col">Service Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleVehicles.map((vehicle) => {
                  const totalSpent = vehicle.serviceHistory.reduce((total, record) => total + record.amount, 0);
                  return (
                    <tr key={vehicle.id}>
                      <td className="vehicle-registration-cell">
                        <span className="vehicle-registration-mark"><Icon name="car" /></span>
                        {vehicle.registration}
                      </td>
                      <td>
                        <span className="vehicle-model-cell">
                          <strong>{vehicle.make} {vehicle.model}</strong>
                          <span>{vehicle.make}</span>
                        </span>
                      </td>
                      <td>
                        <span className="vehicle-owner-cell">
                          <strong>{vehicle.ownerName}</strong>
                          <span>{vehicle.ownerId}</span>
                        </span>
                      </td>
                      <td><span className="vehicle-type-label">{vehicle.type}</span></td>
                      <td>{formatVehicleDate(vehicle.lastServiced)}</td>
                      <td>{vehicle.serviceHistory.length}</td>
                      <td className="vehicle-spend-cell">{inrFormatter.format(totalSpent)}</td>
                      <td><VehicleStatusBadge status={getVehicleServiceStatus(vehicle.lastServiced)} /></td>
                      <td>
                        <div className="customer-row-actions">
                          <button
                            aria-label={`View details for ${vehicle.registration}`}
                            className="customer-row-button"
                            onClick={(event) => openModal('details', vehicle, event.currentTarget)}
                            title="View details"
                            type="button"
                          >
                            <Icon name="eye" />
                          </button>
                          <button
                            aria-label={`Edit ${vehicle.registration}`}
                            className="customer-row-button"
                            onClick={(event) => openModal('edit', vehicle, event.currentTarget)}
                            title="Edit vehicle"
                            type="button"
                          >
                            <Icon name="edit" />
                          </button>
                          <button
                            aria-label={`Delete ${vehicle.registration}`}
                            className="customer-row-button customer-row-button--danger"
                            onClick={(event) => openModal('delete', vehicle, event.currentTarget)}
                            title="Delete vehicle"
                            type="button"
                          >
                            <Icon name="trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="appointments-empty-state">
            <span className="appointments-empty-icon"><Icon name="filter" /></span>
            <h3>No vehicles found</h3>
            <p>Try a different search or filter, or clear the current filters.</p>
            <button className="appointments-clear-button" onClick={clearFilters} type="button">Clear filters</button>
          </div>
        )}
        <p className="appointments-table-footer">Fictional local preview records · Not connected to vehicle data services</p>
      </section>

      <p aria-live="polite" className="appointments-live-announcement">{announcement}</p>

      {modalMode && (
        <VehicleModal
          mode={modalMode}
          onClose={closeDialog}
          onDelete={deleteVehicle}
          onEdit={() => {
            if (!selectedVehicle) return;
            setFormValues({
              registration: selectedVehicle.registration,
              make: selectedVehicle.make,
              model: selectedVehicle.model,
              type: selectedVehicle.type,
              ownerId: selectedVehicle.ownerId,
              notes: selectedVehicle.notes,
            });
            setModalMode('edit');
          }}
          onSave={saveVehicle}
          values={formValues}
          vehicle={selectedVehicle}
          vehicles={vehicles}
        />
      )}
    </div>
  );
}
