import { useState, useEffect, useCallback } from 'react';
import { destinationService } from '../../../services/destinationService';
import type { IDestinationListItem } from '../../../services/destinationService';
import {
  Plus, RefreshCw, Search, Globe, Pencil, Trash2, Image as ImageIcon,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onAdd:  () => void;
  onEdit: (id: string) => void;
}

const AdminDestinationList = ({ onAdd, onEdit }: Props) => {
  const [items, setItems]       = useState<IDestinationListItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [page, setPage]         = useState(1);
  const LIMIT = 12;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params: any = { search: search || undefined };
      if (status === 'active')   params.isActive = true;
      if (status === 'inactive') params.isActive = false;
      const data = await destinationService.list(params);
      setItems(data);
    } catch {
      setError('Could not load destinations — check your connection.');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      const updated = await destinationService.toggleActive(id);
      setItems(prev => prev.map(d => d._id === id ? { ...d, isActive: (updated as any).isActive } : d));
    } catch { alert('Toggle failed.'); }
    finally { setToggling(null); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?\nThis cannot be undone.`)) return;
    setDeleting(id);
    try {
      await destinationService.delete(id);
      setItems(prev => prev.filter(d => d._id !== id));
    } catch { alert('Delete failed — superadmin required.'); }
    finally { setDeleting(null); }
  };

  // Client-side pagination (API returns all)
  const filtered = items;
  const total    = filtered.length;
  const active   = filtered.filter(d => d.isActive).length;
  const inactive = filtered.filter(d => !d.isActive).length;
  const pages    = Math.max(1, Math.ceil(total / LIMIT));
  const slice    = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const visibleStart = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const visibleEnd   = Math.min(page * LIMIT, total);

  const pageNums = Array.from({ length: Math.min(pages, 7) }, (_, i) => {
    if (pages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= pages - 3) return pages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="admin-content admin-content--tour-list">

      {/* Page Header */}
      <div className="atl-list-shell">
        <div className="atl-page-header">
          <div className="atl-page-header__left">
            <div>
              <p className="atl-page-header__eyebrow">Destination inventory</p>
              <h2 className="atl-page-header__title">Manage Destinations</h2>
            </div>
            <div className="atl-page-header__stats">
              <span className="atl-stat-chip atl-stat-chip--purple"><strong>{total}</strong> total</span>
              <span className="atl-stat-chip atl-stat-chip--green"><strong>{active}</strong> active</span>
              <span className="atl-stat-chip atl-stat-chip--red"><strong>{inactive}</strong> inactive</span>
            </div>
          </div>
          <div className="atl-page-header__right">
            <button className="quick-action-btn quick-action-btn--primary" onClick={onAdd} type="button">
              <Plus size={14} /> New Destination
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
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="atl-select"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
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

      {error && <div className="atl-inline-error">{error}</div>}

      <div>
        {loading ? (
          <div className="atl-loading">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="atl-skeleton" />
            ))}
          </div>
        ) : slice.length === 0 ? (
          <div className="atl-empty">
            <div className="atl-empty-icon"><Globe /></div>
            <h4>No destinations found</h4>
            <p>{search || status ? 'Try a different search or status filter.' : 'Add your first destination to get started.'}</p>
            <button className="quick-action-btn quick-action-btn--primary" onClick={onAdd} type="button">
              <Plus size={14} /> Add Destination
            </button>
          </div>
        ) : (
          <div className="atl-table-wrap">
            <table className="atl-table">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Slug</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="atl-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.map(d => (
                  <tr key={d._id}>
                    <td>
                      <div className="atl-tour-cell">
                        {d.heroImage ? (
                          <img
                            src={d.heroImage}
                            alt={d.name.en}
                            className="atl-thumb"
                            onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="atl-thumb-placeholder">
                            <ImageIcon />
                          </div>
                        )}
                        <div className="atl-tour-info">
                          <span className="atl-tour-name">
                            {d.countryFlag && <span style={{ marginRight: 6 }}>{d.countryFlag}</span>}
                            {d.name.en}
                          </span>
                          {d.name.ar && <span className="atl-tour-slug" dir="rtl">{d.name.ar}</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4, color: '#374151' }}>
                        {d.slug}
                      </code>
                    </td>
                    <td><span className="atl-views">{(d.viewCount ?? 0).toLocaleString()}</span></td>
                    <td>
                      <button
                        onClick={() => handleToggle(d._id)}
                        disabled={toggling === d._id}
                        type="button"
                        className={cn(
                          'atl-status-toggle',
                          d.isActive ? 'atl-status-toggle--active' : 'atl-status-toggle--inactive',
                        )}
                      >
                        {toggling === d._id ? '…' : d.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="atl-cell-muted" style={{ fontSize: 12 }}>
                      {new Date(d.updatedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="atl-actions">
                        <button
                          className="atl-action-btn atl-action-btn--edit"
                          title="Edit"
                          onClick={() => onEdit(d._id)}
                          type="button"
                        >
                          <Pencil />
                        </button>
                        <button
                          className="atl-action-btn atl-action-btn--delete"
                          title="Delete"
                          onClick={() => handleDelete(d._id, d.name.en)}
                          disabled={deleting === d._id}
                          type="button"
                        >
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
        {pages > 1 && (
          <div className="atl-pagination">
            <span className="atl-page-info">
              Showing {visibleStart}–{visibleEnd} of {total}
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
  );
};

export default AdminDestinationList;
