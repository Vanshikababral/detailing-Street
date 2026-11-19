'use client';

import { useEffect, useState, useMemo } from 'react';
import { Icon } from '../dashboard/Icon';
import { DEFAULT_SERVICES } from '@/lib/serviceCatalog';

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

interface CustomerRecord {
  _id: string;
  customerId?: string;
  name: string;
  phone: string;
  email?: string;
  state?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

interface BookingForm {
  customerName: string;
  phoneNumber: string;
  email: string;
  state: string;
  address: string;
  city: string;
  zipCode: string;
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

interface BillAppointment {
  _id: string;
  bookingId?: string;
  customerName?: string;
  phoneNumber?: string;
  email?: string;
  carModel?: string;
  service?: string;
  preferredDate?: string;
  preferredTime?: string;
  amount?: number;
  status?: AppointmentStatus;
}

const bookingServices = DEFAULT_SERVICES.map((service) => service.name);

const bookingTimeSlots = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
];

function localDateInputValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function responseError(data: { error?: unknown }, fallback: string) {
  if (typeof data.error === 'string') return data.error;
  if (data.error && typeof data.error === 'object') {
    return Object.entries(data.error)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : String(messages)}`)
      .join(' ');
  }
  return fallback;
}

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [availableBookingServices, setAvailableBookingServices] = useState(bookingServices);
  const [serviceCatalogWarning, setServiceCatalogWarning] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [clientType, setClientType] = useState<'new' | 'existing'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    customerName: '',
    phoneNumber: '',
    email: '',
    state: '',
    address: '',
    city: '',
    zipCode: '',
    vehicleRegistration: '',
    vehicleMake: '',
    vehicleModel: '',
    service: '',
    preferredDate: localDateInputValue(),
    preferredTime: '',
    message: '',
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [billAppointment, setBillAppointment] = useState<BillAppointment | null>(null);
  const [billAmount, setBillAmount] = useState('');
  const [billError, setBillError] = useState('');
  const [billSaving, setBillSaving] = useState(false);
  const [printAppointment, setPrintAppointment] = useState<BillAppointment | null>(null);

  useEffect(() => {
    if (!printAppointment) return;
    document.body.classList.add('appointment-printing');
    return () => document.body.classList.remove('appointment-printing');
  }, [printAppointment]);

  useEffect(() => {
    if (!billAppointment && !printAppointment) return;

    function handleBillKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (printAppointment) setPrintAppointment(null);
      else if (!billSaving) setBillAppointment(null);
    }

    document.addEventListener('keydown', handleBillKeyDown);
    return () => document.removeEventListener('keydown', handleBillKeyDown);
  }, [billAppointment, billSaving, printAppointment]);

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

  useEffect(() => {
    let active = true;
    fetch('/api/services', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(responseError(data, 'Could not load services.'));
        }
        const names = (data.services || [])
          .map((service: { name?: string }) => service.name)
          .filter((name: unknown): name is string => typeof name === 'string' && name.length > 0);
        if (active && names.length > 0) setAvailableBookingServices(names);
      })
      .catch((error: unknown) => {
        console.error('Failed to load the appointment service catalog:', error);
        if (active) setServiceCatalogWarning('Showing standard services because the catalog could not be loaded.');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!showBookingModal || customers.length > 0) return;

    let active = true;
    setCustomersLoading(true);
    fetch('/api/admin/customers', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(responseError(data, 'Could not load customer records.'));
        }
        if (active) setCustomers(data.customers || []);
      })
      .catch((error: unknown) => {
        console.error('Failed to load customers for booking:', error);
        if (active) setBookingError(error instanceof Error ? error.message : 'Could not load customer records.');
      })
      .finally(() => {
        if (active) setCustomersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [showBookingModal, customers.length]);

  useEffect(() => {
    if (!showBookingModal) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !bookingSubmitting) setShowBookingModal(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showBookingModal, bookingSubmitting]);

  const openBookingModal = () => {
    setBookingError('');
    setClientType('new');
    setSelectedCustomerId('');
    setBookingForm({
      customerName: '',
      phoneNumber: '',
      email: '',
      state: '',
      address: '',
      city: '',
      zipCode: '',
      vehicleRegistration: '',
      vehicleMake: '',
      vehicleModel: '',
      service: '',
      preferredDate: localDateInputValue(),
      preferredTime: '',
      message: '',
    });
    setShowBookingModal(true);
  };

  const selectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find((entry) => entry._id === customerId);
    if (customer) {
      setBookingForm((current) => ({
        ...current,
        customerName: customer.name,
        phoneNumber: customer.phone,
        email: customer.email || '',
        state: customer.state || '',
        address: customer.address || '',
        city: customer.city || '',
        zipCode: customer.zipCode || '',
      }));
    }
  };

  const handleCreateBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBookingError('');
    if (
      bookingForm.vehicleRegistration.trim() &&
      (!bookingForm.vehicleMake.trim() || !bookingForm.vehicleModel.trim())
    ) {
      setBookingError('Enter the vehicle make and model when providing a registration.');
      return;
    }
    setBookingSubmitting(true);

    let customerProfileSaved = false;
    let customerForBooking: CustomerRecord | undefined;
    try {
      if (clientType === 'existing') {
        customerForBooking = customers.find((customer) => customer._id === selectedCustomerId);
        if (!customerForBooking) {
          throw new Error('Select an existing customer or choose New client.');
        }
      } else {
        const normalizedPhone = bookingForm.phoneNumber.replace(/\s/g, '');
        customerForBooking = customers.find((customer) => customer.phone.replace(/\s/g, '') === normalizedPhone);

        if (!customerForBooking) {
          const customerResponse = await fetch('/api/admin/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: bookingForm.customerName.trim(),
              phone: normalizedPhone,
              email: bookingForm.email.trim(),
              state: bookingForm.state.trim(),
              address: bookingForm.address.trim(),
              city: bookingForm.city.trim(),
              zipCode: bookingForm.zipCode.trim(),
            }),
          });
          const customerData = await customerResponse.json();
          if (!customerResponse.ok || !customerData.success || !customerData.customer?._id) {
            throw new Error(responseError(customerData, 'Could not save the new customer profile.'));
          }

          customerForBooking = customerData.customer;
          customerProfileSaved = true;
          setCustomers((current) => [...current, customerData.customer]);
          setClientType('existing');
          setSelectedCustomerId(customerData.customer._id);
        }
      }

      if (!customerProfileSaved && customerForBooking) {
        const profileUpdates = {
          name: bookingForm.customerName.trim() || customerForBooking.name,
          phone: customerForBooking.phone,
          email: bookingForm.email.trim(),
          state: bookingForm.state.trim(),
          address: bookingForm.address.trim(),
          city: bookingForm.city.trim(),
          zipCode: bookingForm.zipCode.trim(),
        };
        const hasProfileChanges =
          profileUpdates.name !== customerForBooking.name ||
          profileUpdates.email !== (customerForBooking.email || '') ||
          profileUpdates.state !== (customerForBooking.state || '') ||
          profileUpdates.address !== (customerForBooking.address || '') ||
          profileUpdates.city !== (customerForBooking.city || '') ||
          profileUpdates.zipCode !== (customerForBooking.zipCode || '');

        if (hasProfileChanges) {
          const customerResponse = await fetch('/api/admin/customers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: customerForBooking._id, ...profileUpdates }),
          });
          const customerData = await customerResponse.json();
          if (!customerResponse.ok || !customerData.success || !customerData.customer) {
            throw new Error(responseError(customerData, 'Could not update the customer profile.'));
          }

          customerForBooking = customerData.customer;
          customerProfileSaved = true;
          setCustomers((current) =>
            current.map((customer) =>
              customer._id === customerData.customer._id ? customerData.customer : customer
            )
          );
        }
      }

      const bookingResponse = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerForBooking?.name || bookingForm.customerName.trim(),
          phoneNumber: customerForBooking?.phone || bookingForm.phoneNumber.replace(/\s/g, ''),
          email: customerForBooking?.email || bookingForm.email.trim(),
          state: bookingForm.state.trim(),
          address: bookingForm.address.trim(),
          city: bookingForm.city.trim(),
          zipCode: bookingForm.zipCode.trim(),
          carModel: [bookingForm.vehicleMake.trim(), bookingForm.vehicleModel.trim()].filter(Boolean).join(' '),
          vehicleRegistration: bookingForm.vehicleRegistration.trim(),
          vehicleMake: bookingForm.vehicleMake.trim(),
          vehicleModel: bookingForm.vehicleModel.trim(),
          service: bookingForm.service,
          preferredDate: bookingForm.preferredDate,
          preferredTime: bookingForm.preferredTime,
          message: bookingForm.message.trim(),
        }),
      });
      const bookingData = await bookingResponse.json();
      if (!bookingResponse.ok || !bookingData.success) {
        const details = responseError(bookingData, 'Could not create the appointment.');
        throw new Error(
          customerProfileSaved
            ? `Customer profile saved, but the appointment was not created. ${details} You can retry without creating another customer.`
            : details
        );
      }

      if (bookingData.appointment) {
        setAppointments((current) => [bookingData.appointment, ...current]);
      } else {
        await fetchAppointments();
      }
      setShowBookingModal(false);
    } catch (error) {
      console.error('Failed to create admin booking:', error);
      setBookingError(error instanceof Error ? error.message : 'Could not create the booking. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedAppointment = data.appointment;
        setAppointments((prev) =>
          prev.map((app) => (
            app._id === id
              ? { ...app, status: newStatus, ...(updatedAppointment?.amount !== undefined && { amount: updatedAppointment.amount }) }
              : app
          ))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const openBill = (appointment: BillAppointment) => {
    setBillAppointment(appointment);
    setBillAmount(String(appointment.amount ?? ''));
    setBillError('');
  };

  const handleSaveBill = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!billAppointment) return;

    const amount = Number(billAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      setBillError('Enter a valid bill amount.');
      return;
    }

    setBillSaving(true);
    setBillError('');
    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: billAppointment._id, amount }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.appointment) {
        throw new Error(responseError(data, 'Could not save this bill.'));
      }

      const savedAmount = Number(data.appointment.amount);
      if (!Number.isFinite(savedAmount) || savedAmount !== amount) {
        throw new Error('The saved bill amount could not be verified. Please refresh and try again.');
      }

      const updatedAppointment = { ...billAppointment, amount: savedAmount };
      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === billAppointment._id ? { ...appointment, amount: savedAmount } : appointment
        )
      );
      setBillAppointment(null);
      setPrintAppointment(updatedAppointment);
    } catch (error) {
      console.error('Failed to save appointment bill:', error);
      setBillError(error instanceof Error ? error.message : 'Could not save this bill. Please try again.');
    } finally {
      setBillSaving(false);
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
      const matchesDate = !filterDate || app.preferredDate === filterDate;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        app.customerName?.toLowerCase().includes(q) ||
        app.phoneNumber?.includes(q) ||
        app.email?.toLowerCase().includes(q) ||
        app.bookingId?.toLowerCase().includes(q) ||
        app.service?.toLowerCase().includes(q) ||
        app.carModel?.toLowerCase().includes(q);
      return matchesStatus && matchesDate && matchesQuery;
    });
  }, [appointments, filterStatus, filterDate, searchQuery]);

  const summary = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((appointment) => appointment.status?.toLowerCase() === 'pending').length,
      confirmed: appointments.filter((appointment) => appointment.status?.toLowerCase() === 'confirmed').length,
      completed: appointments.filter((appointment) => appointment.status?.toLowerCase() === 'completed').length,
    }),
    [appointments]
  );

  const hasActiveFilters = filterStatus !== 'All' || Boolean(searchQuery.trim()) || Boolean(filterDate);

  const clearFilters = () => {
    setFilterStatus('All');
    setSearchQuery('');
    setFilterDate('');
  };

  return (
    <div className="appointments-management">
      <header className="dashboard-header">
        <div>
          <span className="appointments-eyebrow">Management <i /> / Bookings</span>
          <h1 className="dashboard-title">Appointments</h1>
          <p className="dashboard-subtitle">
            Manage and track your detailing bookings.
          </p>
        </div>
        <button className="appointment-new-booking" onClick={openBookingModal} type="button">
          <Icon name="appointments" />
          New Booking
        </button>
      </header>

      <section aria-label="Appointment summary" className="appointment-summary-grid">
        <article className="appointment-summary-card appointment-summary-card--total">
          <span className="appointment-summary-icon"><Icon name="appointments" /></span>
          <span className="appointment-summary-copy">
            <span>Total Bookings</span>
            <strong>{loading ? '—' : summary.total}</strong>
          </span>
        </article>
        <article className="appointment-summary-card appointment-summary-card--pending">
          <span className="appointment-summary-icon"><Icon name="clock" /></span>
          <span className="appointment-summary-copy">
            <span>Pending</span>
            <strong>{loading ? '—' : summary.pending}</strong>
          </span>
        </article>
        <article className="appointment-summary-card appointment-summary-card--confirmed">
          <span className="appointment-summary-icon"><Icon name="completed" /></span>
          <span className="appointment-summary-copy">
            <span>Confirmed</span>
            <strong>{loading ? '—' : summary.confirmed}</strong>
          </span>
        </article>
        <article className="appointment-summary-card appointment-summary-card--completed">
          <span className="appointment-summary-icon"><Icon name="completed" /></span>
          <span className="appointment-summary-copy">
            <span>Completed</span>
            <strong>{loading ? '—' : summary.completed}</strong>
          </span>
        </article>
      </section>

      <section aria-labelledby="appointment-bookings-title" className="appointment-bookings-panel">
        <header className="appointment-bookings-panel-header">
          <div>
            <span className="appointments-panel-eyebrow">Booking management</span>
            <h2 id="appointment-bookings-title">All bookings</h2>
            <p>{loading ? 'Loading appointments…' : `${filtered.length} of ${appointments.length} bookings`}</p>
          </div>
        </header>

        <div className="appointment-toolbar">
          <label className="appointment-search">
            <Icon name="search" />
            <input
              aria-label="Search bookings"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search customer, phone, booking ID…"
              type="search"
              value={searchQuery}
            />
          </label>
          <label className="appointment-date-filter">
            <Icon name="calendar" />
            <span className="sr-only">Filter by appointment date</span>
            <input
              aria-label="Filter by appointment date"
              onChange={(event) => setFilterDate(event.target.value)}
              type="date"
              value={filterDate}
            />
          </label>
          {hasActiveFilters && filtered.length > 0 && (
            <button className="appointment-clear-filters" onClick={clearFilters} type="button">
              Clear filters
            </button>
          )}
        </div>

        <div aria-label="Filter bookings by status" className="appointment-status-tabs" role="group">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
            <button
              aria-pressed={filterStatus === status}
              className={filterStatus === status ? 'appointment-status-tab appointment-status-tab--active' : 'appointment-status-tab'}
              key={status}
              onClick={() => setFilterStatus(status)}
              type="button"
            >
              {status}
              {status === 'All' && <span>{loading ? '—' : summary.total}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div aria-live="polite" className="appointments-loading">
            <span className="appointments-loading-indicator" />
            Loading appointments…
          </div>
        ) : filtered.length === 0 ? (
          <div className="appointments-empty-state">
            <span className="appointments-empty-icon"><Icon name={hasActiveFilters ? 'search' : 'appointments'} /></span>
            <h3>{hasActiveFilters ? 'No bookings match these filters' : 'No bookings yet'}</h3>
            <p>
              {hasActiveFilters
                ? 'Try adjusting your search or filters to find what you’re looking for.'
                : 'Bookings from your website and garage will appear here.'}
            </p>
            {hasActiveFilters ? (
              <button className="appointment-clear-filters" onClick={clearFilters} type="button">
                Clear filters
              </button>
            ) : (
              <button className="appointment-empty-action" onClick={openBookingModal} type="button">
                Create a booking
              </button>
            )}
          </div>
        ) : (
          <div className="appointments-table-wrap">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th scope="col">Booking ID</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Vehicle</th>
                  <th scope="col">Service</th>
                  <th scope="col">Date &amp; Time</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <span className="appointment-booking-id">{app.bookingId || '—'}</span>
                    </td>
                    <td>
                      <div className="appointment-customer-cell">
                        <strong>{app.customerName || 'Unknown customer'}</strong>
                        <span>{[app.phoneNumber, app.email].filter(Boolean).join(' · ') || 'No contact details'}</span>
                      </div>
                    </td>
                    <td>{app.carModel || '—'}</td>
                    <td><span className="appointment-service-name">{app.service || '—'}</span></td>
                    <td>
                      <div className="appointment-date-cell">
                        <span>{app.preferredDate || 'Not scheduled'}</span>
                        {app.preferredTime && <small>{app.preferredTime}</small>}
                      </div>
                    </td>
                    <td>
                      <span className={`appointment-status-badge appointment-status-badge--${String(app.status || 'pending').toLowerCase()}`}>
                        <select
                          aria-label={`Update status for ${app.bookingId || app.customerName}`}
                          className="appointment-status-select"
                          onChange={(event) => handleStatusChange(app._id, event.target.value as AppointmentStatus)}
                          value={app.status}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <span aria-hidden="true">{app.status}</span>
                        <Icon name="chevron" />
                      </span>
                    </td>
                    <td>
                      <div className="appointment-row-actions">
                        {app.status === 'Completed' && (
                          <button
                            aria-label={`Create or print bill for ${app.bookingId || app.customerName}`}
                            className="appointment-bill-button"
                            onClick={() => openBill(app)}
                            type="button"
                          >
                            <Icon name="download" />
                            <span>{Number(app.amount) > 0 ? 'Bill' : 'Create bill'}</span>
                          </button>
                        )}
                        <button
                          aria-label={`Delete booking ${app.bookingId || app.customerName}`}
                          className="appointment-delete-button"
                          onClick={() => handleDelete(app._id)}
                          title="Delete appointment"
                          type="button"
                        >
                          <Icon name="trash" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showBookingModal && (
        <div
          className="appointment-booking-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !bookingSubmitting) setShowBookingModal(false);
          }}
        >
          <section
            aria-labelledby="appointment-booking-title"
            aria-modal="true"
            className="appointment-booking-modal"
            role="dialog"
          >
            <header className="appointment-booking-header">
              <div>
                <span className="dashboard-kicker">Garage booking</span>
                <h2 id="appointment-booking-title">Create appointment</h2>
                <p>Book a service for a walk-in or an existing customer.</p>
              </div>
              <button
                aria-label="Close booking form"
                className="appointment-booking-close"
                disabled={bookingSubmitting}
                onClick={() => setShowBookingModal(false)}
                type="button"
              >
                ×
              </button>
            </header>

            <div aria-label="Client type" className="appointment-client-toggle">
              <button
                aria-pressed={clientType === 'new'}
                className={clientType === 'new' ? 'appointment-client-option appointment-client-option--active' : 'appointment-client-option'}
                onClick={() => {
                  setClientType('new');
                  setSelectedCustomerId('');
                  setBookingError('');
                  setBookingForm((current) => ({
                    ...current,
                    customerName: '',
                    phoneNumber: '',
                    email: '',
                    state: '',
                    address: '',
                    city: '',
                    zipCode: '',
                  }));
                }}
                type="button"
              >
                New client
              </button>
              <button
                aria-pressed={clientType === 'existing'}
                className={clientType === 'existing' ? 'appointment-client-option appointment-client-option--active' : 'appointment-client-option'}
                onClick={() => {
                  setClientType('existing');
                  setBookingError('');
                }}
                type="button"
              >
                Existing client
              </button>
            </div>

            {bookingError && <p className="appointment-booking-error" role="alert">{bookingError}</p>}

            {clientType === 'existing' && (
              <label className="appointment-booking-field">
                <span>Select customer *</span>
                <select
                  disabled={customersLoading || customers.length === 0}
                  onChange={(event) => selectCustomer(event.target.value)}
                  required
                  value={selectedCustomerId}
                >
                  <option value="">
                    {customersLoading ? 'Loading customers...' : customers.length ? 'Choose a customer' : 'No saved customers'}
                  </option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} · {customer.phone}
                    </option>
                  ))}
                </select>
                {!customersLoading && customers.length === 0 && (
                  <small>No customer profiles found. Choose “New client” to add one.</small>
                )}
              </label>
            )}

            <form className="appointment-booking-form" onSubmit={handleCreateBooking}>
              <div className="appointment-booking-grid">
                <label className="appointment-booking-field">
                  <span>Client Name *</span>
                  <input
                    autoComplete="name"
                    minLength={2}
                    onChange={(event) => setBookingForm({ ...bookingForm, customerName: event.target.value })}
                    readOnly={clientType === 'existing'}
                    required
                    value={bookingForm.customerName}
                  />
                </label>
                <label className="appointment-booking-field">
                  <span>Mobile no. *</span>
                  <input
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(event) => setBookingForm({ ...bookingForm, phoneNumber: event.target.value })}
                    pattern="[6-9][0-9]{9}"
                    placeholder="10-digit mobile number"
                    readOnly={clientType === 'existing'}
                    required
                    value={bookingForm.phoneNumber}
                  />
                </label>
                <label className="appointment-booking-field appointment-booking-field--full">
                  <span>Email <small>(optional)</small></span>
                  <input
                    autoComplete="email"
                    onChange={(event) => setBookingForm({ ...bookingForm, email: event.target.value })}
                    readOnly={clientType === 'existing'}
                    type="email"
                    value={bookingForm.email}
                  />
                </label>
                <label className="appointment-booking-field">
                  <span>State <small>(optional)</small></span>
                  <input
                    autoComplete="address-level1"
                    onChange={(event) => setBookingForm({ ...bookingForm, state: event.target.value })}
                    value={bookingForm.state}
                  />
                </label>
                <label className="appointment-booking-field">
                  <span>City <small>(optional)</small></span>
                  <input
                    autoComplete="address-level2"
                    onChange={(event) => setBookingForm({ ...bookingForm, city: event.target.value })}
                    value={bookingForm.city}
                  />
                </label>
                <label className="appointment-booking-field appointment-booking-field--full">
                  <span>Address <small>(optional)</small></span>
                  <input
                    autoComplete="street-address"
                    onChange={(event) => setBookingForm({ ...bookingForm, address: event.target.value })}
                    value={bookingForm.address}
                  />
                </label>
                <label className="appointment-booking-field">
                  <span>ZIP code <small>(optional)</small></span>
                  <input
                    autoComplete="postal-code"
                    inputMode="numeric"
                    onChange={(event) => setBookingForm({ ...bookingForm, zipCode: event.target.value })}
                    value={bookingForm.zipCode}
                  />
                </label>
                <label className="appointment-booking-field appointment-booking-field--full">
                  <span>Service *</span>
                  <select
                    onChange={(event) => setBookingForm({ ...bookingForm, service: event.target.value })}
                    required
                    value={bookingForm.service}
                  >
                    <option value="">Select a service</option>
                    {availableBookingServices.map((service) => <option key={service} value={service}>{service}</option>)}
                  </select>
                  {serviceCatalogWarning && <small>{serviceCatalogWarning}</small>}
                </label>
                <label className="appointment-booking-field">
                  <span>Vehicle make <small>(optional)</small></span>
                  <input
                    onChange={(event) => setBookingForm({ ...bookingForm, vehicleMake: event.target.value })}
                    placeholder="e.g. Honda"
                    value={bookingForm.vehicleMake}
                  />
                </label>
                <label className="appointment-booking-field">
                  <span>Vehicle model <small>(optional)</small></span>
                  <input
                    onChange={(event) => setBookingForm({ ...bookingForm, vehicleModel: event.target.value })}
                    placeholder="e.g. City"
                    value={bookingForm.vehicleModel}
                  />
                </label>
                <label className="appointment-booking-field appointment-booking-field--full">
                  <span>Vehicle registration <small>(optional)</small></span>
                  <input
                    maxLength={20}
                    onChange={(event) => setBookingForm({ ...bookingForm, vehicleRegistration: event.target.value })}
                    placeholder="e.g. PB10AB1234"
                    value={bookingForm.vehicleRegistration}
                  />
                </label>
                <label className="appointment-booking-field">
                  <span>Appointment date <small>(optional)</small></span>
                  <input
                    min={localDateInputValue()}
                    onChange={(event) => setBookingForm({ ...bookingForm, preferredDate: event.target.value })}
                    type="date"
                    value={bookingForm.preferredDate}
                  />
                </label>
                <label className="appointment-booking-field">
                  <span>Time <small>(optional)</small></span>
                  <select
                    onChange={(event) => setBookingForm({ ...bookingForm, preferredTime: event.target.value })}
                    value={bookingForm.preferredTime}
                  >
                    <option value="">Not specified</option>
                    {bookingTimeSlots.map((time) => <option key={time} value={time}>{time}</option>)}
                  </select>
                </label>
                <label className="appointment-booking-field appointment-booking-field--full">
                  <span>Notes <small>(optional)</small></span>
                  <textarea
                    onChange={(event) => setBookingForm({ ...bookingForm, message: event.target.value })}
                    rows={3}
                    value={bookingForm.message}
                  />
                </label>
              </div>

              <footer className="appointment-booking-actions">
                <button
                  className="appointment-booking-cancel"
                  disabled={bookingSubmitting}
                  onClick={() => setShowBookingModal(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="appointment-booking-submit"
                  disabled={bookingSubmitting || (clientType === 'existing' && !selectedCustomerId)}
                  type="submit"
                >
                  {bookingSubmitting ? 'Saving booking...' : 'Create booking'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {billAppointment && (
        <div className="appointment-booking-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !billSaving) setBillAppointment(null);
        }}>
          <section aria-labelledby="appointment-bill-title" aria-modal="true" className="appointment-bill-modal" role="dialog">
            <header className="appointment-booking-header">
              <div>
                <span className="appointments-panel-eyebrow">Completed service</span>
                <h2 id="appointment-bill-title">Prepare bill</h2>
                <p>{billAppointment.bookingId || 'Appointment'} · {billAppointment.customerName}</p>
              </div>
              <button
                aria-label="Close bill form"
                className="appointment-booking-close"
                disabled={billSaving}
                onClick={() => setBillAppointment(null)}
                type="button"
              >
                ×
              </button>
            </header>
            <div className="appointment-bill-service">
              <span>{billAppointment.service || 'Detailing service'}</span>
              <span>{billAppointment.carModel || 'Vehicle not specified'}</span>
            </div>
            <form className="appointment-booking-form" onSubmit={handleSaveBill}>
              <label className="appointment-booking-field">
                <span>Bill amount (INR) *</span>
                <input
                  autoFocus
                  min="0"
                  onChange={(event) => setBillAmount(event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={billAmount}
                />
              </label>
              {billError && <p className="appointment-booking-error" role="alert">{billError}</p>}
              <footer className="appointment-booking-actions">
                <button className="appointment-booking-cancel" disabled={billSaving} onClick={() => setBillAppointment(null)} type="button">
                  Cancel
                </button>
                <button className="appointment-booking-submit" disabled={billSaving} type="submit">
                  {billSaving ? 'Saving bill…' : 'Save & print'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {printAppointment && (
        <div
          className="appointment-invoice-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPrintAppointment(null);
          }}
        >
          <article aria-labelledby="appointment-invoice-title" aria-modal="true" className="appointment-invoice" role="dialog">
            <header className="appointment-invoice-header">
              <div>
                <span className="appointment-invoice-eyebrow">Detailing Street · Ludhiana</span>
                <h2 id="appointment-invoice-title">Service Bill</h2>
              </div>
              <div className="appointment-invoice-meta">
                <span>Booking ID</span>
                <strong>{printAppointment.bookingId || '—'}</strong>
                <span>{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </header>
            <div className="appointment-invoice-customer">
              <div><span>Bill to</span><strong>{printAppointment.customerName || 'Customer'}</strong></div>
              <div><span>Contact</span><strong>{printAppointment.phoneNumber || '—'}</strong></div>
              {printAppointment.email && <div><span>Email</span><strong>{printAppointment.email}</strong></div>}
              {printAppointment.carModel && <div><span>Vehicle</span><strong>{printAppointment.carModel}</strong></div>}
            </div>
            <div className="appointment-invoice-table">
              <div className="appointment-invoice-row appointment-invoice-row--head">
                <span>Service</span><span>Amount</span>
              </div>
              <div className="appointment-invoice-row">
                <span>{printAppointment.service || 'Detailing service'}</span>
                <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(printAppointment.amount) || 0)}</strong>
              </div>
            </div>
            <div className="appointment-invoice-total">
              <span>Total</span>
              <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(printAppointment.amount) || 0)}</strong>
            </div>
            <p className="appointment-invoice-note">Thank you for choosing Detailing Street.</p>
            <footer className="appointment-invoice-actions">
              <button className="appointment-booking-cancel" onClick={() => setPrintAppointment(null)} type="button">Close</button>
              <button className="appointment-booking-submit" onClick={() => window.print()} type="button">
                <svg aria-hidden="true" fill="none" height="15" viewBox="0 0 24 24" width="15">
                  <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v7H7z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  <path d="M17 11h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                </svg>
                Print bill
              </button>
            </footer>
          </article>
        </div>
      )}
    </div>
  );
}
