import { Link } from "react-router-dom";

interface AdminSidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

const AdminSidebar = ({
  activePage = "dashboard",
  onNavigate,
  userName = "Admin",
  userRole = "admin",
  onLogout,
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
              <span className="nav-badge">12</span>
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
