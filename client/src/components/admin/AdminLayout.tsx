import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboard from './AdminDashboard';
import AdminTourList from './tours/AdminTourList';
import AdminTourForm from './tours/AdminTourForm';

type Page = 'dashboard' | 'tours' | 'flights' | 'hotels' | 'bookings' | 'users' | 'reports' | 'settings';
type TourView = { mode: 'list' } | { mode: 'add' } | { mode: 'edit'; id: string };

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard',  subtitle: "Welcome back! Here's what's happening today." },
  tours:     { title: 'Tours',      subtitle: 'Manage all tour packages and itineraries.' },
  flights:   { title: 'Flights',    subtitle: 'Track routes, schedules and airline partners.' },
  hotels:    { title: 'Hotels',     subtitle: 'Manage hotel listings, rooms and pricing.' },
  bookings:  { title: 'Bookings',   subtitle: 'Review and manage all customer bookings.' },
  users:     { title: 'Users',      subtitle: 'Manage registered users and admins.' },
  reports:   { title: 'Reports',    subtitle: 'View analytics and export reports.' },
  settings:  { title: 'Settings',   subtitle: 'Configure platform preferences.' },
};

const ComingSoon = ({ title }: { title: string }) => (
  <div className="admin-content">
    <div className="atl-empty" style={{ marginTop: 60 }}>
      <svg viewBox="0 0 24 24" style={{ width: 40, height: 40, stroke: '#9ca3af', fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
      <p style={{ color: '#6b7280', fontSize: 14 }}>{title} management — coming soon</p>
    </div>
  </div>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [tourView, setTourView]     = useState<TourView>({ mode: 'list' });

  const meta = pageTitles[activePage];

  const handleNav = (page: string) => {
    setActivePage(page as Page);
    if (page === 'tours') setTourView({ mode: 'list' });
  };

  const getSubtitle = () => {
    if (activePage === 'tours') {
      if (tourView.mode === 'add')  return 'Create a new tour package';
      if (tourView.mode === 'edit') return 'Edit tour details';
    }
    return meta.subtitle;
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <AdminDashboard
            onAddTour={() => { setActivePage('tours'); setTourView({ mode: 'add' }); }}
            onManageTours={() => { setActivePage('tours'); setTourView({ mode: 'list' }); }}
          />
        );

      case 'tours':
        if (tourView.mode === 'add') {
          return (
            <AdminTourForm
              onSaved={() => setTourView({ mode: 'list' })}
              onCancel={() => setTourView({ mode: 'list' })}
            />
          );
        }
        if (tourView.mode === 'edit') {
          return (
            <AdminTourForm
              tourId={tourView.id}
              onSaved={() => setTourView({ mode: 'list' })}
              onCancel={() => setTourView({ mode: 'list' })}
            />
          );
        }
        return (
          <AdminTourList
            onAdd={() => setTourView({ mode: 'add' })}
            onEdit={(id) => setTourView({ mode: 'edit', id })}
          />
        );

      case 'flights':
      case 'hotels':
      case 'bookings':
      case 'users':
      case 'reports':
      case 'settings':
        return <ComingSoon title={meta.title} />;

      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar
        activePage={activePage}
        onNavigate={handleNav}
        userName={user?.name || 'Admin'}
        userRole={user?.role || 'admin'}
        onLogout={logout}
      />
      <div className="admin-main">
        <AdminHeader
          pageTitle={meta.title}
          pageSubtitle={getSubtitle()}
          primaryAction={
            activePage === 'tours' && tourView.mode === 'list'
              ? {
                  label: 'Add Tour',
                  onClick: () => setTourView({ mode: 'add' }),
                  icon: <PlusIcon />,
                }
              : undefined
          }
        />
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminLayout;
