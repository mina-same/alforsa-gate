import { useState, useEffect, useCallback } from 'react'
import bookingService from '../../../services/bookingService'
import type { IBookingRecord, IBookingStats } from '../../../services/bookingService'
import { RefreshCw, Search, Trash2, ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

interface PaginationMeta {
  total: number; page: number; limit: number; pages: number; hasMore: boolean;
}

const AdminBookingList = () => {
  const { user } = useAuth()
  const isSuperadmin = user?.role === 'superadmin'

  const [bookings, setBookings]         = useState<IBookingRecord[]>([])
  const [meta, setMeta]                 = useState<PaginationMeta | null>(null)
  const [stats, setStats]               = useState<IBookingStats | null>(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]                 = useState(1)
  const [updating, setUpdating]         = useState<string | null>(null)
  const [deleting, setDeleting]         = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const p: any = { page, limit: 15 }
      if (search) p.search = search
      if (statusFilter) p.status = statusFilter
      const [r, s] = await Promise.all([
        bookingService.listBookings(p),
        bookingService.getBookingStats(),
      ])
      setBookings(r.bookings)
      setMeta(r.pagination)
      setStats(s)
    } catch {
      setError('Could not load bookings — check your connection.')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { load() }, [load])

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleStatus = (v: string) => { setStatusFilter(v); setPage(1) }

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'cancelled' | 'pending') => {
    setUpdating(id)
    try {
      const updated = await bookingService.updateBookingStatus(id, status)
      setBookings(prev => prev.map(b => b._id === id ? updated : b))
      setStats(prev => prev ? null : null) // trigger re-fetch of stats on next load
    } catch { /* silent */ }
    finally { setUpdating(null) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this booking? This cannot be undone.')) return
    setDeleting(id)
    try {
      await bookingService.deleteBooking(id)
      setBookings(prev => prev.filter(b => b._id !== id))
      if (meta) setMeta({ ...meta, total: meta.total - 1 })
    } catch { /* silent */ }
    finally { setDeleting(null) }
  }

  const pages = meta?.pages ?? 1
  const pageNums = Array.from({ length: Math.min(pages, 7) }, (_, i) => {
    if (pages <= 7) return i + 1
    if (page <= 4) return i + 1
    if (page >= pages - 3) return pages - 6 + i
    return page - 3 + i
  })

  const total = meta?.total ?? 0
  const visibleStart = meta ? (meta.page - 1) * meta.limit + 1 : 0
  const visibleEnd   = meta ? Math.min(meta.page * meta.limit, total) : 0

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
    catch { return iso }
  }

  const tourName = (b: IBookingRecord) =>
    typeof b.tourName === 'object' ? b.tourName.en : String(b.tourName)

  return (
    <div className="admin-content">
      <div className="atl-list-shell">

        {/* Page header */}
        <div className="atl-page-header">
          <div className="atl-page-header__left">
            <p className="atl-page-header__eyebrow">Bookings</p>
            <h2 className="atl-page-header__title">Booking Requests</h2>
            <div className="atl-page-header__stats">
              <span className="atl-stat-chip atl-stat-chip--purple">
                <strong>{stats?.total ?? '—'}</strong> total
              </span>
              <span className="atl-stat-chip abk-chip--pending">
                <strong>{stats?.pending ?? '—'}</strong> pending
              </span>
              <span className="atl-stat-chip atl-stat-chip--green">
                <strong>{stats?.confirmed ?? '—'}</strong> confirmed
              </span>
              <span className="atl-stat-chip atl-stat-chip--red">
                <strong>{stats?.cancelled ?? '—'}</strong> cancelled
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="atl-toolbar">
          <div className="atl-search">
            <Search size={15} />
            <input
              type="search"
              placeholder="Search name, email or ref…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <select
            className="atl-select"
            value={statusFilter}
            onChange={e => handleStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="atl-icon-btn" onClick={load} title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Error */}
        {error && <div className="atl-inline-error">{error}</div>}

        {/* Loading */}
        {loading ? (
          <div className="atl-loading">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="atl-skeleton" />
            ))}
          </div>
        ) : bookings.length === 0 ? (

          /* Empty state */
          <div className="atl-empty">
            <div className="atl-empty-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4>No bookings yet</h4>
            <p>{search || statusFilter ? 'No results match your filters.' : 'Bookings submitted from the tour pages will appear here.'}</p>
          </div>

        ) : (
          /* Table */
          <div className="atl-table-wrap">
            <table className="atl-table abk-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Tour</th>
                  <th>Travel Date</th>
                  <th className="atl-center">Pax</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const pax  = b.adults + b.youth + b.children
                  const busy = updating === b._id || deleting === b._id
                  return (
                    <tr key={b._id} style={{ opacity: busy ? 0.5 : 1, transition: 'opacity 0.2s' }}>

                      {/* Ref */}
                      <td>
                        <span className="abk-ref">{b.bookingRef}</span>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="abk-customer">
                          <span className="abk-customer__name">{b.customerName}</span>
                          <span className="abk-customer__email">{b.customerEmail}</span>
                          {b.customerPhone && (
                            <span className="abk-customer__phone">{b.customerPhone}</span>
                          )}
                        </div>
                      </td>

                      {/* Tour */}
                      <td>
                        <span className="abk-tour-name">{tourName(b)}</span>
                      </td>

                      {/* Date */}
                      <td>
                        <div className="abk-date">
                          <span className="abk-date__day">{formatDate(b.travelDate)}</span>
                          <span className="abk-date__time">{b.travelTime}</span>
                        </div>
                      </td>

                      {/* Pax */}
                      <td className="atl-center">
                        <span className="abk-pax">{pax}</span>
                      </td>

                      {/* Total */}
                      <td>
                        <span className="abk-amount">${b.totalAmount}</span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`booking-status booking-status--${b.status}`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="atl-actions">
                          {b.status !== 'confirmed' && (
                            <button
                              className="abk-action-btn abk-action-btn--confirm"
                              title="Mark as confirmed"
                              disabled={busy}
                              onClick={() => handleStatusUpdate(b._id, 'confirmed')}
                            >
                              <Check size={13} />
                            </button>
                          )}
                          {b.status !== 'cancelled' && (
                            <button
                              className="abk-action-btn abk-action-btn--cancel"
                              title="Mark as cancelled"
                              disabled={busy}
                              onClick={() => handleStatusUpdate(b._id, 'cancelled')}
                            >
                              <X size={13} />
                            </button>
                          )}
                          {b.status === 'confirmed' && b.status !== 'pending' && (
                            <button
                              className="abk-action-btn abk-action-btn--reset"
                              title="Reset to pending"
                              disabled={busy}
                              onClick={() => handleStatusUpdate(b._id, 'pending')}
                            >
                              <RefreshCw size={13} />
                            </button>
                          )}
                          {isSuperadmin && (
                            <button
                              className="atl-action-btn atl-action-btn--delete"
                              title="Delete booking"
                              disabled={busy}
                              onClick={() => handleDelete(b._id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div className="atl-pagination">
            <span className="atl-page-info">
              Showing {visibleStart}–{visibleEnd} of {total}
            </span>
            <div className="atl-page-btns">
              <button
                className="atl-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
              </button>
              {pageNums.map(n => (
                <button
                  key={n}
                  className={`atl-page-btn${page === n ? ' atl-page-btn--active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="atl-page-btn"
                disabled={page === pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminBookingList
