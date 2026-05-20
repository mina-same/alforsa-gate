import { AuthProvider, useAuth } from '../context/AuthContext';
import AdminLayout from '../components/admin/AdminLayout';
import AdminLogin from '../components/admin/AdminLogin';
import SEO from '../components/SEO';

const AdminGate = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9fafb', fontFamily: 'Poppins, sans-serif', color: '#6b7280', fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  return user ? <AdminLayout /> : <AdminLogin />;
};

const AdminDashboardMain = () => (
  <AuthProvider>
    <SEO pageTitle="Admin Dashboard" />
    <AdminGate />
  </AuthProvider>
);

export default AdminDashboardMain;
