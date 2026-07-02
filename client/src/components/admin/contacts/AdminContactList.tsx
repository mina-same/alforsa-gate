import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getContacts, updateContactStatus, deleteContact } from '../../../api/contacts';
import type { Contact } from '../../../api/contacts';
import AdminContactDetail from './AdminContactDetail';

type Filter = 'all' | 'new' | 'read' | 'replied';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',     value: 'all'     },
  { label: 'New',     value: 'new'     },
  { label: 'Read',    value: 'read'    },
  { label: 'Replied', value: 'replied' },
];

const StatusBadge = ({ status }: { status: Contact['status'] }) => {
  const map = {
    new:     { label: 'New',     cls: 'atb-badge atb-badge--warning' },
    read:    { label: 'Read',    cls: 'atb-badge atb-badge--info'    },
    replied: { label: 'Replied', cls: 'atb-badge atb-badge--success' },
  };
  const { label, cls } = map[status];
  return <span className={cls}>{label}</span>;
};

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

const ChevronIcon = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
  </svg>
);

interface Props {
  refreshTrigger?: number;
}

const AdminContactList = ({ refreshTrigger = 0 }: Props) => {
  const [contacts, setContacts]     = useState<Contact[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<Filter>('all');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [selected, setSelected]     = useState<Contact | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getContacts({ page, limit: 15, status: filter });
      setContacts(res.data.contacts);
      setTotalPages(res.data.pagination.pages);
      setTotal(res.data.pagination.total);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { load(); }, [load, refreshTrigger]);

  const handleFilterChange = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  const handleStatusChange = async (id: string, status: Contact['status']) => {
    try {
      await updateContactStatus(id, status);
      setContacts(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      if (selected?._id === id) setSelected(prev => prev ? { ...prev, status } : prev);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await deleteContact(id);
      setContacts(prev => prev.filter(c => c._id !== id));
      setTotal(prev => prev - 1);
      if (selected?._id === id) setSelected(null);
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleView = async (contact: Contact) => {
    setSelected(contact);
    if (contact.status === 'new') {
      await handleStatusChange(contact._id, 'read');
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="admin-content">
      {/* Filters */}
      <div className="atl-toolbar">
        <div className="atl-filters">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`atl-filter-btn${filter === f.value ? ' active' : ''}`}
              onClick={() => handleFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="atl-count">{total} message{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="atl-loading">Loading messages…</div>
      ) : contacts.length === 0 ? (
        <div className="atl-empty">
          <MessageIcon />
          <p>No messages found</p>
        </div>
      ) : (
        <div className="atl-table-wrap">
          <table className="atl-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Email</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr
                  key={c._id}
                  className={c.status === 'new' ? 'atl-row--highlight' : ''}
                  onClick={() => handleView(c)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="atl-cell-name">
                      <div className="atl-avatar">{c.name.charAt(0).toUpperCase()}</div>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="atl-cell-muted">{c.email}</td>
                  <td className="atl-cell-msg">{c.message.length > 60 ? c.message.slice(0, 60) + '…' : c.message}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="atl-cell-muted">{formatDate(c.createdAt)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="atl-actions">
                      <select
                        className="atl-status-select"
                        value={c.status}
                        onChange={e => handleStatusChange(c._id, e.target.value as Contact['status'])}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                      </select>
                      <button className="atl-btn-icon atl-btn-icon--danger" onClick={() => handleDelete(c._id)} title="Delete">
                        <TrashIcon />
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
      {totalPages > 1 && (
        <div className="atl-pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="atl-page-btn">
            <ChevronIcon dir="left" />
          </button>
          <span className="atl-page-info">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="atl-page-btn">
            <ChevronIcon dir="right" />
          </button>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <AdminContactDetail
          contact={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default AdminContactList;
