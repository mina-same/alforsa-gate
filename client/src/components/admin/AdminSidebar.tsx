import { Link } from "react-router-dom";

interface AdminSidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
  unreadMessages?: number;
  pendingBookings?: number;
}

const AdminSidebar = ({
  activePage = "dashboard",
  onNavigate,
  userName = "Admin",
  userRole = "admin",
  onLogout,
  unreadMessages = 0,
  pendingBookings = 0,
}: AdminSidebarProps) => {
  const go = (page: string) => onNavigate?.(page);
  const initials = userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="admin-sidebar__logo">
        <Link to="/">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" stroke="#fff" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="logo-text">
            <span className="brand-name">Alforsa Gate</span>
            <span className="brand-tag">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar__nav">
        <p className="nav-section-title">Overview</p>
        <ul>
          <li>
            <span className={`nav-link${activePage === "dashboard" ? " active" : ""}`} onClick={() => go("dashboard")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
              </span>
              Dashboard
            </span>
          </li>
          <li>
            <span className={`nav-link${activePage === "bookings" ? " active" : ""}`} onClick={() => go("bookings")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </span>
              Bookings
              {pendingBookings > 0 && <span className="nav-badge">{pendingBookings}</span>}
            </span>
          </li>
        </ul>

        <p className="nav-section-title">Services</p>
        <ul>
          <li>
            <span className={`nav-link${activePage === "tours" ? " active" : ""}`} onClick={() => go("tours")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
              </span>
              Tours
            </span>
          </li>
          <li>
            <span className={`nav-link${activePage === "flights" ? " active" : ""}`} onClick={() => go("flights")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M22 16.21v-1.451a2 2 0 00-1.088-1.784l-1.539-.77a2 2 0 00-1.696-.041l-.088.04-3.93 1.965-4.949-5.657-1.374.687 2.227 6.02-2.83 1.414-.802-.802-1.062.531 1.5 2.5 2.5 1.5.531-1.063-.802-.802 1.414-2.83 6.02 2.227.687-1.374-5.657-4.95 1.965-3.929.04-.088a2 2 0 00-.041-1.696l-.77-1.539A2 2 0 0020 7.241V5.79z" /></svg>
              </span>
              Flights
            </span>
          </li>
          <li>
            <span className={`nav-link${activePage === "hotels" ? " active" : ""}`} onClick={() => go("hotels")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M3 21h18M3 7v14M21 7v14M3 7a2 2 0 012-2h14a2 2 0 012 2M9 21v-8a3 3 0 016 0v8" /></svg>
              </span>
              Hotels
            </span>
          </li>
        </ul>

        <p className="nav-section-title">Content</p>
        <ul>
          <li>
            <span className={`nav-link${activePage === "destinations" ? " active" : ""}`} onClick={() => go("destinations")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg>
              </span>
              Destinations
            </span>
          </li>
          <li>
            <span className={`nav-link${activePage === "blogs" ? " active" : ""}`} onClick={() => go("blogs")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              </span>
              Blogs
            </span>
          </li>
          <li>
            <span className={`nav-link${activePage === "contacts" ? " active" : ""}`} onClick={() => go("contacts")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              </span>
              Messages
              {unreadMessages > 0 && (
                <span className="nav-badge nav-badge--pulse">{unreadMessages > 99 ? '99+' : unreadMessages}</span>
              )}
            </span>
          </li>
        </ul>

        <p className="nav-section-title">Integrations</p>
        <ul>
          <li>
            <span className={`nav-link${activePage === "whatsapp" ? " active" : ""}`} onClick={() => go("whatsapp")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
              </span>
              WhatsApp
            </span>
          </li>
        </ul>

        <p className="nav-section-title">Management</p>
        <ul>
          <li>
            <span className={`nav-link${activePage === "users" ? " active" : ""}`} onClick={() => go("users")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
              </span>
              Users
            </span>
          </li>
          <li>
            <span className={`nav-link${activePage === "reports" ? " active" : ""}`} onClick={() => go("reports")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
              </span>
              Reports
            </span>
          </li>
          <li>
            <span className={`nav-link${activePage === "settings" ? " active" : ""}`} onClick={() => go("settings")}>
              <span className="nav-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
              </span>
              Settings
            </span>
          </li>
        </ul>
      </nav>

      {/* User footer */}
      <div className="admin-sidebar__footer">
        <div className="admin-user" onClick={onLogout} title="Click to logout">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">{userRole}</span>
          </div>
          <div className="logout-icon">
            <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
