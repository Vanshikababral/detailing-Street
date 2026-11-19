'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from './Icon';

interface AppointmentResult {
  _id: string;
  bookingId: string;
  customerName: string;
  service: string;
  status: string;
  preferredDate?: string;
  carModel?: string;
}

interface VehicleResult {
  _id: string;
  registration: string;
  make: string;
  model: string;
  ownerName: string;
  type?: string;
}

interface CustomerResult {
  _id: string;
  customerId?: string;
  name: string;
  phone: string;
  email?: string;
  type?: string;
}

interface ServiceResult {
  _id: string;
  serviceId?: string;
  name: string;
  category: string;
  price: number;
}

interface StaffResult {
  _id: string;
  name: string;
  role: string;
  phone?: string;
  status?: string;
}

interface SearchResults {
  appointments: AppointmentResult[];
  vehicles: VehicleResult[];
  customers: CustomerResult[];
  services: ServiceResult[];
  staff: StaffResult[];
}

const ADMIN_PAGES = [
  { name: 'Dashboard', path: '/admin', icon: 'dashboard' as const, description: 'Overview & metrics' },
  { name: 'Appointments', path: '/admin/appointments', icon: 'appointments' as const, description: 'Bookings & schedule' },
  { name: 'Customers', path: '/admin/customers', icon: 'customers' as const, description: 'Customer records' },
  { name: 'Vehicles', path: '/admin/vehicles', icon: 'vehicles' as const, description: 'Vehicle fleet' },
  { name: 'Services', path: '/admin/services', icon: 'services' as const, description: 'Service catalog & pricing' },
  { name: 'Staff', path: '/admin/staff', icon: 'staff' as const, description: 'Team members' },
  { name: 'Settings', path: '/admin/settings', icon: 'settings' as const, description: 'Studio configuration' },
];

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    appointments: [],
    vehicles: [],
    customers: [],
    services: [],
    staff: [],
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcuts (Ctrl+K or Cmd+K or /)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Perform search query
  const searchApi = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults({
        appointments: [],
        vehicles: [],
        customers: [],
        services: [],
        staff: [],
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.results) {
          setResults(data.results);
        }
      }
    } catch (err) {
      console.error('Failed to search dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length < 2) {
      setResults({
        appointments: [],
        vehicles: [],
        customers: [],
        services: [],
        staff: [],
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      searchApi(val);
    }, 220);
  };

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(path);
  };

  const clearSearch = () => {
    setQuery('');
    setResults({
      appointments: [],
      vehicles: [],
      customers: [],
      services: [],
      staff: [],
    });
    inputRef.current?.focus();
  };

  // Filter matching navigation pages
  const matchingPages = ADMIN_PAGES.filter((page) =>
    query.trim() === '' ||
    page.name.toLowerCase().includes(query.toLowerCase()) ||
    page.description.toLowerCase().includes(query.toLowerCase())
  );

  const hasDatabaseResults =
    results.appointments.length > 0 ||
    results.vehicles.length > 0 ||
    results.customers.length > 0 ||
    results.staff.length > 0 ||
    results.services.length > 0;

  const totalResultsCount =
    (matchingPages.length > 0 && query.trim() ? matchingPages.length : 0) +
    results.appointments.length +
    results.vehicles.length +
    results.customers.length +
    results.staff.length +
    results.services.length;

  return (
    <div className="global-search-container" ref={containerRef}>
      <label className="global-search">
        <Icon name="search" />
        <input
          aria-label="Search dashboard"
          aria-expanded={isOpen}
          autoComplete="off"
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search dashboard, bookings, vehicles..."
          ref={inputRef}
          type="text"
          value={query}
        />
        {query ? (
          <button
            aria-label="Clear search"
            className="global-search-clear"
            onClick={clearSearch}
            type="button"
          >
            ×
          </button>
        ) : (
          <kbd className="global-search-kbd">Ctrl K</kbd>
        )}
      </label>

      {isOpen && (
        <div aria-label="Search results" className="global-search-dropdown" role="region">
          {loading && (
            <div className="global-search-loading">
              <span className="global-search-spinner" />
              <span>Searching studio database...</span>
            </div>
          )}

          {/* Quick Page Navigation (always visible if query is short, or matches) */}
          {matchingPages.length > 0 && (
            <div className="global-search-section">
              <span className="global-search-section-title">
                {query.trim().length >= 2 ? 'Pages' : 'Quick Navigation'}
              </span>
              <div className="global-search-items">
                {matchingPages.map((page) => (
                  <button
                    className="global-search-item"
                    key={page.path}
                    onClick={() => handleSelect(page.path)}
                    type="button"
                  >
                    <div className="global-search-item-icon">
                      <Icon name={page.icon} />
                    </div>
                    <div className="global-search-item-info">
                      <span className="global-search-item-title">{page.name}</span>
                      <span className="global-search-item-desc">{page.description}</span>
                    </div>
                    <span className="global-search-item-action">Jump →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Appointments */}
          {results.appointments.length > 0 && (
            <div className="global-search-section">
              <span className="global-search-section-title">
                Appointments ({results.appointments.length})
              </span>
              <div className="global-search-items">
                {results.appointments.map((apt) => (
                  <button
                    className="global-search-item"
                    key={apt._id}
                    onClick={() => handleSelect('/admin/appointments')}
                    type="button"
                  >
                    <div className="global-search-item-icon global-search-item-icon--apt">
                      <Icon name="appointments" />
                    </div>
                    <div className="global-search-item-info">
                      <div className="global-search-item-row">
                        <span className="global-search-item-title">{apt.customerName}</span>
                        <span className={`global-search-badge global-search-badge--${apt.status.toLowerCase()}`}>
                          {apt.status}
                        </span>
                      </div>
                      <span className="global-search-item-desc">
                        {apt.service} {apt.carModel ? `• ${apt.carModel}` : ''} {apt.bookingId ? `• ${apt.bookingId}` : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vehicles */}
          {results.vehicles.length > 0 && (
            <div className="global-search-section">
              <span className="global-search-section-title">
                Vehicles ({results.vehicles.length})
              </span>
              <div className="global-search-items">
                {results.vehicles.map((veh) => (
                  <button
                    className="global-search-item"
                    key={veh._id}
                    onClick={() => handleSelect('/admin/vehicles')}
                    type="button"
                  >
                    <div className="global-search-item-icon global-search-item-icon--veh">
                      <Icon name="vehicles" />
                    </div>
                    <div className="global-search-item-info">
                      <div className="global-search-item-row">
                        <span className="global-search-item-title">
                          {veh.make} {veh.model}
                        </span>
                        <span className="global-search-badge global-search-badge--reg">
                          {veh.registration}
                        </span>
                      </div>
                      <span className="global-search-item-desc">
                        Owner: {veh.ownerName} {veh.type ? `• ${veh.type}` : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {results.customers.length > 0 && (
            <div className="global-search-section">
              <span className="global-search-section-title">
                Customers ({results.customers.length})
              </span>
              <div className="global-search-items">
                {results.customers.map((cust) => (
                  <button
                    className="global-search-item"
                    key={cust._id}
                    onClick={() => handleSelect('/admin/customers')}
                    type="button"
                  >
                    <div className="global-search-item-icon global-search-item-icon--cust">
                      <Icon name="customers" />
                    </div>
                    <div className="global-search-item-info">
                      <div className="global-search-item-row">
                        <span className="global-search-item-title">{cust.name}</span>
                        {cust.type && (
                          <span className="global-search-badge global-search-badge--cust">
                            {cust.type}
                          </span>
                        )}
                      </div>
                      <span className="global-search-item-desc">
                        {cust.phone} {cust.email ? `• ${cust.email}` : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Staff */}
          {results.staff.length > 0 && (
            <div className="global-search-section">
              <span className="global-search-section-title">
                Staff ({results.staff.length})
              </span>
              <div className="global-search-items">
                {results.staff.map((st) => (
                  <button
                    className="global-search-item"
                    key={st._id}
                    onClick={() => handleSelect('/admin/staff')}
                    type="button"
                  >
                    <div className="global-search-item-icon global-search-item-icon--staff">
                      <Icon name="staff" />
                    </div>
                    <div className="global-search-item-info">
                      <div className="global-search-item-row">
                        <span className="global-search-item-title">{st.name}</span>
                        <span className="global-search-badge global-search-badge--staff">
                          {st.role}
                        </span>
                      </div>
                      <span className="global-search-item-desc">
                        {st.phone || 'No phone'} {st.status ? `• ${st.status}` : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {results.services.length > 0 && (
            <div className="global-search-section">
              <span className="global-search-section-title">
                Services ({results.services.length})
              </span>
              <div className="global-search-items">
                {results.services.map((srv) => (
                  <button
                    className="global-search-item"
                    key={srv._id}
                    onClick={() => handleSelect('/admin/services')}
                    type="button"
                  >
                    <div className="global-search-item-icon global-search-item-icon--srv">
                      <Icon name="services" />
                    </div>
                    <div className="global-search-item-info">
                      <div className="global-search-item-row">
                        <span className="global-search-item-title">{srv.name}</span>
                        <span className="global-search-badge global-search-badge--price">
                          ₹{srv.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="global-search-item-desc">
                        {srv.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {!loading && query.trim().length >= 2 && totalResultsCount === 0 && (
            <div className="global-search-empty">
              <p>No results found for &ldquo;{query}&rdquo;</p>
              <small>Try searching by customer name, vehicle number, phone, or service</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
