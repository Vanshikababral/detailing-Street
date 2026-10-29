'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  initialServiceSummary,
  initialServices,
  serviceCategories,
  serviceDataNotice,
  type Service,
  type ServiceFormValues,
  type ServiceStatus,
} from '../../data/services-data';
import { Icon } from '../dashboard/Icon';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

type ServiceDialogMode = 'add' | 'edit' | 'delete';
type ServiceSort = 'default' | 'price-ascending' | 'price-descending';
type ServiceSummary = {
  total: number;
  active: number;
  inactive: number;
  totalPrice: number;
};
type ServiceFilters = {
  query: string;
  category: string;
  status: string;
  sort: ServiceSort;
};

const emptyFilters: ServiceFilters = {
  query: '',
  category: 'All categories',
  status: 'All statuses',
  sort: 'default',
};

const emptyFormValues: ServiceFormValues = {
  name: '',
  category: 'Exterior Care',
  description: '',
  price: 0,
  durationMinutes: 30,
  status: 'Active',
};

function serviceFormError(values: ServiceFormValues) {
  if (!values.name.trim()) return 'Enter a service name.';
  if (!values.category) return 'Select a service category.';
  if (!Number.isFinite(values.price) || values.price <= 0) return 'Enter a price greater than ₹0.';
  if (!Number.isInteger(values.durationMinutes) || values.durationMinutes <= 0) {
    return 'Enter an estimated duration as a positive whole number of minutes.';
  }
  return '';
}

function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  return <span className={`service-status-badge service-status-badge--${status.toLowerCase()}`}>{status}</span>;
}

function ServiceDialog({
  mode,
  service,
  onClose,
  onSave,
  onDelete,
}: {
  mode: ServiceDialogMode;
  service: Service | null;
  onClose: () => void;
  onSave: (values: ServiceFormValues) => void;
  onDelete: () => void;
}) {
  const [values, setValues] = useState<ServiceFormValues>(service ? {
    name: service.name,
    category: service.category,
    description: service.description,
    price: service.price,
    durationMinutes: service.durationMinutes,
    status: service.status,
  } : emptyFormValues);
  const [validationError, setValidationError] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const isForm = mode !== 'delete';

  useEffect(() => {
    if (mode === 'delete') cancelRef.current?.focus();
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
    const error = serviceFormError(values);
    if (error) {
      setValidationError(error);
      return;
    }
    onSave({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      durationMinutes: Number(values.durationMinutes),
    });
  }

  const title = mode === 'add' ? 'Add service' : mode === 'edit' ? 'Edit service' : 'Delete service?';

  return (
    <div
      className="appointment-modal-backdrop service-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="service-dialog-title"
        aria-modal="true"
        className="appointment-modal service-modal"
        ref={modalRef}
        role={mode === 'delete' ? 'alertdialog' : 'dialog'}
      >
        <header className="appointment-modal-header">
          <div>
            <span className="appointment-modal-kicker">{mode === 'add' ? 'SERVICE CATALOG' : service?.id}</span>
            <h2 id="service-dialog-title">{title}</h2>
          </div>
          <button
            aria-label="Close service dialog"
            className="appointment-modal-close"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <Icon name="close" />
          </button>
        </header>

        {isForm ? (
          <form className="customer-form service-form" noValidate onSubmit={submitForm}>
            <p className="customer-form-preview-note">Preview only — changes are not saved to the database.</p>
            <label className="customer-form-field">
              <span>Service name <i>*</i></span>
              <input
                autoComplete="off"
                maxLength={100}
                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Exterior Car Wash"
                required
                value={values.name}
              />
            </label>
            <label className="customer-form-field">
              <span>Category <i>*</i></span>
              <select
                onChange={(event) => {
                  const category = serviceCategories.find((item) => item === event.target.value);
                  if (category) setValues((current) => ({ ...current, category }));
                }}
                required
                value={values.category}
              >
                {serviceCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className="customer-form-field">
              <span>Description</span>
              <textarea
                maxLength={300}
                onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                placeholder="Briefly describe what this service includes."
                value={values.description}
              />
            </label>
            <div className="service-form-two-column">
              <label className="customer-form-field">
                <span>Price (INR) <i>*</i></span>
                <input
                  inputMode="decimal"
                  min="0.01"
                  onChange={(event) => setValues((current) => ({
                    ...current,
                    price: event.target.value === '' ? 0 : Number(event.target.value),
                  }))}
                  placeholder="e.g. 1499"
                  required
                  step="0.01"
                  type="number"
                  value={values.price || ''}
                />
              </label>
              <label className="customer-form-field">
                <span>Estimated duration (minutes) <i>*</i></span>
                <input
                  inputMode="numeric"
                  min="1"
                  onChange={(event) => setValues((current) => ({
                    ...current,
                    durationMinutes: event.target.value === '' ? 0 : Number(event.target.value),
                  }))}
                  placeholder="e.g. 60"
                  required
                  step="1"
                  type="number"
                  value={values.durationMinutes || ''}
                />
              </label>
            </div>
            <label className="customer-form-field">
              <span>Status <i>*</i></span>
              <select
                onChange={(event) => {
                  const status = event.target.value;
                  if (status === 'Active' || status === 'Inactive') {
                    setValues((current) => ({ ...current, status }));
                  }
                }}
                value={values.status}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
            {validationError && <p className="customer-form-error" role="alert">{validationError}</p>}
            <div className="customer-dialog-actions">
              <button className="appointment-secondary-button" onClick={onClose} type="button">Discard</button>
              <button className="appointments-new-button service-save-button" type="submit">
                {mode === 'add' ? 'Add service' : 'Save changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="service-delete-confirmation">
            <p>
              Remove <strong>{service?.name}</strong> from the demonstration catalog? This preview change is not saved to the database.
            </p>
            <div className="appointment-modal-actions">
              <button className="appointment-secondary-button" onClick={onClose} ref={cancelRef} type="button">Keep service</button>
              <button className="appointment-danger-button" onClick={onDelete} type="button">Delete service</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function ServicesPage() {
  const [services, setServices] = useState(initialServices);
  const [summary, setSummary] = useState<ServiceSummary>({
    total: initialServiceSummary.total,
    active: initialServiceSummary.active,
    inactive: initialServiceSummary.inactive,
    totalPrice: initialServiceSummary.averagePrice * initialServiceSummary.total,
  });
  const [filters, setFilters] = useState<ServiceFilters>(emptyFilters);
  const [dialog, setDialog] = useState<{ mode: ServiceDialogMode; service: Service | null } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const nextIdRef = useRef(initialServices.length + 1);

  const filteredServices = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase();
    const matches = services.filter((service) => {
      const matchesQuery = query === '' ||
        service.name.toLocaleLowerCase().includes(query) ||
        service.category.toLocaleLowerCase().includes(query);
      const matchesCategory = filters.category === 'All categories' || service.category === filters.category;
      const matchesStatus = filters.status === 'All statuses' || service.status === filters.status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
    if (filters.sort === 'price-ascending') matches.sort((a, b) => a.price - b.price);
    if (filters.sort === 'price-descending') matches.sort((a, b) => b.price - a.price);
    return matches;
  }, [filters, services]);

  const hasFilters = filters.query !== '' || filters.category !== emptyFilters.category ||
    filters.status !== emptyFilters.status || filters.sort !== emptyFilters.sort;

  const closeDialog = useCallback(() => {
    setDialog(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, []);

  function openDialog(mode: ServiceDialogMode, service: Service | null = null, trigger?: HTMLElement | null) {
    returnFocusRef.current = trigger ?? addButtonRef.current;
    setDialog({ mode, service });
  }

  function updateFilter<K extends keyof ServiceFilters>(key: K, value: ServiceFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(emptyFilters);
    searchRef.current?.focus();
  }

  function updateServiceStatus(service: Service) {
    const status: ServiceStatus = service.status === 'Active' ? 'Inactive' : 'Active';
    setServices((current) => current.map((entry) => entry.id === service.id ? { ...entry, status } : entry));
    setSummary((current) => ({
      ...current,
      active: current.active + (status === 'Active' ? 1 : -1),
      inactive: current.inactive + (status === 'Inactive' ? 1 : -1),
    }));
    setAnnouncement(`${service.name} set to ${status}. This preview change is not saved.`);
  }

  function saveService(values: ServiceFormValues) {
    if (dialog?.mode === 'edit' && dialog.service) {
      const previous = dialog.service;
      setServices((current) => current.map((service) =>
        service.id === previous.id ? { ...values, id: previous.id } : service,
      ));
      setSummary((current) => ({
        ...current,
        active: current.active + Number(values.status === 'Active') - Number(previous.status === 'Active'),
        inactive: current.inactive + Number(values.status === 'Inactive') - Number(previous.status === 'Inactive'),
        totalPrice: current.totalPrice + values.price - previous.price,
      }));
      setAnnouncement(`${values.name} updated. This preview change is not saved.`);
    } else {
      const nextId = `SRV-${String(nextIdRef.current).padStart(3, '0')}`;
      nextIdRef.current += 1;
      setServices((current) => [...current, { ...values, id: nextId }]);
      setSummary((current) => ({
        ...current,
        total: current.total + 1,
        active: current.active + Number(values.status === 'Active'),
        inactive: current.inactive + Number(values.status === 'Inactive'),
        totalPrice: current.totalPrice + values.price,
      }));
      setAnnouncement(`${values.name} added. This preview change is not saved.`);
    }
    closeDialog();
  }

  function deleteService() {
    if (!dialog?.service) return;
    const removed = dialog.service;
    setServices((current) => current.filter((service) => service.id !== removed.id));
    setSummary((current) => ({
      ...current,
      total: current.total - 1,
      active: current.active - Number(removed.status === 'Active'),
      inactive: current.inactive - Number(removed.status === 'Inactive'),
      totalPrice: current.totalPrice - removed.price,
    }));
    setAnnouncement(`${removed.name} deleted. This preview change is not saved.`);
    closeDialog();
  }

  const cards = [
    { label: 'Total Services', value: String(summary.total), icon: 'services' as const },
    { label: 'Active Services', value: String(summary.active), icon: 'completed' as const },
    { label: 'Inactive Services', value: String(summary.inactive), icon: 'clock' as const },
    { label: 'Average Service Price', value: inrFormatter.format(summary.totalPrice / summary.total), icon: 'revenue' as const },
  ];

  return (
    <div className="services-page">
      <header className="services-page-header">
        <div className="services-page-heading">
          <span className="services-page-eyebrow">DETAILING STREET <i /> LUDHIANA</span>
          <h1>Services &amp; Pricing</h1>
          <p>Manage detailing services, packages, prices, and estimated durations.</p>
          <p className="services-demo-note">Demonstration catalog and business figures; no live service data.</p>
        </div>
        <div className="services-header-actions">
          <button
            className="appointments-new-button"
            onClick={(event) => openDialog('add', null, event.currentTarget)}
            ref={addButtonRef}
            type="button"
          >
            <span aria-hidden="true">+</span>
            Add Service
          </button>
        </div>
      </header>

      <p className="services-preview-banner" role="note">
        <span aria-hidden="true" />
        {serviceDataNotice}
      </p>

      <section aria-label="Service summaries" className="services-summary-grid">
        {cards.map((card, index) => (
          <article className={`appointments-summary-card services-summary-card services-summary-card--${index}`} key={card.label}>
            <div className="appointments-summary-top">
              <span>{card.label}</span>
              <span className="appointments-summary-icon"><Icon name={card.icon} /></span>
            </div>
            <strong>{card.value}</strong>
            <span className="appointments-summary-caption">Demonstration figures</span>
          </article>
        ))}
      </section>

      <section aria-labelledby="services-list-title" className="appointments-list-panel services-list-panel">
        <div className="appointments-list-header">
          <div>
            <span className="appointments-section-kicker">SERVICE MANAGEMENT</span>
            <h2 id="services-list-title">Service Catalog</h2>
            <p>{filteredServices.length} of {services.length} sample service records</p>
          </div>
          <button className="appointments-clear-button" disabled={!hasFilters} onClick={clearFilters} type="button">
            Clear filters
          </button>
        </div>

        <div className="services-toolbar">
          <label className="appointments-search">
            <Icon name="search" />
            <input
              onChange={(event) => updateFilter('query', event.target.value)}
              placeholder="Search service or category"
              ref={searchRef}
              type="search"
              value={filters.query}
            />
          </label>
          <label className="appointments-filter">
            <span>Category</span>
            <select aria-label="Filter services by category" onChange={(event) => updateFilter('category', event.target.value)} value={filters.category}>
              <option>All categories</option>
              {serviceCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="appointments-filter">
            <span>Status</span>
            <select aria-label="Filter services by status" onChange={(event) => updateFilter('status', event.target.value)} value={filters.status}>
              <option>All statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
          <label className="appointments-filter">
            <span>Sort</span>
            <select aria-label="Sort services by price" onChange={(event) => updateFilter('sort', event.target.value as ServiceSort)} value={filters.sort}>
              <option value="default">Default order</option>
              <option value="price-ascending">Price: Low to high</option>
              <option value="price-descending">Price: High to low</option>
            </select>
          </label>
        </div>

        {filteredServices.length ? (
          <div aria-label="Service catalog table" className="services-table-scroll" role="region" tabIndex={0}>
            <table className="services-table">
              <thead>
                <tr>
                  <th scope="col">Service Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Price</th>
                  <th scope="col">Estimated Duration</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <span className="service-name-cell">
                        <strong>{service.name}</strong>
                        <span>{service.description || 'No description provided.'}</span>
                      </span>
                    </td>
                    <td><span className="service-category-cell">{service.category}</span></td>
                    <td className="service-price-cell">{inrFormatter.format(service.price)}</td>
                    <td className="service-duration-cell">
                      {service.durationMinutes >= 60
                        ? `${Math.floor(service.durationMinutes / 60)} hr${Math.floor(service.durationMinutes / 60) > 1 ? 's' : ''}${service.durationMinutes % 60 ? ` ${service.durationMinutes % 60} min` : ''}`
                        : `${service.durationMinutes} min`}
                    </td>
                    <td><ServiceStatusBadge status={service.status} /></td>
                    <td>
                      <div className="service-row-actions">
                        <button
                          aria-label={`Edit ${service.name}`}
                          className="customer-row-button"
                          onClick={(event) => openDialog('edit', service, event.currentTarget)}
                          title="Edit service"
                          type="button"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          aria-label={`${service.status === 'Active' ? 'Deactivate' : 'Activate'} ${service.name}`}
                          className="service-toggle-button"
                          onClick={() => updateServiceStatus(service)}
                          type="button"
                        >
                          {service.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          aria-label={`Delete ${service.name}`}
                          className="customer-row-button customer-row-button--danger"
                          onClick={(event) => openDialog('delete', service, event.currentTarget)}
                          title="Delete service"
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
            <span className="appointments-empty-icon"><Icon name="search" /></span>
            <h3>No services found</h3>
            <p>Try a different search or filter, or clear the current filters.</p>
            <button className="appointments-clear-button" onClick={clearFilters} type="button">Clear filters</button>
          </div>
        )}
        <p className="appointments-table-footer">All catalog entries are fictional sample records. Preview changes are not saved.</p>
      </section>

      <p aria-live="polite" className="appointments-live-announcement">{announcement}</p>

      {dialog && (
        <ServiceDialog
          key={`${dialog.mode}-${dialog.service?.id ?? 'new'}`}
          mode={dialog.mode}
          onClose={closeDialog}
          onDelete={deleteService}
          onSave={saveService}
          service={dialog.service}
        />
      )}
    </div>
  );
}
