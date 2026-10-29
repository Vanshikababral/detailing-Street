'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  customerDataNotice,
  customerMetrics,
  initialCustomers,
  type Customer,
  type CustomerType,
  type CustomerVehicle,
} from '../../data/customers-data';
import { Icon } from '../dashboard/Icon';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const customerDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const customerCsvColumns: { label: string; value: (customer: Customer) => string }[] = [
  { label: 'Customer ID', value: (customer) => customer.id },
  { label: 'Customer', value: (customer) => customer.name },
  { label: 'Phone', value: (customer) => customer.phone },
  { label: 'Email', value: (customer) => customer.email },
  { label: 'Vehicles', value: (customer) => customer.vehicles.map((vehicle) => `${vehicle.registration} — ${vehicle.model}`).join('; ') },
  { label: 'Total Visits', value: (customer) => String(customer.totalVisits) },
  { label: 'Last Visit', value: (customer) => customer.lastVisit },
  { label: 'Total Spent (INR)', value: (customer) => String(customer.totalSpent) },
  { label: 'Customer Type', value: (customer) => customer.type },
];

type CustomerFormValues = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

type CustomerModalMode = 'details' | 'edit' | 'delete' | 'add';
type CustomerSort = 'name' | 'recent' | 'spending';

const emptyFormValues: CustomerFormValues = { name: '', phone: '', email: '', notes: '' };

function formatCustomerDate(date: string) {
  if (!date) return '—';
  return customerDateFormatter.format(new Date(`${date}T12:00:00`));
}

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function getLocalDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? '')
    .join('');
}

function CustomerTypeBadge({ type }: { type: CustomerType }) {
  return <span className={`customer-type-badge customer-type-badge--${type.toLowerCase()}`}>{type}</span>;
}

function customerFormError(values: CustomerFormValues) {
  if (!values.name.trim()) return 'Enter the customer’s name.';
  const digits = values.phone.replace(/\D/g, '');
  const validPhone = digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
  if (!validPhone) return 'Enter a valid 10-digit Indian phone number, optionally with the +91 country code.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    return 'Enter a valid email address.';
  }
  return '';
}

function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

function CustomerModal({
  mode,
  customer,
  initialValues,
  onClose,
  onSave,
  onDelete,
  onEdit,
}: {
  mode: CustomerModalMode;
  customer: Customer | null;
  initialValues: CustomerFormValues;
  onClose: () => void;
  onSave: (values: CustomerFormValues) => string;
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
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
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
    const error = customerFormError(values);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    const saveError = onSave({
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      notes: values.notes.trim(),
    });
    setValidationError(saveError);
  }

  const title = mode === 'add'
    ? 'Add customer'
    : mode === 'edit'
      ? 'Edit customer'
      : mode === 'delete'
        ? 'Delete customer?'
        : 'Customer details';

  return (
    <div
      className="appointment-modal-backdrop customer-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="customer-dialog-title"
        aria-modal="true"
        className="appointment-modal customer-modal"
        ref={modalRef}
        role={mode === 'delete' ? 'alertdialog' : 'dialog'}
      >
        <header className="appointment-modal-header">
          <div>
            <span className="appointment-modal-kicker">
              {mode === 'add' ? 'CUSTOMER DIRECTORY' : customer?.id ?? 'CUSTOMER DIRECTORY'}
            </span>
            <h2 id="customer-dialog-title">{title}</h2>
          </div>
          <button
            aria-label="Close customer dialog"
            className="appointment-modal-close"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <Icon name="close" />
          </button>
        </header>

        {isForm && (
          <form className="customer-form" noValidate onSubmit={submitForm}>
            <p className="customer-form-preview-note">Preview only — changes are not saved to the database.</p>
            <label className="customer-form-field">
              <span>Name <i>*</i></span>
              <input
                autoComplete="name"
                maxLength={80}
                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Aarav Mehta"
                required
                value={values.name}
              />
            </label>
            <label className="customer-form-field">
              <span>Phone number <i>*</i></span>
              <input
                autoComplete="tel"
                inputMode="tel"
                maxLength={20}
                onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
                placeholder="+91 90000 00000"
                required
                type="tel"
                value={values.phone}
              />
            </label>
            <label className="customer-form-field">
              <span>Email <i>*</i></span>
              <input
                autoComplete="email"
                maxLength={120}
                onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
                placeholder="name@example.test"
                required
                type="email"
                value={values.email}
              />
            </label>
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
                {mode === 'add' ? 'Add customer' : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        {mode === 'details' && customer && (
          <div className="customer-details">
            <div className="customer-detail-identity">
              <span aria-hidden="true" className="customer-avatar customer-avatar--large">{getInitials(customer.name)}</span>
              <div>
                <strong>{customer.name}</strong>
                <span>{customer.id} <i /> <CustomerTypeBadge type={customer.type} /></span>
              </div>
            </div>
            <div className="customer-contact-grid">
              <div><span>Phone number</span><strong>{customer.phone}</strong></div>
              <div><span>Email</span><strong>{customer.email}</strong></div>
              <div><span>Total visits</span><strong>{customer.totalVisits}</strong></div>
              <div><span>Total spent</span><strong>{inrFormatter.format(customer.totalSpent)}</strong></div>
            </div>
            <section className="customer-detail-section" aria-labelledby="customer-vehicles-title">
              <div className="customer-detail-section-heading">
                <h3 id="customer-vehicles-title">Vehicles</h3>
                <span>{customer.vehicles.length}</span>
              </div>
              {customer.vehicles.length ? (
                <ul className="customer-vehicle-list">
                  {customer.vehicles.map((vehicle) => (
                    <li key={vehicle.registration}>
                      <span className="customer-record-icon"><Icon name="car" /></span>
                      <span className="customer-record-main">
                        <strong>{vehicle.model}</strong>
                        <span>{vehicle.registration}</span>
                      </span>
                      <span className="customer-record-aside">
                        <span>Last serviced</span>
                        <strong>{formatCustomerDate(vehicle.lastServiced)}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : <p className="customer-detail-empty">No vehicle records in this preview.</p>}
            </section>
            <section className="customer-detail-section" aria-labelledby="customer-history-title">
              <div className="customer-detail-section-heading">
                <h3 id="customer-history-title">Visit history</h3>
                <span>{customer.visits.length}</span>
              </div>
              {customer.visits.length ? (
                <ul className="customer-visit-list">
                  {customer.visits.map((visit, index) => (
                    <li key={`${visit.date}-${visit.service}-${index}`}>
                      <span className="customer-visit-dot" />
                      <span className="customer-record-main">
                        <strong>{visit.service}</strong>
                        <span>{formatCustomerDate(visit.date)}</span>
                      </span>
                      <strong className="customer-visit-amount">{inrFormatter.format(visit.amount)}</strong>
                    </li>
                  ))}
                </ul>
              ) : <p className="customer-detail-empty">No visit history in this preview.</p>}
            </section>
            {customer.notes && (
              <div className="customer-notes">
                <span>Notes</span>
                <p>{customer.notes}</p>
              </div>
            )}
            <p className="appointment-modal-notice">{customerDataNotice}</p>
            <div className="customer-dialog-actions">
              <button className="appointment-secondary-button" onClick={onClose} type="button">Close</button>
              <button className="customer-edit-button" onClick={onEdit} type="button">
                <Icon name="edit" /> Edit customer
              </button>
            </div>
          </div>
        )}

        {mode === 'delete' && customer && (
          <div className="appointment-cancel-confirmation">
            <p>
              Remove the fictional customer <strong>{customer.name}</strong> from this page preview?
              This action cannot be undone, but does not affect a database.
            </p>
            <div className="appointment-modal-actions">
              <button
                className="appointment-secondary-button"
                onClick={onClose}
                ref={cancelDeleteRef}
                type="button"
              >
                Keep customer
              </button>
              <button className="appointment-danger-button" onClick={onDelete} type="button">
                Delete customer
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function CustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All customers');
  const [sort, setSort] = useState<CustomerSort>('recent');
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<CustomerModalMode | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [formValues, setFormValues] = useState<CustomerFormValues>(emptyFormValues);
  const [nextCustomerNumber, setNextCustomerNumber] = useState(146);
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);
  const closeDialog = useCallback(() => {
    setModalMode(null);
    dialogTriggerRef.current?.focus();
  }, []);

  const visibleCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return customers
      .filter((customer) => {
        const phoneQuery = normalizedQuery.replace(/\D/g, '');
        const matchesQuery =
          !normalizedQuery ||
          customer.name.toLocaleLowerCase().includes(normalizedQuery) ||
          (phoneQuery.length > 0 && phoneDigits(customer.phone).includes(phoneQuery)) ||
          customer.email.toLocaleLowerCase().includes(normalizedQuery);
        const matchesType = typeFilter === 'All customers' || customer.type === typeFilter;
        return matchesQuery && matchesType;
      })
      .sort((first, second) => {
        if (sort === 'name') return first.name.localeCompare(second.name);
        if (sort === 'spending') return second.totalSpent - first.totalSpent;
        return (second.lastVisit || '').localeCompare(first.lastVisit || '') || first.name.localeCompare(second.name);
      });
  }, [customers, query, sort, typeFilter]);

  const selectedCustomer = customers.find((customer) => customer.id === activeCustomerId) ?? null;
  const hasFilters = query !== '' || typeFilter !== 'All customers';

  function clearFilters() {
    setQuery('');
    setTypeFilter('All customers');
    setSort('recent');
    searchRef.current?.focus();
  }

  function openModal(mode: CustomerModalMode, customer: Customer | null, trigger: HTMLButtonElement | null) {
    dialogTriggerRef.current = trigger;
    setActiveCustomerId(customer?.id ?? null);
    setFormValues(customer
      ? { name: customer.name, phone: customer.phone, email: customer.email, notes: customer.notes }
      : emptyFormValues);
    setModalMode(mode);
  }

  function saveCustomer(values: CustomerFormValues) {
    const normalizedEmail = values.email.toLocaleLowerCase();
    const normalizedPhone = phoneDigits(values.phone);
    const duplicate = customers.find((customer) =>
      customer.id !== selectedCustomer?.id &&
      (customer.email.toLocaleLowerCase() === normalizedEmail ||
        phoneDigits(customer.phone) === normalizedPhone),
    );
    if (duplicate) return 'That email address or phone number is already in this sample directory.';

    if (modalMode === 'add') {
      const customer: Customer = {
        id: `CUST-${String(nextCustomerNumber).padStart(4, '0')}`,
        ...values,
        type: 'New',
        vehicles: [],
        visits: [],
        totalVisits: 0,
        lastVisit: '',
        totalSpent: 0,
      };
      setCustomers((current) => [customer, ...current]);
      setNextCustomerNumber((current) => current + 1);
      setAnnouncement(`${customer.name} was added to this local preview.`);
      setQuery('');
      setTypeFilter('All customers');
      setSort('recent');
      setActiveCustomerId(customer.id);
      setModalMode('details');
      return '';
    }

    if (!selectedCustomer) return 'Select a customer to edit.';
    setCustomers((current) => current.map((customer) => customer.id === selectedCustomer.id
      ? { ...customer, ...values }
      : customer));
    setAnnouncement(`${values.name} was updated in this local preview.`);
    setActiveCustomerId(selectedCustomer.id);
    setModalMode('details');
    return '';
  }

  function deleteCustomer() {
    if (!selectedCustomer) return;
    const name = selectedCustomer.name;
    setCustomers((current) => current.filter((customer) => customer.id !== selectedCustomer.id));
    setAnnouncement(`${name} was removed from this local preview.`);
    setModalMode(null);
    dialogTriggerRef.current?.focus();
  }

  function exportCustomers() {
    const lines = [
      customerCsvColumns.map(({ label }) => escapeCsvValue(label)).join(','),
      ...visibleCustomers.map((customer) =>
        customerCsvColumns.map(({ value }) => escapeCsvValue(value(customer))).join(','),
      ),
    ];
    const file = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `detailing-street-customers-${getLocalDate()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setAnnouncement(`Exported ${visibleCustomers.length} filtered customer records as a CSV file.`);
  }

  return (
    <div className="customers-page">
      <header className="customers-page-header">
        <div className="customers-page-heading">
          <span className="customers-page-eyebrow">DETAILING STREET <i /> LUDHIANA</span>
          <h1>Customers</h1>
          <p>Manage customer profiles and service history.</p>
          <p className="customers-demo-note">{customerDataNotice}</p>
        </div>
        <div className="customers-header-actions">
          <button
            className="appointments-export-button"
            disabled={visibleCustomers.length === 0}
            onClick={exportCustomers}
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
            Add Customer
          </button>
        </div>
      </header>

      <p className="customers-preview-banner" role="note">
        <span aria-hidden="true" />
        Preview mode — profile changes are local to this page and are not saved to a database.
      </p>

      <section aria-label="Customer metrics, demonstration data" className="customers-summary-grid">
        {customerMetrics.map((metric, index) => (
          <article className={`appointments-summary-card customers-summary-card--${index}`} key={metric.label}>
            <div className="appointments-summary-top">
              <span>{metric.label}</span>
              <span className="appointments-summary-icon"><Icon name={metric.icon} /></span>
            </div>
            <strong>{metric.value}</strong>
            <span className="appointments-summary-caption">Demonstration metric</span>
          </article>
        ))}
      </section>

      <section aria-labelledby="customers-list-title" className="appointments-list-panel customers-list-panel">
        <div className="appointments-list-header">
          <div>
            <span className="appointments-section-kicker">CUSTOMER DIRECTORY</span>
            <h2 id="customers-list-title">All Customers</h2>
            <p>Showing {visibleCustomers.length} of {customers.length} fictional sample profiles</p>
          </div>
          <button className="appointments-clear-button" disabled={!hasFilters} onClick={clearFilters} type="button">
            Clear filters
          </button>
        </div>

        <div className="customers-toolbar">
          <label className="appointments-search">
            <Icon name="search" />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone, or email"
              ref={searchRef}
              type="search"
              value={query}
            />
          </label>
          <label className="appointments-filter">
            <span>Type</span>
            <select
              aria-label="Filter customers by type"
              onChange={(event) => setTypeFilter(event.target.value)}
              value={typeFilter}
            >
              <option>All customers</option>
              <option>New</option>
              <option>Returning</option>
            </select>
          </label>
          <label className="appointments-filter">
            <span>Sort by</span>
            <select aria-label="Sort customers" onChange={(event) => setSort(event.target.value as CustomerSort)} value={sort}>
              <option value="recent">Most recent visit</option>
              <option value="name">Name (A–Z)</option>
              <option value="spending">Total spending</option>
            </select>
          </label>
        </div>

        {visibleCustomers.length ? (
          <div className="customers-table-scroll" role="region" aria-label="Customer list table" tabIndex={0}>
            <table className="customers-table">
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Email</th>
                  <th scope="col">Vehicles</th>
                  <th scope="col">Total Visits</th>
                  <th scope="col">Last Visit</th>
                  <th scope="col">Total Spent</th>
                  <th scope="col">Customer Type</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <span className="customers-table-identity">
                        <span aria-hidden="true" className="customer-avatar">{getInitials(customer.name)}</span>
                        <span className="customer-name-cell">
                          <strong>{customer.name}</strong>
                          <span>{customer.id}</span>
                        </span>
                      </span>
                    </td>
                    <td className="customer-phone-cell">{customer.phone}</td>
                    <td className="customer-email-cell">{customer.email}</td>
                    <td>{customer.vehicles.length}</td>
                    <td>{customer.totalVisits}</td>
                    <td>{formatCustomerDate(customer.lastVisit)}</td>
                    <td className="customer-spend-cell">{inrFormatter.format(customer.totalSpent)}</td>
                    <td><CustomerTypeBadge type={customer.type} /></td>
                    <td>
                      <div className="customer-row-actions">
                        <button
                          aria-label={`View details for ${customer.name}`}
                          className="customer-row-button"
                          onClick={(event) => openModal('details', customer, event.currentTarget)}
                          title="View details"
                          type="button"
                        >
                          <Icon name="eye" />
                        </button>
                        <button
                          aria-label={`Edit ${customer.name}`}
                          className="customer-row-button"
                          onClick={(event) => openModal('edit', customer, event.currentTarget)}
                          title="Edit customer"
                          type="button"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          aria-label={`Delete ${customer.name}`}
                          className="customer-row-button customer-row-button--danger"
                          onClick={(event) => openModal('delete', customer, event.currentTarget)}
                          title="Delete customer"
                          type="button"
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="appointments-empty-state">
            <span className="appointments-empty-icon"><Icon name="filter" /></span>
            <h3>No customers found</h3>
            <p>Try a different search or customer type, or clear the current filters.</p>
            <button className="appointments-clear-button" onClick={clearFilters} type="button">Clear filters</button>
          </div>
        )}

        <p className="appointments-table-footer">Fictional local preview records · Not connected to customer data services</p>
      </section>

      <p aria-live="polite" className="appointments-live-announcement">{announcement}</p>

      {modalMode && (
        <CustomerModal
          customer={selectedCustomer}
          initialValues={formValues}
          mode={modalMode}
          onClose={closeDialog}
          onDelete={deleteCustomer}
          onEdit={() => {
            if (!selectedCustomer) return;
            setFormValues({
              name: selectedCustomer.name,
              phone: selectedCustomer.phone,
              email: selectedCustomer.email,
              notes: selectedCustomer.notes,
            });
            setModalMode('edit');
          }}
          onSave={saveCustomer}
        />
      )}
    </div>
  );
}
