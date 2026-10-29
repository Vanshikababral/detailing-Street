'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { appointmentDataNotice, appointmentServices, appointmentSummaryStatuses, initialAppointments, type Appointment, type AppointmentStatus } from '../../data/appointments-data';
import { Icon } from '../dashboard/Icon';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const appointmentDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const csvColumns: { label: string; value: (appointment: Appointment) => string }[] = [
  { label: 'Booking ID', value: (appointment) => appointment.id },
  { label: 'Customer', value: (appointment) => appointment.customer },
  { label: 'Phone', value: (appointment) => appointment.phone },
  { label: 'Vehicle', value: (appointment) => appointment.vehicle },
  { label: 'Service', value: (appointment) => appointment.service },
  { label: 'Appointment Date', value: (appointment) => appointment.date },
  { label: 'Time', value: (appointment) => appointment.time },
  { label: 'Amount (INR)', value: (appointment) => String(appointment.amount) },
  { label: 'Status', value: (appointment) => appointment.status },
];

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatAppointmentDate(date: string) {
  return appointmentDateFormatter.format(new Date(`${date}T12:00:00`));
}

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`appointment-status appointment-status--${status.toLowerCase()}`}>
      {status}
    </span>
  );
}

function isAppointmentStatus(value: string): value is AppointmentStatus {
  return appointmentSummaryStatuses.some((status) => status === value);
}

type AppointmentFilters = {
  query: string;
  status: string;
  service: string;
  date: string;
};

const emptyFilters: AppointmentFilters = {
  query: '',
  status: 'All statuses',
  service: 'All services',
  date: '',
};

function AppointmentDetailsModal({
  appointment,
  onClose,
  onStatusChange,
  onCancel,
}: {
  appointment: Appointment;
  onClose: () => void;
  onStatusChange: (status: AppointmentStatus) => void;
  onCancel: () => void;
}) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const keepAppointmentRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (confirmingCancel) keepAppointmentRef.current?.focus();
    else closeRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        if (confirmingCancel) setConfirmingCancel(false);
        else onClose();
      } else if (event.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), select:not([disabled])',
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

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [confirmingCancel, onClose]);

  return (
    <div
      className="appointment-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="appointment-dialog-title"
        aria-modal="true"
        className="appointment-modal"
        ref={modalRef}
        role={confirmingCancel ? 'alertdialog' : 'dialog'}
      >
        <header className="appointment-modal-header">
          <div>
            <span className="appointment-modal-kicker">{confirmingCancel ? 'CONFIRM ACTION' : appointment.id}</span>
            <h2 id="appointment-dialog-title">
              {confirmingCancel ? 'Cancel this appointment?' : 'Appointment details'}
            </h2>
          </div>
          <button
            aria-label="Close appointment details"
            className="appointment-modal-close"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <Icon name="close" />
          </button>
        </header>

        {confirmingCancel ? (
          <div className="appointment-cancel-confirmation">
            <p>
              Cancel the demonstration appointment for <strong>{appointment.customer}</strong>?
              This preview change is not saved to the database.
            </p>
            <div className="appointment-modal-actions">
              <button
                className="appointment-secondary-button"
                onClick={() => setConfirmingCancel(false)}
                ref={keepAppointmentRef}
                type="button"
              >
                Keep appointment
              </button>
              <button className="appointment-danger-button" onClick={onCancel} type="button">
                Cancel appointment
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="appointment-detail-grid">
              <div><span>Customer</span><strong>{appointment.customer}</strong></div>
              <div><span>Phone number</span><strong>{appointment.phone}</strong></div>
              <div><span>Vehicle</span><strong>{appointment.vehicle}</strong></div>
              <div><span>Service</span><strong>{appointment.service}</strong></div>
              <div><span>Appointment date</span><strong>{formatAppointmentDate(appointment.date)}</strong></div>
              <div><span>Time</span><strong>{appointment.time}</strong></div>
              <div><span>Amount</span><strong>{inrFormatter.format(appointment.amount)}</strong></div>
              <div>
                <span>Status</span>
                <AppointmentStatusBadge status={appointment.status} />
              </div>
            </div>
            <p className="appointment-modal-notice">
              This is a local preview. Status changes are not saved to the database.
            </p>
            <div className="appointment-modal-actions appointment-modal-actions--details">
              {appointment.status !== 'Cancelled' && (
                <>
                  <label className="appointment-status-control">
                    <span>Update status</span>
                    <select
                      aria-label={`Update status for ${appointment.id}`}
                      onChange={(event) => {
                        const status = event.currentTarget.value;
                        if (isAppointmentStatus(status) && status !== 'Cancelled') onStatusChange(status);
                      }}
                      value={appointment.status}
                    >
                      {appointmentSummaryStatuses
                        .filter((status) => status !== 'Cancelled')
                        .map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                  <button
                    className="appointment-danger-button appointment-cancel-button"
                    onClick={() => setConfirmingCancel(true)}
                    type="button"
                  >
                    Cancel appointment
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [filters, setFilters] = useState<AppointmentFilters>(emptyFilters);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);
  const closeDetails = useCallback(() => {
    setSelectedAppointmentId(null);
    dialogTriggerRef.current?.focus();
  }, []);

  const filteredAppointments = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase();
    return appointments.filter((appointment) => {
      const matchesQuery =
        !query ||
        appointment.customer.toLocaleLowerCase().includes(query) ||
        appointment.phone.replaceAll(' ', '').includes(query.replaceAll(' ', '')) ||
        appointment.service.toLocaleLowerCase().includes(query);
      const matchesStatus = filters.status === 'All statuses' || appointment.status === filters.status;
      const matchesService = filters.service === 'All services' || appointment.service === filters.service;
      const matchesDate = !filters.date || appointment.date === filters.date;
      return matchesQuery && matchesStatus && matchesService && matchesDate;
    });
  }, [appointments, filters]);

  const counts = useMemo(() => {
    const result: Record<AppointmentStatus | 'Total Appointments', number> = {
      'Total Appointments': appointments.length,
      Confirmed: 0,
      Pending: 0,
      Completed: 0,
      Cancelled: 0,
    };
    for (const appointment of appointments) result[appointment.status] += 1;
    return result;
  }, [appointments]);

  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? null;
  const hasFilters = filters.query !== '' || filters.status !== emptyFilters.status ||
    filters.service !== emptyFilters.service || filters.date !== '';

  function updateFilter<K extends keyof AppointmentFilters>(key: K, value: AppointmentFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(emptyFilters);
    searchRef.current?.focus();
  }

  function updateAppointmentStatus(id: string, status: AppointmentStatus) {
    setAppointments((current) =>
      current.map((appointment) => appointment.id === id ? { ...appointment, status } : appointment),
    );
    setAnnouncement(`Appointment ${id} updated to ${status}. This preview change is not saved.`);
  }

  function exportFilteredAppointments() {
    const lines = [
      csvColumns.map(({ label }) => escapeCsvValue(label)).join(','),
      ...filteredAppointments.map((appointment) =>
        csvColumns.map(({ value }) => escapeCsvValue(value(appointment))).join(','),
      ),
    ];
    const file = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `detailing-street-appointments-${localDateString(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setAnnouncement(`Exported ${filteredAppointments.length} filtered appointments as a CSV file.`);
  }

  function cancelSelectedAppointment() {
    if (!selectedAppointment) return;
    updateAppointmentStatus(selectedAppointment.id, 'Cancelled');
    closeDetails();
  }

  return (
    <div className="appointments-page">
      <header className="appointments-page-header">
        <div className="appointments-page-heading">
          <span className="appointments-page-eyebrow">DETAILING STREET <i /> LUDHIANA</span>
          <h1>Appointments</h1>
          <p>Manage bookings, schedules, and service status.</p>
          <p className="appointments-demo-note">{appointmentDataNotice}</p>
        </div>
        <div className="appointments-header-actions">
          <button
            className="appointments-export-button"
            disabled={filteredAppointments.length === 0}
            onClick={exportFilteredAppointments}
            type="button"
          >
            <Icon name="download" />
            Export CSV
          </button>
          <button
            className="appointments-new-button"
            disabled
            title="Appointment creation is not available in this preview."
            type="button"
          >
            <span aria-hidden="true">+</span>
            New Appointment
          </button>
        </div>
      </header>

      <p className="appointments-preview-banner" role="note">
        <span aria-hidden="true" className="appointments-preview-dot" />
        Preview mode — status edits and cancellations update this page only and are not saved to the database.
      </p>

      <section aria-label="Appointment summaries" className="appointments-summary-grid">
        {(['Total Appointments', 'Confirmed', 'Pending', 'Completed'] as const).map((label, index) => (
          <article className={`appointments-summary-card appointments-summary-card--${index}`} key={label}>
            <div className="appointments-summary-top">
              <span>{label}</span>
              <span className="appointments-summary-icon">
                <Icon name={index === 0 ? 'appointments' : index === 1 ? 'completed' : index === 2 ? 'clock' : 'trend'} />
              </span>
            </div>
            <strong>{counts[label]}</strong>
            <span className="appointments-summary-caption">Demonstration records</span>
          </article>
        ))}
      </section>

      <section aria-labelledby="appointments-list-title" className="appointments-list-panel">
        <div className="appointments-list-header">
          <div>
            <span className="appointments-section-kicker">BOOKING MANAGEMENT</span>
            <h2 id="appointments-list-title">All Appointments</h2>
            <p>{filteredAppointments.length} of {appointments.length} demonstration bookings</p>
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

        <div className="appointments-toolbar">
          <label className="appointments-search">
            <Icon name="search" />
            <input
              onChange={(event) => updateFilter('query', event.target.value)}
              placeholder="Search customer, phone, or service"
              ref={searchRef}
              type="search"
              value={filters.query}
            />
          </label>
          <label className="appointments-filter">
            <span>Status</span>
            <select
              aria-label="Filter appointments by status"
              onChange={(event) => updateFilter('status', event.target.value)}
              value={filters.status}
            >
              <option>All statuses</option>
              {appointmentSummaryStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label className="appointments-filter appointments-service-filter">
            <span>Service</span>
            <select
              aria-label="Filter appointments by service"
              onChange={(event) => updateFilter('service', event.target.value)}
              value={filters.service}
            >
              <option>All services</option>
              {appointmentServices.map((service) => <option key={service}>{service}</option>)}
            </select>
          </label>
          <label className="appointments-filter appointments-date-filter">
            <span>Date</span>
            <input
              aria-label="Filter appointments by date"
              onChange={(event) => updateFilter('date', event.target.value)}
              type="date"
              value={filters.date}
            />
          </label>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="managed-appointments-scroll" role="region" aria-label="Appointments list table" tabIndex={0}>
            <table className="managed-appointments-table">
              <thead>
                <tr>
                  <th scope="col">Booking ID</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Vehicle</th>
                  <th scope="col">Service</th>
                  <th scope="col">Appointment Date</th>
                  <th scope="col">Time</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="booking-id-cell">{appointment.id}</td>
                    <td>
                      <span className="managed-customer-name">{appointment.customer}</span>
                      <span className="managed-customer-phone">{appointment.phone}</span>
                    </td>
                    <td>{appointment.vehicle}</td>
                    <td>{appointment.service}</td>
                    <td>{formatAppointmentDate(appointment.date)}</td>
                    <td className="managed-time-cell">{appointment.time}</td>
                    <td className="managed-amount-cell">{inrFormatter.format(appointment.amount)}</td>
                    <td><AppointmentStatusBadge status={appointment.status} /></td>
                    <td>
                      <button
                        aria-label={`View details for ${appointment.id}, ${appointment.customer}`}
                        className="appointment-row-action"
                        onClick={(event) => {
                          dialogTriggerRef.current = event.currentTarget;
                          setSelectedAppointmentId(appointment.id);
                        }}
                        type="button"
                      >
                        <Icon name="eye" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="appointments-empty-state">
            <span className="appointments-empty-icon"><Icon name="filter" /></span>
            <h3>No appointments found</h3>
            <p>Try adjusting your search or clearing one or more filters.</p>
            <button className="appointments-clear-button" onClick={clearFilters} type="button">
              Clear filters
            </button>
          </div>
        )}
        <p className="appointments-table-footer">Showing a local sample schedule · Changes are preview-only</p>
      </section>

      <p aria-live="polite" className="appointments-live-announcement">{announcement}</p>

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onCancel={cancelSelectedAppointment}
          onClose={closeDetails}
          onStatusChange={(status) => updateAppointmentStatus(selectedAppointment.id, status)}
        />
      )}
    </div>
  );
}
