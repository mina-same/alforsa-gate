import type { ReactNode } from 'react';

interface AdminHeaderProps {
  pageTitle?: string;
  pageSubtitle?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

const AdminHeader = ({
  pageTitle = "Dashboard",
  pageSubtitle = "Welcome back, here's what's happening today.",
  primaryAction,
}: AdminHeaderProps) => {
  return (
    <header className="admin-header">
      <div className="admin-header__breadcrumb">
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-subtitle">{pageSubtitle}</p>
      </div>

      <div className="admin-header__actions">
        {primaryAction && (
          <button className="admin-header__primary-action" type="button" onClick={primaryAction.onClick}>
            {primaryAction.icon}
            {primaryAction.label}
          </button>
        )}

        {/* Search */}
        <div className="search-bar">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search..." />
        </div>

        {/* Notifications */}
        <button className="icon-btn" type="button" aria-label="Notifications">
          <svg viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="badge-dot" />
        </button>

        {/* Messages */}
        <button className="icon-btn" type="button" aria-label="Messages">
          <svg viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="header-avatar" title="Admin User">A</div>
      </div>
    </header>
  );
};

export default AdminHeader;
