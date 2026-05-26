import { useState, useEffect, useCallback } from 'react'
import { tourService } from '../../../services/tourService'
import type { TourListItem, PaginationMeta } from '../../../services/tourService'
import { cn } from '@/lib/utils'
import {
  Plus, RefreshCw, Search, Star, Pencil, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight,
} from 'lucide-react'

interface Props { onAdd: () => void; onEdit: (id: string) => void }

const AdminTourList = ({ onAdd, onEdit }: Props) => {
  const [tours, setTours]       = useState<TourListItem[]>([])
  const [meta, setMeta]         = useState<PaginationMeta | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('')
  const [page, setPage]         = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const p: any = { page, limit: 12 }
      if (search) p.search = search
      if (status) p.isActive = status === 'active'
      const r = await tourService.list(p)
      setTours(r.tours)
      setMeta(r.pagination)
    } catch { setError('Could not load tours — check your connection.') }
    finally { setLoading(false) }
  }, [page, search, status])

  useEffect(() => { load() }, [load])

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?\nThis cannot be undone.`)) return
    setDeleting(id)
    try {
      await tourService.delete(id)
      setTours(t => t.filter(x => x._id !== id))
    } catch { alert('Delete failed — superadmin required.') }
    finally { setDeleting(null) }
  }

  const toggleActive = async (id: string) => {
    setToggling(id)
    try {
      const { isActive } = await tourService.toggleActive(id)
      setTours(t => t.map(x => x._id === id ? { ...x, isActive } : x))
    } catch { alert('Toggle failed.') }
    finally { setToggling(null) }
  }

  const toggleFeatured = async (id: string) => {
    setToggling(id)
    try {
      const { isFeatured } = await tourService.toggleFeatured(id)
      setTours(t => t.map(x => x._id === id ? { ...x, isFeatured } : x))
    } catch { alert('Toggle failed.') }
    finally { setToggling(null) }
  }

  const total    = meta?.total ?? 0
  const active   = tours.filter(t => t.isActive).length
  const inactive = tours.filter(t => !t.isActive).length
  const pages    = meta?.pages ?? 1
  const visibleStart = total === 0 ? 0 : (page - 1) * 12 + 1
  const visibleEnd   = Math.min(page * 12, total)

  const pageNums = Array.from({ length: Math.min(pages, 7) }, (_, i) => {
    if (pages <= 7) return i + 1
    if (page <= 4) return i + 1
    if (page >= pages - 3) return pages - 6 + i
    return page - 3 + i
  })

  return (
    <div className="admin-content admin-content--tour-list">

      {/* Header */}
      <div className="atl-list-shell">
        <div className="atl-page-header">
          <div className="atl-page-header__left">
            <div>
              <p className="atl-page-header__eyebrow">Tour inventory</p>
              <h2 className="atl-page-header__title">Manage Tours</h2>
            </div>
            <div className="atl-page-header__stats">
              <span className="atl-stat-chip atl-stat-chip--purple"><strong>{total}</strong> total</span>
              <span className="atl-stat-chip atl-stat-chip--green"><strong>{active}</strong> active</span>
              <span className="atl-stat-chip atl-stat-chip--red"><strong>{inactive}</strong> inactive</span>
            </div>
          </div>
          <div className="atl-page-header__right">
            <button className="quick-action-btn quick-action-btn--primary" onClick={onAdd} type="button">
              <Plus size={14} /> New Tour
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="atl-toolbar">
          <div className="atl-search">
            <Search />
            <input
              placeholder="Search by name…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="atl-select"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="atl-icon-btn" onClick={load} title="Refresh" type="button">
            <RefreshCw />
          </button>
        </div>
      </div>

      {error && (
        <div className="atl-inline-error">
          {error}
        </div>
      )}

      {/* Table */}
      <div>
        {loading ? (
          <div className="atl-loading">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="atl-skeleton" />
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="atl-empty">
            <div className="atl-empty-icon">
              <ImageIcon />
            </div>
            <h4>No tours found</h4>
            <p>{search || status ? 'Try a different search or status filter.' : 'Add your first tour to get started.'}</p>
            <button className="quick-action-btn quick-action-btn--primary" onClick={onAdd} type="button">
              <Plus size={14} /> Add Tour
            </button>
          </div>
        ) : (
          <div className="atl-table-wrap">
            <table className="atl-table">
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th className="atl-center">Featured</th>
                  <th className="atl-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tours.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div className="atl-tour-cell">
                        {t.images?.[0]?.url ? (
                          <img
                            src={t.images[0].url}
                            alt={
                              typeof t.images[0].alt === 'string'
                                ? t.images[0].alt
                                : t.images[0].alt?.en || t.heading.en
                            }
                            className="atl-thumb"
                          />
                        ) : (
                          <div className="atl-thumb-placeholder">
                            <ImageIcon />
                          </div>
                        )}
                        <div className="atl-tour-info">
                          <span className="atl-tour-name">{t.heading.en}</span>
                          <span className="atl-tour-slug">{t.slug.en}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {t.priceStartingFrom?.USD
                        ? <span className="atl-price">${t.priceStartingFrom.USD.toLocaleString()}</span>
                        : t.priceStartingFrom?.EGP
                        ? <span className="atl-price">EGP {t.priceStartingFrom.EGP.toLocaleString()}</span>
                        : t.priceStartingFrom?.SAR
                        ? <span className="atl-price">SAR {t.priceStartingFrom.SAR.toLocaleString()}</span>
                        : <span className="atl-na">—</span>}
                    </td>
                    <td>
                      {t.duration?.en
                        ? <span className="atl-duration-chip">{t.duration.en}</span>
                        : <span className="atl-na">—</span>}
                    </td>
                    <td><span className="atl-views">{t.viewCount.toLocaleString()}</span></td>
                    <td>
                      <button
                        onClick={() => toggleActive(t._id)}
                        disabled={toggling === t._id}
                        type="button"
                        className={cn(
                          'atl-status-toggle',
                          t.isActive ? 'atl-status-toggle--active' : 'atl-status-toggle--inactive'
                        )}
                      >
                        {t.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="atl-center">
                      <button
                        onClick={() => toggleFeatured(t._id)}
                        disabled={toggling === t._id}
                        type="button"
                        title={t.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                        className={cn(
                          'atl-star-btn',
                          t.isFeatured ? 'atl-star-btn--on' : 'atl-star-btn--off'
                        )}
                      >
                        <Star />
                      </button>
                    </td>
                    <td>
                      <div className="atl-actions">
                        <button className="atl-action-btn atl-action-btn--edit"
                          title="Edit" onClick={() => onEdit(t._id)} type="button">
                          <Pencil />
                        </button>
                        <button className="atl-action-btn atl-action-btn--delete"
                          title="Delete" onClick={() => del(t._id, t.heading.en)} disabled={deleting === t._id} type="button">
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div className="atl-pagination">
            <span className="atl-page-info">
              Showing {visibleStart}–{visibleEnd} of {meta.total}
            </span>
            <div className="atl-page-btns">
              <button className="atl-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1} type="button">
                <ChevronLeft size={14} />
              </button>
              {pageNums.map(n => (
                <button
                  key={n}
                  className={cn('atl-page-btn', page === n && 'atl-page-btn--active')}
                  onClick={() => setPage(n)}
                  type="button"
                >
                  {n}
                </button>
              ))}
              <button className="atl-page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages} type="button">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminTourList
