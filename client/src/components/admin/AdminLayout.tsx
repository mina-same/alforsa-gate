import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboard from './AdminDashboard';
import AdminTourList from './tours/AdminTourList';
import AdminTourForm from './tours/AdminTourForm';
import AdminUserList from './users/AdminUserList';
import AdminUserForm from './users/AdminUserForm';
import WhatsAppQRPanel from './whatsapp/WhatsAppQRPanel';
import AdminDestinationList from './destinations/AdminDestinationList';
import AdminDestinationForm from './destinations/AdminDestinationForm';
import AdminBlogList from './blogs/AdminBlogList';
import AdminBlogForm from './blogs/AdminBlogForm';
import AdminContactList from './contacts/AdminContactList';
import AdminBookingList from './bookings/AdminBookingList';
import { useContactSocket } from '../../hooks/useContactSocket';
import { getUnreadCount } from '../../api/contacts';
import bookingService from '../../services/bookingService';

type Page = 'dashboard' | 'tours' | 'flights' | 'hotels' | 'bookings' | 'users' | 'reports' | 'settings' | 'whatsapp' | 'destinations' | 'blogs' | 'contacts';
type TourView        = { mode: 'list' } | { mode: 'add' } | { mode: 'edit'; id: string };
type UserView        = { mode: 'list' } | { mode: 'add' } | { mode: 'edit'; id: string };
type DestinationView = { mode: 'list' } | { mode: 'add' } | { mode: 'edit'; id: string };
type BlogView        = { mode: 'list' } | { mode: 'add' } | { mode: 'edit'; id: string };

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard:    { title: 'Dashboard',    subtitle: "Welcome back! Here's what's happening today." },
  tours:        { title: 'Tours',        subtitle: 'Manage all tour packages and itineraries.' },
  flights:      { title: 'Flights',      subtitle: 'Track routes, schedules and airline partners.' },
  hotels:       { title: 'Hotels',       subtitle: 'Manage hotel listings, rooms and pricing.' },
  bookings:     { title: 'Bookings',     subtitle: 'Review and manage all customer bookings.' },
  users:        { title: 'Users',        subtitle: 'Manage registered users and admins.' },
  reports:      { title: 'Reports',      subtitle: 'View analytics and export reports.' },
  settings:     { title: 'Settings',     subtitle: 'Configure platform preferences.' },
  whatsapp:     { title: 'WhatsApp',     subtitle: 'Connect your WhatsApp account to enable messaging.' },
  destinations: { title: 'Destinations', subtitle: 'Manage destination pages with SEO, gallery and content.' },
  blogs:        { title: 'Blogs',        subtitle: 'Write and manage travel blog articles.' },
  contacts:     { title: 'Messages',     subtitle: 'View and manage contact form submissions.' },
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

// Floating notification toast for new contact messages
const ContactToast = ({ name, onDismiss, onView }: { name: string; onDismiss: () => void; onView: () => void }) => (
  <div className="contact-toast">
    <div className="contact-toast__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    </div>
    <div className="contact-toast__body">
      <p className="contact-toast__title">New message received</p>
      <p className="contact-toast__sub">From <strong>{name}</strong></p>
    </div>
    <div className="contact-toast__actions">
      <button className="contact-toast__view" onClick={onView}>View</button>
      <button className="contact-toast__close" onClick={onDismiss}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  </div>
);

const URL_TO_PAGE: Record<string, Page> = {
  '':             'dashboard',
  'dashboard':    'dashboard',
  'tours':        'tours',
  'flights':      'flights',
  'hotels':       'hotels',
  'bookings':     'bookings',
  'users':        'users',
  'reports':      'reports',
  'settings':     'settings',
  'whatsapp':     'whatsapp',
  'destinations': 'destinations',
  'blogs':        'blogs',
  'messages':     'contacts',
};

const PAGE_TO_URL: Record<Page, string> = {
  dashboard:    '/admin',
  tours:        '/admin/tours',
  flights:      '/admin/flights',
  hotels:       '/admin/hotels',
  bookings:     '/admin/bookings',
  users:        '/admin/users',
  reports:      '/admin/reports',
  settings:     '/admin/settings',
  whatsapp:     '/admin/whatsapp',
  destinations: '/admin/destinations',
  blogs:        '/admin/blogs',
  contacts:     '/admin/messages',
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageFromUrl = (): Page => {
    const segment = location.pathname.replace(/^\/admin\/?/, '').split('/')[0];
    return URL_TO_PAGE[segment] ?? 'dashboard';
  };

  const [activePage, setActivePage]           = useState<Page>(pageFromUrl);
  const [tourView, setTourView]               = useState<TourView>({ mode: 'list' });
  const [userView, setUserView]               = useState<UserView>({ mode: 'list' });
  const [destinationView, setDestinationView] = useState<DestinationView>({ mode: 'list' });
  const [blogView, setBlogView]               = useState<BlogView>({ mode: 'list' });

  const [pendingBookings, setPendingBookings]  = useState(0);
  const [serverUnread, setServerUnread]       = useState(0);
  const [contactRefresh, setContactRefresh]   = useState(0);
  const [showToast, setShowToast]             = useState(false);
  const [toastDismissTimer, setToastDismissTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Sync active page when URL changes (e.g. browser back/forward)
  useEffect(() => {
    setActivePage(pageFromUrl());
  }, [location.pathname]);

  const { unreadCount, notification, resetCount, clearNotif } = useContactSocket(!!user);

  // Load initial unread count from server
  useEffect(() => {
    if (!user) return;
    getUnreadCount()
      .then(res => setServerUnread(res.data.count))
      .catch(() => {});
    bookingService.getBookingStats()
      .then(stats => setPendingBookings(stats.pending))
      .catch(() => {});
  }, [user]);

  // Show toast on new socket notification
  useEffect(() => {
    if (!notification) return;
    setShowToast(true);
    if (toastDismissTimer) clearTimeout(toastDismissTimer);
    const t = setTimeout(() => {
      setShowToast(false);
      clearNotif();
    }, 6000);
    setToastDismissTimer(t);
    return () => clearTimeout(t);
  }, [notification]);

  // Reset unread counter when admin opens contacts page
  useEffect(() => {
    if (activePage === 'contacts') {
      resetCount();
      setServerUnread(0);
    }
  }, [activePage]);

  const totalUnread = serverUnread + unreadCount;

  const meta = pageTitles[activePage];

  const handleNav = (page: string) => {
    const p = page as Page;
    setActivePage(p);
    if (page === 'tours')        setTourView({ mode: 'list' });
    if (page === 'users')        setUserView({ mode: 'list' });
    if (page === 'destinations') setDestinationView({ mode: 'list' });
    if (page === 'blogs')        setBlogView({ mode: 'list' });
    navigate(PAGE_TO_URL[p] ?? '/admin');
  };

  const getSubtitle = () => {
    if (activePage === 'tours') {
      if (tourView.mode === 'add')  return 'Create a new tour package';
      if (tourView.mode === 'edit') return 'Edit tour details';
    }
    if (activePage === 'users') {
      if (userView.mode === 'add')  return 'Create a new admin user';
      if (userView.mode === 'edit') return 'Edit user account and permissions';
    }
    if (activePage === 'destinations') {
      if (destinationView.mode === 'add')  return 'Create a new destination page';
      if (destinationView.mode === 'edit') return 'Edit destination content';
    }
    if (activePage === 'blogs') {
      if (blogView.mode === 'add')  return 'Write a new blog article';
      if (blogView.mode === 'edit') return 'Edit blog article';
    }
    return meta.subtitle;
  };

  const handleToastView = () => {
    setShowToast(false);
    clearNotif();
    setActivePage('contacts');
    setContactRefresh(prev => prev + 1);
    navigate('/admin/messages');
  };

  const handleToastDismiss = () => {
    setShowToast(false);
    clearNotif();
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <AdminDashboard
            onAddTour={() => { setActivePage('tours'); setTourView({ mode: 'add' }); navigate('/admin/tours'); }}
            onManageTours={() => { setActivePage('tours'); setTourView({ mode: 'list' }); navigate('/admin/tours'); }}
            onAddBlog={() => { setActivePage('blogs'); setBlogView({ mode: 'add' }); navigate('/admin/blogs'); }}
            onManageBlogs={() => { setActivePage('blogs'); setBlogView({ mode: 'list' }); navigate('/admin/blogs'); }}
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

      case 'users':
        if (userView.mode === 'add') {
          return (
            <AdminUserForm
              onSaved={() => setUserView({ mode: 'list' })}
              onCancel={() => setUserView({ mode: 'list' })}
            />
          );
        }
        if (userView.mode === 'edit') {
          return (
            <AdminUserForm
              userId={userView.id}
              onSaved={() => setUserView({ mode: 'list' })}
              onCancel={() => setUserView({ mode: 'list' })}
            />
          );
        }
        return (
          <AdminUserList
            onAdd={() => setUserView({ mode: 'add' })}
            onEdit={(id) => setUserView({ mode: 'edit', id })}
          />
        );

      case 'whatsapp':
        return <WhatsAppQRPanel />;

      case 'destinations':
        if (destinationView.mode === 'add') {
          return <AdminDestinationForm onSaved={() => setDestinationView({ mode: 'list' })} onCancel={() => setDestinationView({ mode: 'list' })} />;
        }
        if (destinationView.mode === 'edit') {
          return <AdminDestinationForm destinationId={destinationView.id} onSaved={() => setDestinationView({ mode: 'list' })} onCancel={() => setDestinationView({ mode: 'list' })} />;
        }
        return <AdminDestinationList onAdd={() => setDestinationView({ mode: 'add' })} onEdit={(id) => setDestinationView({ mode: 'edit', id })} />;

      case 'blogs':
        if (blogView.mode === 'add') {
          return <AdminBlogForm onSaved={() => setBlogView({ mode: 'list' })} onCancel={() => setBlogView({ mode: 'list' })} />;
        }
        if (blogView.mode === 'edit') {
          return <AdminBlogForm blogId={blogView.id} onSaved={() => setBlogView({ mode: 'list' })} onCancel={() => setBlogView({ mode: 'list' })} />;
        }
        return <AdminBlogList onAdd={() => setBlogView({ mode: 'add' })} onEdit={(id) => setBlogView({ mode: 'edit', id })} />;

      case 'contacts':
        return <AdminContactList refreshTrigger={contactRefresh} />;

      case 'bookings':
        return <AdminBookingList />;

      case 'flights':
      case 'hotels':
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
        unreadMessages={totalUnread}
        pendingBookings={pendingBookings}
      />
      <div className="admin-main">
        <AdminHeader
          pageTitle={meta.title}
          pageSubtitle={getSubtitle()}
          primaryAction={
            activePage === 'tours'        && tourView.mode === 'list'
              ? { label: 'Add Tour',        onClick: () => setTourView({ mode: 'add' }),        icon: <PlusIcon /> }
              : activePage === 'users' && userView.mode === 'list' && user?.role === 'superadmin'
              ? { label: 'Add User',        onClick: () => setUserView({ mode: 'add' }),        icon: <PlusIcon /> }
              : activePage === 'destinations' && destinationView.mode === 'list'
              ? { label: 'Add Destination', onClick: () => setDestinationView({ mode: 'add' }), icon: <PlusIcon /> }
              : activePage === 'blogs' && blogView.mode === 'list'
              ? { label: 'Add Blog',        onClick: () => setBlogView({ mode: 'add' }),        icon: <PlusIcon /> }
              : undefined
          }
        />
        {renderContent()}
      </div>

      {/* Real-time contact notification toast */}
      {showToast && notification && (
        <ContactToast
          name={notification.contact.name}
          onDismiss={handleToastDismiss}
          onView={handleToastView}
        />
      )}
    </div>
  );
};

export default AdminLayout;
