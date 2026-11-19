'use client';

import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import toast from 'react-hot-toast';
import { Icon } from '@/components/admin/dashboard/Icon';
import { STAFF_ROLES, type StaffRecord, type StaffRole, type StaffStatus } from '@/lib/staff';
import styles from './StaffPageContent.module.css';

interface StaffMetrics {
  total: number;
  active: number;
  inactive: number;
  detailingSpecialists: number;
}

interface StaffListResponse {
  success: boolean;
  error?: string;
  staff: StaffRecord[];
  metrics: StaffMetrics;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}

interface ApiResponse<T = Record<string, never>> {
  success: boolean;
  error?: string;
  staff?: T;
}

interface StaffForm {
  name: string;
  phone: string;
  email: string;
  role: StaffRole | '';
  specialization: string;
  joiningDate: string;
  status: StaffStatus;
  notes: string;
}

type DialogState =
  | { type: 'form'; staffId: string | null }
  | { type: 'view'; staff: StaffRecord }
  | { type: 'delete'; staff: StaffRecord }
  | null;

const emptyForm: StaffForm = {
  name: '',
  phone: '',
  email: '',
  role: '',
  specialization: '',
  joiningDate: '',
  status: 'Active',
  notes: '',
};

async function readApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let data: ApiResponse<T>;
  try {
    data = await response.json() as ApiResponse<T>;
  } catch {
    throw new Error('The server returned an invalid response.');
  }
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'The request could not be completed.');
  }
  return data;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function formatJoiningDate(value: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function staffFormFromRecord(staff: StaffRecord): StaffForm {
  return {
    name: staff.name,
    phone: staff.phone,
    email: staff.email,
    role: staff.role,
    specialization: staff.specialization,
    joiningDate: staff.joiningDate,
    status: staff.status,
    notes: staff.notes,
  };
}

export function StaffPageContent() {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [metrics, setMetrics] = useState<StaffMetrics>({
    total: 0,
    active: 0,
    inactive: 0,
    detailingSpecialists: 0,
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<DialogState>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);

  const loadStaff = useCallback(async (requestedPage: number, signal?: AbortSignal) => {
    const params = new URLSearchParams({
      q: searchQuery,
      role: roleFilter,
      status: statusFilter,
      page: String(requestedPage),
    });

    setLoading(true);
    setError('');
    let response: Response | undefined;
    try {
      response = await fetch(`/api/admin/staff?${params.toString()}`, {
        cache: 'no-store',
        signal,
      });
      const data = await readApiResponse<StaffRecord[]>(response) as StaffListResponse;
      setStaff(data.staff);
      setMetrics(data.metrics);
      setTotal(data.pagination.total);
      setPage(data.pagination.page);
      setPageCount(data.pagination.pageCount);
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === 'AbortError') return;
      setError(requestError instanceof Error ? requestError.message : 'Staff records could not be loaded.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [roleFilter, searchQuery, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    void loadStaff(page, controller.signal);
    return () => controller.abort();
  }, [loadStaff, page]);

  useEffect(() => {
    if (!dialog) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) setDialog(null);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dialog, saving]);

  function openCreateDialog() {
    setForm(emptyForm);
    setError('');
    setDialog({ type: 'form', staffId: null });
  }

  function openEditDialog(person: StaffRecord) {
    setForm(staffFormFromRecord(person));
    setError('');
    setDialog({ type: 'form', staffId: person._id });
  }

  function closeMenu(event: MouseEvent<HTMLButtonElement>) {
    event.currentTarget.closest('details')?.removeAttribute('open');
  }

  async function saveStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.role) {
      toast.error('Enter a name and phone number, and choose a role.');
      return;
    }
    setSaving(true);
    try {
      const isEditing = dialog?.type === 'form' && Boolean(dialog.staffId);
      const staffId = dialog?.type === 'form' ? dialog.staffId : null;
      const response = await fetch(
        isEditing ? `/api/admin/staff/${staffId}` : '/api/admin/staff',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, name: form.name.trim(), phone: form.phone.trim() }),
        }
      );
      await readApiResponse<StaffRecord>(response);
      setDialog(null);
      toast.success(isEditing ? 'Staff details updated.' : 'Staff member added.');
      if (!isEditing && page !== 1) {
        setPage(1);
      } else {
        await loadStaff(page);
      }
    } catch (requestError) {
      console.error('Failed to save staff member:', requestError);
      toast.error(requestError instanceof Error ? requestError.message : 'Staff member could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(person: StaffRecord) {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/staff/${person._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: person.status === 'Active' ? 'Inactive' : 'Active' }),
      });
      await readApiResponse<StaffRecord>(response);
      toast.success(person.status === 'Active' ? 'Staff member deactivated.' : 'Staff member activated.');
      await loadStaff(page);
    } catch (requestError) {
      console.error('Failed to change staff status:', requestError);
      toast.error(requestError instanceof Error ? requestError.message : 'Staff status could not be changed.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteStaff(person: StaffRecord) {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/staff/${person._id}`, { method: 'DELETE' });
      await readApiResponse(response);
      setDialog(null);
      toast.success('Staff member deleted.');
      const nextPage = staff.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else await loadStaff(page);
    } catch (requestError) {
      console.error('Failed to delete staff member:', requestError);
      toast.error(requestError instanceof Error ? requestError.message : 'Staff member could not be deleted.');
    } finally {
      setSaving(false);
    }
  }

  function clearFilters() {
    setSearchInput('');
    setSearchQuery('');
    setRoleFilter('All');
    setStatusFilter('All');
    setPage(1);
  }

  const hasFilters = Boolean(searchInput || roleFilter !== 'All' || statusFilter !== 'All');

  return (
    <div className={styles.staffPage}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>TEAM DIRECTORY</span>
          <h1>Staff</h1>
          <p>Manage your team, roles and staff availability.</p>
        </div>
        <button className={styles.primaryButton} onClick={openCreateDialog} type="button">
          <span aria-hidden="true">+</span>
          Add Staff
        </button>
      </header>

      <section aria-label="Staff overview" className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Total staff</span>
          <strong>{metrics.total}</strong>
          <span className={styles.metricCaption}>Team records</span>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Active staff</span>
          <strong>{metrics.active}</strong>
          <span className={styles.metricCaption}>Currently active</span>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Inactive staff</span>
          <strong>{metrics.inactive}</strong>
          <span className={styles.metricCaption}>Not currently active</span>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Detailing specialists</span>
          <strong>{metrics.detailingSpecialists}</strong>
          <span className={styles.metricCaption}>Assigned specialist role</span>
        </article>
      </section>

      <section aria-labelledby="staff-directory-title" className={styles.directoryCard}>
        <div className={styles.directoryHeader}>
          <div>
            <h2 id="staff-directory-title">Staff directory</h2>
            <p>{total} {total === 1 ? 'team member' : 'team members'}</p>
          </div>
          {hasFilters && (
            <button className={styles.clearButton} onClick={clearFilters} type="button">
              Clear filters
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <label className={styles.searchBox}>
            <Icon name="search" />
            <span className={styles.visuallyHidden}>Search staff by name or phone</span>
            <input
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or phone"
              type="search"
              value={searchInput}
            />
          </label>
          <label className={styles.filterControl}>
            <span className={styles.visuallyHidden}>Filter by role</span>
            <select
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(1);
              }}
              value={roleFilter}
            >
              <option value="All">All roles</option>
              {STAFF_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <label className={styles.filterControl}>
            <span className={styles.visuallyHidden}>Filter by status</span>
            <select
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              value={statusFilter}
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>

        {error && (
          <div className={styles.errorBanner} role="alert">
            <span>{error}</span>
            <button onClick={() => void loadStaff(page)} type="button">Retry</button>
          </div>
        )}

        {loading ? (
          <div aria-live="polite" className={styles.statePanel}>Loading staff directory…</div>
        ) : error ? (
          <div className={styles.statePanel}>The directory could not be loaded.</div>
        ) : staff.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><Icon name="staff" /></span>
            <h3>{total === 0 && !hasFilters ? 'No staff members yet' : 'No staff match these filters'}</h3>
            <p>
              {total === 0 && !hasFilters
                ? 'Add your first team member to start building your staff directory.'
                : 'Try a different search, role or status filter.'}
            </p>
            {total === 0 && !hasFilters ? (
              <button className={styles.primaryButton} onClick={openCreateDialog} type="button">
                <span aria-hidden="true">+</span>
                Add your first staff member
              </button>
            ) : (
              <button className={styles.secondaryButton} onClick={clearFilters} type="button">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div aria-label="Staff directory table" className={styles.tableScroll} role="region" tabIndex={0}>
              <table className={styles.staffTable}>
                <thead>
                  <tr>
                    <th scope="col">Team member</th>
                    <th scope="col">Role</th>
                    <th scope="col">Specialization</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Status</th>
                    <th scope="col">Joined</th>
                    <th scope="col"><span className={styles.visuallyHidden}>Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((person) => (
                    <tr key={person._id}>
                      <td>
                        <div className={styles.personCell}>
                          <span aria-hidden="true" className={styles.avatar}>{initials(person.name)}</span>
                          <span className={styles.personName}>{person.name}</span>
                        </div>
                      </td>
                      <td>{person.role}</td>
                      <td>{person.specialization || '—'}</td>
                      <td>{person.phone}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${person.status === 'Active' ? styles.active : styles.inactive}`}>
                          {person.status}
                        </span>
                      </td>
                      <td>{formatJoiningDate(person.joiningDate)}</td>
                      <td>
                        <details className={styles.actionsMenu}>
                          <summary aria-label={`Actions for ${person.name}`}>
                            <Icon name="more" />
                          </summary>
                          <div className={styles.menuItems} role="menu">
                            <button onClick={(event) => { closeMenu(event); setDialog({ type: 'view', staff: person }); }} role="menuitem" type="button">View details</button>
                            <button onClick={(event) => { closeMenu(event); openEditDialog(person); }} role="menuitem" type="button">Edit details</button>
                            <button disabled={saving} onClick={(event) => { closeMenu(event); void toggleStatus(person); }} role="menuitem" type="button">
                              {person.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className={styles.deleteAction} onClick={(event) => { closeMenu(event); setDialog({ type: 'delete', staff: person }); }} role="menuitem" type="button">Delete</button>
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className={styles.tableFooter}>
              <span>Showing {Math.min((page - 1) * 25 + 1, total)}–{Math.min(page * 25, total)} of {total}</span>
              <div className={styles.pagination}>
                <button
                  aria-label="Previous page"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  type="button"
                >
                  Previous
                </button>
                <span>Page {page} of {pageCount}</span>
                <button
                  aria-label="Next page"
                  disabled={page >= pageCount || loading}
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  type="button"
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      {dialog?.type === 'form' && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setDialog(null);
        }}>
          <section aria-labelledby="staff-form-title" aria-modal="true" className={styles.modal} role="dialog">
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>{dialog.staffId ? 'TEAM PROFILE' : 'NEW TEAM MEMBER'}</span>
                <h2 id="staff-form-title">{dialog.staffId ? 'Edit staff member' : 'Add staff member'}</h2>
              </div>
              <button aria-label="Close dialog" className={styles.closeButton} disabled={saving} onClick={() => setDialog(null)} type="button">
                <Icon name="close" />
              </button>
            </div>
            <form className={styles.staffForm} onSubmit={saveStaff}>
              <label className={styles.formField}>
                <span>Full name <b>*</b></span>
                <input autoComplete="name" maxLength={100} onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} />
              </label>
              <label className={styles.formField}>
                <span>Phone number <b>*</b></span>
                <input autoComplete="tel" inputMode="tel" maxLength={24} onChange={(event) => setForm({ ...form, phone: event.target.value })} required value={form.phone} />
              </label>
              <label className={styles.formField}>
                <span>Email <small>Optional</small></span>
                <input autoComplete="email" maxLength={254} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" value={form.email} />
              </label>
              <label className={styles.formField}>
                <span>Role <b>*</b></span>
                <select onChange={(event) => setForm({ ...form, role: event.target.value as StaffRole | '' })} required value={form.role}>
                  <option disabled value="">Select a role</option>
                  {STAFF_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
              <label className={styles.formField}>
                <span>Specialization <small>Optional</small></span>
                <input maxLength={80} onChange={(event) => setForm({ ...form, specialization: event.target.value })} placeholder="e.g. PPF, ceramic coating" value={form.specialization} />
              </label>
              <label className={styles.formField}>
                <span>Joining date <small>Optional</small></span>
                <input onChange={(event) => setForm({ ...form, joiningDate: event.target.value })} type="date" value={form.joiningDate} />
              </label>
              <label className={styles.formField}>
                <span>Status</span>
                <select onChange={(event) => setForm({ ...form, status: event.target.value as StaffStatus })} value={form.status}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label className={`${styles.formField} ${styles.formFieldFull}`}>
                <span>Notes <small>Optional</small></span>
                <textarea maxLength={1000} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} value={form.notes} />
              </label>
              <div className={styles.formActions}>
                <button className={styles.secondaryButton} disabled={saving} onClick={() => setDialog(null)} type="button">Cancel</button>
                <button className={styles.primaryButton} disabled={saving} type="submit">
                  {saving ? 'Saving…' : dialog.staffId ? 'Save changes' : 'Add staff member'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {dialog?.type === 'view' && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDialog(null);
        }}>
          <section aria-labelledby="staff-details-title" aria-modal="true" className={styles.modal} role="dialog">
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>TEAM PROFILE</span>
                <h2 id="staff-details-title">Staff details</h2>
              </div>
              <button aria-label="Close dialog" className={styles.closeButton} onClick={() => setDialog(null)} type="button"><Icon name="close" /></button>
            </div>
            <div className={styles.detailsIdentity}>
              <span aria-hidden="true" className={styles.avatarLarge}>{initials(dialog.staff.name)}</span>
              <div>
                <strong>{dialog.staff.name}</strong>
                <span>{dialog.staff.role}</span>
              </div>
              <span className={`${styles.statusBadge} ${dialog.staff.status === 'Active' ? styles.active : styles.inactive}`}>{dialog.staff.status}</span>
            </div>
            <dl className={styles.detailsGrid}>
              <div><dt>Phone</dt><dd>{dialog.staff.phone}</dd></div>
              <div><dt>Email</dt><dd>{dialog.staff.email || '—'}</dd></div>
              <div><dt>Specialization</dt><dd>{dialog.staff.specialization || '—'}</dd></div>
              <div><dt>Joining date</dt><dd>{formatJoiningDate(dialog.staff.joiningDate)}</dd></div>
              <div className={styles.detailsFull}><dt>Notes</dt><dd>{dialog.staff.notes || '—'}</dd></div>
            </dl>
            <div className={styles.formActions}>
              <button className={styles.secondaryButton} onClick={() => setDialog(null)} type="button">Close</button>
              <button className={styles.primaryButton} onClick={() => openEditDialog(dialog.staff)} type="button">Edit details</button>
            </div>
          </section>
        </div>
      )}

      {dialog?.type === 'delete' && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setDialog(null);
        }}>
          <section aria-labelledby="delete-staff-title" aria-modal="true" className={`${styles.modal} ${styles.confirmModal}`} role="alertdialog">
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>REMOVE TEAM MEMBER</span>
                <h2 id="delete-staff-title">Delete staff member?</h2>
              </div>
              <button aria-label="Close dialog" className={styles.closeButton} disabled={saving} onClick={() => setDialog(null)} type="button"><Icon name="close" /></button>
            </div>
            <p className={styles.confirmText}>
              This permanently removes <strong>{dialog.staff.name}</strong> from the staff directory. This action cannot be undone.
            </p>
            <div className={styles.formActions}>
              <button className={styles.secondaryButton} disabled={saving} onClick={() => setDialog(null)} type="button">Keep staff member</button>
              <button className={styles.dangerButton} disabled={saving} onClick={() => void deleteStaff(dialog.staff)} type="button">
                {saving ? 'Deleting…' : 'Delete staff member'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
