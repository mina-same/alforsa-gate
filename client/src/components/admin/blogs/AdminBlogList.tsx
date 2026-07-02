import { useState, useEffect, useCallback } from 'react';
import { blogService } from '../../../services/destinationService';
import type { IBlog } from '../../../services/destinationService';

interface Props {
  onAdd:  () => void;
  onEdit: (id: string) => void;
}

const EditIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;

const AdminBlogList = ({ onAdd, onEdit }: Props) => {
  const [items, setItems]     = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { blogs } = await blogService.list({ search: search || undefined, limit: 50 });
      setItems(blogs);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const updated = await blogService.togglePublished(id);
      setItems((prev) => prev.map((b) => b._id === id ? { ...b, isPublished: (updated as any).isPublished } : b));
    } catch { /* ignore */ }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    setDeleting(id);
    try {
      await blogService.delete(id);
      setItems((prev) => prev.filter((b) => b._id !== id));
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  };

  return (
    <div className="admin-content">
      <div className="atl-toolbar">
        <div className="atl-search">
          <span className="atl-search-icon"><SearchIcon /></span>
          <input className="atl-search-input" placeholder="Search blogs…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="atl-toolbar-right">
          <button className="atf-btn atf-btn--primary" onClick={onAdd}>+ Add Blog</button>
        </div>
      </div>

      {loading ? (
        <div className="atl-empty"><p style={{ color: '#9ca3af', fontSize: 14 }}>Loading…</p></div>
      ) : items.length === 0 ? (
        <div className="atl-empty">
          <p style={{ color: '#6b7280', fontSize: 14 }}>No blogs yet</p>
          <button className="atf-btn atf-btn--primary" onClick={onAdd}>Write your first blog</button>
        </div>
      ) : (
        <div className="atl-table-wrap">
          <table className="atl-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Destinations</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {b.coverImage && <img src={b.coverImage} alt="" style={{ width: 44, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />}
                      <div>
                        <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 14 }}>{b.title.en}</span>
                        {b.title.ar && <div style={{ fontSize: 11, color: '#9ca3af' }}>{b.title.ar}</div>}
                      </div>
                    </div>
                  </td>
                  <td><code style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{b.slug}</code></td>
                  <td style={{ fontSize: 12, color: '#6b7280' }}>{(b.destinationSlugs || []).join(', ') || '—'}</td>
                  <td>
                    <button onClick={() => handleToggle(b._id)} disabled={togglingId === b._id}
                      className={`atl-badge ${b.isPublished ? 'atl-badge--active' : 'atl-badge--inactive'}`}
                      style={{ cursor: 'pointer', border: 'none' }}>
                      {togglingId === b._id ? '…' : b.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: 12 }}>{b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="atl-action-btn atl-action-btn--edit"   onClick={() => onEdit(b._id)} title="Edit"><EditIcon /></button>
                      <button className="atl-action-btn atl-action-btn--delete" onClick={() => handleDelete(b._id, b.title.en)} disabled={deleting === b._id} title="Delete">{deleting === b._id ? '…' : <TrashIcon />}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBlogList;
