import type { Contact } from '../../../api/contacts';

interface Props {
  contact: Contact;
  onClose: () => void;
  onStatusChange: (id: string, status: Contact['status']) => void;
  onDelete: (id: string) => void;
}

const StatusBadge = ({ status }: { status: Contact['status'] }) => {
  const map = {
    new:     { label: 'New',     cls: 'atb-badge atb-badge--warning' },
    read:    { label: 'Read',    cls: 'atb-badge atb-badge--info'    },
    replied: { label: 'Replied', cls: 'atb-badge atb-badge--success' },
  };
  const { label, cls } = map[status];
  return <span className={cls}>{label}</span>;
};

const AdminContactDetail = ({ contact, onClose, onStatusChange, onDelete }: Props) => {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const handleDelete = () => {
    onDelete(contact._id);
    onClose();
  };

  return (
    <div className="acd-overlay" onClick={onClose}>
      <div className="acd-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="acd-header">
          <div className="acd-header-left">
            <div className="acd-avatar">{contact.name.charAt(0).toUpperCase()}</div>
            <div>
              <h3 className="acd-name">{contact.name}</h3>
              <p className="acd-meta">{formatDate(contact.createdAt)}</p>
            </div>
          </div>
          <button className="acd-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Contact info */}
        <div className="acd-info">
          <div className="acd-info-row">
            <span className="acd-label">Email</span>
            <a href={`mailto:${contact.email}`} className="acd-link">{contact.email}</a>
          </div>
          {contact.website && (
            <div className="acd-info-row">
              <span className="acd-label">Website</span>
              <a href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                 target="_blank" rel="noopener noreferrer" className="acd-link">{contact.website}</a>
            </div>
          )}
          <div className="acd-info-row">
            <span className="acd-label">Status</span>
            <StatusBadge status={contact.status} />
          </div>
        </div>

        {/* Message body */}
        <div className="acd-message">
          <p className="acd-label">Message</p>
          <div className="acd-message-body">{contact.message}</div>
        </div>

        {/* Actions */}
        <div className="acd-footer">
          <a href={`mailto:${contact.email}?subject=Re: Your message`} className="acd-btn acd-btn--primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Reply via Email
          </a>
          <div className="acd-status-actions">
            {contact.status !== 'replied' && (
              <button className="acd-btn acd-btn--success" onClick={() => onStatusChange(contact._id, 'replied')}>
                Mark as Replied
              </button>
            )}
            {contact.status !== 'read' && contact.status !== 'replied' && (
              <button className="acd-btn acd-btn--secondary" onClick={() => onStatusChange(contact._id, 'read')}>
                Mark as Read
              </button>
            )}
            <button className="acd-btn acd-btn--danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContactDetail;
