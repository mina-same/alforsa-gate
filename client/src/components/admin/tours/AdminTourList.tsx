import { useState, useEffect, useCallback } from 'react'
import { tourService } from '../../../services/tourService'
import type { TourListItem, PaginationMeta } from '../../../services/tourService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

  const pageNums = Array.from({ length: Math.min(pages, 7) }, (_, i) => {
    if (pages <= 7) return i + 1
    if (page <= 4) return i + 1
    if (page >= pages - 3) return pages - 6 + i
    return page - 3 + i
  })

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">Tours</h1>
            <div className="flex items-center gap-2">
              <Badge variant="default">{total} total</Badge>
              <Badge variant="success">{active} active</Badge>
              {inactive > 0 && <Badge variant="danger">{inactive} inactive</Badge>}
            </div>
          </div>
          <Button onClick={onAdd} size="sm" type="button">
            <Plus className="h-4 w-4" /> New Tour
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search by name…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <select
            className="h-8 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button variant="ghost" size="icon" onClick={load} title="Refresh" type="button" className="h-8 w-8">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <ImageIcon className="h-6 w-6 text-gray-300" />
            </div>
            <h4 className="font-semibold text-gray-700 mb-1">No tours yet</h4>
            <p className="text-sm text-gray-400 mb-4">Add your first tour to get started.</p>
            <Button onClick={onAdd} size="sm" type="button">
              <Plus className="h-4 w-4" /> Add Tour
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Tour</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Views</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Featured</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tours.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {t.images?.[0]?.url ? (
                          <img
                            src={t.images[0].url}
                            alt={t.images[0].alt || t.heading.en}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <ImageIcon className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800 leading-snug">{t.heading.en}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{t.slug.en}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.priceStartingFrom?.USD
                        ? <span className="font-medium">${t.priceStartingFrom.USD.toLocaleString()}</span>
                        : t.priceStartingFrom?.EGP
                        ? <span className="font-medium">EGP {t.priceStartingFrom.EGP.toLocaleString()}</span>
                        : t.priceStartingFrom?.SAR
                        ? <span className="font-medium">SAR {t.priceStartingFrom.SAR.toLocaleString()}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {t.duration?.en
                        ? <Badge variant="outline">{t.duration.en}</Badge>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{t.viewCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(t._id)}
                        disabled={toggling === t._id}
                        type="button"
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors border',
                          t.isActive
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', t.isActive ? 'bg-green-500' : 'bg-gray-400')} />
                        {t.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(t._id)}
                        disabled={toggling === t._id}
                        type="button"
                        title={t.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          t.isFeatured
                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                            : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'
                        )}
                      >
                        <Star className={cn('h-4 w-4', t.isFeatured && 'fill-current')} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                          title="Edit" onClick={() => onEdit(t._id)} type="button">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          title="Delete" onClick={() => del(t._id, t.heading.en)} disabled={deleting === t._id} type="button">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
          <div className="flex items-center justify-between mt-4 px-1">
            <span className="text-xs text-gray-400">
              Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, meta.total)} of {meta.total}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(p => p - 1)} disabled={page === 1} type="button">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              {pageNums.map(n => (
                <Button
                  key={n}
                  variant={page === n ? 'default' : 'outline'}
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => setPage(n)}
                  type="button"
                >
                  {n}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(p => p + 1)} disabled={page === pages} type="button">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminTourList
